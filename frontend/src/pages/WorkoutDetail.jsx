import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WorkoutDetail as WorkoutDetailView } from '../components/history/WorkoutDetail';
import { Spinner, EmptyState } from '../components/ui';
import { toLocalDateKey } from '../utils/filterUtils';
import * as api from '../services/api';

export default function WorkoutDetail() {
    const { id } = useParams();
    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);
        api.getWorkout(id)
            .then((w) => {
                if (!cancelled) {
                    setWorkout({
                        ...w,
                        name: w.title ?? w.name,
                        date: toLocalDateKey(w.date),
                    });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setNotFound(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="space-y-6">
            <Link
                to="/workouts"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
            >
                &larr; Back to workouts
            </Link>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : notFound || !workout ? (
                <EmptyState
                    title="Workout not found"
                    message="We could not find a workout with that ID. It may have been removed."
                    action={
                        <Link
                            to="/workouts"
                            className="inline-flex rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                        >
                            Back to workouts
                        </Link>
                    }
                />
            ) : (
                <WorkoutDetailView workout={workout} />
            )}
        </div>
    );
}