import { BodyWeight } from '../models/BodyWeight.js';
import { Measurement } from '../models/Measurement.js';
import { Workout } from '../models/Workout.js';
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

function weekMondayKey(key) {
    const date = new Date(`${key}T00:00:00.000Z`);
    const offset = (date.getUTCDay() + 6) % 7;
    return addDaysUtc(key, -offset);
}

function toWeightOut(w) {
    return {
        id: w._id.toString(),
        date: dateKeyOf(w.date),
        weightKg: w.weightKg,
    };
}

function toMeasurementOut(m) {
    return {
        id: m._id.toString(),
        date: dateKeyOf(m.date),
        chestCm: m.chestCm ?? null,
        waistCm: m.waistCm ?? null,
        armsCm: m.armsCm ?? null,
        hipsCm: m.hipsCm ?? null,
        thighsCm: m.thighsCm ?? null,
    };
}

function exerciseVolume(exercise) {
    return (exercise.sets ?? 0) * (exercise.reps ?? 0) * (exercise.weightKg ?? 0);
}

function buildPerformance(workouts) {
    const perWeek = new Map();
    workouts.forEach((w) => {
        const monday = weekMondayKey(dateKeyOf(w.date));
        const record = perWeek.get(monday) || { sessions: new Set(), volume: 0 };
        record.sessions.add(w._id.toString());
        record.volume += (w.exercises ?? []).reduce((sum, e) => sum + exerciseVolume(e), 0);
        perWeek.set(monday, record);
    });
    const anchor = weekMondayKey(dateKeyOf(new Date()));
    const result = [];
    for (let i = 7; i >= 0; i--) {
        const key = addDaysUtc(anchor, -i * 7);
        const record = perWeek.get(key);
        result.push({
            id: key,
            week: key,
            totalVolumeKg: Math.round(record?.volume || 0),
            sessions: record?.sessions.size || 0,
        });
    }
    return result;
}

function buildStrengthHistory(workouts) {
    const best = new Map();
    workouts.forEach((w) => {
        const day = dateKeyOf(w.date);
        (w.exercises ?? []).forEach((ex) => {
            const kg = ex.weightKg;
            if (!kg) {
                return;
            }
            const volume = exerciseVolume(ex);
            const current = best.get(ex.name);
            if (!current || kg > current.prKg || (kg === current.prKg && volume > current.volume)) {
                best.set(ex.name, {
                    id: `${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${w._id.toString()}`,
                    exercise: ex.name,
                    prKg: kg,
                    sets: ex.sets ?? 0,
                    reps: ex.reps ?? 0,
                    date: day,
                    volume,
                });
            }
            else if (kg === current.prKg && day > current.date) {
                current.date = day;
            }
        });
    });
    return [...best.values()]
        .sort((a, b) => (b.prKg - a.prKg) || a.exercise.localeCompare(b.exercise))
        .map(({ volume, ...record }) => record);
}

async function syncUserWeight(owner, weightKg) {
    if (weightKg == null) {
        return;
    }
    await User.updateOne({ _id: owner }, { $set: { weightKg } });
}

export async function getProgress(owner) {
    const [weights, measurements, workouts] = await Promise.all([
        BodyWeight.find({ owner }).sort({ date: -1, createdAt: -1 }).lean(),
        Measurement.find({ owner }).sort({ date: -1, createdAt: -1 }).lean(),
        Workout.find({ owner }).sort({ date: -1 }).lean(),
    ]);
    return {
        weightEntries: weights.map(toWeightOut),
        measurements: measurements.map(toMeasurementOut),
        performance: buildPerformance(workouts),
        strengthHistory: buildStrengthHistory(workouts),
    };
}

export async function listWeights(owner) {
    const weights = await BodyWeight.find({ owner }).sort({ date: -1, createdAt: -1 }).lean();
    return weights.map(toWeightOut);
}

export async function addWeight(owner, input) {
    const weight = await BodyWeight.create({
        owner,
        date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : new Date(),
        weightKg: input.weightKg,
    });
    await syncUserWeight(owner, input.weightKg);
    return toWeightOut(weight.toObject());
}

export async function updateWeight(owner, id, patch) {
    const set = {};
    if (patch.weightKg != null) {
        set.weightKg = patch.weightKg;
    }
    if (patch.date != null) {
        set.date = new Date(`${patch.date}T00:00:00.000Z`);
    }
    if (Object.keys(set).length === 0) {
        throw new AppError(400, 'Nothing to update', 'EMPTY_UPDATE');
    }
    const weight = await BodyWeight.findOneAndUpdate({ owner, _id: id }, { $set: set }, { returnDocument: 'after', runValidators: true }).lean();
    if (!weight) {
        throw new AppError(404, 'Weight entry not found', 'NOT_FOUND');
    }
    if (patch.weightKg != null) {
        await syncUserWeight(owner, patch.weightKg);
    }
    return toWeightOut(weight);
}

export async function deleteWeight(owner, id) {
    const weight = await BodyWeight.findOneAndDelete({ owner, _id: id }).lean();
    if (!weight) {
        throw new AppError(404, 'Weight entry not found', 'NOT_FOUND');
    }
    const latest = await BodyWeight.findOne({ owner }).sort({ date: -1, createdAt: -1 }).lean();
    if (latest) {
        await syncUserWeight(owner, latest.weightKg);
    }
    return toWeightOut(weight);
}

export async function addMeasurement(owner, input) {
    const measurement = await Measurement.create({
        owner,
        date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : new Date(),
        chestCm: input.chestCm,
        waistCm: input.waistCm,
        armsCm: input.armsCm,
        hipsCm: input.hipsCm,
        thighsCm: input.thighsCm,
    });
    return toMeasurementOut(measurement.toObject());
}

export async function updateMeasurement(owner, id, patch) {
    const set = {};
    if (patch.date != null) {
        set.date = new Date(`${patch.date}T00:00:00.000Z`);
    }
    ['chestCm', 'waistCm', 'armsCm', 'hipsCm', 'thighsCm'].forEach((field) => {
        if (patch[field] != null) {
            set[field] = patch[field];
        }
    });
    if (Object.keys(set).length === 0) {
        throw new AppError(400, 'Nothing to update', 'EMPTY_UPDATE');
    }
    const measurement = await Measurement.findOneAndUpdate({ owner, _id: id }, { $set: set }, { returnDocument: 'after', runValidators: true }).lean();
    if (!measurement) {
        throw new AppError(404, 'Measurement not found', 'NOT_FOUND');
    }
    return toMeasurementOut(measurement);
}

export async function deleteMeasurement(owner, id) {
    const measurement = await Measurement.findOneAndDelete({ owner, _id: id }).lean();
    if (!measurement) {
        throw new AppError(404, 'Measurement not found', 'NOT_FOUND');
    }
    return toMeasurementOut(measurement);
}