import { Skeleton, EmptyState } from '../ui';
import { MetricCard } from './MetricCard';
import { TrendIndicator } from './TrendIndicator';
import { formatCalories, formatKg } from '../../utils/analyticsUtils';
import { useSettings } from '../../context/SettingsContext';

export function FitnessSummary({ summary, loading = false, error = false }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    if (loading) {
        return (
            <div className="dash-card p-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-4 h-12 w-56" />
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-card p-5">
                <EmptyState
                    title="Couldn't load your summary"
                    message="Your fitness summary could not be loaded. Try again."
                />
            </div>
        );
    }

    if (summary === null) {
        return (
            <div className="dash-card p-5">
                <EmptyState
                    title="Log more data to see your fitness summary"
                    message="Log a few workouts and weigh-ins to unlock your overall progress score."
                />
            </div>
        );
    }

    const weightDirection = summary.weightChange > 0 ? 'up' : summary.weightChange < 0 ? 'down' : 'flat';

    let badge = { label: 'Getting started', className: 'bg-[var(--color-line)]/60 text-[var(--color-ink-soft)]' };
    if (summary.progressScore >= 70) {
        badge = { label: 'On track', className: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' };
    } else if (summary.progressScore >= 30) {
        badge = { label: 'Building momentum', className: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' };
    }

    return (
        <div className="dash-card p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                        Overall Progress Score
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                        <span className="dash-num text-4xl text-[var(--color-accent)]">{summary.progressScore}</span>
                        <span className="text-sm text-[var(--color-ink-muted)]">/ 100</span>
                    </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Total Workouts" value={summary.totalWorkouts} />
                <MetricCard label="Avg Calories" value={formatCalories(summary.avgCalories)} />
                <MetricCard
                    label="Weight Change"
                    value={formatKg(summary.weightChange, units)}
                    trend={<TrendIndicator direction={weightDirection} delta={summary.weightChange} context="weight" />}
                />
                <MetricCard label="Workout Streak" value={summary.streakDays} unit="days" />
            </div>

            <p className="mt-5 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-ink-soft)]">
                <span className="font-medium accent-text">Top insight: </span>
                {summary.topInsight}
            </p>
        </div>
    );
}