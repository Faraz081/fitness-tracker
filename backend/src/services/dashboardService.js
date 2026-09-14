import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { User } from '../models/User.js';

function dateKeyOf(d) {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseKeyUtc(key) {
    const [y, m, d] = String(key).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}

function addDaysUtc(key, days) {
    const date = parseKeyUtc(key);
    date.setUTCDate(date.getUTCDate() + days);
    return dateKeyOf(date);
}

function isValidDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key ?? ''))) {
        return false;
    }
    return dateKeyOf(parseKeyUtc(key)) === String(key);
}

function weekKeysFrom(todayKey) {
    const date = parseKeyUtc(todayKey);
    const mondayOffset = (date.getUTCDay() + 6) % 7;
    const mondayKey = addDaysUtc(todayKey, -mondayOffset);
    return Array.from({ length: 7 }, (_, i) => addDaysUtc(mondayKey, i));
}

function dayRangeOf(key) {
    const start = new Date(`${key}T00:00:00.000Z`);
    const end = new Date(`${key}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}

function estimateWorkoutCalories(w) {
    const exercises = w.exercises ?? [];
    if (exercises.length === 0) {
        return 0;
    }
    return exercises.reduce((sum, e) => {
        const sets = e.sets ?? 0;
        const reps = e.reps ?? 0;
        const kg = e.weightKg ?? 0;
        return sum + sets * reps * (kg * 0.02 + 0.35);
    }, 0);
}

function computeStreak(dateKeys, todayKey) {
    const unique = [...new Set(dateKeys)].sort().reverse();
    if (unique.length === 0) {
        return 0;
    }
    const yesterday = addDaysUtc(todayKey, -1);
    const latest = unique[0];
    if (latest < yesterday) {
        return 0;
    }
    let streak = 1;
    for (let i = 0; i < unique.length - 1; i++) {
        if (addDaysUtc(unique[i], -1) === unique[i + 1]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

const TARGET_BY_LEVEL = { beginner: 3, intermediate: 4, advanced: 5 };

function weeklyWorkoutTarget(user, workoutDateKeys) {
    if (user?.fitnessLevel && TARGET_BY_LEVEL[user.fitnessLevel]) {
        return TARGET_BY_LEVEL[user.fitnessLevel];
    }
    const perWeek = new Map();
    workoutDateKeys.forEach((key) => {
        const monday = dateKeyOf(weekKeysFrom(key)[0]);
        perWeek.set(monday, (perWeek.get(monday) || 0) + 1);
    });
    const recentWeeks = [...perWeek.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
    const avg = recentWeeks.length
        ? recentWeeks.reduce((sum, [, count]) => sum + count, 0) / recentWeeks.length
        : 0;
    return Math.max(1, Math.min(7, Math.round(avg) || 3));
}

function calorieTargetFor(user) {
    const { weightKg, heightCm, age, fitnessLevel, goal } = user ?? {};
    if (!(weightKg > 0) || !(heightCm > 0) || !(age > 0)) {
        return null;
    }
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const bmr = base - 78;
    const ACTIVITY = { beginner: 1.375, intermediate: 1.55, advanced: 1.725 };
    const activity = ACTIVITY[fitnessLevel] ?? 1.55;
    const adjust = goal === 'lose' ? 0.9 : goal === 'gain' ? 1.1 : 1;
    return Math.round((bmr * activity * adjust) / 10) * 10;
}

function proteinTargetFor(user) {
    return user?.weightKg > 0 ? Math.round(user.weightKg * 1.6) : null;
}

export async function getDashboardData(owner, todayParam) {
    const todayKey = isValidDateKey(todayParam) ? todayParam : new Date().toISOString().slice(0, 10);
    const weekKeys = weekKeysFrom(todayKey);

    const [user, allWorkouts, allNutrition] = await Promise.all([
        User.findById(owner).lean(),
        Workout.find({ owner }).sort({ date: -1 }).lean(),
        Nutrition.find({ owner }).sort({ date: -1 }).lean(),
    ]);

    const totals = allWorkouts.reduce(
        (acc, w) => {
            const exercises = w.exercises ?? [];
            const sets = exercises.reduce((s, e) => s + (e.sets ?? 0), 0);
            acc.workoutCalories += estimateWorkoutCalories(w);
            acc.exercises += exercises.length;
            acc.sets += sets;
            acc.volume += exercises.reduce((s, e) => s + (e.sets ?? 0) * (e.reps ?? 0) * (e.weightKg ?? 0), 0);
            return acc;
        },
        { workoutCalories: 0, exercises: 0, sets: 0, volume: 0 },
    );

    const totalCaloriesConsumed = allNutrition.reduce((s, e) => s + (e.calories || 0), 0);

    const todayEntries = allNutrition.filter((e) => dateKeyOf(e.date) === todayKey);
    const todayCalories = todayEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const todayProtein = todayEntries.reduce((s, e) => s + (e.protein || 0), 0);
    const todayCarbs = todayEntries.reduce((s, e) => s + (e.carbs || 0), 0);
    const todayFat = todayEntries.reduce((s, e) => s + (e.fat || 0), 0);

    const workoutDateKeys = allWorkouts.map((w) => (w.date ? dateKeyOf(w.date) : null)).filter(Boolean);
    const streak = computeStreak(workoutDateKeys, todayKey);

    const weeklyWorkouts = weekKeys.map((key) => ({
        day: new Date(`${key}T00:00:00.000Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        value: workoutDateKeys.filter((k) => k === key).length,
    }));

    const weekWorkoutCount = weeklyWorkouts.reduce((sum, d) => sum + d.value, 0);

    const caloriesSeries = weekKeys.map((key) => {
        const dayCals = allNutrition
            .filter((e) => dateKeyOf(e.date) === key)
            .reduce((s, e) => s + (e.calories || 0), 0);
        return {
            label: new Date(`${key}T00:00:00.000Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
            value: dayCals,
        };
    });

    const weekTarget = weeklyWorkoutTarget(user, workoutDateKeys);
    const caloriesTarget = calorieTargetFor(user);
    const proteinTarget = proteinTargetFor(user);

    const recentWorkouts = allWorkouts.slice(0, 5).map((w) => {
        const exercises = w.exercises ?? [];
        const sets = exercises.reduce((s, e) => s + (e.sets ?? 0), 0);
        return {
            id: w._id.toString(),
            name: w.title,
            category: w.category,
            date: w.date ? dateKeyOf(w.date) : '',
            metric: `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'} · ${sets} ${sets === 1 ? 'set' : 'sets'}`,
        };
    });

    const dailyGoals = [
        {
            key: 'calories',
            label: 'Calories',
            current: todayCalories,
            target: caloriesTarget,
            unit: 'kcal',
        },
        {
            key: 'workouts',
            label: 'Workouts',
            current: weekWorkoutCount,
            target: weekTarget,
            unit: 'sessions',
        },
    ].filter((goal) => goal.target != null);

    const rings = [
        { key: 'workouts', label: 'Workouts', value: weekWorkoutCount, max: weekTarget, unit: 'sessions' },
    ];
    if (caloriesTarget != null) {
        rings.push({ key: 'calories', label: 'Calories', value: todayCalories, max: caloriesTarget, unit: 'kcal' });
    }
    if (proteinTarget != null) {
        rings.push({ key: 'protein', label: 'Protein', value: todayProtein, max: proteinTarget, unit: 'g' });
    }

    return {
        user: {
            name: user?.name ?? 'User',
        },
        summary: [
            { key: 'workouts', label: 'Total Workouts', value: allWorkouts.length, unit: '' },
            { key: 'exercises', label: 'Total Exercises', value: totals.exercises, unit: '' },
            { key: 'volume', label: 'Total Volume', value: Math.round(totals.volume), unit: 'kg' },
            { key: 'caloriesBurned', label: 'Est. Calories Burned', value: Math.round(totals.workoutCalories), unit: 'kcal' },
            { key: 'caloriesConsumed', label: 'Calories Consumed', value: totalCaloriesConsumed, unit: 'kcal' },
            { key: 'weight', label: 'Current Weight', value: user?.weightKg ?? null, unit: user?.preferences?.units || 'kg' },
            { key: 'streak', label: 'Workout Streak', value: streak, unit: 'days' },
        ],
        dailyGoals,
        rings,
        weeklyWorkouts,
        caloriesSeries,
        macros: {
            protein: todayProtein,
            carbs: todayCarbs,
            fat: todayFat,
        },
        recentWorkouts,
        hasData: allWorkouts.length > 0 || allNutrition.length > 0,
    };
}