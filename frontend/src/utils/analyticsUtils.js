import { computeStreak } from './streakUtils';
import { formatWeight, weightUnitLabel } from './units';

const DAY_MS = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
}

function toISO(date) {
    return date.toISOString().slice(0, 10);
}

function addDays(iso, n) {
    const d = new Date(parseISO(iso));
    d.setUTCDate(d.getUTCDate() + n);
    return toISO(d);
}

function diffDays(a, b) {
    return Math.round((parseISO(b) - parseISO(a)) / DAY_MS);
}

function todayString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function startOfWeekISO(iso) {
    const d = new Date(parseISO(iso));
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
    return toISO(d);
}

function clamp(value, lo, hi) {
    return Math.min(hi, Math.max(lo, value));
}

function round1(n) {
    return Math.round(n * 10) / 10;
}

function round0(n) {
    return Math.round(n);
}

function inRange(date, from, to) {
    if (from && date < from) {
        return false;
    }
    if (to && date > to) {
        return false;
    }
    return true;
}

function bucketKeyForDate(date, bucket) {
    if (bucket === 'day') {
        return date;
    }
    if (bucket === 'week') {
        return startOfWeekISO(date);
    }
    return `${date.slice(0, 7)}-01`;
}

function bucketLabel(date, bucket) {
    if (bucket === 'month') {
        return monthLabel(date);
    }
    return isoWeekLabel(date);
}

export function isoWeekLabel(iso) {
    const [, , day] = iso.split('-').map(Number);
    const month = MONTHS[Number(iso.slice(5, 7)) - 1];
    return `${month} ${day}`;
}

export function monthLabel(iso) {
    const year = iso.slice(0, 4);
    const month = MONTHS[Number(iso.slice(5, 7)) - 1];
    return `${month} ${year}`;
}

export function resolveRange(periodKey, { from, to } = {}, today = todayString()) {
    if (periodKey === 'custom') {
        return { from: from || undefined, to: to || undefined };
    }
    if (periodKey === 'week') {
        return { from: startOfWeekISO(today), to: today };
    }
    if (periodKey === 'month') {
        return { from: `${today.slice(0, 7)}-01`, to: today };
    }
    const days = {
        last30: 29,
        last3: 89,
        last6: 179,
        lastYear: 364,
    };
    if (days[periodKey] !== undefined) {
        return { from: addDays(today, -days[periodKey]), to: today };
    }
    return { from: undefined, to: undefined };
}

export function bucketForRange(from, to) {
    if (from && to) {
        const span = diffDays(from, to);
        if (span <= 10) {
            return 'day';
        }
        if (span <= 120) {
            return 'week';
        }
        return 'month';
    }
    return 'month';
}

