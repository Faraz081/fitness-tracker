# Implementation Plan: Activities & Workout History (Day 3.1)

**Branch**: `006-workout-history` | **Date**: 2026-09-08 | **Spec**: [specs/006-workout-history/spec.md](./spec.md)
**Input**: Day 3.1 constitution (`.specify/memory/constitution.md`, v3.2.0) + feature specification.

## 1. Overall Approach

### 1.1 High-Level Sequence

1. **Data + utils layer** — the mock dataset (`workoutHistoryData.js`),
   constants (`WORKOUT_CATEGORIES`, `PR_FIELDS`, `DATE_FILTER_OPTIONS`), and the
   PURE derivation helpers (`historyUtils.js`) that encode filtering, grouping,
   PR, and volume rules exactly once. Every section reads from these; nothing is
   computed inline.
2. **Pages + routing + navigation** — scaffold `pages/WorkoutHistory.jsx`,
   `pages/WorkoutDetail.jsx`, `pages/ExerciseHistory.jsx` (each renders inside
   the existing `DashboardLayout`), add the three standalone routes in
   `App.jsx`, and wire the existing `Sidebar`/`TopNavbar` so History becomes a
   real, navigable entry (H10).
3. **Workout History page** — `HistoryFilters` (category + date), then
   `WorkoutHistoryList` of `WorkoutCard`s grouped newest-first, composed in
   `pages/WorkoutHistory.jsx`, with filters driving the pure `filterWorkouts`.
4. **Workout Detail view** — `components/history/WorkoutDetail` +
   `ExerciseRow` rendered by `pages/WorkoutDetail.jsx`, loading the match via
   `findWorkout`, with the "Workout not found" empty state for unknown ids.
5. **Exercise History page** — per-exercise progression
   (`ExerciseHistory` + `ExerciseRow`) and the derived `PersonalRecords` panel,
   composed in `pages/ExerciseHistory.jsx`.
6. **Cross-cutting** — empty/loading/error states on every section (shared
   `EmptyState`/`Spinner`), responsive reflow, then polish + build verification +
   Day 1.1 + Day 2.1 regression.

### 1.2 Design & Technical Decisions Locked by Constitution/Spec

- **Language**: JavaScript only — `.js` for data/utils/constants, `.jsx` for
  components/pages. Strictly NO TypeScript (H2).
- **Frontend-only, mock data**: no backend, API, auth, persistence, or env
  changes (H1). All data imports from `frontend/src/data/`; `services/` and the
  auth-phase `/workouts*` CRUD pages are untouched.
- **No new runtime dependencies**: reuse React 19 + Vite 8 + React Router 7 +
  Tailwind v4 and the Day 1.1 `ui/` primitives (`Card`, `Badge`, `EmptyState`,
  `Spinner`, `Select`, `Input`) + dark tokens (`--color-*`, `dash-card`,
  `dash-num`, `accent-text`) (H3, H5).
- **State**: page-level `useState` slices (workouts, category filter, date
  range, loading/error); props-driven sections; pure `utils/` for all filtering
  and derivation (H6, H7, H8); no state library, no Context required.
- **Routing decision (explicit)**: App.jsx gains three top-level routes
  `/workouts-history`, `/workouts/:id`, `/exercises`, each rendering inside its
  own `DashboardLayout` — mirroring Day 1.1 `/` and Day 2.1 `/progress`
  wiring. `/workouts/:id` is the new Day 3.1 detail route and MUST NOT touch the
  existing `/workouts`, `/workouts/new`, or `/workouts/:id/edit` auth-phase
  routes (they remain and keep working).
- **Navigation (H10)**: `frontend/src/data/constants.js` gains a `history`
  entry in `NAV_TABS` and `SIDEBAR_MENU` (label "History", path
  `/workouts-history`); `TopNavbar.jsx`'s `implementedTabs` set and
  `Sidebar.jsx`'s `menuIcons` map gain the corresponding key. `bmi` stays inert.
- **Date convention**: workout `date` is a `YYYY-MM-DD` string; filtering is
  plain inclusive string comparison; absent bounds = unbounded.
- **Category enum**: `WORKOUT_CATEGORIES` = `strength`, `cardio`,
  `flexibility`, `hybrid`, `other` (fixed, lowercase in data, display label via
  constants).
