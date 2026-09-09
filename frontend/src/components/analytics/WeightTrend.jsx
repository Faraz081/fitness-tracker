import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { MetricCard } from './MetricCard';
import { TrendIndicator } from './TrendIndicator';
import { SvgLineChart } from './charts/SvgLineChart';
import { CHART_COLORS } from '../../data/constants';
import { formatKg } from '../../utils/analyticsUtils';
import { displayWeight, formatWeight, weightUnitLabel } from '../../utils/units';
import { useSettings } from '../../context/SettingsContext';

export function WeightTrend({ trend = null, goalWeightKg = null, loading = false, error = false }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const points = trend?.points || [];
    const unitSuffix = ` ${weightUnitLabel(units)}`;

    const series = [
        {
            key: 'weight',
            label: 'Weight',
            color: CHART_COLORS.accent,
            unit: unitSuffix,
            points: points.map((p) => ({ 'x-label': p.date, value: displayWeight(p.weightKg, units) })),
        },
    ];
    const goalNumber = goalWeightKg !== null && goalWeightKg !== undefined ? Number(goalWeightKg) : null;
    const guide = goalNumber !== null
        ? { value: displayWeight(goalNumber, units), label: `Goal ${formatWeight(goalNumber, units)} ${weightUnitLabel(units)}` }
        : null;

    const direction = (trend?.changeKg || 0) > 0 ? 'up' : (trend?.changeKg || 0) < 0 ? 'down' : 'flat';

    return (
        <ChartCard title="Body Weight Trend" caption={points.length ? `From ${points[0].date}` : undefined} loading={loading} error={error}>
            {points.length === 0 ? (
                <EmptyState
                    title="No weight entries for this period"
                    message="Log your weight to see how you are tracking toward your goal."
                />
            ) : (
                <div>
                    <SvgLineChart
                        series={series}
                        guide={guide}
                        ariaLabel="Body weight trend line chart"
                    />
                    <div className="mt-3">
                        <MetricCard
                            label={`Change since ${points[0].date}`}
                            value={formatKg(trend?.changeKg, units)}
                            trend={<TrendIndicator direction={direction} delta={trend?.changeKg} context="weight" />}
                        />
                    </div>
                </div>
            )}
        </ChartCard>
    );
}