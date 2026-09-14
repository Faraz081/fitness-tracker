import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Greeting } from '../components/dashboard/Greeting';
import { QuickLog } from '../components/dashboard/QuickLog';
import { Section } from '../components/dashboard/Section';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ProgressCards } from '../components/dashboard/ProgressCards';
import { ActivityRings } from '../components/dashboard/ActivityRings';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { CaloriesChart } from '../components/dashboard/CaloriesChart';
import { MacroChart } from '../components/dashboard/MacroChart';
import { RecentWorkouts } from '../components/dashboard/RecentWorkouts';
import { QuickActions } from '../components/dashboard/QuickActions';
import { EmptyState, ListSkeleton } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import { useDashboardRefresh } from '../context/DashboardContext';
import { formatWeight, weightUnitLabel } from '../utils/units';
import { todayISO } from '../utils/filterUtils';
import { getDashboard } from '../services/api';

export default function Dashboard() {
    const { preferences } = useSettings();
    const units = preferences.units;
    const { refreshKey } = useDashboardRefresh();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchDashboard = useCallback(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        getDashboard({ today: todayISO() })
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const cancel = fetchDashboard();
        return cancel;
    }, [fetchDashboard, refreshKey]);

    const summary = (data?.summary || []).map((item) =>
        item.key === 'weight' && item.value != null
            ? { ...item, value: formatWeight(item.value, units), unit: weightUnitLabel(units) }
            : item,
    ).filter((item) => item.value != null);

    return (
        <DashboardLayout>
            {loading ? (
                <ListSkeleton count={3} />
            ) : error ? (
                <EmptyState title="Something went wrong" message="The dashboard could not be loaded. Try again." />
            ) : (
                <div className="space-y-6">
                    <Greeting userName={data?.user?.name || 'User'} />

                    <QuickLog />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <Section title="Overview">
                                {summary.length === 0 ? (
                                    <EmptyState title="No summary data" message="Start logging workouts and meals to see your stats." />
                                ) : (
                                    <SummaryCards items={summary} />
                                )}
                            </Section>

                            <Section title="Daily Goals">
                                <ProgressCards items={data?.dailyGoals || []} />
                            </Section>

                            <Section title="Workouts This Week">
                                <WeeklyChart data={data?.weeklyWorkouts || []} />
                            </Section>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Section title="Calories">
                                    <CaloriesChart data={data?.caloriesSeries || []} />
                                </Section>
                                <Section title="Macros">
                                    <MacroChart macros={data?.macros || null} />
                                </Section>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Section title="Activity">
                                <ActivityRings items={data?.rings || []} />
                            </Section>
                            <Section title="Recent Workouts">
                                <RecentWorkouts items={data?.recentWorkouts || []} />
                            </Section>
                            <Section title="Quick Actions">
                                <QuickActions />
                            </Section>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
