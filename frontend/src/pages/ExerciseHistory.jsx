import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PersonalRecords } from '../components/history/PersonalRecords';
import { ExerciseHistory } from '../components/history/ExerciseHistory';
import { SearchInput } from '../components/search/SearchInput';
import { Spinner, EmptyState } from '../components/ui';
import { workouts } from '../data/workoutHistoryData';
import { uniqueExerciseNames } from '../utils/historyUtils';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { filterBySearch, parseSearchParams } from '../utils/filterUtils';
import { SearchX } from 'lucide-react';

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
                Exercise History
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
                Track how each exercise changes over time, with personal records derived from your logs.
            </p>
        </div>
    );
}

export default function ExerciseHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [initial] = useState(() => parseSearchParams(searchParams, {}, {}));
    const [searchDraft, setSearchDraft] = useState(initial.search ?? '');
    const search = useDebouncedValue(searchDraft, 250);
    const skipUrlWrite = useRef(true);

    useEffect(() => {
        if (skipUrlWrite.current) {
            skipUrlWrite.current = false;
            return;
        }
        const params = new URLSearchParams();
        if (search) {
            params.set('search', search);
        }
        setSearchParams(params, { replace: false });
    }, [search, setSearchParams]);

    function clearSearch() {
        setSearchDraft('');
        setSearchParams(new URLSearchParams(), { replace: false });
    }

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const names = uniqueExerciseNames(workouts);
    const visibleNames = filterBySearch(names, search, (n) => n);

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your exercise history could not be loaded. Try again." />
            ) : workouts.length === 0 ? (
                <div className="space-y-6">
                    <PageHeading />
                    <EmptyState title="No exercise history yet" message="Once you log workouts, each exercise will show its progression and records here." />
                </div>
            ) : (
                <div className="space-y-6">
                    <PageHeading />
                    <div className="max-w-md">
                        <SearchInput
                            id="exercise-search"
                            label="Search exercises"
                            value={searchDraft}
                            onChange={setSearchDraft}
                            placeholder="Search exercises…"
                        />
                    </div>
                    {visibleNames.length === 0 ? (
                        <EmptyState
                            icon={<SearchX className="h-7 w-7"/>}
                            title="No exercises match your filters"
                            message="Try a broader search term to see matching exercises and their records."
                            action={
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                                >
                                    Clear search
                                </button>
                            }
                        />
                    ) : (
                        <div aria-live="polite" className="space-y-6">
                            {visibleNames.map((name) => (
                                <div key={name} className="grid gap-4 lg:grid-cols-3">
                                    <div className="lg:col-span-2">
                                        <ExerciseHistory workouts={workouts} name={name} />
                                    </div>
                                    <PersonalRecords exerciseName={name} workouts={workouts} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}