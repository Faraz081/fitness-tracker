import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AnalyticsPage } from '../components/analytics/AnalyticsPage';
import { EmptyState, Spinner } from '../components/ui';
import { getAnalytics } from '../services/api';
import { previousRange, resolveRange } from '../utils/analyticsUtils';
import { useDashboardRefresh } from '../context/DashboardContext';

const DEFAULT_PERIOD = 'last30';

export default function Analytics() {
    const { refreshKey } = useDashboardRefresh();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [period, setPeriod] = useState(DEFAULT_PERIOD);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [category, setCategory] = useState('all');
    const [exerciseName, setExerciseName] = useState(null);

    const range = useMemo(() => resolveRange(period, { from, to }), [period, from, to]);

    const fetchParams = useMemo(() => {
        const prev = previousRange(range);
        return {
            from: prev ? prev.from : range.from,
            to: range.to,
        };
    }, [range]);

    const load = useCallback(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        getAnalytics({ from: fetchParams.from, to: fetchParams.to, category })
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
    }, [fetchParams.from, fetchParams.to, category]);

    useEffect(() => load(), [load, refreshKey]);

    const handlePeriod = (next) => {
        setPeriod(next);
        setFrom('');
        setTo('');
    };

    const handleReset = () => {
        setPeriod(DEFAULT_PERIOD);
        setFrom('');
        setTo('');
        setCategory('all');
        setExerciseName(null);
    };

    return (
        <DashboardLayout>
            {loading && !data ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error && !data ? (
                <EmptyState title="Something went wrong" message="Your analytics could not be loaded. Try again." />
            ) : data && !data.hasData ? (
                <div className="dash-card p-5">
                    <EmptyState
                        title="No analytics data"
                        message={
                            category !== 'all'
                                ? 'No workouts match this category in the selected period. Adjust your filters.'
                                : 'Log workouts, meals and weigh-ins to unlock personalised analytics here.'
                        }
                    />
                </div>
            ) : (
                <AnalyticsPage
                    dataSource={data}
                    range={range}
                    period={period}
                    onPeriod={handlePeriod}
                    from={from}
                    onFrom={setFrom}
                    to={to}
                    onTo={setTo}
                    category={category}
                    onCategory={setCategory}
                    exerciseName={exerciseName}
                    onExercise={setExerciseName}
                    onReset={handleReset}
                    loading={loading}
                    error={error}
                />
            )}
        </DashboardLayout>
    );
}