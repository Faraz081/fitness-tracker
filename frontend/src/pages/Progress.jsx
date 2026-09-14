import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WeightTracker } from '../components/progress/WeightTracker';
import { Measurements } from '../components/progress/Measurements';
import { WeightChart } from '../components/progress/WeightChart';
import { PerformanceChart } from '../components/progress/PerformanceChart';
import { StrengthHistory } from '../components/progress/StrengthHistory';
import { Spinner, EmptyState } from '../components/ui';
import { useDashboardRefresh } from '../context/DashboardContext';
import * as api from '../services/api';

const EMPTY_PROGRESS = {
    weightEntries: [],
    measurements: [],
    performance: [],
    strengthHistory: [],
};

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

function ProgressContent({ data, busy, onAddWeight, onDeleteWeight, onAddMeasurement, onDeleteMeasurement }) {
    return (
        <div className="space-y-6">
            <PageHeading />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <WeightTracker entries={data.weightEntries} onAdd={onAddWeight} onDelete={onDeleteWeight} busy={busy} />
                <Measurements sessions={data.measurements} onAdd={onAddMeasurement} onDelete={onDeleteMeasurement} busy={busy} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="dash-card p-5 xl:col-span-2">
                    <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Weight Trend</h2>
                    <WeightChart entries={data.weightEntries} />
                </div>
                <div className="dash-card p-5 xl:col-span-1">
                    <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Workout Performance</h2>
                    <PerformanceChart data={data.performance} />
                </div>
            </div>

            <div className="dash-card p-5">
                <h2 className="mb-4 dash-num text-lg text-[var(--color-ink)]">Strength History</h2>
                <StrengthHistory records={data.strengthHistory} />
            </div>
        </div>
    );
}

export default function Progress() {
    const { refreshKey, refreshDashboard } = useDashboardRefresh();
    const [data, setData] = useState(EMPTY_PROGRESS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.getProgress();
            setData(result);
            setError(false);
        }
        catch {
            setError(true);
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.getProgress()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                    setError(false);
                }
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [refreshKey, load]);

    const runMutation = useCallback(async (action) => {
        setBusy(true);
        try {
            await action();
            await load();
            refreshDashboard();
        }
        finally {
            setBusy(false);
        }
    }, [load, refreshDashboard]);

    const onAddWeight = useCallback((payload) => runMutation(() => api.addWeight(payload)), [runMutation]);
    const onDeleteWeight = useCallback((id) => runMutation(() => api.deleteWeight(id)), [runMutation]);
    const onAddMeasurement = useCallback((payload) => runMutation(() => api.addMeasurement(payload)), [runMutation]);
    const onDeleteMeasurement = useCallback((id) => runMutation(() => api.deleteMeasurement(id)), [runMutation]);

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
                    data={data}
                    busy={busy}
                    onAddWeight={onAddWeight}
                    onDeleteWeight={onDeleteWeight}
                    onAddMeasurement={onAddMeasurement}
                    onDeleteMeasurement={onDeleteMeasurement}
                />
            )}
        </DashboardLayout>
    );
}