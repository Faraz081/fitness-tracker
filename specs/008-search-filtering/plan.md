# Implementation Plan: Search & Filtering (Day 5.1)

**Branch**: `008-search-filtering` | **Date**: 2026-09-09 | **Spec**: [specs/008-search-filtering/spec.md](./spec.md)
**Input**: Day 5.1 constitution (`.specify/memory/constitution.md`, v3.4.0) + feature specification.

## 1. Overall Approach

### 1.1 High-Level Sequence

1. **Shared filter foundation** — a PURE, reusable utility module
   (`utils/filterUtils.js`) encoding search matching, date-range resolution,
   category/meal-type filtering, AND-composition, and URL-param marshalling
   exactly once (S1, S3, S5); the debounce hook (`hooks/useDebouncedValue.js`)
   (S2); and the shared dark-token UI primitives
   (`components/search/SearchInput.jsx`, `FilterBar.jsx`, `FilterChip.jsx`,
   `ActiveFilters.jsx`) matching the existing design system (S7, S9, S10).
2. **Workouts page** — integrate search (title/notes/exercise names) +
   category + date-range into `WorkoutList` (`/workouts`); client-side
   `useMemo` filtering of the fully-loaded `api.listWorkouts()` array (spec
   US1 — the highest-value slice). No backend change.
3. **Activities page (additive)** — extend `WorkoutHistory` (`/workouts-history`)
   with text search beside the existing Day 3.1 `HistoryFilters` and migrate
   its page-local date-bounds resolver to the shared `resolveDateRange`
   (constitution pages; enables `Last 6 Months`/`This Year` presets).
4. **Nutrition page** — integrate search (food name) + meal-type toggle chips
   on `Nutrition` (`/nutrition`); client-side filtering of the day's loaded
   entries; existing single-date picker stays as the date filter (spec US2 /
   FR-006).
5. **Exercises page** — search by exercise name on `ExerciseHistory`
   (`/exercises`) filtering the grouped exercise list (spec US3).
6. **Cross-cutting** — URL query-param sync per page (S5), empty states with a
   "Clear all filters" action (S4, S6), responsive/a11y polish, build
   verification, and Day 1.1/2.1/3.1/4.1 regression (FR-020/021).

### 1.2 Design & Technical Decisions Locked by Constitution/Spec

- **Language**: JavaScript only — `.js` for utils/data, `.jsx` for
  components/pages. Strictly NO TypeScript (Principle V Day 5.1 amendment).
- **Frontend-only, no backend changes**: `services/api.js`, all backend routes,
  and env config are UNTOUCHED. WorkoutList/Nutrition continue loading their
  data exactly as today; search/filter runs client-side over the loaded array
  (A1/S-principles). URL state via `useSearchParams` only — nothing persisted
  to localStorage/backend (S5).
- **No new runtime dependencies**: reuse React 19 + Vite 8 + React Router 7 +
  the existing `ui/` primitives (`EmptyState`, `Badge`, `Spinner`, `Skeleton`)
  and dark tokens (`dash-card`, `--color-accent`, `--color-line`,
  `--color-panel-soft`, `--color-ink*`). New controls follow the Day 3.1
  `HistoryFilters` dark-token input pattern (`border-[var(--color-line)]
  bg-[var(--color-panel-soft)] focus:border-[var(--color-accent)]`) — NOT the
  legacy `ui/Input` orange focus pattern.
- **Search matching (S1)**: case-insensitive substring matching via
  `toLocaleLowerCase()`; no regex interpretation (special characters are
  literal — spec Edge Cases); no Fuse.js/lunr or any search library.
  Searchable text per the constitution Search Implementation Rules: item
  names, exercise names, notes, AND category labels (workouts/history) and
  meal names (nutrition) — each page's `textFor(item)` accessor joins these
  so e.g. `search=strength` matches strength workouts and `search=breakfast`
  matches breakfast foods.
- **Debounce (S2)**: parent-level hook `useDebouncedValue(value, 250)`; the
  visible input updates instantly; filtering applies 250ms after typing
  stops. `SearchInput` is a dumb presentational component.
- **AND-composition (S3)**: `applyFilters(items, {...})` composes search +
  date-range + category/meal-type as logical AND; clearing one filter never
  clears others.
- **Date presets**: extend the existing `DATE_FILTER_OPTIONS` APPEND-ONLY with
  `last6` ("Last 6 Months") and `lastYear` ("This Year") so the shared preset
  list matches the constitution set (`all, week, month, last3, last6,
  lastYear, custom`). WorkoutList + WorkoutHistory consume it via the shared
  `resolveDateRange(option, {from,to}, today)` (exported from `filterUtils`),
  which supersedes WorkoutHistory's page-local `resolveDateBounds` and closes
  its last6/lastYear gap.