- **PR semantics**: derived each render (H7). `bestLift` = max `weightKg`
  ignoring bodyweight (`0`/`undefined`); `bestSet` = highest `sets × reps ×
  weightKg`; `bestVolume` = max `Σ(sets × reps × weightKg)` across workouts.
  Never displayed as `0 kg`/`NaN` when there is no weighted history.
- **Empty/loading/error**: every data-driven section renders the shared
  `EmptyState`/`Spinner`/friendly-error branches (H4). Distinct empty states for
  "no workouts at all", "no matches for filters", "workout not found", "no
  exercise history", and "no personal records yet".

## 2. Ordered Task List

> Each task lists ID, title, files, implementation, acceptance criteria, and dependencies.
> Order is sequential unless marked **[P]** (different files, no dependency). Stories
> [US#] map to spec user stories (US1 history list, US2 filters, US3 detail view,
> US4 exercise history + PRs, plus the edge cases in spec.md).

### Phase 1 — Data Layer, Utils, Pages, Routing, Navigation (Constitution Check gate)

- [ ] T001 Extend the shared constants module with Day 3.1 display metadata.
  - Files: `frontend/src/data/constants.js` (append only)
  - Implementation: append exactly three exports, do NOT remove/rename any
    existing export (`QUICK_LOG_ITEMS`, `SIDEBAR_MENU`, `NAV_TABS`,
    `MACRO_COLORS`, `WEEK_DAYS`, `MEASUREMENT_FIELDS`, `GOAL_CATEGORIES`,
    `STREAK_TYPES`).
    - `WORKOUT_CATEGORIES` = `[{ key: 'strength', label: 'Strength' }, { key:
      'cardio', label: 'Cardio' }, { key: 'flexibility', label:
      'Flexibility' }, { key: 'hybrid', label: 'Hybrid' }, { key: 'other',
      label: 'Other' }]`.
    - `PR_FIELDS` = `[{ key: 'bestLiftKg', label: 'Best Lift', unit: 'kg' }, {
      key: 'bestSet', label: 'Best Set', unit: 'kg' }, { key: 'bestVolumeKg',
      label: 'Best Volume', unit: 'kg' }]`.
    - `DATE_FILTER_OPTIONS` = quick ranges `[{ key: 'all', label: 'All' }, {
      key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' },
      { key: 'last3', label: 'Last 3 Months' }, { key: 'custom', label: 'Custom
      Range' }]`.
  - Acceptance: three new named exports exist with the exact keys/labels above;
    all prior exports unchanged; file stays `.js`.
  - Depends: none.
  - [P]

- [ ] T002 Create the mock workout-history dataset (filled + empty variants).
  - Files: `frontend/src/data/workoutHistoryData.js` (new)
  - Implementation: export `workouts` (array) and `emptyWorkouts` (array `[]`;
    imported or defaulted when forcing empty states). Each workout matches the
    constitution shape `{ id, name, category, date, notes, exercises: [{ id,
    name, sets, reps, weightKg }] }`. Filled data MUST:
    - span ≥3 different `date` values between 2026-06 and 2026-09-08 so that
      "This Week" (2026-09-07/08), "This Month" (Sept), and "Last 3 Months"
      filters each produce a non-empty distinct slice;
    - include at least one workout per category across the set;
    - include an exercise that repeats across ≥3 workouts with increasing
      `weightKg` (e.g. "Bench Press") so PRs and progression are visible;
    - include a bodyweight exercise (`weightKg: 0` or omitted) to verify it is
      excluded from PRs but counted in exercise/set counts;
    - include ONE workout with `exercises: []` to exercise the "No exercises in
      this workout" empty state;
    - include ≥1 exercise with only bodyweight history so the "No personal
      records yet" panel state is reachable.
  - Acceptance: exports exist; shapes valid (dates `YYYY-MM-DD`, categories from
    `WORKOUT_CATEGORIES` keys); required data-coverage bullets hold; no `.ts`.
  - Depends: T001 (category keys).
  - [P]

