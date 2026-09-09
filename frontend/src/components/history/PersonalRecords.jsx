import { EmptyState } from '../ui';
import { PR_FIELDS } from '../../data/constants';
import { bestLift, bestSet } from '../../utils/historyUtils';

function exerciseVolume(exercise) {
    return exercise.sets * exercise.reps * (Number(exercise.weightKg) || 0);
}

function bestWorkoutVolume(exerciseName, workouts) {
    let best = null;
    for (const w of workouts) {
        for (const ex of w.exercises || []) {
            if (ex.name !== exerciseName) {
                continue;
            }
            const volume = exerciseVolume(ex);
            if (volume > 0 && (best === null || volume > best)) {
                best = volume;
            }
        }
    }
    return best;
}

function toDisplay(value) {
    return Math.round(Number(value) || 0).toLocaleString();
}

export function PersonalRecords({ exerciseName, workouts }) {
    const lift = bestLift(exerciseName, workouts);
    const set = bestSet(exerciseName, workouts);
    const volume = bestWorkoutVolume(exerciseName, workouts);

    if (lift === null && set === null && volume === null) {
        return (
            <div className="dash-card p-5">
                <h3 className="mb-1 dash-num text-base text-[var(--color-ink)]">
                    Personal Records
                </h3>
                <p className="mb-3 text-xs text-[var(--color-ink-muted)]">for {exerciseName}</p>
                <EmptyState title="No personal records yet" message="Add weighted sets to unlock performance records." />
            </div>
        );
    }

    const records = [
        { key: PR_FIELDS[0].key, label: PR_FIELDS[0].label, value: lift, unit: PR_FIELDS[0].unit },
        { key: PR_FIELDS[1].key, label: PR_FIELDS[1].label, value: set, unit: PR_FIELDS[1].unit },
        { key: PR_FIELDS[2].key, label: PR_FIELDS[2].label, value: volume, unit: PR_FIELDS[2].unit },
    ];

    return (
        <div className="dash-card p-5">
            <h3 className="dash-num text-base text-[var(--color-ink)]">Personal Records</h3>
            <p className="mb-4 text-xs text-[var(--color-ink-muted)]">for {exerciseName}</p>
            <div className="grid grid-cols-3 gap-3">
                {records.map((r) => (
                    <div key={r.key} className="text-center">
                        <p className="dash-num text-lg text-[var(--color-accent)]">
                            {r.value === null ? '—' : toDisplay(r.value)}
                            <span className="ml-1 text-xs font-normal text-[var(--color-ink-muted)]">
                                {r.unit}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{r.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}