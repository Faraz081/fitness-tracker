import { ExerciseRow } from './ExerciseRow';
import { EmptyState } from '../ui';
import { uniqueExerciseNames, exercisesFor } from '../../utils/historyUtils';

function exerciseNames(workouts, name) {
    const all = uniqueExerciseNames(workouts);
    return name ? all.filter((n) => n === name) : all;
}

export function ExerciseHistory({ workouts, name = '' }) {
    const names = exerciseNames(workouts, name);

    if (workouts.length === 0) {
        return <EmptyState title="No exercise history yet" message="Once you log workouts, each exercise will show its progression here." />;
    }

    return (
        <div className="space-y-5">
            {names.map((exName) => {
                const entries = workouts
                    .flatMap((w) =>
                        exercisesFor(w, exName).map((ex) => ({ exercise: ex, date: w.date }))
                    )
                    .sort((a, b) => b.date.localeCompare(a.date));

                return (
                    <div key={exName} className="dash-card p-5">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-[var(--color-ink)]">
                                {exName}
                            </h3>
                            <span className="text-xs text-[var(--color-ink-muted)]">
                                {entries.length} {entries.length === 1 ? 'session' : 'sessions'}
                            </span>
                        </div>
                        <ul className="divide-y divide-[var(--color-line)]">
                            {entries.map((entry) => (
                                <ExerciseRow
                                    key={`${entry.date}-${entry.exercise.name}`}
                                    exercise={entry.exercise}
                                    date={entry.date}
                                />
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}