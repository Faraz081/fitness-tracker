import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { BodyWeight } from '../models/BodyWeight.js';
import { Goal } from '../models/Goal.js';

function dateKeyOf(d) {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function dayEndKey(key) {
    const date = new Date(`${key}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date;
}

function round0(n) {
    return Math.round(n);
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

function resolveGoalWeightKg(goals) {
    const weightGoals = (goals ?? []).filter((g) => g.category === 'weight');
    if (weightGoals.length === 0) {
        return null;
    }
    const pool = weightGoals.filter((g) => !g.completedAt);
    const candidates = pool.length > 0 ? pool : weightGoals;
    const latest = candidates.sort((a, b) => (b.targetDate || '9999-99-99').localeCompare(a.targetDate || '9999-99-99'))[0];
    return latest?.targetValue ?? null;
}

export async function getAnalyticsData(owner, { from, to, category } = {}) {
    const dateFilter = {};
    if (from) {
        dateFilter.date = { $gte: new Date(`${from}T00:00:00.000Z`) };
    }
    if (to) {
        dateFilter.date = { ...(dateFilter.date || {}), $lt: dayEndKey(to) };
    }

    const workoutFilter = { owner, ...dateFilter };
    if (category) {
        workoutFilter.category = category;
    }

    const [workouts, weights, nutrition, weightGoals] = await Promise.all([
        Workout.find(workoutFilter).sort({ date: 1, createdAt: 1 }).lean(),
        BodyWeight.find({ owner, ...dateFilter }).sort({ date: 1, createdAt: 1 }).lean(),
        Nutrition.find({ owner, ...dateFilter }).sort({ date: 1, createdAt: 1 }).lean(),
        Goal.find({ owner, category: 'weight' }).lean(),
    ]);

    const outWorkouts = workouts.map((w) => ({
        id: String(w._id),
        name: w.title,
        category: w.category,
        date: dateKeyOf(w.date),
        notes: w.notes ?? null,
        exercises: (w.exercises ?? []).map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg ?? null,
        })),
    }));

    const weightEntries = weights.map((w) => ({
        date: dateKeyOf(w.date),
        weightKg: w.weightKg,
    }));

    const byDay = new Map();
    nutrition.forEach((n) => {
        const key = dateKeyOf(n.date);
        const rec = byDay.get(key) || { consumed: 0, burned: 0, protein: 0, carbs: 0, fat: 0 };
        rec.consumed += n.calories || 0;
        rec.protein += n.protein || 0;
        rec.carbs += n.carbs || 0;
        rec.fat += n.fat || 0;
        byDay.set(key, rec);
    });
    workouts.forEach((w) => {
        const key = dateKeyOf(w.date);
        const rec = byDay.get(key) || { consumed: 0, burned: 0, protein: 0, carbs: 0, fat: 0 };
        rec.burned += estimateWorkoutCalories(w);
        byDay.set(key, rec);
    });

    const dates = [...byDay.keys()].sort();
    const daily = dates.map((date) => {
        const v = byDay.get(date);
        return {
            date,
            consumed: round0(v.consumed),
            burned: round0(v.burned),
            protein: round0(v.protein),
            carbs: round0(v.carbs),
            fat: round0(v.fat),
            deficit: round0(v.burned - v.consumed),
        };
    });

    const calorieDays = daily.map(({ date, consumed, burned, deficit }) => ({ date, consumed, burned, deficit }));
    const macroDays = daily.map(({ date, protein, carbs, fat, consumed }) => ({ date, protein, carbs, fat, calories: consumed }));

    const goalWeightKg = resolveGoalWeightKg(weightGoals);
    const hasData = outWorkouts.length > 0 || weightEntries.length > 0 || calorieDays.length > 0;

    return {
        workouts: outWorkouts,
        weightEntries,
        calorieDays,
        macroDays,
        goalWeightKg,
        hasData,
    };
}