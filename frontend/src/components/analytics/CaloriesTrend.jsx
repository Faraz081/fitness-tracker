import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { MetricCard } from './MetricCard';
import { TrendIndicator } from './TrendIndicator';
import { SvgLineChart } from './charts/SvgLineChart';
import { CHART_COLORS } from '../../data/constants';
import { formatCalories } from '../../utils/analyticsUtils';

export function CaloriesTrend({ calories = null, loading = false, error = false }) {
    const points = calories?.points || [];

    const series = [
        {
            key: 'burned',
            label: 'Burned',
            color: CHART_COLORS.accent,
            unit: ' kcal',
            points: points.map((p) => ({ 'x-label': p.date, value: p.burned })),
        },
        {
            key: 'consumed',
            label: 'Consumed',
            color: CHART_COLORS.secondary,
            unit: ' kcal',
            points: points.map((p) => ({ 'x-label': p.date, value: p.consumed })),
        },
    ];

    const netDeficit = calories?.netDeficit || 0;
    const balanceContext = netDeficit > 0
        ? { label: 'Avg deficit', value: formatCalories(netDeficit), direction: 'down' }
        : netDeficit < 0
            ? { label: 'Avg surplus', value: formatCalories(-netDeficit), direction: 'up' }
            : { label: 'Net balance', value: 'Balanced', direction: 'flat' };

    return (
        <ChartCard title="Calories" caption="Consumed vs burned · daily averages" loading={loading} error={error}>
            {points.length === 0 ? (
                <EmptyState
                    title="No calorie data for this period"
                    message="Track your calories to see your energy balance over time."
                />
            ) : (
                <div>
                    <SvgLineChart
                        series={series}
                        ariaLabel="Calories consumed vs burned line chart"
                    />
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        <MetricCard
                            label="Avg consumed"
                            value={calories?.avgConsumed}
                            unit="kcal"
                        />
                        <MetricCard
                            label="Avg burned"
                            value={calories?.avgBurned}
                            unit="kcal"
                        />
                        <MetricCard
                            label={balanceContext.label}
                            value={balanceContext.value}
                            trend={
                                <TrendIndicator
                                    direction={balanceContext.direction}
                                    delta={netDeficit}
                                    context="calories"
                                />
                            }
                        />
                    </div>
                </div>
            )}
        </ChartCard>
    );
}