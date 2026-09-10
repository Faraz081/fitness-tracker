import { ReportCard } from './ReportCard.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { CardSkeleton } from '../ui/Skeleton.jsx';
import { SvgLineChart } from '../analytics/charts/SvgLineChart.jsx';
import { strengthSeriesWithColor, shortDate } from '../../utils/reportCharts.js';

function round1(n) {
    return n != null ? +n.toFixed(1) : null;
}

const GOAL_LABELS = {
    lose: 'Lose weight',
    maintain: 'Maintain weight',
    gain: 'Gain weight',
    other: 'Other',
};

export function ProgressReport({ data, isLoading, dateRange }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!data) return null;

    const hasAnyData =
        data.profile?.latestWeight != null ||
        data.profile?.goal != null ||
        data.consistency?.nutritionDaysLogged > 0 ||
        data.strengthProgression?.length > 0;

    if (!hasAnyData) {
        return (
            <EmptyState
                icon={<span aria-hidden="true">📈</span>}
                title="No progress data in this date range"
                message="Add profile details, workouts, and nutrition logs to see your progress report."
            />
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Progress Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <ReportCard title="Latest Weight">
                    <p className="text-2xl font-bold">
                        {data.profile.latestWeight != null ? `${round1(data.profile.latestWeight)} kg` : 'No data'}
                    </p>
                </ReportCard>
                <ReportCard title="Goal">
                    <p className="text-2xl font-bold">
                        {data.profile.goal ? (GOAL_LABELS[data.profile.goal] || data.profile.goal) : 'No data'}
                    </p>
                </ReportCard>
                <ReportCard title="Workout Consistency">
                    <p className="text-2xl font-bold">
                        {data.consistency.workoutConsistency != null ? `${round1(data.consistency.workoutConsistency)} sessions/week` : 'No data'}
                    </p>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Nutrition Consistency">
                    <p className="text-2xl font-bold">
                        {data.consistency.nutritionDaysLogged > 0
                            ? `${data.consistency.nutritionConsistency}%`
                            : 'No data'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                        {data.consistency.nutritionDaysLogged} of {data.consistency.rangeDays} days logged
                    </p>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Strength Progression">
                    {(() => {
                        const lines = strengthSeriesWithColor(data.strengthSeries || [], ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-primary)']);
                        return lines.length > 0 ? (
                            <SvgLineChart
                                ariaLabel="Best weight per exercise over the range"
                                series={lines.map((s) => ({
                                    ...s,
                                    points: s.points.map((p) => ({ value: p.value, 'x-label': shortDate(p['x-label']) })),
                                }))}
                            />
                        ) : (
                            <p className="text-sm text-text-secondary">No strength exercises with recorded weights in this range.</p>
                        );
                    })()}
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Strength Progression Table">
                    {data.strengthProgression.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-text-secondary border-b border-dark-600">
                                        <th className="py-2">Exercise</th>
                                        <th className="py-2 text-right">Best (range)</th>
                                        <th className="py-2 text-right">Prior Best</th>
                                        <th className="py-2 text-right">Delta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.strengthProgression.map((s) => (
                                        <tr key={s.exercise} className="border-b border-dark-700">
                                            <td className="py-2 font-medium">{s.exercise}</td>
                                            <td className="py-2 text-right">{s.bestWeight} kg</td>
                                            <td className="py-2 text-right">{s.priorBest > 0 ? `${s.priorBest} kg` : '—'}</td>
                                            <td className={`py-2 text-right ${s.delta > 0 ? 'text-success' : s.delta < 0 ? 'text-error' : 'text-text-secondary'}`}>
                                                {s.delta > 0 ? `+${s.delta}` : s.delta} kg
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No strength exercises with recorded weights in this range.</p>
                    )}
                    <p className="mt-3 text-sm text-text-secondary">Personal records: <strong>{data.prCount}</strong></p>
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportCard title="Weight Trend">
                    <EmptyState
                        title="No weight history in this range"
                        message="Weight history is not tracked by this app."
                    />
                </ReportCard>
                <ReportCard title="Milestones">
                    <EmptyState
                        title="No milestone data yet"
                        message="Milestones are not tracked by this app."
                    />
                </ReportCard>
                <ReportCard title="Progress Photos">
                    <EmptyState
                        title="Not tracked"
                        message="Progress photos are not tracked by this app."
                    />
                </ReportCard>
            </div>
        </div>
    );
}