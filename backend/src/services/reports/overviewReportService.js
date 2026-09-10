import { Workout } from '../../models/Workout.js';
import { Nutrition } from '../../models/Nutrition.js';
import { User } from '../../models/User.js';

function toDateStr(d) {
    return new Date(d).toISOString().split('T')[0];
}

export async function getOverviewReport(owner, fromDate, toDate) {
    const rangeDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    const workouts = await Workout.find({
        owner,
        date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const nutritionEntries = await Nutrition.find({
        owner,
        date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const user = await User.findById(owner).lean();

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => {
        return sum + w.exercises.reduce((s, ex) => s + ex.sets * ex.reps * (ex.weightKg || 0), 0);
    }, 0);

    const totalCalories = nutritionEntries.reduce((s, e) => s + e.calories, 0);
    const nutritionDaysLogged = new Set(nutritionEntries.map((e) => toDateStr(e.date))).size;
    const avgDailyCalories = nutritionEntries.length > 0 ? +(totalCalories / nutritionDaysLogged).toFixed(1) : 0;

    const workoutDays = new Set(workouts.map((w) => toDateStr(w.date)));
    const allActiveDays = new Set([...workoutDays, ...nutritionEntries.map((e) => toDateStr(e.date))]);
    const activeDays = allActiveDays.size;
    const consistencyScore = activeDays > 0 ? Math.round((activeDays / rangeDays) * 100) : null;

    return {
        dateRange: {
            from: toDateStr(fromDate),
            to: toDateStr(toDate),
            days: rangeDays,
        },
        workouts: {
            totalWorkouts,
            totalVolume: +totalVolume.toFixed(1),
        },
        nutrition: {
            totalCalories,
            avgDailyCalories,
            daysLogged: nutritionDaysLogged,
        },
        progress: {
            latestWeight: user?.weightKg ?? null,
            weightChange: null,
            hasWeightHistory: false,
            goal: user?.goal ?? null,
            consistencyScore,
        },
    };
}
