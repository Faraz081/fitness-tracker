import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GoalsList } from '../components/progress/GoalsList';
import { StreakRow } from '../components/progress/StreakRow';
import { Spinner, EmptyState } from '../components/ui';
import { goalsData, emptyGoalsData } from '../data/goalsData';
import { progressData } from '../data/progressData';
import { computeStreak } from '../utils/streakUtils';

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
                Goals
            </h1>
        </div>
    );
}

function buildStreaks(streaks, workoutDates) {
    const derived = computeStreak(workoutDates);
    return streaks.map((streak) =>
        streak.key === 'workout'
            ? { ...streak, current: derived.current, best: Math.max(streak.best, derived.best) }
            : streak,
    );
}

function GoalsContent({ data }) {
    const streaks = buildStreaks(data.streaks, progressData.workoutDates);

    return (
        <div className="space-y-6">
            <PageHeading />

            <StreakRow streaks={streaks} />

            <GoalsList goals={data.goals} />
        </div>
    );
}

export default function Goals() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(goalsData);
                setLoading(false);
            }
        }, 500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const showEmpty = data === emptyGoalsData;

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your goals could not be loaded. Try again." />
            ) : (
                <GoalsContent data={showEmpty ? emptyGoalsData : data} />
            )}
        </DashboardLayout>
    );
}