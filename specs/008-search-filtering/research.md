# Phase 0 Research — Search & Filtering (Day 5.1)

**Branch**: `008-search-filtering` | **Date**: 2026-09-09
**Source**: Day 5.1 constitution `.specify/memory/constitution.md` v3.4.0 + `specs/008-search-filtering/spec.md`

## 1. Feature Summary

Provide client-side search + multi-dimensional filtering on the Workouts
(`/workouts`), Nutrition (`/nutrition`), and Exercises (`/exercises`) pages by
wrapping each page's existing loaded data with a shared, case-insensitive,
debounced, AND-composed filter pipeline, persisted to the URL query string.
Activities (`/workouts-history`) receives additive text search under the same
pipeline. Frontend-only; zero backend/model/API changes; zero new runtime
dependencies; JavaScript only.

## 2. Codebase Facts Established (Evidence)

### Pages & data sources

| Page (route) | Data origin | Searchable text fields | Filter dimensions today |
|---|---|---|---|
| `WorkoutList` (`/workouts`) | `api.listWorkouts()` (backend, returns ALL workouts) | API workout: `title`, `notes`, `exercises[].name` | none (date-desc list only) |
| `Nutrition` (`/nutrition`) | `api.listNutrition({ date })` (single day entries) + `api.getNutritionSummary(date)` (full-day totals) | entry `foodName` (+ `mealType`, `calories`, etc. shown) | single-date picker (is the date filter) |
| `ExerciseHistory` (`/exercises`) | mock `data/workoutHistoryData.js` → page maps ALL exercise names → `components/history/ExerciseHistory.jsx` | exercise `name` | none (static grouped list) |
| `WorkoutHistory` (`/workouts-history`) | mock `data/workoutHistoryData.js` (workout uses `name`, NOT `title`) | `name`, `notes`, `exercises[].name` | `HistoryFilters`: category select + date presets (all/week/month/last3/custom) via page-local `resolveDateBounds` |

### Existing reusable code

- `utils/historyUtils.js`: `filterWorkouts(workouts, { category, from, to })`,
  `groupByDate`, `uniqueExerciseNames`, `exercisesFor` — reused/extended for
  `WorkoutHistory`; `ExerciseHistory` derives `names` via map + `uniqueExerciseNames`.
- `data/constants.js`: `DATE_FILTER_OPTIONS` = `[{all},{week},{month},{last3},
  {custom}]`; `WORKOUT_CATEGORIES`; `MEAL_TYPES` (existing); `SIDEBAR_MENU`,
  `NAV_TABS`, `MACRO_COLORS`. Append-only discipline is established (Day 2.1–4.1).
- `components/history/HistoryFilters.jsx`: dark-token control pattern
  `border-[var(--color-line)] bg-[var(--color-panel-soft)]
  focus:border-[var(--color-accent)]` + `FieldLabel`-style muted labels — the
  STYLE SOURCE for all new inputs.
