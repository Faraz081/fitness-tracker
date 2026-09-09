import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WorkoutDetail as WorkoutDetailView } from '../components/history/WorkoutDetail';
import { Spinner, EmptyState } from '../components/ui';
import { workouts } from '../data/workoutHistoryData';
import { findWorkout } from '../utils/historyUtils';

export default function WorkoutDetail() {
    const { id } = useParams();
    const [match, setMatch] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setMatch(findWorkout(workouts, id));
                setLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [id]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Link
                    to="/workouts-history"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
                >
                    &larr; Back to history
                </Link>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Spinner />
                    </div>
                ) : match ? (
                    <WorkoutDetailView workout={match} />
                ) : (
                    <EmptyState
                        title="Workout not found"
                        message="We could not find a workout with that ID. It may have been removed."
                        action={
                            <Link
                                to="/workouts-history"
                                className="inline-flex rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                            >
                                Back to history
                            </Link>
                        }
                    />
                )}
            </div>
        </DashboardLayout>
    );
}