import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { MetricCard } from './MetricCard';
import { TrendIndicator } from './TrendIndicator';
import { formatDelta } from '../../utils/analyticsUtils';
import { displayWeight, weightUnitLabel } from '../../utils/units';
import { useSettings } from '../../context/SettingsContext';

function formatMetricValue(metric, value, units) {
    if (metric === 'volume') {
        const display = displayWeight(value, units);
        return `${display.toLocaleString()} ${weightUnitLabel(units)}`;
    }
    if (metric === 'calories') {
        return `${Math.round(Number(value) || 0).toLocaleString()} kcal`;
    }
    if (metric === 'weightChange') {
        return `${displayWeight(value, units)} ${weightUnitLabel(units)}`;
    }
    return value;
}

export function PeriodComparison({ comparison = [], previousLabel = 'Previous period', loading = false, error = false }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const weightSuffix = ` ${weightUnitLabel(units)}`;
    return (
        <ChartCard title="Period Comparison" caption={`Current period vs ${previousLabel}`} loading={loading} error={error}>
            {comparison.length === 0 ? (
                <EmptyState
                    title="Not enough data for comparison"
                    message="Select a range with data in both periods to compare your progress."
                />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {comparison.map((item) => {
                        const context = item.metric === 'weightChange' || item.metric === 'calories' ? 'weight' : 'neutral';
                        const direction = item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : 'flat';
                        const deltaUnit = item.metric === 'volume' || item.metric === 'weightChange' ? weightSuffix : item.metric === 'calories' ? ' kcal' : '';
                        return (
                            <MetricCard
                                key={item.metric}
                                label={item.label}
                                value={formatMetricValue(item.metric, item.current, units)}
                                trend={<TrendIndicator direction={direction} delta={formatDelta(item.delta, deltaUnit)} context={context} />}
                            />
                        );
                    })}
                </div>
            )}
        </ChartCard>
    );
}