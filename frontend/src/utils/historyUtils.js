export function workoutVolume(workout) {
    if (!workout?.exercises?.length) {
        return 0;
    }
    return workout.exercises.reduce((total, ex) => {
        const weight = Number(ex.weightKg) || 0;
        return total + ex.sets * ex.reps * weight;
    }, 0);
}

export function formatVolume(value) {
    const n = Math.round(Number(value) || 0);
    return `${n.toLocaleString()} kg`;
}

export function filterWorkouts(workouts, { category = 'all', from, to } = {}) {
    return workouts
        .filter((w) => {
            const categoryMatch = !category || category === 'all' || w.category === category;
            const fromMatch = !from || w.date >= from;
            const toMatch = !to || w.date <= to;
            return categoryMatch && fromMatch && toMatch;
        })
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));
}

export function groupByDate(workouts) {
    const groups = [];
    for (const w of workouts) {
        const last = groups[groups.length - 1];
        if (last && last.date === w.date) {
            last.workouts.push(w);
        } else {
            groups.push({ date: w.date, workouts: [w] });
        }
    }
    return groups;
}

export function findWorkout(workouts, id) {
    return workouts.find((w) => w.id === id);
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

export function bestVolume(workouts) {
    return workouts.reduce((max, w) => Math.max(max, workoutVolume(w)), 0);
}