- [ ] T003 Implement the pure filtering/grouping/PR helpers.
  - Files: `frontend/src/utils/historyUtils.js` (new `utils/` entry)
  - Implementation (all exported pure functions; no date library; no mutation):
    - `filterWorkouts(workouts, { category = 'all', from, to })` → NEW array.
      Category matches when `from/absent || w.category === category`; date
      bounds inclusive string compare `w.date >= from` / `w.date <= to`, absent
      bounds unbounded; both filters AND-compose; result sorted newest-first by
      `date` (stable for equal dates). Never mutates `workouts`.
    - `groupByDate(workouts)` → array `[{ date, workouts: [...] }]`
      newest-first, preserving input order within a date — used for date
      group headings.
    - `findWorkout(workouts, id)` → the workout object or `undefined` (for the
      detail not-found state); never throws.
    - `bestLift(exerciseName, workouts)` → max `weightKg` across all workouts
      containing an exercise with that `name`, ignoring `0`/`undefined`
      records; returns `null` when no weighted record exists.
    - `bestSet(exerciseName, workouts)` → the highest single-exercise volume
      `sets × reps × weightKg` (same weighting exclusion); returns `null` when
      none.
    - `bestVolume(workouts)` → max `Σ exercises(sets × reps × weightKg)`
      (bodyweight exercises contribute 0 volume) across workouts; `0` when none.
    - `workoutVolume(workout)` → `Σ(sets × reps × weightKg)` for one workout.
    - `formatVolume(n)` → thousands-separated integer + ` kg` (e.g. `1,440 kg`),
      `0` → `0 kg` (valid, only used where volume is meaningful).
  - Acceptance: filtering returns correct AND-composed, ordered, non-mutated
    results for the T002 mock set; absent bounds unbounded; bestLift/bestSet
    return `null` for bodyweight-only exercises; volumes match hand-checked
    math; input arrays unchanged.
  - Depends: T002.
  - [US1, US2, US4]

- [ ] T004 Scaffold the three pages (heading + `DashboardLayout` shell).
  - Files: `frontend/src/pages/WorkoutHistory.jsx`, `frontend/src/pages/WorkoutDetail.jsx`,
    `frontend/src/pages/ExerciseHistory.jsx` (all new)
  - Implementation: each is `export default function` returning
    `<DashboardLayout>` around a page heading (current date + `dash-num` title
    "Workout History"/"Workout Detail"/"Exercise History", reusing the Day 2.1
    `Progress.jsx` `PageHeading` pattern). Sections are composed by T009/T011/
    T014. No logic beyond heading for now.
  - Acceptance: temporarily routed (see T005), each page renders its heading
    inside the dark shell without crashing.
  - Depends: T002, T003.
  - [US1, US3, US4]

- [ ] T005 Wire routes and navigation (small, surgical edits).
  - Files: `frontend/src/App.jsx`, `frontend/src/data/constants.js`,
    `frontend/src/components/layout/TopNavbar.jsx`,
    `frontend/src/components/layout/Sidebar.jsx`
  - Implementation:
    - `App.jsx`: add top-level routes `<Route path="/workouts-history"
      element={<WorkoutHistory />} />` and `<Route path="/exercises"
      element={<ExerciseHistory />} />` and `<Route path="/workouts/:id"
      element={<WorkoutDetail />} />` beside the `/`, `/progress`, `/goals`
      routes, each wrapped in `<ProtectedRoute>` exactly like `/progress`.
      Leave all other routes untouched.
    - `constants.js`: add to `NAV_TABS` (after `goals`, before `bmi`) `{ key:
      'history', label: 'History', path: '/workouts-history' }` and the same
      entry to `SIDEBAR_MENU`.
    - `TopNavbar.jsx`: add `'history'` to `implementedTabs`.
    - `Sidebar.jsx`: add `history: History` to `menuIcons` (lucide-react
      `History` exists in the installed package; fallback `Dumbbell` otherwise).
  - Acceptance: `/workouts-history`, `/workouts/:id`, `/exercises` load their
    pages; nav tab + sidebar item navigate and show active state; `/workouts`,
    `/workouts/new`, `/workouts/:id/edit` still work (route ranking keeps
    static `new`/`edit` winning over `:id`); `/`, `/progress`, `/goals`,
    `/login`, `/profile`, `/nutrition` still load; `bmi` still inert.
  - Depends: T004.
  - [US1, US3, US4]

### Phase 2 — Workout History Page

