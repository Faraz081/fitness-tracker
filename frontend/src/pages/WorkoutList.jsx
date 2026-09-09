import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, Dumbbell, Edit3, Plus, SearchX, Trash2, TrendingUp } from 'lucide-react';
import * as api from '../services/api';
import { Badge, Button, EmptyState, ListSkeleton } from '../components/ui';
import { SearchInput } from '../components/search/SearchInput';
import { FilterBar } from '../components/search/FilterBar';
import { ActiveFilters } from '../components/search/ActiveFilters';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { DATE_FILTER_OPTIONS, WORKOUT_CATEGORIES } from '../data/constants';
import { activeFilterCount, applyFilters, filtersToSearchParams, parseSearchParams, resolveDateRange, toLocalDateKey } from '../utils/filterUtils';

function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
const CATEGORY_META = {
    strength: { icon: Dumbbell, color: 'primary', label: 'Strength' },
    cardio: { icon: Activity, color: 'success', label: 'Cardio' },
    flexibility: { icon: TrendingUp, color: 'warning', label: 'Flexibility' },
    hybrid: { icon: Activity, color: 'error', label: 'Hybrid' },
    other: { icon: Dumbbell, color: 'neutral', label: 'Other' },
};
const CATEGORY_OPTIONS = WORKOUT_CATEGORIES.map((c) => c.key);
const DATE_OPTION_KEYS = DATE_FILTER_OPTIONS.map((o) => o.key);
const DEFAULT_FILTERS = { search: '', category: 'all', dateOption: 'all', from: '', to: '' };
function workoutTextFor(w) {
    return [w.title, w.notes, w.category, ...(w.exercises || []).map((ex) => ex.name)]
        .filter(Boolean)
        .join(' ');
}
export default function WorkoutList() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const skipUrlWrite = useRef(true);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.listWorkouts();
            const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setWorkouts(sorted);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workouts');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
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
    async function handleDelete(id) {
        if (deletingId)
            return;
        setDeletingId(id);
        setError(null);
        try {
            await api.deleteWorkout(id);
            setWorkouts((prev) => prev.filter((w) => w.id !== id));
            setConfirmId(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete workout');
        }
        finally {
            setDeletingId(null);
        }
    }
    const datedWorkouts = useMemo(() => workouts.map((w) => ({ ...w, dateKey: toLocalDateKey(w.date) })), [workouts]);
    const { from: rangeFrom, to: rangeTo } = resolveDateRange(filters.dateOption, filters);
    const filtered = useMemo(() => applyFilters(datedWorkouts, {
        search,
        textFor: workoutTextFor,
        from: rangeFrom,
        to: rangeTo,
        categories: [filters.category],
    }), [datedWorkouts, search, rangeFrom, rangeTo, filters.category]);
    const filterCount = activeFilterCount({ ...filters, search });
    const chips = [];
    if (search) {
        const onRemove = () => removeChip('search');
        chips.push({ id: 'search', label: `Search: ${search}`, onRemove });
    }
    if (filters.category !== 'all') {
        const label = WORKOUT_CATEGORIES.find((c) => c.key === filters.category)?.label ?? filters.category;
        const onRemove = () => removeChip('category');
        chips.push({ id: 'category', label, onRemove });
    }
    if (filters.dateOption !== 'all') {
        let label = DATE_FILTER_OPTIONS.find((o) => o.key === filters.dateOption)?.label ?? filters.dateOption;
        if (filters.dateOption === 'custom' && (filters.from || filters.to)) {
            label = `${filters.from || '…'} → ${filters.to || '…'}`;
        }
        const onRemove = () => removeChip('dateOption');
        chips.push({ id: 'dateOption', label, onRemove });
    }
    return (<div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Your <span className="text-gradient">Workouts</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Track your training sessions</p>
        </div>
        <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
          <Plus className="h-4 w-4"/>
          <span className="hidden sm:inline">New Workout</span>
          <span className="sm:hidden">New</span>
        </Link>
      </motion.div>

      {error && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-sm text-error bg-error/10 border border-error/20 rounded-xl p-4">
          {error}
        </motion.div>)}

      <div className="mb-6">
        <FilterBar
          title="Filter workouts"
          collapsible
          open={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          activeCount={filterCount}
        >
          <SearchInput
            id="workout-search"
            label="Search workouts"
            value={searchDraft}
            onChange={setSearchDraft}
            placeholder="Search by name, notes, or exercise…"
          />
          <div>
            <label htmlFor="workout-category" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
              Category
            </label>
            <select
              id="workout-category"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="all">All categories</option>
              {WORKOUT_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="workout-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
              Time Range
            </label>
            <select
              id="workout-date"
              value={filters.dateOption}
              onChange={(e) => setFilters((f) => ({ ...f, dateOption: e.target.value }))}
              className="w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
            >
              {DATE_FILTER_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
          {filters.dateOption === 'custom' && (
            <>
              <div>
                <label htmlFor="workout-from" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                  From
                </label>
                <input
                  id="workout-from"
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="workout-to" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                  To
                </label>
                <input
                  id="workout-to"
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
            </>
          )}
        </FilterBar>
        <ActiveFilters chips={chips} onClearAll={clearAllFilters} label="Active filters" />
      </div>

      {loading ? (<ListSkeleton count={4}/>) : workouts.length === 0 ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated rounded-3xl p-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-dark-700 flex items-center justify-center mb-5">
            <Dumbbell className="h-10 w-10 text-primary"/>
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">No workouts yet</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            Time to crush your first session! Log a workout to start building your training history.
          </p>
          <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
            <Plus className="h-4 w-4"/>
            Create your first workout
          </Link>
        </motion.div>) : filtered.length === 0 ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={<SearchX className="h-7 w-7"/>}
            title="No workouts match your filters"
            message="Try adjusting your search terms or clearing filters to see more workouts."
            action={<Button variant="secondary" onClick={clearAllFilters}>Clear all filters</Button>}
          />
        </motion.div>) : (<motion.div initial="hidden" animate="show" variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
            }} className="space-y-3">
          <p aria-live="polite" className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? 'workout' : 'workouts'}
          </p>
          {filtered.map((w) => {
                const meta = CATEGORY_META[w.category] ?? CATEGORY_META.other;
                const Icon = meta.icon;
                return (<motion.div key={w.id} variants={{
                        hidden: { opacity: 0, y: 16 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }} whileHover={{ y: -2 }} className="glass-elevated rounded-2xl p-4 sm:p-5 hover:bg-dark-700 transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-dark-700 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Icon className="h-6 w-6 text-primary"/>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link to={`/workouts/${w.id}/edit`} className="font-semibold text-base sm:text-lg text-white hover:text-primary transition-colors line-clamp-1">
                          {w.title}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          <Badge color={meta.color}>{meta.label}</Badge>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Calendar className="h-3 w-3"/>
                            {formatDate(w.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Dumbbell className="h-3 w-3"/>
                            {w.exercises.length} {w.exercises.length === 1 ? 'exercise' : 'exercises'}
                          </span>
                          {w.exercises[0]?.restTimeSec != null && (<span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock className="h-3 w-3"/>
                              {w.exercises[0].restTimeSec}s rest
                            </span>)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/workouts/${w.id}/edit`} className="p-2.5 rounded-lg text-text-muted hover:text-primary hover:bg-dark-600 transition-colors cursor-pointer" title="Edit workout">
                          <Edit3 className="h-4 w-4"/>
                        </Link>

                        {confirmId === w.id ? (<div className="flex items-center gap-2">
                            <Button variant="danger" size="sm" onClick={() => handleDelete(w.id)} isLoading={deletingId === w.id}>
                              {deletingId === w.id ? 'Deleting…' : 'Confirm'}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                              Cancel
                            </Button>
                          </div>) : (<button type="button" onClick={() => setConfirmId(w.id)} className="p-2.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer" title="Delete workout">
                            <Trash2 className="h-4 w-4"/>
                          </button>)}
                      </div>
                    </div>

                    {w.notes && <p className="text-sm text-text-muted mt-2 line-clamp-2">{w.notes}</p>}

                    {w.exercises.length > 0 && (<div className="flex items-center gap-2 flex-wrap mt-3">
                        {w.exercises.slice(0, 3).map((ex, i) => (<span key={i} className="text-xs bg-dark-700 text-text-secondary px-2.5 py-1 rounded-lg border border-white/5">
                            {ex.name}
                          </span>))}
                        {w.exercises.length > 3 && (<span className="text-xs text-text-muted">
                            +{w.exercises.length - 3} more
                          </span>)}
                      </div>)}
                  </div>
                </div>
              </motion.div>);
            })}
        </motion.div>)}
    </div>);
}