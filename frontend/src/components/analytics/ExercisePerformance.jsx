import { EmptyState } from '../ui';
import { ChartCard } from './ChartCard';
import { SvgLineChart } from './charts/SvgLineChart';
import { SvgBarChart } from './charts/SvgBarChart';
import { CHART_COLORS } from '../../data/constants';
import { displayWeight, weightUnitLabel } from '../../utils/units';
import { useSettings } from '../../context/SettingsContext';

function NativeNote({ children }) {
    return (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] px-4 text-center text-sm text-[var(--color-ink-muted)]">
            {children}
        </div>
    );
}

export function ExercisePerformance({ exerciseNames = [], exerciseName, onExercise, history = [], volume = [], loading = false, error = false }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const unitSuffix = ` ${weightUnitLabel(units)}`;
    const hasHistory = history.length > 0;
    const hasLoad = hasHistory && history.some((r) => Number(r.weightKg) > 0);

    const weightSeries = [
        {
            key: 'weight',
            label: 'Weight',
            color: CHART_COLORS.accent,
            unit: unitSuffix,
            points: history.map((r) => ({ 'x-label': r.date, value: displayWeight(r.weightKg, units) })),
        },
    ];
    const repsSeries = [
        {
            key: 'reps',
            label: 'Reps',
            color: CHART_COLORS.secondary,
            points: history.map((r) => ({ 'x-label': r.date, value: r.reps })),
        },
    ];
    const oneRMMarkers = history.filter((r) => r.estimated1RM !== null);
    const oneRMSeries = [
        {
            key: '1rm',
            label: 'Estimated 1RM',
            color: CHART_COLORS.accent,
            unit: unitSuffix,
            points: oneRMMarkers.map((r) => ({ 'x-label': r.date, value: displayWeight(r.estimated1RM, units) })),
        },
    ];
    const volumeSeries = [
        {
            label: 'Volume',
            color: CHART_COLORS.accent,
            values: volume.map((b) => ({ 'x-label': b.label, value: displayWeight(b.volumeKg, units) })),
        },
    ];

    return (
        <ChartCard
            title="Exercise Performance"
            caption={exerciseName ? `Volume, load, reps & estimated 1RM for ${exerciseName}` : undefined}
            loading={loading}
            error={error}
        >
            {exerciseNames.length === 0 ? (
                <EmptyState
                    title="No exercise data for this period"
                    message="Log workouts with exercises to see strength progression here."
                />
            ) : (
                <div>
                    <div className="mb-4">
                        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                            Exercise
                        </span>
                        <select
                            value={exerciseName || ''}
                            onChange={(e) => onExercise(e.target.value)}
                            className="w-full max-w-xs cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                            aria-label="Exercise"
                        >
                            {exerciseNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!hasHistory ? (
                        <EmptyState
                            title="No exercise data for this period"
                            message="This exercise has no recorded sets in the selected window."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <ChartCard title="Volume over time" caption="Sets × reps × load per bucket">
                                {volume.length === 0 ? (
                                    <NativeNote>Bodyweight exercise — no external volume recorded.</NativeNote>
                                ) : (
                                    <SvgBarChart series={volumeSeries} ariaLabel="Exercise volume over time bar chart" />
                                )}
                            </ChartCard>

                            <ChartCard title="Weight progression">
                                {hasLoad ? (
                                    <SvgLineChart series={weightSeries} ariaLabel="Exercise weight progression line chart" />
                                ) : (
                                    <NativeNote>Bodyweight exercise — no external load recorded.</NativeNote>
                                )}
                            </ChartCard>

                            <ChartCard title="Reps progression">
                                <SvgLineChart series={repsSeries} ariaLabel="Exercise reps progression line chart" />
                            </ChartCard>

                            <ChartCard title="Estimated 1RM trend">
                                {oneRMMarkers.length === 0 ? (
                                    <NativeNote>No estimated 1RM yet.</NativeNote>
                                ) : (
                                    <SvgLineChart series={oneRMSeries} ariaLabel="Estimated 1RM trend line chart" />
                                )}
                            </ChartCard>
                        </div>
                    )}
                </div>
            )}
        </ChartCard>
    );
}