- `components/ui/index.js` exports: `Button`, `Input`, `Select`, `Card`,
  `Badge`, `Modal`, `Skeletons`, `Counter`, `PageTransition`, `Toast`,
  `ProgressBar`, `EmptyState`, `Spinner`. `EmptyState` supports an `action` prop
  (used by WorkoutHistory's "Clear filters" empty state).
- `components/layout/Layout.jsx`: dark shell (`dashboard-body`, `Sidebar`,
  `lg:pl-64`, `main p-4 sm:p-6 lg:p-8`, panels `bg-panel`, text `text-ink-soft`)
  that all four pages already sit inside.
- `components/layout/TopNavbar.jsx` `implementedTabs`: dashboard, workouts,
  nutrition, progress, goals, history, analytics.
- `App.jsx` routes: `/workouts`, `/workouts-history`, `/nutrition`, `/exercises`
  all under `<Route element={<Layout/>}>`; no route changes needed.

### Field-name mismatch (CRITICAL)

Mock workout: `name` (e.g. `"Push Day"`). API/DB workout: `title`. Both carry
`notes` + `exercises[].name`. `filterUtils` search helpers therefore take a
caller-supplied `textFor(item)` accessor; the workouts page joins
`[title, notes, …exercises.map(e => e.name)]`, the history page joins
`[name, notes, …exercises.map(e => e.name)]`.

### Styling trap

`components/ui/Input.jsx` uses the Day 1.1 ORANGE focus ring
(`rgba(255, 140, 66, …)`). It must NOT be reused for the new search/filter
controls — the dark green-accent pattern (`--color-line` / `--color-accent`)
is the house rule. Search/select/date inputs are styled inline (the
`HistoryFilters` approach), not via `ui/Input`.

## 3. Decisions Made (with rationale)

1. **Per-page inputs, NOT a global navbar search** — user plan says global
   search is "(if required)" and spec/user stories are per-page. Shared
   `SearchInput` keeps a later cross-app bar trivial. TopNavbar/App unchanged.
2. **Parent-level debounce** — `useDebouncedValue(value, 250)` lives as a hook;
   `SearchInput` stays dumb. Keeps filtering logic out of the input and makes
   the 250ms window a single knob (S2 200–300ms).
3. **Pure single-pass filter pipeline** — everything in `utils/filterUtils.js`
   so ordering/AND semantics are defined once, hand-checkable, and mutations
   impossible (S8). `applyFilters` does search (S1) + date-range + category +
   meal-type in ONE `Array.filter` (S3).
4. **Scope reconciliation** — spec pages (Workouts/Nutrition/Exercises) are the
   core; `WorkoutHistory` (constitution "Activities" page) gets ADDITIVE search
   (low cost, it already has filters); Dashboard + Analytics get NO per-page
   search now (Dashboard = derived stats duplicating WorkoutList; Analytics
   already has `DateRangeFilter` + category). Justified in plan §9 Complexity
   Tracking.
5. **Workouts = search + category + date-range** — the page already loads the
   full workout list, so all three filters are pure client-side trims.
   Category is a single-select mirroring `HistoryFilters`; date-range uses the
   shared presets + custom from/to.
6. **Nutrition = search + meal-type chips, single-date stays** — meal-type is
   multi-select toggle chips per constitution ("multi-select checkboxes or
   toggle chips"); search + toggles trim the day's entry list only; the
   summary cards (full-day totals from the summary API) are intentionally
   unaffected; the existing single-date picker is already the date filter (no
   backend change → no date-range here). Total calorie display per entry
   (US2) is preserved.
7. **DATE_FILTER_OPTIONS extended append-only** — `last6` ("Last 6 Months") +
   `lastYear` ("This Year") appended so the full constitution set
   (all/week/month/last3/last6/lastYear/custom) is shared; WorkoutHistory's
   page-local `resolveDateBounds` migrates to the shared `resolveDateRange`
   (fixes a pre-existing last6/lastYear gap there).
8. **URL persistence via `useSearchParams`** — query params per page
   (`search`, `category`, `dateOption`, `from`, `to`, `mealTypes[comma]`);
   initialized on mount, written on change, cleared by reset. No localStorage/
   backend (S5). Refresh + back/forward round-trip for free.
9. **Visual language** — new controls use the `HistoryFilters` dark-token
   classes; `FilterBar` (responsive grid → mobile collapsible), `FilterChip`
   (accent-tinted removable pills), `ActiveFilters` ("Clear all filters",
   `aria-live`). Empty states reuse `EmptyState` with a clear action, distinct
   per page.

## 4. Risks / Mitigations

- **`title` vs `name`** — accessor-based `textFor` (Decision 3) removes the
  coupling; hand-check both mock + API shapes.
- **Nutrition totals drift** — mitigated by testing that `summary` is rendered
  from the API summary, never recalculated from `filtered` entries.
- **URL param pollution** — `parseSearchParams` validates enums/dates and drops
  unknowns back to defaults; empty-equivalent values (`'', 'all'`) are omitted
  on write so URLs stay short.
- **Debounce + stale closure** — filter state derived in `useMemo` keyed on the
  debounced value; no stale reads (single origin in the page).
- **No test runner in repo** (`npm test`/`npm run lint` absent in scripts) —
  verification is by `vite build` + hand-check script + manual browser pass
  (recorded), matching the Day 2.1–4.1 approach.

## 5. Open Question Log

- None. All spec/user-plan ambiguities resolved in §3 and reflected in the plan.

## 6. Feedback Loops

Implementation (T006–T009) should surface: (a) date-input UX when `custom` is
active across breakpoints; (b) whether `mealTypes` chip-toggle UX reads
clearly against the day totals; (c) iOS date-input quirk handling; (d) whether
URL param length stays sane for typical workout titles. If any loop shows a
real defect, adjust the plan task + spec (in a new amendment) before
implementation completes.