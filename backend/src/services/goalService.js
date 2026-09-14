import { randomUUID } from 'node:crypto';
import { Goal } from '../models/Goal.js';
import { Hydration } from '../models/Hydration.js';
import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { BodyWeight } from '../models/BodyWeight.js';
import { Measurement } from '../models/Measurement.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/apiError.js';

function dateKeyOf(d) {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function addDaysUtc(key, days) {
    const date = new Date(`${key}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return dateKeyOf(date);
}

function isValidDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key ?? ''))) {
        return false;
    }
    const [y, m, d] = String(key).split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return dateKeyOf(date) === String(key);
}

function computeStreak(dateKeys, todayKey) {
    const sorted = [...new Set(dateKeys)].sort();
    const today_or_past = sorted.filter((k) => k <= todayKey);
    let best = 0;
    let run = 0;
    let prev = null;
    for (const key of today_or_past) {
        run = prev && addDaysUtc(prev, 1) === key ? run + 1 : 1;
        best = Math.max(best, run);
        prev = key;
    }
    let current = 0;
    if (today_or_past.length > 0) {
        const last = today_or_past[today_or_past.length - 1];
        if (last === todayKey || last === addDaysUtc(todayKey, -1)) {
            current = 1;
            for (let i = today_or_past.length - 1; i > 0; i--) {
                if (addDaysUtc(today_or_past[i - 1], 1) === today_or_past[i]) {
                    current += 1;
                } else {
                    break;
                }
            }
        }
    }
    return { current, best, active: current > 0 };
}

function toGoalOut(goal, { currentValue, completedAt, targetToday, milestones }) {
    const resolvedMilestones = milestones ?? (goal.milestones ?? []).map((milestone) => {
        const pct = currentValue != null && goal.targetValue > 0
            ? Math.round((currentValue / goal.targetValue) * 100)
            : null;
        return {
            id: milestone.id,
            title: milestone.title,
            threshold: milestone.threshold,
            reachedAt: milestone.reachedAt
                || (pct != null && pct >= milestone.threshold ? targetToday : null),
        };
    });
    return {
        id: goal._id.toString(),
        title: goal.title,
        category: goal.category,
        targetValue: goal.targetValue,
        unit: goal.unit,
        startDate: goal.startDate ?? null,
        targetDate: goal.targetDate ?? null,
        currentValue,
        completedAt,
        milestones: resolvedMilestones,
    };
}

function windowFor(goal, todayKey) {
    const start = goal.startDate && isValidDateKey(goal.startDate) ? goal.startDate : '0000-00-00';
    let end = todayKey;
    if (goal.targetDate && isValidDateKey(goal.targetDate) && goal.targetDate < end) {
        end = goal.targetDate;
    }
    return { start, end };
}

function computeCurrentValue(goal, { workouts, latestWeight, todayKey }) {
    const window = windowFor(goal, todayKey);
    const inWindow = (k) => k >= window.start && k <= window.end;

    if (goal.category === 'strength') {
        const best = (workouts ?? []).reduce((max, w) => {
            for (const ex of w.exercises ?? []) {
                if (ex.weightKg != null && ex.weightKg > max) {
                    max = ex.weightKg;
                }
            }
            return max;
        }, 0);
        return best > 0 ? best : null;
    }

    if (goal.category === 'weight') {
        return latestWeight ?? null;
    }

    if (goal.category === 'endurance') {
        const count = (workouts ?? []).filter(
            (w) => (w.category === 'cardio' || w.category === 'hybrid') && inWindow(dateKeyOf(w.date)),
        ).length;
        return count;
    }

    const count = (workouts ?? []).filter((w) => inWindow(dateKeyOf(w.date))).length;
    return count;
}

function isReached(goal, currentValue, { profileGoal, weightBaseline }) {
    if (currentValue == null) {
        return false;
    }
    if (goal.category === 'weight') {
        const baseline = weightBaseline !== null
            ? weightBaseline
            : profileGoal === 'lose'
                ? currentValue + 1
                : profileGoal === 'gain'
                    ? currentValue - 1
                    : currentValue;
        const direction = baseline > goal.targetValue ? 'down' : baseline < goal.targetValue ? 'up' : 'at';
        if (direction === 'at' || currentValue === goal.targetValue) {
            return true;
        }
        return direction === 'down' ? currentValue <= goal.targetValue : currentValue >= goal.targetValue;
    }
    return currentValue >= goal.targetValue;
}

function buildStreaks({ workoutDateKeys, checkinDateKeys, hydrationDateKeys, todayKey }) {
    const workout = computeStreak(workoutDateKeys, todayKey);
    const checkin = computeStreak(checkinDateKeys, todayKey);
    const hydration = computeStreak(hydrationDateKeys, todayKey);
    return [
        { key: 'workout', label: 'Workout Streak', current: workout.current, best: workout.best, unit: 'days' },
        { key: 'checkin', label: 'Check-in Streak', current: checkin.current, best: checkin.best, unit: 'days' },
        { key: 'hydration', label: 'Hydration Streak', current: hydration.current, best: hydration.best, unit: 'days' },
    ];
}

export async function getGoals(owner, todayParam) {
    const todayKey = isValidDateKey(todayParam)
        ? todayParam
        : dateKeyOf(new Date());

    const [goals, user, workouts, nutrition, weights, measurements, hydrations] = await Promise.all([
        Goal.find({ owner }).sort({ createdAt: 1, _id: 1 }).lean(),
        User.findById(owner).lean(),
        Workout.find({ owner }).lean(),
        Nutrition.find({ owner }).lean(),
        BodyWeight.find({ owner }).sort({ date: -1, createdAt: -1 }).lean(),
        Measurement.find({ owner }).lean(),
        Hydration.find({ owner }).lean(),
    ]);

    const latestWeightDoc = weights[0];
    const latestWeight = latestWeightDoc?.weightKg ?? null;
    const weightBaseline = weights[weights.length - 1]?.weightKg ?? null;
    const profileGoal = user?.goal ?? null;

    const workoutDateKeys = workouts.map((w) => dateKeyOf(w.date)).filter((k) => k <= todayKey);
    const checkinKeys = new Set([
        ...workoutDateKeys,
        ...nutrition.map((e) => dateKeyOf(e.date)).filter((k) => k <= todayKey),
        ...weights.map((we) => dateKeyOf(we.date)).filter((k) => k <= todayKey),
        ...measurements.map((m) => dateKeyOf(m.date)).filter((k) => k <= todayKey),
        ...hydrations.map((h) => dateKeyOf(h.date)).filter((k) => k <= todayKey),
    ]);

    const hydratedDates = hydrations.map((h) => dateKeyOf(h.date)).filter((k) => k <= todayKey);

    const goalOut = [];
    const pendingWrites = [];
    for (const goal of goals) {
        const currentValue = computeCurrentValue(goal, { workouts, latestWeight, todayKey });
        const reached = isReached(goal, currentValue, { profileGoal, weightBaseline });
        const completedAt = goal.completedAt ?? (reached ? todayKey : null);

        const milestoneWrites = [];
        const milestones = (goal.milestones ?? []).map((milestone) => {
            const pct = currentValue != null && goal.targetValue > 0
                ? Math.round((currentValue / goal.targetValue) * 100)
                : null;
            const reachedAt = milestone.reachedAt
                || (pct != null && pct >= milestone.threshold ? todayKey : null);
            if (!milestone.reachedAt && reachedAt) {
                milestoneWrites.push({ id: milestone.id, reachedAt });
            }
            return {
                id: milestone.id,
                title: milestone.title,
                threshold: milestone.threshold,
                reachedAt,
            };
        });

        const set = {};
        if (!goal.completedAt && completedAt) {
            set.completedAt = completedAt;
        }
        if (milestoneWrites.length > 0) {
            set.milestones = (goal.milestones ?? []).map((milestone) => {
                const write = milestoneWrites.find((m) => m.id === milestone.id);
                return write
                    ? { ...milestone, reachedAt: write.reachedAt }
                    : milestone;
            });
        }
        if (Object.keys(set).length > 0) {
            pendingWrites.push(Goal.updateOne({ owner, _id: goal._id }, { $set: set }));
        }

        goalOut.push(toGoalOut(goal, { currentValue, completedAt, targetToday: todayKey, milestones }));
    }
    if (pendingWrites.length > 0) {
        await Promise.all(pendingWrites);
    }

    return {
        goals: goalOut,
        streaks: buildStreaks({
            workoutDateKeys,
            checkinDateKeys: [...checkinKeys],
            hydrationDateKeys: hydratedDates,
            todayKey,
        }),
    };
}

export async function createGoal(owner, input) {
    const milestones = (input.milestones ?? []).map((milestone) => ({
        id: `ms-${randomUUID().slice(0, 8)}`,
        title: milestone.title,
        threshold: milestone.threshold,
    }));
    const goal = await Goal.create({
        owner,
        title: input.title,
        category: input.category,
        targetValue: input.targetValue,
        unit: input.unit ?? 'kg',
        startDate: input.startDate ?? null,
        targetDate: input.targetDate ?? null,
        milestones,
    });
    return goal;
}

export async function updateGoal(owner, id, patch) {
    const set = {};
    ['title', 'category', 'targetValue', 'unit', 'startDate', 'targetDate'].forEach((field) => {
        if (patch[field] !== undefined) {
            set[field] = patch[field];
        }
    });
    if (Object.keys(set).length === 0) {
        throw new AppError(400, 'Nothing to update', 'EMPTY_UPDATE');
    }
    const goal = await Goal.findOneAndUpdate(
        { owner, _id: id },
        { $set: set },
        { returnDocument: 'after', runValidators: true },
    ).lean();
    if (!goal) {
        throw new AppError(404, 'Goal not found', 'NOT_FOUND');
    }
    return goal;
}

export async function deleteGoal(owner, id) {
    const goal = await Goal.findOneAndDelete({ owner, _id: id }).lean();
    if (!goal) {
        throw new AppError(404, 'Goal not found', 'NOT_FOUND');
    }
    return goal;
}

export async function addHydration(owner, input) {
    const current = dateKeyOf(new Date());
    const dateKey = isValidDateKey(input.date) ? input.date : current;
    const hydration = await Hydration.create({
        owner,
        date: new Date(`${dateKey}T00:00:00.000Z`),
        amountMl: input.amountMl ?? 250,
        note: input.note,
    });
    return {
        id: hydration._id.toString(),
        date: dateKeyOf(hydration.date),
        amountMl: hydration.amountMl,
        note: hydration.note ?? '',
    };
}

export async function deleteHydration(owner, id) {
    const hydration = await Hydration.findOneAndDelete({ owner, _id: id }).lean();
    if (!hydration) {
        throw new AppError(404, 'Hydration record not found', 'NOT_FOUND');
    }
    return {
        id: hydration._id.toString(),
        date: dateKeyOf(hydration.date),
        amountMl: hydration.amountMl,
        note: hydration.note ?? '',
    };
}