- **Category filter**: single-select `<select>` over `WORKOUT_CATEGORIES` +
  "All categories" (mates the existing `HistoryFilters` control). Applies to
  the Workouts + Activities pages.
- **Meal-type filter**: multi-select toggle chips (Breakfast/Lunch/Dinner/
  Snack), per constitution "multi-select checkboxes or toggle chips". Applies
  to the Nutrition page.
- **Nutrition day totals**: the summary cards (calories/protein/carbs/fat)
  come from `getNutritionSummary(date)` and intentionally reflect the FULL
  day — filters narrow the meal LIST only, never the day totals (documented,
  spec FR-005 scope).
- **Page scope (reconciliation, see §9)**: spec pages are WorkoutList (`/workouts`),
  Nutrition (`/nutrition`), ExerciseHistory (`/exercises`) + WorkoutHistory
  (`/workouts-history`, the Activities page, additive). Dashboard and Analytics
  get NO per-page search this phase (rationale in §9 Complexity Tracking);
  both already have filters (`DateRangeFilter` on Analytics) and the shared
  components make later extension trivial.
- **Empty states (S4)**: reuse `ui/EmptyState` with a descriptive message plus
  an in-card "Clear filters" `action` button (the WorkoutHistory pattern),
  distinct per page ("No workouts match your filters", etc.). Never a
  blank/broken card.
- **Transitions**: 150ms `opacity` transition on list changes where cheap
  (S-spec UI rules; not mandatory everywhere).
- **Performance (user plan Phase 6)**: all filtering is single-pass
  `Array.filter` over arrays that are small (mock `workouts` ~9 items) or
  per-page loaded; results derived once per render in `useMemo` keyed on
  `[data, debouncedSearch, ...filters]`. No pagination; large lists render as
  today (no virtualization added).

## 2. Ordered Task List

> Each task lists ID, title, files, implementation, acceptance criteria, and dependencies.
> Order is sequential unless marked **[P]** (different files, no dependency). Stories
> [US#] map to spec user stories (US1 workouts, US2 nutrition, US3 exercises, US4
> clear + URL state).

### Phase 1 — Shared Foundation (utils, hook, UI primitives) (Constitution Check gate)

- [ ] T001 Implement the pure shared filter utility module.
  - Files: `frontend/src/utils/filterUtils.js` (new `utils/` entry)
  - Implementation (all exported pure functions; NO date library (reuse the
    hand-rolled `new Date()` math already used by WorkoutHistory); NO mutation;
    every function returns a new array or value):
    - `todayISO()` → local `YYYY-MM-DD`.
    - `matchesSearch(text, query)` → `text.toLocaleLowerCase().includes(
      query.toLocaleLowerCase())` (S1; empty `query` → `true`).
    - `filterBySearch(items, query, textFor)` → items where
      `matchesSearch(textFor(item), query)`; `textFor` is a caller-supplied
      accessor (e.g. `(w) => [w.title, w.notes, ...(w.exercises||[]).map(ex =>
      ex.name)].join(' ')` for API workouts; `(w) => [w.name, w.notes, ...]`
      for mock workouts — covers spec FR-001/FR-004/FR-007 searchable fields).
    - `filterByDateRange(items, { from, to }, dateKey = 'date')` → inclusive
      `YYYY-MM-DD` string compare (`!from || item[dateKey] >= from`, `!to ||
      item[dateKey] <= to`); absent bound = unbounded.
    - `filterByCategory(items, categories, key = 'category')` → pass when
      `categories` is empty/`'all'`/`['all']`, else `categories.includes(
      item[key])`.
    - `filterByMealType(items, mealTypes, key = 'mealType')` → same semantics.
    - `applyFilters(items, { search = '', textFor, from, to, dateKey, categories,
      mealTypes })` → AND-compose the four predicates above in one pass (S3).
    - `resolveDateRange(option, { from = '', to = '' } = {}, today = todayISO())`
      → `{ from, to }` inclusive bounds per option: `all` → both `undefined`;
      `custom` → passed through (missing bound stays `undefined`); `week` →
      `[start-of-week(Monday), today]`; `month` → `[1st of month, today]`;
      `last3` → `[today minus 3 months (1st), today]`; `last6` → `[today minus
      6 months (1st), today]`; `lastYear` → `[Jan 1 of current year, today]`.
      Uses the SAME `startOfWeek`/`toISODate` local helper logic currently
      inline in `pages/WorkoutHistory.jsx` (moved here).
    - `hasActiveFilters({ search, category, dateOption, from, to, mealTypes })`
      → true when search non-empty, category not `'all'`, `dateOption` not
      `'all'` (custom counts when `from/to` set; treat custom-with-empty-bounds
      as inactive), or `mealTypes.length > 0`.
    - `filtersToSearchParams(filters, { include = ['search','category',
      'dateOption','from','to'] })` → `URLSearchParams` (underscores in
      meal-type lists NOT needed — meal types are single tokens; multi values
      comma-joined). `parseSearchParams(params, defaults)` → filter object with
      validated enum values (unknown category/mealType values dropped back to
      defaults; invalid dates dropped).
  - Acceptance: each function hand-checks against the mock `workouts` data and a
    sample nutrition entry list; search is case-insensitive and literal
    (no-regex); `applyFilters` composes AND; `resolveDateRange` matches
    WorkoutHistory's current outputs for all/week/month/last3/custom AND adds
    correct last6/lastYear; `hasActiveFilters` is accurate for every filter
    combo; no input array is mutated; no `.ts`.
  - Depends: none.
  - [P] [US1, US2, US3, US4]

