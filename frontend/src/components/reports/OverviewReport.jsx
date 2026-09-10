import { KpiCard } from './KpiCard.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { CardSkeleton } from '../ui/Skeleton.jsx';

function round1(n) {
    return n != null ? +n.toFixed(1) : null;
}

export function OverviewReport({ data, isLoading, dateRange }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!data) return null;

    const hasActivity =
        data.progress?.consistencyScore != null ||
        data.workouts?.totalWorkouts > 0 ||
        data.nutrition?.daysLogged > 0;

    if (!hasActivity) {
        return (
            <EmptyState
                icon={<span aria-hidden="true">📊</span>}
                title="No activity in this date range"
                message="Try a wider date range to see your workout and nutrition summary."
            />
        );
    }

    const caloriesSubtitle =
        data.nutrition?.daysLogged > 0
            ? `Avg ${round1(data.nutrition.avgDailyCalories)} kcal/day over ${data.nutrition.daysLogged} logged day(s)`
            : undefined;

    const weightValue =
        data.progress?.latestWeight != null
            ? `${round1(data.progress.latestWeight)} kg`
            : null;

    const weightSubtitle = data.progress?.weightChange
        ? `Change: ${round1(data.progress.weightChange)} kg`
        : data.progress?.hasWeightHistory
            ? 'Weight history'
            : undefined;

    const consistencyValue =
        data.progress?.consistencyScore != null
            ? `${data.progress.consistencyScore}%`
            : null;

    const consistencySubtitle =
        data.progress?.consistencyScore != null
            ? `${dateRange.days} day range`
            : undefined;

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Fitness Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard label="Total Workouts" value={data.workouts?.totalWorkouts ?? null} />
                <KpiCard
                    label="Total Volume"
                    value={data.workouts?.totalVolume != null ? `${round1(data.workouts.totalVolume)} kg` : null}
                />
                <KpiCard
                    label="Calories Consumed"
                    value={data.nutrition?.totalCalories != null ? Math.round(data.nutrition.totalCalories) : null}
                    subtitle={caloriesSubtitle}
                />
                <KpiCard
                    label="Weight"
                    value={weightValue}
                    subtitle={weightSubtitle}
                />
                <KpiCard
                    label="Consistency Score"
                    value={consistencyValue}
                    subtitle={consistencySubtitle}
                />
            </div>
            <p className="mt-4 text-sm text-text-secondary">
                Showing data for {dateRange.from} to {dateRange.to} ({dateRange.days} days) ·{' '}
                {data.workouts?.totalWorkouts > 0 ? `${data.workouts.totalWorkouts} workout${data.workouts.totalWorkouts === 1 ? '' : 's'}` : '0 workouts'} ·{' '}
                {data.nutrition?.daysLogged > 0 ? `${data.nutrition.daysLogged} day${data.nutrition.daysLogged === 1 ? '' : 's'} logged` : '0 days logged'}
            </p>
        </div>
    );
}