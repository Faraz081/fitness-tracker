import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AnalyticsPage } from '../components/analytics/AnalyticsPage';
import { Spinner, EmptyState } from '../components/ui';
import { analyticsData, emptyAnalyticsData } from '../data/analyticsData';
import { resolveRange } from '../utils/analyticsUtils';

const DEFAULT_PERIOD = 'last30';

function drillSource() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('empty') === '1') {
        return emptyAnalyticsData;
    }
    return analyticsData;
}

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [period, setPeriod] = useState(DEFAULT_PERIOD);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [category, setCategory] = useState('all');
    const [exerciseName, setExerciseName] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(drillSource());
                setLoading(false);
            }
        }, 500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const range = useMemo(() => resolveRange(data || analyticsData, { period, from, to }), [data, period, from, to]);

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
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your analytics could not be loaded. Try again." />
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
                />
            )}
        </DashboardLayout>
    );
}