- [ ] T006 [US1] Implement `CategoryBadge` + `WorkoutCard`.
  - Files: `frontend/src/components/history/CategoryBadge.jsx`,
    `frontend/src/components/history/WorkoutCard.jsx` (new `history/` folder)
  - Implementation:
    - `CategoryBadge` props `{ category, className = '' }`: maps a category key
      to the shared `ui/Badge` with a semantic color from `WORKOUT_CATEGORIES`
      (e.g. `strength`→accent/primary, `cardio`→success, `flexibility`→warning,
      `hybrid`→primary, `other`→neutral). Reuses `ui/Badge`; never invents new
      color meanings beyond success/accent/warning/muted.
    - `WorkoutCard` props `{ workout }`: builds on `dash-card`; renders name
      (`truncate`, prominent), `CategoryBadge`, `date`, and a summary line
      (e.g. `"8 exercises · 32 sets"` plus `formatVolume(workoutVolume(workout))`
      as a `dash-num` headline). The whole card is a `Link` to
      `/workouts/${workout.id}`; keyboard-focusable with visible focus-visible
      ring using the accent color.
  - Acceptance: card shows name, badge, date, exercise count + sets + volume;
    links to the detail route; focus ring visible on keyboard tab; long names
    truncate; numbers use `dash-num`.
  - Depends: T001, T002, T003.
  - [US1]

- [ ] T007 [US1] Implement `WorkoutHistoryList`.
  - Files: `frontend/src/components/history/WorkoutHistoryList.jsx`; wire into
    `pages/WorkoutHistory.jsx`
  - Implementation: props `{ workouts }`. Groups via `groupByDate` and renders
    date headings (e.g. formatted "Sep 8, 2026") with a responsive grid
    (`sm:grid-cols-2 xl:grid-cols-3`) of `WorkoutCard`s beneath. `workouts`
    empty → `EmptyState` ("No workouts recorded yet"). A listed count
    ("N workouts") renders above the grid so filtering is observable.
  - Acceptance: cards render newest-first, grouped by date; count visible;
    empty state when `workouts` is empty; reflows at breakpoints.
  - Depends: T006.
  - [US1]

- [ ] T008 [US2] Implement `HistoryFilters` (category + date).
  - Files: `frontend/src/components/history/HistoryFilters.jsx`; wire into
    `pages/WorkoutHistory.jsx`
  - Implementation: props `{ category, onCategory, dateOption, onDateOption,
    from, to, onFrom, onTo, onClear }`. Renders a row of real controls using
    `ui/Select` + `ui/Input` (type="date"):
    - category `Select` with "All categories" + the five `WORKOUT_CATEGORIES`
      labels;
    - date range `Select` over `DATE_FILTER_OPTIONS` quick ranges;
    - when `custom` is active, two `Input type="date"` fields (`from`,`to`);
    - a "Clear filters" `Button` (shown when any filter is active).
    All controls are controlled (`value`/`onChange`), labels + `id`s wired for
    accessibility.
  - Acceptance: each control renders as a real select/input; custom range
    reveals from/to date fields only when selected; clear action is present only
    when filters are active.
  - Depends: T001.
  - [US2]

- [ ] T009 [US1, US2] Compose the Workout History page with live filters.
  - Files: `frontend/src/pages/WorkoutHistory.jsx` (complete)
  - Implementation: page holds `useState` for `workouts` (init from
    `workoutHistoryData`), `category`, `dateOption`, `from`, `to`; plus
    `loading`/`error` for the mock async gate (T015 pattern, ~400-500ms). In
    render, resolve the quick-range `from`/`to` when a quick option is selected
    (map via `DATE_FILTER_OPTIONS` keys to today-relative bounds — implement as
    a tiny local helper or in T003; only the chosen bounds are passed), then
    `const filtered = filterWorkouts(workouts, { category, from, to })`, then
    pass to `WorkoutHistoryList`. When `workouts` (source) is empty → "No
    workouts recorded yet". When `filtered` is empty but source is not → the
    distinct "No workouts match your filters" `EmptyState` with a clear-filters
    action (calls `onClear`). Keep source array untouched at all times.
  - Acceptance: default shows ALL workouts newest-first; category alone, date
    alone, and both together update the list via `filterWorkouts`; clearing
    restores full list; both empty states reachable and distinct; source array
    never mutated.
  - Depends: T007, T008, T003.
  - [US1, US2]

### Phase 3 — Workout Detail View

