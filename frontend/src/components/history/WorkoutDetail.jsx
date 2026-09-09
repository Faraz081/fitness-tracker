import { CategoryBadge } from './CategoryBadge';
import { ExerciseRow } from './ExerciseRow';
import { EmptyState } from '../ui';
import { workoutVolume, formatVolume } from '../../utils/historyUtils';

function formatDate(isoDate) {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function ExerciseTable({ exercises }) {
    if (!exercises?.length) {
        return <EmptyState title="No exercises in this workout" message="This workout has no logged exercises." />;
    }
    return (
        <div className="overflow-x-auto">
            <ul className="divide-y divide-[var(--color-line)]">
                {exercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                ))}
            </ul>
        </div>
    );
}

export function WorkoutDetail({ workout }) {
    const volume = workoutVolume(workout);
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">
                            {workout.name}
                        </h1>
                        <CategoryBadge category={workout.category} />
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                        {formatDate(workout.date)}
                    </p>
                </div>
                {volume > 0 && (
                    <div className="dash-card px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                            Total Volume
                        </p>
                        <p className="dash-num text-lg text-[var(--color-accent)]">
                            {formatVolume(volume)}
                        </p>
                    </div>
                )}
            </div>

            {workout.notes && (
                <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    {workout.notes}
                </p>
            )}

            <div className="dash-card p-5">
                <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Exercises</h2>
                <ExerciseTable exercises={workout.exercises} />
            </div>
        </div>
    );
}