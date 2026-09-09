import { useEffect, useState } from 'react';
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
import { Spinner, EmptyState } from '../components/ui';
import { dashboardData, emptyDashboardData } from '../data/dashboardData';
import { useSettings } from '../context/SettingsContext';
import { formatWeight, weightUnitLabel } from '../utils/units';

export default function Dashboard() {
    const { preferences } = useSettings();
    const units = preferences.units;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(dashboardData);
                setLoading(false);
            }
        }, 500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const showEmpty = data === emptyDashboardData;
    const summary = (data?.summary || []).map((item) =>
        item.key === 'weight'
            ? { ...item, value: formatWeight(item.value, units), unit: weightUnitLabel(units) }
            : item,
    );

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="The dashboard could not be loaded. Try again." />
            ) : (
                <div className="space-y-6">
                    <Greeting userName={data.user.name} />

                    <QuickLog />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <Section title="Overview">
                                {showEmpty ? (
                                    <EmptyState title="No summary data" message="Key stats will appear here." />
                                ) : (
                                    <SummaryCards items={summary} />
                                )}
                            </Section>

                            <Section title="Daily Goals">
                                <ProgressCards items={data.dailyGoals} />
                            </Section>

                            <Section title="Workouts This Week">
                                <WeeklyChart data={data.weeklyWorkouts} />
                            </Section>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Section title="Calories">
                                    <CaloriesChart data={data.caloriesSeries} />
                                </Section>
                                <Section title="Macros">
                                    <MacroChart macros={data.macros} />
                                </Section>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Section title="Activity">
                                <ActivityRings items={data.rings} />
                            </Section>
                            <Section title="Recent Workouts">
                                <RecentWorkouts items={data.recentWorkouts} />
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
