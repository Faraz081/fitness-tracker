import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { SvgBarChart } from './charts/SvgBarChart';
import { CHART_COLORS } from '../../data/constants';

export function WorkoutFrequency({ frequency = [], previous = [], rangeLabel, loading = false, error = false }) {
    const total = frequency.reduce((sum, b) => sum + b.count, 0);

    const series = [];
    if (previous.length > 0) {
        series.push({
            label: 'Previous',
            color: CHART_COLORS.muted,
            values: previous.map((b) => ({ 'x-label': b.label, value: b.count })),
        });
    }
    series.push({
        label: 'This period',
        color: CHART_COLORS.accent,
        values: frequency.map((b) => ({ 'x-label': b.label, value: b.count })),
    });

    return (
        <ChartCard title="Workout Frequency" caption={rangeLabel} loading={loading} error={error}>
            {frequency.length === 0 ? (
                <EmptyState
                    title="No workouts recorded for this period"
                    message="Adjust the time range or log a workout to see your training frequency."
                />
            ) : (
                <div>
                    <SvgBarChart
                        series={series}
                        group={previous.length > 0}
                        height={220}
                        ariaLabel="Workout frequency bar chart"
                    />
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {total} {total === 1 ? 'workout' : 'workouts'}
                        {previous.length > 0 ? ' this period' : ' in this period'}
                    </p>
                </div>
            )}
        </ChartCard>
    );
}