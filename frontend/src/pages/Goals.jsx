import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GoalsList } from '../components/progress/GoalsList';
import { StreakRow } from '../components/progress/StreakRow';
import { GoalForm } from '../components/progress/GoalForm';
import { Spinner, EmptyState } from '../components/ui';
import { useDashboardRefresh } from '../context/DashboardContext';
import { todayISO } from '../utils/filterUtils';
import * as api from '../services/api';

const EMPTY_GOALS = { goals: [], streaks: [] };

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
                Goals
            </h1>
        </div>
    );
}

function GoalsContent({ data, busy, onAddGoal, onEditGoal, onDeleteGoal, onHydrationLog }) {
    return (
        <div className="space-y-6">
            <PageHeading />

            <StreakRow streaks={data.streaks} onHydrationLog={onHydrationLog} busy={busy} />

            <section aria-label="Personal goals">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="dash-num text-lg text-[var(--color-ink)]">Personal Goals</h2>
                    <button
                        type="button"
                        onClick={onAddGoal}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-line)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4 text-[var(--color-accent)]" />
                        Add goal
                    </button>
                </div>
                <GoalsList goals={data.goals} onEdit={onEditGoal} onDelete={onDeleteGoal} busy={busy} />
            </section>
        </div>
    );
}

export default function Goals() {
    const { refreshKey, refreshDashboard } = useDashboardRefresh();
    const [data, setData] = useState(EMPTY_GOALS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [busy, setBusy] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.getGoals({ today: todayISO() });
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
        api.getGoals({ today: todayISO() })
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
        catch {
            // grid reload keeps state consistent; errors surface via load
        }
        finally {
            setBusy(false);
        }
    }, [load, refreshDashboard]);

    const handleAddGoal = useCallback((payload) => {
        setFormOpen(false);
        return runMutation(() => api.createGoal(payload));
    }, [runMutation]);

    const handleEditGoal = useCallback((payload) => {
        const id = editingGoal?.id;
        setFormOpen(false);
        setEditingGoal(null);
        if (!id) {
            return;
        }
        return runMutation(() => api.updateGoal(id, payload));
    }, [editingGoal, runMutation]);

    const handleDeleteGoal = useCallback((goal) => {
        return runMutation(() => api.deleteGoal(goal.id));
    }, [runMutation]);

    const handleHydrationLog = useCallback(() => {
        return runMutation(() => api.addHydration({ amountMl: 250 }));
    }, [runMutation]);

    const openCreate = useCallback(() => {
        setEditingGoal(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((goal) => {
        setEditingGoal(goal);
        setFormOpen(true);
    }, []);

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your goals could not be loaded. Try again." />
            ) : (
                <>
                    <GoalsContent
                        data={data}
                        busy={busy}
                        onAddGoal={openCreate}
                        onEditGoal={openEdit}
                        onDeleteGoal={handleDeleteGoal}
                        onHydrationLog={handleHydrationLog}
                    />
                    <GoalForm
                        isOpen={formOpen}
                        onClose={() => {
                            setFormOpen(false);
                            setEditingGoal(null);
                        }}
                        initialGoal={editingGoal}
                        onSubmit={editingGoal ? handleEditGoal : handleAddGoal}
                        busy={busy}
                    />
                </>
            )}
        </DashboardLayout>
    );
}