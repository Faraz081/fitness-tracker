import { Workout } from '../../models/Workout.js';

function calcVolume(exercises) {
    return exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * (ex.weightKg || 0), 0);
}

function toDateStr(d) {
    return new Date(d).toISOString().split('T')[0];
}

export async function getWorkoutReport(owner, fromDate, toDate) {
    const workouts = await Workout.find({
        owner,
        date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 }).lean();

    const rangeDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => sum + calcVolume(w.exercises), 0);
    const avgSessionsPerWeek = totalWorkouts > 0 ? +((totalWorkouts / rangeDays) * 7).toFixed(1) : 0;

    const categoryMap = {};
    workouts.forEach((w) => {
        if (!categoryMap[w.category]) categoryMap[w.category] = { category: w.category, count: 0, volume: 0 };
        categoryMap[w.category].count += 1;
        categoryMap[w.category].volume += calcVolume(w.exercises);
    });
    const categoryBreakdown = Object.values(categoryMap)
        .map((c) => ({ ...c, percentage: totalWorkouts > 0 ? Math.round((c.count / totalWorkouts) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

    const freqMap = {};
    workouts.forEach((w) => {
        const key = toDateStr(w.date);
        freqMap[key] = (freqMap[key] || 0) + 1;
    });
    const frequencySeries = Object.entries(freqMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const exerciseBest = {};
    const historicalWorkouts = await Workout.find({ owner, date: { $lt: fromDate } }).lean();
    const histBest = {};
    historicalWorkouts.forEach((w) => {
        w.exercises.forEach((ex) => {
            if (ex.weightKg) histBest[ex.name] = Math.max(histBest[ex.name] || 0, ex.weightKg);
        });
    });

    let prCount = 0;
    workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
            if (ex.weightKg) {
                exerciseBest[ex.name] = Math.max(exerciseBest[ex.name] || 0, ex.weightKg);
            }
        });
    });
    Object.entries(exerciseBest).forEach(([name, weight]) => {
        if (weight > (histBest[name] || 0)) prCount += 1;
    });

    const notableLifts = Object.entries(exerciseBest)
        .map(([exercise, weight]) => ({ exercise, weight }))
        .sort((a, b) => b.weight - a.weight);

    const workoutsList = workouts.map((w) => {
        let wPrCount = 0;
        w.exercises.forEach((ex) => {
            if (ex.weightKg && exerciseBest[ex.name] === ex.weightKg && ex.weightKg > (histBest[ex.name] || 0)) {
                wPrCount += 1;
            }
        });
        return {
            id: String(w._id),
            name: w.title,
            category: w.category,
            date: toDateStr(w.date),
            volume: +calcVolume(w.exercises).toFixed(1),
            exerciseCount: w.exercises.length,
            prCount: wPrCount,
        };
    });

    return {
        dateRange: {
            from: toDateStr(fromDate),
            to: toDateStr(toDate),
            days: rangeDays,
        },
        summary: {
            totalWorkouts,
            totalVolume: +totalVolume.toFixed(1),
            avgSessionsPerWeek,
            frequencySeries,
        },
        categoryBreakdown,
        workouts: workoutsList,
        notableLifts,
        prCount,
        notTracked: { duration: true, muscleGroups: true },
    };
}
