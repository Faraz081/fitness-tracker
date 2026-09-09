import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WorkoutHistoryList } from '../components/history/WorkoutHistoryList';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { Spinner, EmptyState } from '../components/ui';
import { SearchInput } from '../components/search/SearchInput';
import { ActiveFilters } from '../components/search/ActiveFilters';
import { workouts } from '../data/workoutHistoryData';
import { filterWorkouts } from '../utils/historyUtils';
import { DATE_FILTER_OPTIONS, WORKOUT_CATEGORIES } from '../data/constants';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { filtersToSearchParams, hasActiveFilters, parseSearchParams, resolveDateRange } from '../utils/filterUtils';
const CATEGORY_OPTIONS = WORKOUT_CATEGORIES.map((c) => c.key);
const DATE_OPTION_KEYS = DATE_FILTER_OPTIONS.map((o) => o.key);
const DEFAULT_FILTERS = { search: '', category: 'all', dateOption: 'all', from: '', to: '' };

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
                Workout History
            </h1>
        </div>
    );
}

function WorkoutHistoryContent({ sourceWorkouts, filters, search, onClear }) {
    const bounds = resolveDateRange(filters.dateOption, filters.from, filters.to);
    const filtered = filterWorkouts(sourceWorkouts, {
        category: filters.category,
        from: bounds.from,
        to: bounds.to,
        query: search,
    });

    if (sourceWorkouts.length === 0) {
        return <EmptyState title="No workouts recorded yet" message="Your workout history will appear here once you log your first session." />;
    }

    if (filtered.length === 0) {
        return (
            <EmptyState
                title="No workouts match your filters"
                message="Try a wider date range, a different category, or a broader search term."
                action={
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                    >
                        Clear all filters
                    </button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            <div aria-live="polite" className="flex items-end justify-between">
                <p className="text-sm text-[var(--color-ink-muted)]">
                    {filtered.length} {filtered.length === 1 ? 'workout' : 'workouts'}
                </p>
                {hasActiveFilters({ ...filters, search }) && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-light)]"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
            <WorkoutHistoryList workouts={filtered} />
        </div>
    );
}

export default function WorkoutHistory() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [initial] = useState(() => ({
        ...DEFAULT_FILTERS,
        ...parseSearchParams(searchParams, {}, { category: CATEGORY_OPTIONS, dateOption: DATE_OPTION_KEYS }),
    }));
    const [searchDraft, setSearchDraft] = useState(initial.search);
    const search = useDebouncedValue(searchDraft, 250);
    const [filters, setFilters] = useState({
        category: initial.category,
        dateOption: initial.dateOption,
        from: initial.from,
        to: initial.to,
    });
    const skipUrlWrite = useRef(true);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            if (!cancelled) {
                setData(workouts);
                setLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (skipUrlWrite.current) {
            skipUrlWrite.current = false;
            return;
        }
        setSearchParams(filtersToSearchParams({ ...filters, search }), { replace: false });
    }, [filters, search, setSearchParams]);

    function clearAllFilters() {
        setSearchDraft('');
        setFilters({ category: 'all', dateOption: 'all', from: '', to: '' });
        setSearchParams(new URLSearchParams(), { replace: false });
    }

    function removeChip(key) {
        if (key === 'search') {
            setSearchDraft('');
        }
        else if (key === 'category') {
            setFilters((f) => ({ ...f, category: 'all' }));
        }
        else {
            setFilters((f) => ({ ...f, dateOption: 'all', from: '', to: '' }));
        }
    }

    const chips = [];
    if (search) {
        chips.push({ id: 'search', label: `Search: ${search}`, onRemove: () => removeChip('search') });
    }
    if (filters.category !== 'all') {
        const label = WORKOUT_CATEGORIES.find((c) => c.key === filters.category)?.label ?? filters.category;
        chips.push({ id: 'category', label, onRemove: () => removeChip('category') });
    }
    if (filters.dateOption !== 'all' || filters.from || filters.to) {
        let label = DATE_FILTER_OPTIONS.find((o) => o.key === filters.dateOption)?.label ?? filters.dateOption;
        if (filters.dateOption === 'custom' && (filters.from || filters.to)) {
            label = `${filters.from || '…'} → ${filters.to || '…'}`;
        }
        chips.push({ id: 'dateOption', label, onRemove: () => removeChip('dateOption') });
    }

    return (
        <DashboardLayout>
            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner />
                </div>
            ) : error ? (
                <EmptyState title="Something went wrong" message="Your workout history could not be loaded. Try again." />
            ) : (
                <div className="space-y-6">
                    <PageHeading />
                    <div className="max-w-md">
                        <SearchInput
                            id="history-search"
                            label="Search workouts"
                            value={searchDraft}
                            onChange={setSearchDraft}
                            placeholder="Search by name, notes, or exercise…"
                        />
                    </div>
                    <HistoryFilters filters={filters} onChange={setFilters} dateOptions={DATE_FILTER_OPTIONS} />
                    <ActiveFilters chips={chips} onClearAll={clearAllFilters} label="Active filters" />
                    <WorkoutHistoryContent
                        sourceWorkouts={data}
                        filters={filters}
                        search={search}
                        onClear={clearAllFilters}
                    />
                </div>
            )}
        </DashboardLayout>
    );
}