- [ ] T002 Extend the shared date-filter preset list (append-only).
  - Files: `frontend/src/data/constants.js` (append-only `DATE_FILTER_OPTIONS`)
  - Implementation: append exactly two entries to the existing
    `DATE_FILTER_OPTIONS` (`all, week, month, last3, custom` already exist):
    `{ key: 'last6', label: 'Last 6 Months' }` and `{ key: 'lastYear',
    label: 'This Year' }`, keeping `custom` last. DO NOT remove/rename any
    existing entry; do not touch any other export.
  - Acceptance: `DATE_FILTER_OPTIONS` now = `all, week, month, last3, last6,
    lastYear, custom`; `WorkoutHistory` still renders (last6/lastYear resolve
    via the shared resolver in T007; before then they simply show full list —
    no crash).
  - Depends: none (paired with T007 wiring).
  - [P] [US1, US4]

- [ ] T003 Implement the debounce hook.
  - Files: `frontend/src/hooks/useDebouncedValue.js` (new `hooks/` entry)
  - Implementation: `useDebouncedValue(value, delay = 250)` returning
    `debouncedValue`. Internally `useState(value)` + `useEffect` timer reset on
    every `value` change, clearing on unmount (S2: 200-300ms window).
  - Acceptance: rapid successive updates coalesce to one emit after `delay` of
    silence; initial value returns immediately; timer cleaned up on unmount;
    no `.ts`.
  - Depends: none.
  - [P] [US1, US2, US3]

- [ ] T004 Implement the shared `SearchInput` component.
  - Files: `frontend/src/components/search/SearchInput.jsx` (new
    `components/search/`)
  - Implementation: `export function SearchInput({ id, label, value, onChange,
    placeholder, className = '' })`. A presentational, dark-token input that
    mirrors the Day 3.1 `HistoryFilters` control styling: wrapper with the
    `FieldLabel`-style muted uppercase label (label + `id` + `htmlFor`, S10);
    input `type="text"` with `border-[var(--color-line)]
    bg-[var(--color-panel-soft)] px-3.5 py-2.5 pl-10 text-sm text-[var(--color-ink)]
    focus:border-[var(--color-accent)] focus:outline-none rounded-xl`; left
    icon `<Search className="h-4 w-4">` (lucide-react, `text-[var(--color-ink-muted)]`);
    when `value` non-empty, a right-aligned clear button (`<X>` icon) calling
    `onChange('')`; `aria-label`/`aria-labelledby` wiring (S10). NO debounce
    inside (parent uses `useDebouncedValue`).
  - Acceptance: renders with icon + optional clear button; controlled
    `value`/`onChange`; focus ring is `--color-accent`; accessible label; no
    `.ts`; no new dependency.
  - Depends: none.
  - [P] [US1, US2, US3, US4]

