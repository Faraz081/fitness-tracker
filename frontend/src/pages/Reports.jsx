import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ReportTabs } from '../components/reports/ReportTabs';
import { DateRangeSelector } from '../components/reports/DateRangeSelector';
import { OverviewReport } from '../components/reports/OverviewReport';
import { WorkoutReport } from '../components/reports/WorkoutReport';
import { NutritionReport } from '../components/reports/NutritionReport';
import { ProgressReport } from '../components/reports/ProgressReport';
import { ExportButtons } from '../components/reports/ExportButtons';
import { getOverviewReport, getWorkoutReport, getNutritionReport, getProgressReport } from '../services/reports';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

function toDateInput(d) {
    return d.toISOString().split('T')[0];
}

function getDefaultRange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from: toDateInput(from), to: toDateInput(to) };
}

const FETCHERS = {
    overview: getOverviewReport,
    workout: getWorkoutReport,
    nutrition: getNutritionReport,
    progress: getProgressReport,
};

function computeDays(from, to) {
    const f = new Date(from + 'T00:00:00');
    const t = new Date(to + 'T00:00:00');
    return Math.ceil((t - f) / (1000 * 60 * 60 * 24)) + 1;
}

export default function Reports() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [from, setFrom] = useState(searchParams.get('from') ?? '');
    const [to, setTo] = useState(searchParams.get('to') ?? '');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!from || !to) {
            const def = getDefaultRange();
            setFrom(def.from);
            setTo(def.to);
            setSearchParams({ from: def.from, to: def.to }, { replace: true });
        }
    }, [from, to, setSearchParams]);

    const handleRangeChange = useCallback((newFrom, newTo) => {
        setFrom(newFrom);
        setTo(newTo);
        setSearchParams({ from: newFrom, to: newTo }, { replace: true });
    }, [setSearchParams]);

    const fetchReport = useCallback(async () => {
        if (!from || !to || from > to) {
            setError('Invalid date range');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const fetcher = FETCHERS[activeTab] || getOverviewReport;
            const result = await fetcher(from, to);
            setData(result);
        } catch (err) {
            setError(err?.message || 'Failed to load report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, from, to]);

    useEffect(() => {
        if (from && to) {
            fetchReport();
        }
    }, [from, to, activeTab, fetchReport]);

    const dateRange = {
        from,
        to,
        days: from && to ? computeDays(from, to) : 0,
    };

    return (
        <DashboardLayout>
            <div className="px-4 py-6 md:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
                    <p className="text-sm text-text-secondary mt-1" aria-live="polite">
                        {from && to ? `${from} to ${to} (${dateRange.days} days)` : 'Select a date range'}
                    </p>
                </div>

                <DateRangeSelector
                    from={from}
                    to={to}
                    onRangeChange={handleRangeChange}
                    isLoading={isLoading}
                />

                <ReportTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="mb-6">
                    {data && (
                        <ExportButtons
                            reportType={activeTab}
                            data={data}
                            dateRange={dateRange}
                            userName={user?.name || ''}
                        />
                    )}
                </div>

                {error && (
                    <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-error/30 bg-error/10 p-6">
                        <p className="text-sm text-error" role="alert">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchReport}>
                            Retry
                        </Button>
                    </div>
                )}

                {!error && (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewReport data={data} isLoading={isLoading} dateRange={dateRange} />
                        )}
                        {activeTab === 'workout' && (
                            <WorkoutReport data={data} isLoading={isLoading} dateRange={dateRange} />
                        )}
                        {activeTab === 'nutrition' && (
                            <NutritionReport data={data} isLoading={isLoading} dateRange={dateRange} />
                        )}
                        {activeTab === 'progress' && (
                            <ProgressReport data={data} isLoading={isLoading} dateRange={dateRange} />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}