import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { MetricCard } from './MetricCard';
import { SvgLineChart } from './charts/SvgLineChart';
import { MACRO_TYPES } from '../../data/constants';

export function MacroTrends({ macros = null, loading = false, error = false }) {
    const points = macros?.points || [];

    const series = MACRO_TYPES.map((macro) => ({
        key: macro.key,
        label: macro.label,
        color: macro.color,
        unit: ' g',
        points: points.map((p) => ({ 'x-label': p.date, value: p[macro.key] })),
    }));

    return (
        <ChartCard title="Macronutrients" caption="Protein · Carbs · Fat · average daily intake" loading={loading} error={error}>
            {points.length === 0 ? (
                <EmptyState
                    title="No nutrition data for this period"
                    message="Log your nutrition to see your protein, carbs, and fat trends."
                />
            ) : (
                <div>
                    <SvgLineChart
                        series={series}
                        ariaLabel="Macronutrient trends line chart"
                    />
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        {MACRO_TYPES.map((macro) => (
                            <MetricCard
                                key={macro.key}
                                label={`Avg ${macro.label}`}
                                value={macros?.averages?.[macro.key]}
                                unit="g"
                            />
                        ))}
                    </div>
                </div>
            )}
        </ChartCard>
    );
}