- [ ] T005 Implement `FilterBar`, `FilterChip`, `ActiveFilters`.
  - Files: `frontend/src/components/search/FilterBar.jsx`,
    `frontend/src/components/search/FilterChip.jsx`,
    `frontend/src/components/search/ActiveFilters.jsx` (new `components/search/`)
  - Implementation:
    - `FilterBar({ title, children, collapsible = false, onToggle, open })` — a
      `dash-card p-5` wrapper that lays children out in a responsive grid
      (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`); when `collapsible` and on
      mobile (`< 768px`), children are hidden unless `open` and a "Filters"
      toggle `Button` (with optional active-count badge) is shown instead
      (S7 progressive disclosure). Desktop (`sm+`) always renders children.
    - `FilterChip({ label, onRemove })` — removable chip: accent-tinted pill
      (`rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]
      border border-[var(--color-accent)]/30 px-3 py-1 text-xs`) with an `<X>`
      remove button (`aria-label={`Remove ${label}`}`, S9/S10).
    - `ActiveFilters({ chips = [], onRemove, onClearAll })` — wraps chips in a
      `flex flex-wrap gap-2` row (S9) and, when `chips.length > 0`, a
      "Clear all filters" text button (S6, `aria-label`); wraps the row in
      `aria-live="polite"` (S10).
  - Acceptance: FilterBar stacks vertically < 760px and is a 2-3 col grid on
    larger screens; collapsed mobile toggle shows/hides children and reports
    active count; chips render accent-tinted, wrap, and each removes via its X
    button; "Clear all filters" appears only when chips exist and calls
    `onClearAll`; aria attributes present.
  - Depends: none (uses `ui/Button` + tokens only).
  - [P] [US1, US2, US4]

### Phase 2 — Workouts (WorkoutList) + Activities (WorkoutHistory, additive)

- [ ] T006 Integrate search + category + date-range into `WorkoutList`
  (`/workouts`).
  - Files: `frontend/src/pages/WorkoutList.jsx` (edit)
  - Implementation:
    - New page state: `searchDraft` (''), `category` ('all'), `dateOption`
      ('all'), `from`, `to`; `search = useDebouncedValue(searchDraft, 250)`.
    - URL sync via `useSearchParams` (S5): on mount, initialize the six filter
      values from `parseSearchParams` (with defaults); on any filter change,
      `filtersToSearchParams(...)` via `setSearchParams(replace: false)`.
    - Wrap the existing `load()` so search/filter NEVER re-fetch; instead a
      `useMemo` computes `filtered = applyFilters(workouts, { search, textFor:
      (w) => [w.title, w.notes, w.category, ...(w.exercises||[]).map(ex => ex.name)].join(
      ' '), from, to, categories: category })` (spec FR-001/002/003/009/010).
    - Render above the list a `FilterBar` containing `SearchInput`
      (`label="Search workouts"`, `placeholder="Search by name, notes, or
      exercise…"`), a category `<select>` (dark-token style, "All categories"
      + `WORKOUT_CATEGORIES`), and a date-option `<select>` over
      `DATE_FILTER_OPTIONS` + (when `custom`) two `type="date"` inputs,
      exactly like `HistoryFilters` (FR-003).
    - Results header: `{filtered.length} workouts` + `ActiveFilters` chips
      (search term, category label, date-range label) with "Clear all filters"
      that resets all six states and clears URL params (FR-012/014/US4).
    - Empty states: keep the existing full-list "No workouts yet" state
      (source `workouts.length === 0`); NEW distinct state when
      `filtered.length === 0` → `ui/EmptyState` title "No workouts match your
      filters", message + "Clear all filters" action (FR-011/S4).
    - `hasActiveFilters` guards whether the clear-all/chips render.
  - Acceptance: typing "bench" filters by title/notes/exercise name,
    case-insensitive, debounced 250ms; category + date presets (all presets +
    custom incl. inverted `from > to` → zero results) combine as AND; the
    search/filter never triggers a network call; URL reflects state and
    survives refresh; back/forward restores state; empty-filter state shows
    the clear action; existing add/edit/delete flows unchanged; `api.listWorkouts`
    called exactly once on mount.
  - Depends: T001, T002, T003, T004, T005.
  - [US1, US4]

- [ ] T007 Extend `WorkoutHistory` (`/workouts-history`) with search (additive).
  - Files: `frontend/src/utils/historyUtils.js` (edit `filterWorkouts`),
    `frontend/src/pages/WorkoutHistory.jsx` (edit)
  - Implementation:
    - `utils/historyUtils.js`: extend `filterWorkouts(workouts, { category =
      'all', from, to, query = '' })` to also exclude workouts where
      `query` does not match `[w.name, w.notes, w.category, ...(w.exercises||[]).map(ex =>
      ex.name)].join(' ')` (case-insensitive, only when `query` non-empty).
      ADD ONLY — existing callers (workouts-history) unaffected for empty query.
    - `pages/WorkoutHistory.jsx`: add `searchDraft` + `search =
      useDebouncedValue(searchDraft, 250)`; add a `SearchInput` above the
      existing `HistoryFilters` (inside the same `space-y-6` flow);
      `filterWorkouts(..., { ..., query: search })`; delete the page-local
      `startOfWeek`/`toISODate`/`resolveDateBounds` and use shared
      `resolveDateRange` from `filterUtils` (closes last6/lastYear); extend
      `hasActiveFilters` to include `search`; exercise names match via existing
      notes/exercise join; the existing "Clear filters" button + empty state
      now also clear/reset search (US4). URL sync optional-here: YES via
      `useSearchParams` for the `search`, `category`, `dateOption`, `from`,
      `to` params (consistency with T006).
  - Acceptance: search narrows the grouped workout list by name/notes/exercise;
    existing category + date filters still work; `Last 6 Months` / `This Year`
    presets now resolve correctly; clear filters resets search too; empty
    state message reflects search+filters; URL round-trips.
  - Depends: T002, T003, T004.
  - [US1, US4]

