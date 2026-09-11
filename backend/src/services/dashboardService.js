import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { User } from '../models/User.js';

function toDateStr(d) {
    return new Date(d).toISOString().split('T')[0];
}

function getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
}

function computeStreak(workoutDates) {
    if (!workoutDates.length) return 0;
    const unique = [...new Set(workoutDates)].sort((a, b) => b - a);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecent = new Date(unique[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;
    let streak = 1;
    for (let i = 0; i < unique.length - 1; i++) {
        const curr = new Date(unique[i]);
        curr.setHours(0, 0, 0, 0);
        const prev = new Date(unique[i + 1]);
        prev.setHours(0, 0, 0, 0);
        const gap = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
        if (gap === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export async function getDashboardData(owner) {
    const user = await User.findById(owner).lean();
    const now = new Date();
    const { from: weekStart, to: weekEnd } = getWeekRange(now);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [allWorkouts, weekWorkouts, todayNutrition, allNutrition] = await Promise.all([
        Workout.find({ owner }).sort({ date: -1 }).lean(),
        Workout.find({ owner, date: { $gte: weekStart, $lte: weekEnd } }).lean(),
        Nutrition.find({ owner, date: { $gte: todayStart, $lte: todayEnd } }).lean(),
        Nutrition.find({ owner }).sort({ date: -1 }).lean(),
    ]);

    const totalWorkouts = allWorkouts.length;
    const totalExercises = allWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);

    const totalCaloriesConsumed = allNutrition.reduce((s, e) => s + (e.calories || 0), 0);
    const todayCaloriesConsumed = todayNutrition.reduce((s, e) => s + (e.calories || 0), 0);
    const todayProtein = todayNutrition.reduce((s, e) => s + (e.protein || 0), 0);
    const todayCarbs = todayNutrition.reduce((s, e) => s + (e.carbs || 0), 0);
    const todayFat = todayNutrition.reduce((s, e) => s + (e.fat || 0), 0);

    const workoutDates = allWorkouts.map((w) => toDateStr(w.date));
    const streak = computeStreak(workoutDates);

    const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyWorkouts = weekDayLabels.map((day, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = toDateStr(date);
        const count = weekWorkouts.filter((w) => toDateStr(w.date) === dateStr).length;
        return { day, value: count };
    });

    const caloriesSeries = weekDayLabels.map((day, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = toDateStr(date);
        const dayCals = allNutrition
            .filter((e) => toDateStr(e.date) === dateStr)
            .reduce((s, e) => s + (e.calories || 0), 0);
        return { label: day, value: dayCals };
    });

    const weekWorkoutCount = weekWorkouts.length;
    const weekTarget = 5;
    const workoutsRing = Math.min(weekWorkoutCount, weekTarget);

    const recentWorkouts = allWorkouts.slice(0, 5).map((w) => ({
        id: w._id.toString(),
        name: w.title,
        category: w.category,
        date: toDateStr(w.date),
        metric: `${w.exercises?.length || 0} exercise${(w.exercises?.length || 0) !== 1 ? 's' : ''}`,
    }));

    const hasData = totalWorkouts > 0 || allNutrition.length > 0;

    return {
        user: {
            name: user?.name ?? 'User',
        },
        summary: [
            { key: 'workouts', label: 'Total Workouts', value: totalWorkouts, unit: '' },
            { key: 'exercises', label: 'Total Exercises', value: totalExercises, unit: '' },
            { key: 'caloriesBurned', label: 'Est. Calories Burned', value: totalWorkouts * 200, unit: 'kcal' },
            { key: 'caloriesConsumed', label: 'Calories Consumed', value: totalCaloriesConsumed, unit: 'kcal' },
            { key: 'weight', label: 'Current Weight', value: user?.weightKg ?? null, unit: user?.preferences?.units || 'kg' },
            { key: 'streak', label: 'Workout Streak', value: streak, unit: 'days' },
        ],
        dailyGoals: [
            { key: 'calories', label: 'Calories', current: todayCaloriesConsumed, target: 2400, unit: 'kcal' },
            { key: 'workouts', label: 'Workouts', current: weekWorkoutCount, target: weekTarget, unit: 'sessions' },
        ],
        rings: [
            { key: 'workouts', label: 'Workouts', value: workoutsRing, max: weekTarget, unit: '' },
        ],
        weeklyWorkouts,
        caloriesSeries,
        macros: {
            protein: todayProtein,
            carbs: todayCarbs,
            fat: todayFat,
        },
        recentWorkouts,
        hasData,
    };
}
