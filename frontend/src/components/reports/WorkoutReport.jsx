import { Link } from 'react-router-dom';
import { ReportCard } from './ReportCard.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { Badge } from '../ui/Badge.jsx';
import { CardSkeleton } from '../ui/Skeleton.jsx';
import { SvgLineChart } from '../analytics/charts/SvgLineChart.jsx';
import { SvgBarChart } from '../analytics/charts/SvgBarChart.jsx';
import { workoutVolumeSeries, workoutFrequencySeries, categorySeries, shortDate } from '../../utils/reportCharts.js';

function round1(n) {
    return n != null ? +n.toFixed(1) : null;
}

const CATEGORY_LABELS = {
    strength: 'Strength',
    cardio: 'Cardio',
    flexibility: 'Flexibility',
    hybrid: 'Hybrid',
    other: 'Other',
};

const SERIES_COLORS = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)'];

export function WorkoutReport({ data, isLoading, dateRange }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!data) return null;

    if (data.summary?.totalWorkouts === 0) {
        return (
            <EmptyState
                icon={<span aria-hidden="true">🏋️</span>}
                title="No workouts in this date range"
                message="Log some workouts or widen the date range to see your workout report."
            />
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Workout Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <ReportCard title="Total Workouts">
                    <p className="text-2xl font-bold">{data.summary.totalWorkouts}</p>
                </ReportCard>
                <ReportCard title="Total Volume">
                    <p className="text-2xl font-bold">{round1(data.summary.totalVolume)} kg</p>
                </ReportCard>
                <ReportCard title="Avg Sessions / Week">
                    <p className="text-2xl font-bold">{round1(data.summary.avgSessionsPerWeek)}</p>
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ReportCard title="Volume Over Time">
                    {data.workouts.length > 0 ? (
                        <SvgLineChart
                            ariaLabel="Workout volume over time"
                            series={[{
                                key: 'volume',
                                label: 'Volume',
                                color: 'var(--color-accent)',
                                unit: ' kg',
                                points: workoutVolumeSeries(data.workouts).map((d) => ({
                                    value: round1(d.value),
                                    'x-label': shortDate(d.date),
                                })),
                            }]}
                        />
                    ) : (
                        <p className="text-sm text-text-secondary">No volume data in this range.</p>
                    )}
                </ReportCard>
                <ReportCard title="Workout Frequency">
                    {data.summary.frequencySeries?.length > 0 ? (
                        <SvgBarChart
                            ariaLabel="Workout frequency over time"
                            series={[{
                                label: 'Workouts',
                                color: 'var(--color-primary)',
                                values: workoutFrequencySeries(data.summary.frequencySeries).map((d) => ({
                                    value: d.value,
                                    'x-label': shortDate(d.date),
                                })),
                            }]}
                        />
                    ) : (
                        <p className="text-sm text-text-secondary">No frequency data in this range.</p>
                    )}
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ReportCard title="Category Distribution">
                    {data.categoryBreakdown.length > 0 ? (
                        <SvgBarChart
                            ariaLabel="Workout category distribution"
                            series={[{
                                label: 'Workouts',
                                color: 'var(--color-accent)',
                                values: categorySeries(data.categoryBreakdown).map((c) => ({
                                    value: c.value,
                                    'x-label': CATEGORY_LABELS[c.label] || c.label,
                                })),
                            }]}
                        />
                    ) : (
                        <p className="text-sm text-text-secondary">No categories in this range.</p>
                    )}
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Category Breakdown">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-text-secondary border-b border-dark-600">
                                <th className="py-2">Category</th>
                                <th className="py-2">Count</th>
                                <th className="py-2">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.categoryBreakdown.map((c) => (
                                <tr key={c.category} className="border-b border-dark-700">
                                    <td className="py-2">{CATEGORY_LABELS[c.category] || c.category}</td>
                                    <td className="py-2">{c.count}</td>
                                    <td className="py-2">{c.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Workouts">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-text-secondary border-b border-dark-600">
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Title</th>
                                    <th className="py-2">Category</th>
                                    <th className="py-2 text-right">Volume</th>
                                    <th className="py-2 text-right">Exercises</th>
                                    <th className="py-2 text-right">PRs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.workouts.map((w) => (
                                    <tr key={w.id} className="border-b border-dark-700">
                                        <td className="py-2">{w.date}</td>
                                        <td className="py-2">
                                            <Link
                                                to={`/workouts/${w.id}`}
                                                className="font-medium text-text-primary underline-offset-4 hover:text-primary hover:underline"
                                            >
                                                {w.name}
                                            </Link>
                                        </td>
                                        <td className="py-2">
                                            <Badge color="neutral">{CATEGORY_LABELS[w.category] || w.category}</Badge>
                                        </td>
                                        <td className="py-2 text-right">{round1(w.volume)} kg</td>
                                        <td className="py-2 text-right">{w.exerciseCount}</td>
                                        <td className="py-2 text-right">{w.prCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Notable Lifts">
                    {data.notableLifts.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-text-secondary border-b border-dark-600">
                                    <th className="py-2">Exercise</th>
                                    <th className="py-2 text-right">Best Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.notableLifts.map((l) => (
                                    <tr key={l.exercise} className="border-b border-dark-700">
                                        <td className="py-2">{l.exercise}</td>
                                        <td className="py-2 text-right">{l.weight} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-text-secondary">No recorded lifts in this range.</p>
                    )}
                    <p className="mt-3 text-sm text-text-secondary">PRs in range: <strong>{data.prCount}</strong></p>
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCard title="Duration">
                    <EmptyState
                        title="Not tracked"
                        message="Workout duration is not recorded by this app."
                    />
                </ReportCard>
                <ReportCard title="Muscle Groups">
                    <EmptyState
                        title="Not tracked"
                        message="Muscle-group distribution is not recorded by this app."
                    />
                </ReportCard>
            </div>
        </div>
    );
}