### Phase 3 — Nutrition

- [ ] T008 Integrate search + meal-type filter into `Nutrition` (`/nutrition`).
  - Files: `frontend/src/pages/Nutrition.jsx` (edit)
  - Implementation:
    - New state: `searchDraft` + `search = useDebouncedValue(searchDraft, 250)`;
      `mealTypes` (array, default `[]`).
    - Client-side filter over the LOADED day's `entries`: `filtered =
      useMemo(() => applyFilters(entries, { search, textFor: (e) =>
      [e.foodName, e.mealType, MEAL_META[e.mealType]?.label ?? ''].join(' '),
      mealTypes }), [entries, search, mealTypes])` (spec
      FR-004/005/009). The `grouped` meal sections are computed from
      `filtered` so a meal group disappears when all its entries are filtered
      out.
    - Render a `FilterBar` above the date row (which stays unchanged — it IS
      the single-date date filter, FR-006): `SearchInput` ("Search foods…") +
      four meal-type toggle `FilterChip`s that toggle membership in
      `mealTypes` (constitution "toggle chips"; clicking an active chip
      removes it, S9). `ActiveFilters` with a "Clear all filters" action
      visible when any filter is active (search or mealTypes).
    - Day totals (`summary` cards) intentionally unchanged and still reflect
      the FULL day (documented decision; derived from `getNutritionSummary`);
      `aria-live="polite"` on the filtered list region (S10).
    - Distinct empty state when `filtered.length === 0` && `entries.length > 0`
      → "No entries match your filters" + clear action; the existing
      "No entries for this date" state stays for a truly empty day (FR-011).
  - Acceptance: typing "chicken" filters food names (case-insensitive,
    debounced); toggling Lunch shows only lunch entries; search + meal
    toggles combine as AND; totals unchanged by filters; add/edit/delete still
    reload and interact correctly; empty-filter state with clear action; any
    filter active → chips + clear-all shown.
  - Depends: T001, T003, T004, T005.
  - [US2, US4]

### Phase 4 — Exercises

- [ ] T009 Integrate search into `ExerciseHistory` (`/exercises`).
  - Files: `frontend/src/pages/ExerciseHistory.jsx` (edit)
  - Implementation:
    - Add `searchDraft` + `search = useDebouncedValue(searchDraft, 250)`.
    - Filter the per-exercise page sections: build `names` as before but apply
      `filterBySearch(names, search, (n) => n)` (i.e. match exercise name) so
      only matching exercise groups render with their `PersonalRecords`
      (spec FR-007).
    - Render a `SearchInput` ("Search exercises…") between `PageHeading` and
      the group list; when `search` is active and zero groups match →
      `ui/EmptyState` "No exercises match your filters" with a "Clear search"
      action (FR-011/S4); when no search and `workouts.length === 0` keep the
      existing "No exercise history yet" state.
  - Acceptance: typing "squat" keeps only exercise groups whose name contains
    "squat" (case-insensitive, debounced); clearing restores all groups;
    `PersonalRecords` still correct for the visible groups; empty-filter state
    with clear action; the Day 3.1 `ExerciseHistory` component is reused
    unchanged (only the page filters which names are passed).
  - Depends: T003, T004.
  - [US3]

### Phase 5 — Cross-Cutting Polish, Verification, PHR Handoff

- [ ] T010 Responsive + accessibility, build, regression, handoff.
  - Files: `frontend/src/pages/WorkoutList.jsx`, `pages/Nutrition.jsx`,
    `pages/ExerciseHistory.jsx`, `pages/WorkoutHistory.jsx`,
    `components/search/*` (minor layout/class tweaks only); possibly
    `frontend/src/index.css` (STRICTLY-additive tokens only if genuinely
    missing — expected none)
  - Implementation: verify zero horizontal scroll at 1024+, 640-1024, <640
    (FilterBar stacks/collapses, chips wrap, search input full-width on
    mobile); keyboard flow (Tab through search → selects → chips → clear-all;
    Enter opens/closes as native `<select>`/buttons; Escape blur); `aria-live`
    announcements on the filtered regions; reconcile spacing/radius/type with
    the dark tokens (S9/S10, FR-020); remove dead imports; confirm no
    `.ts`/`.tsx`; confirm no new runtime dependency (`package.json`
    unchanged); run `npm run build` in `frontend/`; manual browser/regression
    pass on `/workouts`, `/workouts-history`, `/exercises`, `/nutrition` and
    prior days (`/`, `/progress`, `/goals`, `/analytics`, `/workouts/new`,
    `/workouts/:id/edit`, `/profile`, `/login`); record manual verification;
    write the tasks handoff note.
  - Acceptance: everything above passes; build clean; no regression across
    prior-day pages; all 14 Day 5.1 constitution DoD items demonstrably met
    (see §6); manual verification recorded.
  - Depends: T006, T007, T008, T009.

## 3. File Creation Order

Create/update files in this dependency-safe sequence:

1. `frontend/src/utils/filterUtils.js` (new — T001)
2. `frontend/src/data/constants.js` (append `DATE_FILTER_OPTIONS` — T002)
3. `frontend/src/hooks/useDebouncedValue.js` (new — T003)
4. `frontend/src/components/search/SearchInput.jsx` (new — T004)
5. `frontend/src/components/search/FilterBar.jsx` (new — T005)
6. `frontend/src/components/search/FilterChip.jsx` (new — T005)
7. `frontend/src/components/search/ActiveFilters.jsx` (new — T005)
8. `frontend/src/pages/WorkoutList.jsx` (edit — T006)
9. `frontend/src/utils/historyUtils.js` (extend `filterWorkouts` — T007)
10. `frontend/src/pages/WorkoutHistory.jsx` (edit — T007)
11. `frontend/src/pages/Nutrition.jsx` (edit — T008)
12. `frontend/src/pages/ExerciseHistory.jsx` (edit — T009)
13. `frontend/src/index.css` (STRICTLY-additive ONLY if T010 needs it)

## 4. State Management Plan

- **Data sources of truth**: unchanged — `api.listWorkouts()` -> `WorkoutList`
  `workouts` state; `api.listNutrition({ date })` -> `Nutrition` `entries`;
  `data/workoutHistoryData.js` `workouts` -> `WorkoutHistory` + `ExerciseHistory`.
  Search/filter NEVER triggers a refetch and NEVER mutates these source arrays
  (S8) — derived arrays only.
- **Per-page filter state** (`useState` + `useDebouncedValue` in each page,
  NO Context/store):
  ```js
  { searchDraft: '',              // input text (debounced -> search)
    category: 'all',              // WorkoutList/WorkoutHistory (single select)
    dateOption: 'all',            // all/week/month/last3/last6/lastYear/custom
    from: '', to: '',             // custom-range bounds, YYYY-MM-DD
    mealTypes: [] }               // Nutrition (toggle chips)
  ```
  Filter state is LOCAL per constitution Filter State Management Rules.
- **Derived results via `useMemo`**: each page computes its filtered slice
  ONCE per render keyed on `[sourceData, search, category, dateOption, from,
  to, mealTypes]` using `applyFilters`; components render only the derived
  slice. No separate "filtered data" store.
- **URL sync (S5)**: each page uses React Router `useSearchParams` — on mount
  initialize filter state via `parseSearchParams`; on change write via
  `filtersToSearchParams` (big `+` query string, no localStorage/backend).
  "Clear all filters" resets state AND deletes the params.
- **Empty/loading/error**: existing loading/error flows per page are
  untouched; this feature adds ONLY the filter-empty state (distinct per
  page, always with a clear action). Nutrition summary cards stay full-day.
- **Shared components are dumb**: `SearchInput`, `FilterBar`, `FilterChip`,
  `ActiveFilters` receive props; all logic lives in `filterUtils` + the hooks.

## 5. Testing & Verification Plan

- **Utility unit checks (T001)**: hand-check `matchesSearch` (case-insensitive,
  literal special chars like `(`, `*`), `filterBySearch` over mock `workouts`
  (title `Push Day`, notes `clouds "New bench press record"`, exercise
  `Plank`), `applyFilters` AND-composition across the 4 predicates,
  `resolveDateRange` for every preset against fixed `today` (week/Monday
  alignment, month 1st, last3/last6 first-of-month, lastYear Jan 1, custom
  pass-through, `all`, inverted `from>to`), `hasActiveFilters` truth table,
  URL param round-trip, and no-mutation (assert source array length unchanged).
- **Debounce (T003)**: simulated 10 rapid keystrokes → single filtered update
  ~250ms after last; unmount clears the timer.
- **WorkoutList (T006)**: type "bench" → only workouts whose title/notes/exercise
  contain it; `category=strength` + `dateOption=last3` combine; URL shows
  `?search=bench&category=strength&dateOption=last3` and survives refresh;
  back/forward restore; network tab shows exactly ONE `listWorkouts` call;
  `from > to` → zero results → empty-filter state + clear action; delete/edit
  still work on filtered list.
- **WorkoutHistory (T007)**: search narrows grouped history; Date presets
  incl. Last 6 Months / This Year resolve correctly; clear filters clears
  search too; Day 3.1 behavior unchanged when query empty.
- **Nutrition (T008)**: type "chicken" narrows only lunch/dinner rows as
  matching food name; toggling a meal chip adds/removes it; totals stay
  full-day after filtering; "No entries match your filters" empty state; add
  entry while filtered → correct reload behavior.
- **ExerciseHistory (T009)**: "squat" leaves only Squat groups + their
  PersonalRecords; clear restores; no-match empty state with "Clear search".
- **Responsive/a11y (T010)**: three breakpoints zero horizontal scroll;
  keyboard-only flow works; `aria-live` present on filtered regions; visual
  consistency vs Dashboard/HistoryFilters (dark tokens, green accent).
- **Build/quality**: `npm run build` (vite build) in `frontend/` clean; grep
  confirms no `.ts`/`.tsx`; `package.json` unchanged (no new deps); no dead
  imports.
- **Regression**: `/` (Day 1.1), `/progress` + `/goals` (Day 2.1),
  `/workouts-history` + `/workouts/:id` + `/exercises` (Day 3.1 — baseline
  behavior when filters are default), `/analytics` (Day 4.1), plus `/workouts`,
  `/nutrition`, `/workouts/new`, `/workouts/:id/edit`, `/profile`, `/login`.

## 6. Definition of Done

Day 5.1 is complete only when ALL hold:

- [ ] Shared `SearchInput` + filter controls exist and match the dark theme /
      green-accent design system (same tokens/cards/spacing as the Dashboard;
      no large side gaps).
- [ ] `WorkoutList` (`/workouts`): search by title/notes/exercise name,
      category filter, and date-range filter work and combine as AND; results
      update after a 250ms debounce; the list renders only the filtered slice.
- [ ] `WorkoutHistory` (`/workouts-history`): text search added beside existing
      filters; new preset handling correct; clear resets search too.
- [ ] `Nutrition` (`/nutrition`): search by food name + meal-type toggle chips
      work and combine as AND over the day's entries; day totals unchanged.
- [ ] `ExerciseHistory` (`/exercises`): search by exercise name filters the
      grouped list.
- [ ] "Clear all filters" appears whenever any filter/search is active and
      resets search + all filters to defaults (state AND URL params).
- [ ] Zero-match results show a designed `EmptyState` with a clear action —
      never a blank/broken card.
- [ ] Filter state is reflected in URL query params and survives refresh /
      back-forward (S5). No localStorage/backend persistence.
- [ ] Responsive: filter bar stacks/collapses on mobile (< 768px), inline on
      desktop; chips wrap; zero horizontal scroll at any breakpoint.
- [ ] Accessible: labels/aria-labels, keyboard-navigable controls, `aria-live`
      on filtered regions (S10).
- [ ] Search is case-insensitive substring matching (S1); debounced 200-300ms
      (S2); filters compose as AND (S3); read-only, no data mutation (S8).
- [ ] All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime
      dependency (package.json unchanged); no backend/API/env/model changes.
- [ ] `npm run build` (vite build) succeeds cleanly.
- [ ] Manual browser verification recorded (all four pages, every preset,
      custom range, inverted range, search+filter combos, empty states, URL
      round-trip, responsive at 3 breakpoints, prior-day regression).

## 7. Out of Scope Reminder

MUST NOT be built in Day 5.1:

- Backend search API, database text indexes, or server-side filtering; changes
  to `services/api.js` or any backend route/model/controller.
- Full-text search engines; ranking/relevance scoring beyond substring match.
- Fuzzy matching / typo tolerance (Levenshtein, Soundex).
- Saved searches, search history, auto-complete/typeahead suggestions.
- Advanced filter operators (NOT, OR across dimensions).
- Filter persistence to localStorage, cookies, or backend.
- Server-side pagination / infinite scroll; export of filtered results.
- Editing/deleting any entity from the filtered views (existing flows only).
- TypeScript adoption or conversion (`.js`/`.jsx` only, Principle V override).
- New runtime dependencies (search/filter/date/state libraries).
- Automated test suite/CI (optional build + manual smoke only).
- Deployment/production hosting; env-var changes; new routes in `App.jsx`.
- A dedicated cross-app global search bar in `TopNavbar` (deferred — see §9).

These MUST NOT be silently added; open a new spec if one is required.

## 8. Constitution Check

*GATE: Passes before Phase 0 research; re-checked after Phase 1 design.*

| Gate | Result | Evidence |
|------|--------|----------|
| S1 Case-insensitive substring matching | PASS | `matchesSearch` via `toLocaleLowerCase()`; literal (no-regex) matching (T001); searchable fields per page: workouts title/notes/exercise names, nutrition food name, exercises name |
| S2 Debounced search input (200-300ms) | PASS | `useDebouncedValue(value, 250)` (T003); instant visual input, filtered updates after silence |
| S3 Composable AND filters | PASS | `applyFilters` composes search + date + category + meal-type in one pass (T001); clear-one-never-clears-others |
| S4 Empty result handling | PASS | Distinct `EmptyState` per page with "Clear all filters"/"Clear search" action (T006-T009); never blank/broken |
| S5 Filter persistence in URL | PASS | `useSearchParams` + `filtersToSearchParams`/`parseSearchParams` on all four pages; no localStorage/backend (T006-T009) |
| S6 Clear-all affordance | PASS | `ActiveFilters` shows "Clear all filters" only when filters active; keyboard-accessible (T005, per-page wiring) |
| S7 Progressive disclosure | PASS | `FilterBar` collapses date-range/meal controls behind a "Filters" toggle < 768px; inline on desktop (T005) |
| S8 No data mutation | PASS | All filtering derives new arrays via pure `filterUtils`; source state never reassigned/mutated; no side effects (T001/T006-T009) |
| S9 Responsive filter layout | PASS | `FilterBar` grid stacks on mobile, inline on desktop; chips wrap + individually removable (T005, T010) |
| S10 Accessibility | PASS | `label`/`aria-label` on search + controls, keyboard-navigable, `aria-live="polite"` on filtered regions (T004/T005/T010) |
| JS-only override (Principle V Day 5.1) | PASS | Every created/edited file `.js`/`.jsx`; no `.ts`/`.tsx`/`@ts-check` (T010 greps) |
| No backend/env/route changes | PASS | Only page-level component edits + new `utils/`,`hooks/`,`components/search/` files; `App.jsx`, `services/api.js`, env, models untouched |
| No new runtime dependencies | PASS | Only React Router (`useSearchParams`), lucide-react (`Search`, `X`), existing `ui/` primitives reused; `package.json` unchanged |
| Additive-only to prior-day files | PASS | `constants.js` append-only; `historyUtils.filterWorkouts` extended (empty-query = old behavior); `WorkoutHistory`/`ExerciseHistory` changes additive; Day 3.1 data arrays untouched |
| Page scope reconciliation (spec > constitution pages) | PASS* | Spec pages (WorkoutList/Nutrition/ExerciseHistory) implement; WorkoutHistory (Activities) covered additively; Dashboard + Analytics search deferred — justified in §9 |
| No new routes | PASS | No `App.jsx` edits; filtering embeds in existing pages |
| Date presets match constitution set | PASS | `DATE_FILTER_OPTIONS` extended append-only to all/week/month/last3/last6/lastYear/custom; shared `resolveDateRange` (T001/T002/T007) |

Result: **No unaddressed violations** — two scoped deviations documented with
justification in §9: (1) Dashboard + Analytics search inputs deferred;
(2) Nutrition keeps its single-date picker as the date filter (no date-range
selector per DoD item 4) per the ratified spec + "no backend changes" rule.

## 9. Complexity Tracking

> Filled because the constitution gate has a scoped deviation to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution DoD item 1 names Dashboard + Analytics among pages with a search input; they are excluded this phase | The ratified spec (S5.1) and the `/sp.plan` integration list scope search/filter to the Workouts, Exercises, and Nutrition pages; Dashboard shows derived summary stats (a search there duplicates the WorkoutList experience) and Analytics already ships its own `DateRangeFilter` + category filter (Day 4.1). WorkoutHistory (Activities) IS covered additively (T007) | Adding search inputs to Dashboard + Analytics would re-implement WorkoutList search (Dashboard recent-workouts) or duplicate existing filters (Analytics), adding UI surface and regression risk without a spec user story; shared `SearchInput`/`FilterBar` make a future cross-app bar (TopNavbar) a trivial follow-up |
| Constitution DoD item 4 lists "Date range filter with presets + custom range" on Nutrition; Nutrition keeps its existing single-date picker as the date filter | The ratified spec (FR-006) and user plan bind Nutrition's date behavior to the existing single-date picker, and Day 5.1 MUST NOT change backend/API behavior (`listNutrition({ date })` returns ONE day only — a server-side range endpoint is explicitly out of scope). Date-range with presets + custom IS delivered on WorkoutList and WorkoutHistory (Activities) via the shared presets. Meal-type + search (DoD items 2/6) are fully delivered on Nutrition | Faking a client-side "range" from single-day loads would require N sequential API calls with no spec story and would break the day-totals contract; the single-date picker already satisfies "date filter exists on Nutrition" without violating "no backend changes" |
| No cross-app global search bar in `TopNavbar` | User plan Phase 6 marks global search "(if required)"; shared page-scoped inputs deliver the search value now | A TopNavbar bar would need a results/grouping UI (per "grouped by type" requirement) with no page under it, contradicting "no new routes" and adding scope without a spec story |

## 10. Artifacts This Phase

- `specs/008-search-filtering/research.md` (Phase 0)
- `specs/008-search-filtering/data-model.md` (Phase 1)
- `specs/008-search-filtering/contracts/filter-contract.md` (Phase 1)
- `specs/008-search-filtering/quickstart.md` (Phase 1)
- `AGENTS.md` (agent context, Phase 1 — via `update-agent-context.ps1`)