- [ ] T010 [US3] Implement `ExerciseRow` + `components/history/WorkoutDetail`.
  - Files: `frontend/src/components/history/ExerciseRow.jsx`,
    `frontend/src/components/history/WorkoutDetail.jsx` (new)
  - Implementation:
    - `ExerciseRow` props `{ exercise }`: one row of the exercise table — name,
      sets, reps, weight (`formatKg(n)` → `"60 kg"`; `0`/`undefined` →
      "Bodyweight"), and derived volume via `workoutVolume`-style math when
      weight exists (e.g. `4 × 8 = 1,920 kg`). Long names truncate.
    - `WorkoutDetail` props `{ workout }`: `dash-card` header with name,
      `CategoryBadge`, full formatted date, optional `notes`; body is a
      responsive table/list of `ExerciseRow`s; headline metric with total
      workout volume `formatVolume(workoutVolume(workout))` when total > 0;
      when `workout.exercises.length === 0` → `EmptyState` ("No exercises in
      this workout"). Renders the passed `workout` only (lookup happens in the
      page).
  - Acceptance: header + exercises render with sets/reps/weight/volume;
    bodyweight shows "Bodyweight"; no-exercises workout shows its empty state;
    volume headlines correct.
  - Depends: T003, T006.
  - [US3]

- [ ] T011 [US3] Compose the Workout Detail page (id lookup + not-found).
  - Files: `frontend/src/pages/WorkoutDetail.jsx` (complete)
  - Implementation: `useParams()` for `id`; `let match = findWorkout(workouts,
    id)`. Loading branch renders `Spinner` (mock gate); on load, `match` truthy
    → `<WorkoutDetail workout={match} />` plus a "Back to history" `Link` to
    `/workouts-history` (FR-010); `match` falsy → `EmptyState` "Workout not
    found" with a back-to-history link (FR-009). Never crashes on unknown id.
  - Acceptance: valid id renders detail + back link; unknown id renders
    "Workout not found" with back link; back link returns to `/workouts-history`.
  - Depends: T010, T003, T005.
  - [US3]

### Phase 4 — Exercise History Page

- [ ] T012 [US4] Implement per-exercise progression.
  - Files: `frontend/src/components/history/ExerciseHistory.jsx`,
    wire into `pages/ExerciseHistory.jsx`
  - Implementation: props `{ workouts }`. Derive a unique sorted list of
    exercise names from all workouts (exercise library is NOT introduced — names
    are collected from workout data only). For each exercise render a `dash-card`
    with name and a newest-first list of `ExerciseRow`s across all workouts
    containing it (progression over time). No workouts/names → `EmptyState`
    ("No exercise history yet").
  - Acceptance: each exercise shows its full progression (sets/reps/weight over
    time); bodyweight handling per `ExerciseRow`; per-card empty state when
    there are no workouts.
  - Depends: T010, T003.
  - [US4]

