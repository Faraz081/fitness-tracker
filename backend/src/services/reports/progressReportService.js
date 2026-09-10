import { Workout } from '../../models/Workout.js';
import { Nutrition } from '../../models/Nutrition.js';
import { User } from '../../models/User.js';

function toDateStr(d) {
    return new Date(d).toISOString().split('T')[0];
}

export async function getProgressReport(owner, fromDate, toDate) {
    const user = await User.findById(owner).lean();
    const rangeDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    const workouts = await Workout.find({ owner }).sort({ date: 1 }).lean();
    const rangeWorkouts = workouts.filter((w) => w.date >= fromDate && w.date <= toDate);
    const workoutsPerWeek = rangeWorkouts.length > 0 ? +((rangeWorkouts.length / rangeDays) * 7).toFixed(1) : 0;

    const nutritionEntries = await Nutrition.find({
        owner,
        date: { $gte: fromDate, $lte: toDate },
    }).lean();
    const nutritionDaysLogged = new Set(nutritionEntries.map((e) => toDateStr(e.date))).size;
    const nutritionConsistency = rangeDays > 0 ? Math.round((nutritionDaysLogged / rangeDays) * 100) : 0;

    const histBest = {};
    const rangeBest = {};
    workouts.forEach((w) => {
        const isRange = w.date >= fromDate && w.date <= toDate;
        const isHistory = w.date < fromDate;
        w.exercises.forEach((ex) => {
            if (!ex.weightKg) return;
            if (isRange) rangeBest[ex.name] = Math.max(rangeBest[ex.name] || 0, ex.weightKg);
            if (isHistory) histBest[ex.name] = Math.max(histBest[ex.name] || 0, ex.weightKg);
        });
    });

    let prCount = 0;
    const strengthProgression = Object.entries(rangeBest)
        .map(([exercise, bestWeight]) => {
            const priorBest = histBest[exercise] || 0;
            const delta = bestWeight - priorBest;
            if (bestWeight > priorBest) prCount += 1;
            return { exercise, bestWeight, priorBest, delta };
        })
        .sort((a, b) => b.bestWeight - a.bestWeight);

    const strengthSeriesMap = {};
    const runningBest = {};
    [...workouts].sort((a, b) => a.date - b.date).forEach((w) => {
        const day = toDateStr(w.date);
        w.exercises.forEach((ex) => {
            if (!ex.weightKg) return;
            if (ex.weightKg > (runningBest[ex.name] || 0)) {
                runningBest[ex.name] = ex.weightKg;
                if (!strengthSeriesMap[ex.name]) strengthSeriesMap[ex.name] = [];
                strengthSeriesMap[ex.name].push({ date: day, weight: ex.weightKg });
            }
        });
    });
    const MAX_POINTS = 40;
    const strengthSeries = Object.entries(strengthSeriesMap).map(([exercise, points]) => {
        if (points.length <= MAX_POINTS) return { exercise, points };
        const step = (points.length - 1) / (MAX_POINTS - 1);
        const sampled = Array.from({ length: MAX_POINTS }, (_, i) => points[Math.round(i * step)]);
        return { exercise, points: sampled };
    });

    return {
        dateRange: {
            from: toDateStr(fromDate),
            to: toDateStr(toDate),
            days: rangeDays,
        },
        profile: {
            latestWeight: user?.weightKg ?? null,
            goal: user?.goal ?? null,
            hasWeightHistory: false,
        },
        consistency: {
            workoutConsistency: workoutsPerWeek,
            nutritionConsistency,
            nutritionDaysLogged,
            rangeDays,
        },
        strengthProgression,
        strengthSeries,
        prCount,
        notTracked: { weightHistory: true, milestones: true, photos: true },
    };
}
