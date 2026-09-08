import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WeightTracker } from '../components/progress/WeightTracker';
import { Measurements } from '../components/progress/Measurements';
import { WeightChart } from '../components/progress/WeightChart';
import { PerformanceChart } from '../components/progress/PerformanceChart';
import { StrengthHistory } from '../components/progress/StrengthHistory';
import { Spinner, EmptyState } from '../components/ui';
import { progressData, emptyProgressData } from '../data/progressData';

function PageHeading() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div>
            <p className="text-sm text-[var(--color-ink-muted)]">{dateLabel}</p>
            <h1 className="mt-1 dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">
                Progress
            </h1>
        </div>
    );
}

function ProgressContent({ weightEntries, onAddWeight, measurements, performance, strengthHistory }) {
    return (
        <div className="space-y-6">
            <PageHeading />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <WeightTracker entries={weightEntries} onAdd={onAddWeight} />
                <Measurements sessions={measurements} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="dash-card p-5 xl:col-span-2">
                    <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Weight Trend</h2>
                    <WeightChart entries={weightEntries} />
                </div>
                <div className="dash-card p-5 xl:col-span-1">
                    <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Workout Performance</h2>
                    <PerformanceChart data={performance} />
                </div>
            </div>

            <div className="dash-card p-5">
                <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Strength History</h2>
                <StrengthHistory records={strengthHistory} />
            </div>
        </div>
    );
}

export default function Progress() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(progressData);
                setLoading(false);
            }
        }, 500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const showEmpty = data === emptyProgressData;

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your progress could not be loaded. Try again." />
            ) : (
                <ProgressContent
                    weightEntries={(showEmpty ? emptyProgressData : data).weightEntries}
                    measurements={(showEmpty ? emptyProgressData : data).measurements}
                    performance={(showEmpty ? emptyProgressData : data).performance}
                    strengthHistory={(showEmpty ? emptyProgressData : data).strengthHistory}
                    onAddWeight={({ weightKg }) => {
                        const entry = {
                            id: `w-${Date.now()}`,
                            date: new Date().toISOString().slice(0, 10),
                            weightKg,
                        };
                        setData((prev) => ({ ...prev, weightEntries: [entry, ...prev.weightEntries] }));
                    }}
                />
            )}
        </DashboardLayout>
    );
}