- [ ] T013 [US4] Implement the `PersonalRecords` panel.
  - Files: `frontend/src/components/history/PersonalRecords.jsx`; wire into
    `pages/ExerciseHistory.jsx`
  - Implementation: props `{ exerciseName, workouts }`. Iterates `PR_FIELDS`:
    `bestLift` → "Best Lift" (`bestLift(exerciseName, workouts)` + `kg`),
    `bestSet` → "Best Set" (the exercise volume of the winning set + `kg`),
    `bestVolumeKg` → best single-workout volume for that exercise (sum over that
    workout's records of that exercise). All derived via T003 functions each
    render (H7). When the exercise has no weighted history → `null` values, then
    render `EmptyState` "No personal records yet" — NEVER `0 kg`/`NaN`.
    Responsive grid/summary row of the three derived values when present.
  - Acceptance: derived PRs match hand-checked math for the bench press mock;
    bodyweight-only exercise shows "No personal records yet"; never renders
    zero/invalid numbers.
  - Depends: T010, T003, T001.
  - [US4]

- [ ] T014 [US4] Compose the Exercise History page.
  - Files: `frontend/src/pages/ExerciseHistory.jsx` (complete)
  - Implementation: mock async gate (T015 pattern); when loaded, per-exercise
    section = `<PersonalRecords exerciseName={name} workouts={workouts} />` +
    `<ExerciseHistory workouts={workouts} selection={name} />` layout (grid:
    PR panel alongside each exercise's progression card). Empty source →
    `EmptyState` "No exercise history yet".
  - Acceptance: each exercise gets a PR panel + progression; empty state on no
    workouts; derived PRs update if the (mock) workouts change — no stored PRs.
  - Depends: T012, T013, T003.
  - [US4]

### Phase 5 — Cross-Cutting (Empty/Loading/Error, Responsive, Polish)

- [ ] T015 [FR-014] Ensure every section has empty, loading, and error behaviour.
  - Files: `pages/WorkoutHistory.jsx`, `pages/WorkoutDetail.jsx`,
    `pages/ExerciseHistory.jsx`, all `components/history/*.jsx` (audit empty
    branches)
  - Implementation: each page holds `{ loading, error, data }` via `useState` +
    `useEffect` mock timer (~400-500ms) then loads mock data; loading renders
    `<Spinner>` (or card `Skeleton`); error renders a friendly message (never a
    stack trace); otherwise sections render, each already handling empty via
    `EmptyState`. Forcing empty uses `emptyWorkouts` (import swap) so all empty
    states can be verified. Any section missing an empty/loading/error branch
    gets one.
  - Acceptance: forcing empty shows designed empty states everywhere; loading
    shows spinner/skeleton; error shows friendly message; none render
    blank/broken/`NaN`; the five distinct empty states (no workouts, no filter
    matches, not-found, no exercise history, no personal records) all render.
  - Depends: T009, T011, T014.
  - [FR-014]

- [ ] T016 [FR-015] Responsive adjustments at all breakpoints.
  - Files: `pages/*.jsx` and `components/history/*.jsx` (grid/tailwind
    adjustments only), `frontend/src/index.css` (additive utilities ONLY if
    needed)
  - Implementation: encode the spec layouts with responsive grids — history
    list `sm:grid-cols-2 xl:grid-cols-3`; filters row wraps to stacked on small
    screens; detail exercise list becomes a readable stacked layout <640; PR
    panel stacks under progression on mobile. Confirm no horizontal scroll at
    1024+, 640-1024, <640.
  - Acceptance: at each width layouts reflow with zero horizontal scroll and all
    controls reachable.
  - Depends: T009, T011, T014.
  - [FR-015]

- [ ] T017 Final Polish: consistency, build, regression, PHR.
  - Files: audit all Day 3.1 + touched Day 1.1/2.1 files
  - Implementation: reconcile spacing/radius/type with the dark tokens; truncate
    long names; remove dead imports; verify no `.ts`/`.tsx`; run `npm run build`
    in `frontend/` (frontend has no lint/test script — `typecheck`/`build` = vite
    build is the smoke gate); verify `/` (Day 1.1), `/progress` + `/goals`
    (Day 2.1), `/workouts`, `/workouts/new`, `/workouts/:id/edit`, `/nutrition`,
    `/login`, `/profile` regression; verify the three new pages, filters, PRs,
    empty/loading/error, responsive at 3 breakpoints; record manual verification;
    create the green plan→tasks handoff note.
  - Acceptance: build clean; no `.ts`/`.tsx`; Day 1.1 `/` and Day 2.1 pages
    unchanged; manual browser verification recorded (DoD item 10).
  - Depends: T015, T016.

## 3. File Creation Order

Create/update files in this dependency-safe sequence:

1. `frontend/src/data/constants.js` (append — T001)
2. `frontend/src/data/workoutHistoryData.js` (new — T002)
3. `frontend/src/utils/historyUtils.js` (new — T003)
4. `frontend/src/pages/WorkoutHistory.jsx` (new scaffold — T004)
5. `frontend/src/pages/WorkoutDetail.jsx` (new scaffold — T004)
6. `frontend/src/pages/ExerciseHistory.jsx` (new scaffold — T004)
7. `frontend/src/App.jsx` (edit routes — T005)
8. `frontend/src/components/layout/TopNavbar.jsx` (edit implementedTabs — T005)
9. `frontend/src/components/layout/Sidebar.jsx` (edit menuIcons — T005)
10. `frontend/src/components/history/CategoryBadge.jsx` (new — T006)
11. `frontend/src/components/history/WorkoutCard.jsx` (new — T006)
12. `frontend/src/components/history/WorkoutHistoryList.jsx` (new — T007)
13. `frontend/src/components/history/HistoryFilters.jsx` (new — T008)
14. `frontend/src/pages/WorkoutHistory.jsx` (wire T007-T009)
15. `frontend/src/components/history/ExerciseRow.jsx` (new — T010)
16. `frontend/src/components/history/WorkoutDetail.jsx` (new — T010)
17. `frontend/src/pages/WorkoutDetail.jsx` (wire T011)
18. `frontend/src/components/history/ExerciseHistory.jsx` (new — T012)
19. `frontend/src/components/history/PersonalRecords.jsx` (new — T013)
20. `frontend/src/pages/ExerciseHistory.jsx` (wire T014)

(21. `frontend/src/index.css` additive utilities ONLY if needed by T016.)

## 4. State Management Plan

- **Data source of truth**: mock module `frontend/src/data/workoutHistoryData.js`
  (`workouts` / `emptyWorkouts`), imported by the pages; components never
  re-create data.
- **Per-page state slices** (`useState`):
  - `WorkoutHistory.jsx`: `workouts` (init `workouts` mock), `category`,
    `dateOption`, `from`, `to` (filter state shared between `HistoryFilters`
    and the list — lives here, passed as props), plus `loading`/`error` for the
    mock async gate.
  - `WorkoutDetail.jsx`: `id` from `useParams()`, `loading`/`error`, and the
    resolved workout (or `undefined` for the not-found branch).
  - `ExerciseHistory.jsx`: `workouts` + `loading`/`error`; derived exercise +
    PR data computed per render from props (H7 — never stored).
- **Prop flow**: pages pass data + minimal handlers to section components. No
  global store, no Context required (H8 — lift only if two components share the
  slice not cleanly able to be lifted; none do: the filter state is already in
  the page).
- **Derivation**: `filterWorkouts`, `groupByDate`, `findWorkout`, `bestLift`,
  `bestSet`, `bestVolume`, `workoutVolume`, `formatVolume` live ONLY in
  `utils/historyUtils.js` as pure functions; components render + format results
  (H6, H7).
- **Empty-state handling**: `emptyWorkouts` forces "no data"; every section
  checks its input and renders the shared `EmptyState`. Loading renders
  `Spinner`/`Skeleton`; error renders a friendly message. The page must
  distinguish "source empty" from "filtered empty" and render the correct
  `EmptyState` for each.

## 5. Testing & Verification Plan

- **Visual checks against the dark theme**: load `/workouts-history`,
  `/workouts/:id`, `/exercises`; compare card surface, border/radius, `dash-num`
  numerals, lime accent, `CategoryBadge` colors, spacing, and typography with
  `/`, `/progress`, `/goals`. Record any drift and fix before Done.
- **Filter behaviour**: apply category only, date quick range only (This Week /
  This Month / Last 3 Months), a custom from/to range, and both together —
  assert the list updates to correct AND-composed, newest-first, non-mutated
  results; "Clear filters" restores the full list; a combo matching nothing
  shows the distinct "No workouts match your filters" state with clear-filters
  action.
- **Detail view**: open a card → detail shows header, badge, date, notes,
  exercises with sets/reps/weight (Bodyweight for `0`) and derived volume; "Back
  to history" returns to `/workouts-history`; an unknown id (e.g.
  `/workouts/nope`) shows "Workout not found" with a back link and never
  crashes; a no-exercises workout shows its empty state.
- **PR / derivation logic**: hand-check `bestLift`, `bestSet`, `bestVolume`
  against the mock set (e.g. bench press progression); a bodyweight-only
  exercise shows "No personal records yet"; exercises without weighted history
  never render `0 kg`/`NaN`.
- **Empty-state checks**: swap to `emptyWorkouts` and confirm every section
  shows a designed empty state and nothing renders blank/broken/`NaN`; loading
  shows spinner/skeleton; error shows a friendly message; the five distinct
  empty states are each reachable.
- **Responsive checks**: at 1024+, 640-1024, <640 confirm card grids, filter
  row, detail layout, and PR panel reflow with zero horizontal scroll; sidebar
  toggle still works.
- **Build/quality**: `npm run build` (vite build) in `frontend/` succeeds; grep
  confirms no `.ts`/`.tsx` introduced; no dead imports; no new runtime
  dependency.
- **Regression**: `/` (Day 1.1) and `/progress` + `/goals` (Day 2.1) unchanged;
  `/workouts`, `/workouts/new`, `/workouts/:id/edit`, `/nutrition`, `/login`,
  `/profile` still load — route ranking keeps auth-phase workout routes intact;
  nav active states correct; `bmi` still inert.

## 6. Definition of Done

Day 3.1 is complete only when ALL hold:

- [ ] `/workouts-history` renders inside the existing dark `DashboardLayout`
      shell, complete history as improved `WorkoutCard`s newest-first, with
      working category + date filters that compose.
- [ ] `/workouts/:id` renders the detail view (name, `CategoryBadge`, date,
      notes, exercises with sets/reps/weight, derived volume); unknown id shows
      "Workout not found" with a back link; no exercises shows its own empty
      state.
- [ ] `/exercises` renders per-exercise progression across workouts and a
      `PersonalRecords` panel (best lift, best set) derived via pure functions.
- [ ] Category + date filtering returns correctly ordered, non-mutated results
      and shows the distinct "No workouts match your filters" state with a
      clear-filters action.
- [ ] Every section has designed empty, loading, and error states — none render
      blank/broken/`NaN` (H4).
- [ ] Design matches the existing dark dashboard: same tokens, cards, badges,
      accent, type; fully responsive with no horizontal scroll at any breakpoint.
- [ ] All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime
      dependency; no backend, API, env, or model changes.
- [ ] `npm run build` (vite build) succeeds cleanly.
- [ ] Manual browser verification is recorded (all three pages, filters, PRs,
      empty/loading/error exercised, responsive at 3 breakpoints, Day 1.1 +
      Day 2.1 regression check).
- [ ] Navigation: History entry navigates correctly; `bmi` remains inert; no
      existing nav entry removed or repurposed (H10); auth-phase `/workouts*`
      routes unchanged.

## 7. Out of Scope Reminder

MUST NOT be built in Day 3.1:

- Backend, API, controller, service, model, or database changes of any kind;
  server-side filtering or statistics; calling existing `services/` API code.
- Authentication, registration, or login changes; protecting the new pages
  behind additional auth beyond the existing shell (they render like Day 1.1 `/`
  and Day 2.1 `/progress`/`/goals`).
- TypeScript adoption or conversion (`.js`/`.jsx` only); `tsconfig` changes
  governing the frontend.
- Real persistence, storage, sync, import/export, or device integrations.
- Editing/deleting workouts from these pages, or creating new workouts here
  (the existing auth-phase `/workouts*` CRUD is separate and untouched).
- Exercise library/catalog with muscle groups, supersets, rest timers, or
  dedicated per-exercise REST endpoints.
- Advanced analytics: one-rep-max estimation beyond recorded lifts, trend
  forecasting, form/technique analysis.
- Notifications, reminders, push, email, social sharing, leaderboards.
- New runtime dependencies (charting, date, or state libraries).
- Automated test suite and CI (optional build/lint smoke only).
- Deployment or production hosting.

These MUST NOT be silently added; open a new spec if one is required.

## 8. Constitution Check

*GATE: Passes before Phase 0 research; re-checked after Phase 1 design.*

| Gate | Result | Evidence |
|------|--------|----------|
| H1 Frontend-only, mock data | PASS | All sections consume `data/workoutHistoryData.js`; zero backend/API/env/auth tasks (T001-T017); `services/` untouched |
| H2 JavaScript-only | PASS | Every created/edited file is `.js`/`.jsx`; no `.ts`/`.tsx`, no `@ts-check` (T017 greps) |
| H3 Reuse shell + primitives | PASS | `DashboardLayout`, `ui/` primitives (`Card`, `Badge`, `EmptyState`, `Spinner`, `Select`, `Input`), dark tokens reused; `CategoryBadge` wraps `ui/Badge` (T006) |
| H4 Empty/loading/error everywhere | PASS | T015 mandates `EmptyState`/`Spinner`/friendly-error on every section via `emptyWorkouts`; five distinct empty states enumerated |
| H5 No new runtime deps | PASS | No library added anywhere in T001-T017 |
| H6 Filtering pure + derivable | PASS | `filterWorkouts`/`groupByDate` live only in `utils/historyUtils.js`; components render results (T003) |
| H7 PRs derived, never stored | PASS | `bestLift`/`bestSet`/`bestVolume`/`workoutVolume` pure in T003, called each render (T013); "No personal records yet" instead of `0`/`NaN` |
| H8 Local state only | PASS | Page-level `useState`; props-driven sections; no store, no Context (T009/T011/T014) |
| H9 Fully responsive | PASS | T016 encodes spec grids for all breakpoints; zero horizontal scroll |
| H10 Nav additive + non-destructive | PASS | T005 adds `history` only; `bmi` stays inert; existing nav entries/routes untouched; auth-phase `/workouts*` intact (route ranking) |
| Routing stays standalone | PASS | `/workouts-history`, `/workouts/:id`, `/exercises` mirror Day 1.1 `/` wiring; auth routes untouched |
| Additive-only to Day 1.1/2.1 files | PASS | Only `App.jsx`, `constants.js`, `TopNavbar.jsx`, `Sidebar.jsx`, `index.css` (optional) touched, all additive/surgical |

Result: **No violations** — nothing requires Complexity Tracking justification.

## 9. Complexity Tracking

> Fill only if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |