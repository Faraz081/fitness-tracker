import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Dumbbell, LayoutDashboard, Scale, Utensils } from 'lucide-react';
import { FitnessSummary } from './FitnessSummary';
import { DateRangeFilter } from './DateRangeFilter';
import { WorkoutFrequency } from './WorkoutFrequency';
import { ExercisePerformance } from './ExercisePerformance';
import { WeightTrend } from './WeightTrend';
import { CaloriesTrend } from './CaloriesTrend';
import { MacroTrends } from './MacroTrends';
import { PeriodComparison } from './PeriodComparison';
import {
    aggregateMacros,
    buildSummary,
    computeCalories,
    computeExerciseVolume,
    computeFrequency,
    computeWeightTrend,
    comparePeriods,
    exerciseHistory,
    isoWeekLabel,
    mostFrequentExercise,
    previousRange,
} from '../../utils/analyticsUtils';
import { uniqueExerciseNames, workoutVolume } from '../../utils/historyUtils';

const TABS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'workout', label: 'Workout Analytics', icon: Dumbbell },
    { key: 'nutrition', label: 'Nutrition Analytics', icon: Utensils },
    { key: 'body', label: 'Body & Progress', icon: Scale },
];

function PageHeading() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <p className="text-sm text-[var(--color-ink-muted)]">{dateLabel}</p>
                <h1 className="mt-1 flex items-center gap-2 dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">
                    <BarChart3 className="h-6 w-6 text-[var(--color-accent)]" />
                    Analytics
                </h1>
            </div>
        </div>
    );
}

function shortDate(iso) {
    return iso ? isoWeekLabel(iso) : 'Start';
}

function AnalyticsTabs({ active, onActive }) {
    return (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Analytics sections">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === active;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onActive(tab.key)}
                        className={
                            isActive
                                ? 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-3 py-2.5 text-sm font-bold text-[var(--color-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                                : 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                        }
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export function AnalyticsPage({ dataSource, range, period, onPeriod, from, onFrom, to, onTo, category, onCategory, exerciseName, onExercise, onReset, loading = false, error = false }) {
    const [activeTab, setActiveTab] = useState('overview');

    const views = useMemo(() => {
        const workouts = dataSource?.workouts || [];
        const filtered = category === 'all' ? workouts : workouts.filter((w) => w.category === category);
        const inRange = filtered.filter((w) => (!range.from || w.date >= range.from) && (!range.to || w.date <= range.to));
        const prev = previousRange(range);
        const prevInRange = prev ? filtered.filter((w) => (!prev.from || w.date >= prev.from) && (!prev.to || w.date <= prev.to)) : [];

        const calories = computeCalories(dataSource?.calorieDays || [], range);
        const weightTrend = computeWeightTrend(dataSource?.weightEntries || [], range);
        const macros = aggregateMacros(dataSource?.macroDays || [], range);
        const prevCalories = prev ? computeCalories(dataSource?.calorieDays || [], prev) : null;
        const prevWeight = prev ? computeWeightTrend(dataSource?.weightEntries || [], prev) : null;

        const exercise = exerciseName || mostFrequentExercise(filtered, range);

        const current = {};
        if (inRange.length > 0) {
            current.workouts = inRange.length;
            current.volume = inRange.reduce((sum, w) => sum + workoutVolume(w), 0);
        }
        if (calories.points.length > 0) {
            current.calories = calories.avgConsumed;
        }
        if (weightTrend.points.length > 0) {
            current.weightChange = weightTrend.changeKg;
        }

        const previous = {};
        if (prev) {
            if (prevInRange.length > 0) {
                previous.workouts = prevInRange.length;
                previous.volume = prevInRange.reduce((sum, w) => sum + workoutVolume(w), 0);
            }
            if (prevCalories && prevCalories.points.length > 0) {
                previous.calories = prevCalories.avgConsumed;
            }
            if (prevWeight && prevWeight.points.length > 0) {
                previous.weightChange = prevWeight.changeKg;
            }
        }

        return {
            summary: buildSummary(
                inRange,
                dataSource?.weightEntries || [],
                dataSource?.calorieDays || [],
                range,
                dataSource?.goalWeightKg ?? null
            ),
            frequency: computeFrequency(filtered, range),
            frequencyPrev: prev ? computeFrequency(filtered, prev) : [],
            exerciseNames: uniqueExerciseNames(inRange),
            exercise,
            history: exercise ? exerciseHistory(exercise, filtered, range) : [],
            volume: exercise ? computeExerciseVolume(exercise, filtered, range) : [],
            weightTrend,
            calories,
            macros,
            comparison: comparePeriods(current, previous),
            previousLabel: prev ? prev.label : 'Previous period',
        };
    }, [dataSource, category, range.from, range.to, exerciseName]);

    useEffect(() => {
        onExercise(null);
    }, [dataSource, range.from, range.to, category, onExercise]);

    const rangeLabel = [range.from, range.to].filter(Boolean).map(shortDate).join(' – ') || 'All time';

    return (
        <div className="space-y-4">
            <PageHeading />

            <DateRangeFilter
                period={period}
                onPeriod={onPeriod}
                from={from}
                onFrom={onFrom}
                to={to}
                onTo={onTo}
                category={category}
                onCategory={onCategory}
                onReset={onReset}
            />

            <AnalyticsTabs active={activeTab} onActive={setActiveTab} />

            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <FitnessSummary summary={views.summary} loading={loading} error={error} />
                    <PeriodComparison comparison={views.comparison} previousLabel={views.previousLabel} loading={loading} error={error} />
                </div>
            )}

            {activeTab === 'workout' && (
                <div className="space-y-4">
                    <WorkoutFrequency frequency={views.frequency} previous={views.frequencyPrev} rangeLabel={rangeLabel} loading={loading} error={error} />
                    <ExercisePerformance
                        exerciseNames={views.exerciseNames}
                        exerciseName={views.exercise}
                        onExercise={onExercise}
                        history={views.history}
                        volume={views.volume}
                        loading={loading}
                        error={error}
                    />
                </div>
            )}

            {activeTab === 'nutrition' && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <CaloriesTrend calories={views.calories} loading={loading} error={error} />
                    <MacroTrends macros={views.macros} loading={loading} error={error} />
                </div>
            )}

            {activeTab === 'body' && (
                <div className="space-y-4">
                    <WeightTrend trend={views.weightTrend} goalWeightKg={dataSource?.goalWeightKg ?? null} loading={loading} error={error} />
                </div>
            )}
        </div>
    );
}