export function computeFrequency(workouts = [], { from, to } = {}) {
    const bucket = bucketForRange(from, to);
    const map = new Map();
    for (const w of workouts) {
        if (!inRange(w.date, from, to)) {
            continue;
        }
        const key = bucketKeyForDate(w.date, bucket);
        const entry = map.get(key);
        if (entry) {
            entry.count += 1;
        } else {
            map.set(key, { label: bucketLabel(key, bucket), date: key, count: 1 });
        }
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function estimate1RM(weightKg, reps) {
    const w = Number(weightKg);
    const r = Number(reps);
    if (Number.isFinite(r) && r >= 1 && Number.isFinite(w) && w > 0) {
        return round1(w * (1 + r / 30));
    }
    return null;
}

export function exerciseHistory(exerciseName, workouts = [], { from, to } = {}) {
    const out = [];
    for (const w of workouts) {
        if (!inRange(w.date, from, to)) {
            continue;
        }
        for (const ex of w.exercises || []) {
            if (ex.name !== exerciseName) {
                continue;
            }
            const sets = Number(ex.sets) || 0;
            const reps = Number(ex.reps) || 0;
            const weightKg = Number(ex.weightKg) || 0;
            out.push({
                date: w.date,
                sets,
                reps,
                weightKg,
                volumeKg: sets * reps * weightKg,
                estimated1RM: estimate1RM(weightKg, reps),
            });
        }
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function computeExerciseVolume(exerciseName, workouts = [], { from, to } = {}) {
    const bucket = bucketForRange(from, to);
    const map = new Map();
    for (const rec of exerciseHistory(exerciseName, workouts, { from, to })) {
        const key = bucketKeyForDate(rec.date, bucket);
        const entry = map.get(key);
        if (entry) {
            entry.volumeKg += rec.volumeKg;
        } else {
            map.set(key, { label: bucketLabel(key, bucket), date: key, volumeKg: rec.volumeKg });
        }
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function computeWeightTrend(entries = [], { from, to } = {}) {
    const byDate = new Map();
    for (const e of entries) {
        if (!inRange(e.date, from, to)) {
            continue;
        }
        byDate.set(e.date, Number(e.weightKg));
    }
    const points = [...byDate.entries()]
        .map(([date, weightKg]) => ({ date, weightKg }))
        .sort((a, b) => a.date.localeCompare(b.date));
    if (points.length === 0) {
        return { points: [], changeKg: 0, latest: null };
    }
    const changeKg = round1(points[points.length - 1].weightKg - points[0].weightKg);
    return { points, changeKg, latest: points[points.length - 1].weightKg };
}

export function computeCalories(days = [], { from, to } = {}) {
    const points = [];
    let sumConsumed = 0;
    let sumBurned = 0;
    for (const d of days) {
        if (!inRange(d.date, from, to)) {
            continue;
        }
        const consumed = Number(d.consumed) || 0;
        const burned = Number(d.burned) || 0;
        const deficit = Number(d.deficit);
        points.push({ date: d.date, consumed, burned, deficit: Number.isFinite(deficit) ? round0(deficit) : round0(burned - consumed) });
        sumConsumed += consumed;
        sumBurned += burned;
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    const count = points.length;
    const avgConsumed = count ? round0(sumConsumed / count) : 0;
    const avgBurned = count ? round0(sumBurned / count) : 0;
    return { points, avgConsumed, avgBurned, netDeficit: count ? avgBurned - avgConsumed : 0 };
}

export function aggregateMacros(days = [], { from, to } = {}) {
    const points = [];
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let calories = 0;
    let count = 0;
    for (const d of days) {
        if (!inRange(d.date, from, to)) {
            continue;
        }
        points.push({ date: d.date, protein: Number(d.protein) || 0, carbs: Number(d.carbs) || 0, fat: Number(d.fat) || 0 });
        protein += Number(d.protein) || 0;
        carbs += Number(d.carbs) || 0;
        fat += Number(d.fat) || 0;
        calories += Number(d.calories) || 0;
        count += 1;
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (!count) {
        return { points: [], averages: { protein: 0, carbs: 0, fat: 0 }, calorieAvg: 0 };
    }
    return {
        points,
        averages: { protein: round0(protein / count), carbs: round0(carbs / count), fat: round0(fat / count) },
        calorieAvg: round0(calories / count),
    };
}

export function previousRange(range = {}, today = todayString()) {
    const { from, to } = range;
    if (!from) {
        return null;
    }
    const end = to || today;
    const spanDays = diffDays(from, end) + 1;
    const previousFrom = addDays(from, -spanDays);
    const previousTo = addDays(from, -1);
    const label = spanDays <= 7 ? 'Last Week' : spanDays <= 31 ? 'Last Month' : `Previous ${spanDays} days`;
    return { from: previousFrom, to: previousTo, label };
}

export function comparePeriods(current = null, previous = null) {
    if (!current || !previous) {
        return [];
    }
    const metrics = [
        { metric: 'workouts', label: 'Workouts' },
        { metric: 'volume', label: 'Volume' },
        { metric: 'calories', label: 'Calories' },
        { metric: 'weightChange', label: 'Weight change' },
    ];
    const out = [];
    for (const m of metrics) {
        const c = current[m.metric];
        const p = previous[m.metric];
        if (c === undefined || c === null || p === undefined || p === null) {
            continue;
        }
        out.push({ metric: m.metric, label: m.label, current: c, previous: p, delta: round1(c - p) });
    }
    return out;
}

export function computeProgressScore(workouts = [], weightEntries = [], calorieDays = [], { from, to } = {}, goalWeightKg = null) {
    const spanDays = from && to ? diffDays(from, to) + 1 : 366;
    const rangeWorkouts = workouts.filter((w) => inRange(w.date, from, to));
    const rangeWeight = weightEntries.filter((e) => inRange(e.date, from, to));
    const rangeCalories = calorieDays.filter((d) => inRange(d.date, from, to));

    if (spanDays < 7 && rangeWorkouts.length === 0 && rangeWeight.length === 0 && rangeCalories.length === 0) {
        return null;
    }
    if (rangeWorkouts.length === 0 && rangeWeight.length === 0 && rangeCalories.length === 0) {
        return null;
    }

    const weeks = Math.max(1, spanDays / 7);
    const consistency = round1(clamp(rangeWorkouts.length / weeks, 0, 4) / 4 * 40);

    let calories = 0;
    if (rangeCalories.length) {
        let withinBand = 0;
        for (const d of rangeCalories) {
            const deficit = Number(d.deficit);
            const value = Number.isFinite(deficit) ? deficit : (Number(d.burned) || 0) - (Number(d.consumed) || 0);
            if (Math.abs(value) <= 300) {
                withinBand += 1;
            }
        }
        calories = round1(withinBand / rangeCalories.length * 30);
    }

    let weight = 0;
    if (goalWeightKg !== null && goalWeightKg !== undefined && rangeWeight.length) {
        const sorted = [...rangeWeight].sort((a, b) => a.date.localeCompare(b.date));
        const byDate = new Map();
        for (const e of sorted) {
            byDate.set(e.date, Number(e.weightKg));
        }
        const values = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        const startKg = values[0][1];
        const latestKg = values[values.length - 1][1];
        const denom = startKg - Number(goalWeightKg);
        if (denom > 0) {
            weight = round1(clamp((startKg - latestKg) / denom, 0, 1) * 30);
        }
    }

    return {
        score: round1(consistency + calories + weight),
        factors: { consistency, calories, weight },
    };
}

export function buildSummary(workouts = [], weightEntries = [], calorieDays = [], { from, to } = {}, goalWeightKg = null, insightPool = {}) {
    const progress = computeProgressScore(workouts, weightEntries, calorieDays, { from, to }, goalWeightKg);
    if (!progress) {
        return null;
    }
    const rangedWorkouts = workouts.filter((w) => inRange(w.date, from, to));
    const streak = computeStreak(rangedWorkouts.map((w) => w.date));
    const calories = computeCalories(calorieDays, { from, to });
    const weight = computeWeightTrend(weightEntries, { from, to });

    const { factors } = progress;
    const ranked = ['consistency', 'calories', 'weight'].sort((a, b) => factors[b] - factors[a]);
    const topFactor = ranked[0];
    const pool = insightPool[topFactor] || insightPool.consistency || [];
    const topInsight = (pool && pool[0]) || 'Keep logging to see personalised insights here.';

    return {
        progressScore: progress.score,
        streakDays: streak.current,
        totalWorkouts: rangedWorkouts.length,
        avgCalories: calories.avgConsumed,
        weightChange: weight.changeKg,
        topInsight,
        factors: progress.factors,
    };
}

export function mostFrequentExercise(workouts = [], { from, to } = {}) {
    const counts = new Map();
    for (const w of workouts) {
        if (!inRange(w.date, from, to)) {
            continue;
        }
        for (const ex of w.exercises || []) {
            counts.set(ex.name, (counts.get(ex.name) || 0) + 1);
        }
    }
    let bestName = null;
    let bestCount = 0;
    for (const [name, count] of counts) {
        if (count > bestCount || (count === bestCount && bestName !== null && name < bestName)) {
            bestName = name;
            bestCount = count;
        }
    }
    return bestName;
}

export function formatKg(n, units = 'kg') {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) {
        return '—';
    }
    return `${formatWeight(Number(n), units)} ${weightUnitLabel(units)}`;
}

export function formatCalories(n) {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) {
        return '—';
    }
    return `${Math.round(Number(n)).toLocaleString()} kcal`;
}

export function formatPct(n) {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) {
        return '—';
    }
    return `${Math.round(Number(n))}%`;
}

export function formatDelta(n, unit = '') {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) {
        return 'flat';
    }
    const value = Number(n);
    if (value === 0) {
        return 'flat';
    }
    const rounded = Math.abs(value) < 10 ? round1(value) : Math.round(value);
    const sign = value > 0 ? '+' : '−';
    return `${sign}${Math.abs(rounded)}${unit}`;
}