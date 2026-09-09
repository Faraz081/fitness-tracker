import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WorkoutHistoryList } from '../components/history/WorkoutHistoryList';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { Spinner, EmptyState } from '../components/ui';
import { workouts } from '../data/workoutHistoryData';
import { filterWorkouts } from '../utils/historyUtils';
import { DATE_FILTER_OPTIONS } from '../data/constants';

function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function toISODate(date) {
    return date.toISOString().slice(0, 10);
}

function resolveDateBounds(dateOption, from, to) {
    if (dateOption === 'all') {
        return { from: undefined, to: undefined };
    }
    if (dateOption === 'custom') {
        return { from: from || undefined, to: to || undefined };
    }
    const today = new Date();
    if (dateOption === 'week') {
        return { from: toISODate(startOfWeek(today)), to: undefined };
    }
    if (dateOption === 'month') {
        return { from: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`, to: undefined };
    }
    if (dateOption === 'last3') {
        const d = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return { from: toISODate(d), to: undefined };
    }
    return { from: undefined, to: undefined };
}

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
                Workout History
            </h1>
        </div>
    );
}

function WorkoutHistoryContent({ sourceWorkouts, filters, onFilters }) {
    const bounds = resolveDateBounds(filters.dateOption, filters.from, filters.to);
    const filtered = filterWorkouts(sourceWorkouts, {
        category: filters.category,
        from: bounds.from,
        to: bounds.to,
    });

    const hasActiveFilters =
        filters.dateOption !== 'all' ||
        filters.category !== 'all' ||
        filters.from ||
        filters.to;

    if (sourceWorkouts.length === 0) {
        return <EmptyState title="No workouts recorded yet" message="Your workout history will appear here once you log your first session." />;
    }

    if (filtered.length === 0) {
        return (
            <EmptyState
                title="No workouts match your filters"
                message="Try a wider date range or a different category."
                action={
                    <button
                        type="button"
                        onClick={() => onFilters({ category: 'all', dateOption: 'all', from: '', to: '' })}
                        className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                    >
                        Clear filters
                    </button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <p className="text-sm text-[var(--color-ink-muted)]">
                    {filtered.length} {filtered.length === 1 ? 'workout' : 'workouts'}
                </p>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => onFilters({ category: 'all', dateOption: 'all', from: '', to: '' })}
                        className="text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-light)]"
                    >
                        Clear filters
                    </button>
                )}
            </div>
            <WorkoutHistoryList workouts={filtered} />
        </div>
    );
}

export default function WorkoutHistory() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState({ category: 'all', dateOption: 'all', from: '', to: '' });

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(workouts);
                setLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your workout history could not be loaded. Try again." />
            ) : (
                <div className="space-y-6">
                    <PageHeading />
                    <HistoryFilters filters={filters} onChange={setFilters} dateOptions={DATE_FILTER_OPTIONS} />
                    <WorkoutHistoryContent
                        sourceWorkouts={data}
                        filters={filters}
                        onFilters={setFilters}
                    />
                </div>
            )}
        </DashboardLayout>
    );
}