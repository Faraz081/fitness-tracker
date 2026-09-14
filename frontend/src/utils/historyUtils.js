import { kgToLb, weightUnitLabel } from './units';

export function workoutVolume(workout) {
    if (!workout?.exercises?.length) {
        return 0;
    }
    return workout.exercises.reduce((total, ex) => {
        const weight = Number(ex.weightKg) || 0;
        return total + ex.sets * ex.reps * weight;
    }, 0);
}

export function formatVolume(value, units = 'kg') {
    const raw = Math.round(Number(value) || 0);
    const n = units === 'lb' ? Math.round(kgToLb(raw)) : raw;
    return `${n.toLocaleString()} ${weightUnitLabel(units)}`;
}

export function exercisesFor(workout, name) {
    return (workout?.exercises || []).filter((ex) => ex.name === name);
}

export function uniqueExerciseNames(workouts) {
    const names = [];
    const seen = new Set();
    for (const w of workouts) {
        for (const ex of w.exercises || []) {
            if (!seen.has(ex.name)) {
                seen.add(ex.name);
                names.push(ex.name);
            }
        }
    }
    return names.sort((a, b) => a.localeCompare(b));
}

export function bestLift(exerciseName, workouts) {
    let best = null;
    for (const w of workouts) {
        for (const ex of exercisesFor(w, exerciseName)) {
            const weight = Number(ex.weightKg);
            if (weight > 0 && (best === null || weight > best)) {
                best = weight;
            }
        }
    }
    return best;
}

export function bestSet(exerciseName, workouts) {
    let best = null;
    for (const w of workouts) {
        for (const ex of exercisesFor(w, exerciseName)) {
            const weight = Number(ex.weightKg);
            if (weight <= 0) {
                continue;
            }
            const volume = ex.sets * ex.reps * weight;
            if (best === null || volume > best) {
                best = volume;
            }
        }
    }
    return best;
}