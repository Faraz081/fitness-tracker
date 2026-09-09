import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PersonalRecords } from '../components/history/PersonalRecords';
import { ExerciseHistory } from '../components/history/ExerciseHistory';
import { Spinner, EmptyState } from '../components/ui';
import { workouts } from '../data/workoutHistoryData';
import { uniqueExerciseNames } from '../utils/historyUtils';

function PageHeading() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div>
            <p className="text-sm text-[var(--color-ink-muted)]">{dateLabel}</p>
            <h1 className="mt-1 dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">
                Exercise History
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
                Track how each exercise changes over time, with personal records derived from your logs.
            </p>
        </div>
    );
}

export default function ExerciseHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const names = uniqueExerciseNames(workouts);

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your exercise history could not be loaded. Try again." />
            ) : workouts.length === 0 ? (
                <div className="space-y-6">
                    <PageHeading />
                    <EmptyState title="No exercise history yet" message="Once you log workouts, each exercise will show its progression and records here." />
                </div>
            ) : (
                <div className="space-y-6">
                    <PageHeading />
                    <div className="space-y-6">
                        {names.map((name) => (
                            <div key={name} className="grid gap-4 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <ExerciseHistory workouts={workouts} name={name} />
                                </div>
                                <PersonalRecords exerciseName={name} workouts={workouts} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}