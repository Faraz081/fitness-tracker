import { useEffect, useMemo } from 'react';
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
                Analytics
            </h1>
        </div>
    );
}

function shortDate(iso) {
    return iso ? isoWeekLabel(iso) : 'Start';
}

export function AnalyticsPage({ dataSource, range, period, onPeriod, from, onFrom, to, onTo, category, onCategory, exerciseName, onExercise, onReset, loading = false, error = false }) {
    const views = useMemo(() => {
        const workouts = dataSource.workouts || [];
        const filtered = category === 'all' ? workouts : workouts.filter((w) => w.category === category);
        const inRange = filtered.filter((w) => (!range.from || w.date >= range.from) && (!range.to || w.date <= range.to));
        const prev = previousRange(range);
        const prevInRange = prev ? filtered.filter((w) => (!prev.from || w.date >= prev.from) && (!prev.to || w.date <= prev.to)) : [];

        const calories = computeCalories(dataSource.calorieDays || [], range);
        const weightTrend = computeWeightTrend(dataSource.weightEntries || [], range);
        const macros = aggregateMacros(dataSource.macroDays || [], range);
        const prevCalories = prev ? computeCalories(dataSource.calorieDays || [], prev) : null;
        const prevWeight = prev ? computeWeightTrend(dataSource.weightEntries || [], prev) : null;

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
                dataSource.weightEntries || [],
                dataSource.calorieDays || [],
                range,
                dataSource.goalWeightKg ?? null,
                dataSource.insightPool || {}
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
        <div className="space-y-6">
            <PageHeading />

            <FitnessSummary summary={views.summary} loading={loading} error={error} />

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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <WeightTrend trend={views.weightTrend} goalWeightKg={dataSource.goalWeightKg ?? null} loading={loading} error={error} />
                <CaloriesTrend calories={views.calories} loading={loading} error={error} />
            </div>

            <MacroTrends macros={views.macros} loading={loading} error={error} />

            <PeriodComparison comparison={views.comparison} previousLabel={views.previousLabel} loading={loading} error={error} />
        </div>
    );
}