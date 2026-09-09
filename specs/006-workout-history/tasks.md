---
description: "Task list for the Day 3.1 Activities & Workout History feature"

---

# Tasks: Activities & Workout History (Day 3.1)

**Input**: Design documents from `/specs/006-workout-history/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated test suite is in scope for Day 3.1 (per spec Out of Scope —
build/lint smoke check only). Verification is via manual browser checks in the
Polish/Verification phases.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story. All work is in `frontend/` and is
JavaScript-only (`.js`/`.jsx`, no TypeScript). The Day 1.1 dark dashboard and
Day 2.1 Progress & Goals pages are complete and are reused as-is (only additive
wiring). Execution order starts with page structure + improved workout cards
(US1), then filtering (US2), then the detail view (US3), then exercise history +
personal records (US4), then empty/loading/error + responsive + final
verification.

## Format: `- [ ] [ID] [P?] [Story] Title — primary file`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US4, from spec.md)
- Include exact file paths in descriptions; every task lists Size (S/M/L),
  Depends, Files, and Acceptance criteria.

---

## Phase 1: Setup — Constants, Data & Utils Foundation

**Purpose**: Shared inputs every section needs: display constants, the mock
workout dataset (with an empty variant), and the pure derivation utilities.

Note: T001 then T002/T003 all `[P]` against each other (different files).

- [X] T001 Add Day 3.1 constants to `frontend/src/data/constants.js` (append
  only — do NOT remove/rename existing exports `QUICK_LOG_ITEMS`,
  `SIDEBAR_MENU`, `NAV_TABS`, `MACRO_COLORS`, `WEEK_DAYS`, `MEASUREMENT_FIELDS`,
  `GOAL_CATEGORIES`, `STREAK_TYPES`):
  `WORKOUT_CATEGORIES` = `[{ key: 'strength', label: 'Strength' }, { key:
  'cardio', label: 'Cardio' }, { key: 'flexibility', label: 'Flexibility' }, {
  key: 'hybrid', label: 'Hybrid' }, { key: 'other', label: 'Other' }]`;
  `PR_FIELDS` = `[{ key: 'bestLiftKg', label: 'Best Lift', unit: 'kg' }, {
  key: 'bestSet', label: 'Best Set', unit: 'kg' }, { key: 'bestVolumeKg',
  label: 'Best Volume', unit: 'kg' }]`;
  `DATE_FILTER_OPTIONS` = `[{ key: 'all', label: 'All' }, { key: 'week',
  label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'last3',
  label: 'Last 3 Months' }, { key: 'custom', label: 'Custom Range' }]`
  - **Size**: S
  - **Files**: `frontend/src/data/constants.js`
  - **Depends**: —
  - **Accept**: the three new named exports exist with the exact keys/labels
    above; all prior exports unchanged; file stays `.js`.

- [X] T002 [P] Create `frontend/src/data/workoutHistoryData.js`: export
  `workouts` (array of `{ id, name, category, date: "YYYY-MM-DD", notes,
  exercises: [{ id, name, sets, reps, weightKg }] }`) and `emptyWorkouts`
  (`[]`). Filled data MUST satisfy all of:
  - dates span ≥3 distinct values between 2026-06 and 2026-09-08 so "This
    Week" (2026-09-07/08), "This Month" (Sept), and "Last 3 Months" each give
    a non-empty distinct slice;
  - at least one workout per category across the set;
  - one exercise repeating across ≥3 workouts with increasing `weightKg` (e.g.
    "Bench Press") for visible PRs/progression;
  - one bodyweight exercise (`weightKg: 0` or omitted);
  - ONE workout with `exercises: []`;
  - at least one exercise with only bodyweight history (for the "No personal
    records yet" state).
  - **Size**: M
  - **Files**: `frontend/src/data/workoutHistoryData.js`
  - **Depends**: T001 (category keys)
  - **Accept**: exports exist; shapes valid (dates `YYYY-MM-DD`, categories in
    `WORKOUT_CATEGORIES`); all six coverage bullets hold; no `.ts`.

- [X] T003 [P] Create `frontend/src/utils/historyUtils.js` (new `utils/`
  entry); all functions pure, no date library, no mutation of inputs:
  - `filterWorkouts(workouts, { category = 'all', from, to })` → NEW array;
    category match (or no category when `'all'`) AND inclusive `YYYY-MM-DD`
    string bounds (`w.date >= from`, `w.date <= to`; absent bound = unbounded);
    sorted newest-first by `date`;
  - `groupByDate(workouts)` → `[{ date, workouts: [...] }]` newest-first with
    input order preserved within a date;
  - `findWorkout(workouts, id)` → workout or `undefined`;
  - `bestLift(exerciseName, workouts)` → max `weightKg` for that exercise
    ignoring `0`/`undefined`; `bestSet(exerciseName, workouts)` → highest
    `sets × reps × weightKg` set volume; `bestVolume(workouts)` → max
    `Σ exercises (sets × reps × weightKg)` across workouts; `workoutVolume
    (workout)` → that sum for one workout (bodyweight contributes 0);
  - `formatVolume(n)` → thousands-separated integer + ` kg` (e.g. `1,440 kg`),
    `0` → `0 kg`;
  - PR functions return `null` when no weighted record exists.
  - **Size**: M
  - **Files**: `frontend/src/utils/historyUtils.js`
  - **Depends**: T002
  - **Accept**: filtering returns correct AND-composed, newest-first, non-mutated
    results for the T002 mock set; absent bounds unbounded; `bestLift`/`bestSet`
    return `null` for bodyweight-only exercises; volumes match hand-checked
    math; input arrays unchanged.

**Checkpoint**: Foundation ready — constants, filled+empty mock data, and pure
filtering/PR/volume utilities exist.

---

## Phase 2: Foundational — Pages, Routing & Navigation

**Purpose**: The three standalone pages, their routes, and the nav entry that
make History reachable. Blocks ALL user stories.

- [X] T004 [P] Create the three page scaffolds, each `export default function`
  rendering `DashboardLayout` (import from
  `frontend/src/components/layout/DashboardLayout`) with a page heading: current
  date + `dash-num` title (reuse the Day 2.1 `Progress.jsx` `PageHeading`
  pattern) — "Workout History", "Workout Detail", "Exercise History";
  empty composition areas; no data logic yet:
  - `frontend/src/pages/WorkoutHistory.jsx`
  - `frontend/src/pages/WorkoutDetail.jsx`
  - `frontend/src/pages/ExerciseHistory.jsx`
  - **Size**: S
  - **Files**: the three files above (new)
  - **Depends**: —
  - **Accept**: once routed (T005), each page renders its heading inside the
    dark shell without crashing.

- [X] T005 [P] Wire routes + navigation (surgical edits):
  - `frontend/src/App.jsx`: import `WorkoutHistory`, `WorkoutDetail`,
    `ExerciseHistory`; add top-level routes beside `/`, `/progress`, `/goals`,
    each wrapped exactly like `/progress` (`<ProtectedRoute>`), do not touch any
    existing route:
    - `<Route path="/workouts-history" element={<ProtectedRoute><WorkoutHistory
      /></ProtectedRoute>} />`
    - `<Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetail
      /></ProtectedRoute>} />`
    - `<Route path="/exercises" element={<ProtectedRoute><ExerciseHistory
      /></ProtectedRoute>} />`
  - `frontend/src/data/constants.js`: append `{ key: 'history', label:
    'History', path: '/workouts-history' }` to `NAV_TABS` (after `goals`, before
    `bmi`) and to `SIDEBAR_MENU`; leave `bmi` untouched.
  - `frontend/src/components/layout/TopNavbar.jsx`: add `'history'` to the
    `implementedTabs` Set so the new tab renders as a real `NavLink`; `bmi`
    stays an inert `<span>` placeholder.
  - `frontend/src/components/layout/Sidebar.jsx`: add `history: History` to the
    `menuIcons` map (import `History` from `lucide-react`; fall back to
    `Dumbbell` if missing); existing items unchanged.
  - **Size**: S
  - **Files**: `frontend/src/App.jsx`, `frontend/src/data/constants.js`,
    `frontend/src/components/layout/TopNavbar.jsx`,
    `frontend/src/components/layout/Sidebar.jsx`
  - **Depends**: T004
  - **Accept**: `/workouts-history`, `/workouts/:id`, `/exercises` load their
    pages; nav tab + sidebar item navigate with active state; `/workouts`,
    `/workouts/new`, `/workouts/:id/edit` still work (static `new`/`edit` win
    over `:id` by route ranking); `/`, `/progress`, `/goals`, `/login`,
    `/profile`, `/nutrition` still load; `bmi` inert.

**Checkpoint**: Foundation ready — all three pages reachable from nav inside the
dark shell; Day 1.1 + Day 2.1 routes still work.

---

## Phase 3: User Story 1 - View the Complete Workout History (Priority: P1) 🎯 MVP

**Goal**: The Workout History page shows the full workout history as improved
workout cards, newest-first, grouped by date, inside the dashboard shell.

**Independent Test**: Load `/workouts-history`; confirm every recorded workout
renders newest-first as a card showing name, `CategoryBadge`, date, and a
summary (exercises · sets · volume), plus the "No workouts recorded yet" empty
state when history is empty.

- [X] T006 [US1] Create `frontend/src/components/history/CategoryBadge.jsx` +
  `frontend/src/components/history/WorkoutCard.jsx` (new `history/` folder):
  - `CategoryBadge` props `{ category, className = '' }`: maps a category key
    from `WORKOUT_CATEGORIES` to the shared `ui/Badge` color — `strength`/
    `hybrid` → primary (accent), `cardio` → success, `flexibility` → warning,
    `other` → neutral; never invent color meanings beyond
    success/accent/warning/muted; reuses `ui/Badge` (no forked markup).
  - `WorkoutCard` props `{ workout }`: builds on `dash-card`; renders name
    (`truncate`, prominent), `<CategoryBadge category={workout.category} />`,
    `date`, and a summary line e.g. `"8 exercises · 32 sets"` plus
    `formatVolume(workoutVolume(workout))` as a `dash-num` headline; the whole
    card is a `Link` to `/workouts/${workout.id}` (import `Link` from
    `react-router-dom`); keyboard-focusable with a visible focus-visible ring
    using the accent color.
  - **Size**: M
  - **Files**: `frontend/src/components/history/CategoryBadge.jsx`,
    `frontend/src/components/history/WorkoutCard.jsx`
  - **Depends**: T001, T003 (and `WorkoutCard` links into the T005 route)
  - **Accept**: card shows name, badge, date, count + sets + volume; links to
    the detail route; focus ring visible on Tab; long names truncate; numbers
    use `dash-num`.

- [X] T007 [US1] Create `frontend/src/components/history/WorkoutHistoryList.jsx`:
  props `{ workouts }`; group via `groupByDate` and render a date heading per
  group (e.g. "Sep 8, 2026") with a responsive grid
  (`grid gap-6 sm:grid-cols-2 xl:grid-cols-3`) of `<WorkoutCard />`s beneath; a
  "N workouts" count renders above the grid so filtering is observable;
  `workouts.length === 0` → shared `EmptyState` ("No workouts recorded yet",
  import from `frontend/src/components/ui`).
  - **Size**: M
  - **Files**: `frontend/src/components/history/WorkoutHistoryList.jsx`
  - **Depends**: T006
  - **Accept**: cards render newest-first, grouped by date; count visible; empty
    state when input `[]`; reflows at breakpoints.

- [X] T008 [US1] Wire US1 into `frontend/src/pages/WorkoutHistory.jsx`: import
  `workouts` from `frontend/src/data/workoutHistoryData`; render the page heading
  + `<WorkoutHistoryList workouts={workouts} />` (no filters yet — showing ALL
  newest-first is the default state).
  - **Size**: S
  - **Files**: `frontend/src/pages/WorkoutHistory.jsx`
  - **Depends**: T007, T005
  - **Accept**: `/workouts-history` shows the full history newest-first as
    linked cards.

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Filter the Workout History (Priority: P1)

**Goal**: Category and/or date filters narrow the history and compose (AND),
with a distinct clear-filters "no matches" empty state.

**Independent Test**: Load `/workouts-history`; apply a category filter, then a
date filter (quick range and a custom from/to), then both together — the list
updates each time; a combo matching nothing shows "No workouts match your
filters" + clear-filters action; clearing restores the full list.

- [X] T009 [US2] Create `frontend/src/components/history/HistoryFilters.jsx`:
  props `{ category, onCategory, dateOption, onDateOption, from, to, onFrom,
  onTo, onClear }`; controlled row of real controls using `ui/Select` +
  `ui/Input`:
  - category `Select`: "All categories" + the five `WORKOUT_CATEGORIES` labels;
  - date range `Select` over `DATE_FILTER_OPTIONS` quick ranges;
  - when `dateOption === 'custom'`, reveal two `Input type="date"` fields
    (`from`, `to`);
  - a "Clear filters" `Button` shown only when any filter is active;
  - wire label `htmlFor`/`id` for accessibility.
  - **Size**: M
  - **Files**: `frontend/src/components/history/HistoryFilters.jsx`
  - **Depends**: T001
  - **Accept**: each control is a real select/input with label; custom range
    inputs appear only when `custom` selected; clear shows only when a filter is
    active.
  - [P] with T006/T007 (different files — may build ahead).

- [X] T010 [US2] Wire filters into `frontend/src/pages/WorkoutHistory.jsx`
  (complete the page): hold `useState` slices `{ category, dateOption, from,
  to }` + `workouts` (init from `workoutHistoryData`); in render, resolve the
  quick-range `from`/`to` for `dateOption` keys `week`/`month`/`last3`
  (today-relative, `YYYY-MM-DD`; implement as a small local helper — only the
  resolved bounds are passed) then
  `const filtered = filterWorkouts(workouts, { category, from, to })` (import
  from `frontend/src/utils/historyUtils`); render `<HistoryFilters />` + list:
  - source empty → "No workouts recorded yet";
  - source non-empty, `filtered` empty → DISTINCT "No workouts match your
    filters" `EmptyState` with a clear-filters action (calls `onClear`);
  - otherwise `<WorkoutHistoryList workouts={filtered} />`;
  - never mutate the source array.
  - **Size**: M
  - **Files**: `frontend/src/pages/WorkoutHistory.jsx`
  - **Depends**: T007, T008, T009, T003
  - **Accept**: default shows ALL newest-first; category alone, date alone, and
    both together update via `filterWorkouts`; clearing restores full list; both
    empty states reachable and distinct; source array untouched.

**Checkpoint**: User Stories 1 AND 2 work independently.

---

## Phase 5: User Story 3 - View a Single Workout's Detail (Priority: P2)

**Goal**: From any workout card the user opens a dedicated detail view with full
exercise breakdown (sets/reps/weight/volume), a back path, and a graceful
not-found state.

**Independent Test**: Load `/workouts-history`, click a card → detail shows the
workout header and each exercise with sets/reps/weight (Bodyweight) + volume;
the back link returns to history; an unknown id (e.g. `/workouts/nope`) shows
"Workout not found" with a back link and never crashes.

- [X] T011 [US3] Create `frontend/src/components/history/ExerciseRow.jsx` +
  `frontend/src/components/history/WorkoutDetail.jsx`:
  - `ExerciseRow` props `{ exercise }`: name (truncate), sets, reps, weight
    (`"60 kg"`, or "Bodyweight" for `0`/`undefined`), and derived volume
    (`sets × reps × weightKg` → `formatVolume`) when weight exists;
  - `WorkoutDetail` props `{ workout }`: `dash-card` header with name,
    `<CategoryBadge />`, full formatted date, optional `notes`; body is a
    responsive table/list of `<ExerciseRow />`s; headline metric total volume
    `formatVolume(workoutVolume(workout))` when > 0; `workout.exercises.length
    === 0` → `EmptyState` ("No exercises in this workout").
  - **Size**: M
  - **Files**: `frontend/src/components/history/ExerciseRow.jsx`,
    `frontend/src/components/history/WorkoutDetail.jsx`
  - **Depends**: T003, T006
  - **Accept**: header + exercises render with sets/reps/weight/volume;
    bodyweight shows "Bodyweight"; no-exercises workout shows its empty state;
    volume headlines correct.

- [X] T012 [US3] Complete `frontend/src/pages/WorkoutDetail.jsx`: `useParams()`
  for `id`; `const match = findWorkout(workouts, id)` (import from
  `frontend/src/utils/historyUtils`); loading renders a mock-async `Spinner`
  (as in T015 pattern, ~400-500ms); on load, `match` truthy →
  `<WorkoutDetail workout={match} />` plus a "Back to history" `Link` to
  `/workouts-history`; `match` falsy → `EmptyState` ("Workout not found") with a
  back-to-history link; never crashes on unknown id.
  - **Size**: S
  - **Files**: `frontend/src/pages/WorkoutDetail.jsx`
  - **Depends**: T011, T003, T005
  - **Accept**: valid id renders detail + back link; unknown id renders
    not-found with back link; back returns to `/workouts-history`.

**Checkpoint**: User Story 3 (Detail) fully functional.

---

## Phase 6: User Story 4 - Browse Exercise History and Personal Records (Priority: P3)

**Goal**: The Exercise History page shows, per exercise, its progression across
workouts (sets/reps/weight over time) plus derived best-performance records —
never entered by the user.

**Independent Test**: Load `/exercises`; confirm each exercise lists its
progression across workouts; the bench press shows a personal-records panel with
best lift + best set matching the workout data; a bodyweight-only exercise shows
"No personal records yet"; no workouts → "No exercise history yet".

- [X] T013 [US4] Create `frontend/src/components/history/ExerciseHistory.jsx`:
  props `{ workouts }`; derive the unique sorted list of exercise names from all
  workouts (exercise library is NOT introduced — names come from workout data
  only); for each exercise render a `dash-card` with its name and a newest-first
  list of `<ExerciseRow />`s across all workouts containing it (progression over
  time); no workouts → `EmptyState` ("No exercise history yet").
  - **Size**: M
  - **Files**: `frontend/src/components/history/ExerciseHistory.jsx`
  - **Depends**: T011, T003
  - **Accept**: each exercise shows its full progression (sets/reps/weight over
    time); bodyweight handled per `ExerciseRow`; empty state when no workouts.

- [X] T014 [US4] Create `frontend/src/components/history/PersonalRecords.jsx`:
  props `{ exerciseName, workouts }`; derive each record via T003 functions each
  render (H7 — never stored):
  - iterate `PR_FIELDS`: `bestLiftKg` → `bestLift(exerciseName, workouts)` +
    `kg`; `bestSet` → the winning set's volume (`bestSet(...)`) + `kg`;
    `bestVolumeKg` → best single-workout total for that exercise + `kg`;
  - when the exercise has no weighted history → `null` values → render
    `EmptyState` ("No personal records yet") — NEVER `0 kg`/`NaN`;
  - responsive grid/summary row of the values when present, `dash-num` numbers.
  - **Size**: M
  - **Files**: `frontend/src/components/history/PersonalRecords.jsx`
  - **Depends**: T010, T003, T001
  - **Accept**: derived PRs match hand-checked math for the bench-press mock;
    bodyweight-only exercise shows "No personal records yet"; never zero/invalid.

- [X] T015 [US4] Complete `frontend/src/pages/ExerciseHistory.jsx`: mock async
  gate (as in T015/T016 pattern ~400-500ms); when loaded, for each exercise name
  render a layout of `<PersonalRecords exerciseName={name} workouts={workouts} />`
  + the exercise's progression card from `<ExerciseHistory workouts={workouts}
  name={name} />` (grid: PR panel alongside each exercise's progression card);
  empty source → `EmptyState` ("No exercise history yet").
  - **Size**: S
  - **Files**: `frontend/src/pages/ExerciseHistory.jsx`
  - **Depends**: T013, T014, T003
  - **Accept**: each exercise gets a PR panel + progression; empty state on no
    workouts; derived PRs update if mock workouts change — no stored PRs.

**Checkpoint**: User Story 4 (Exercise History + Personal Records) fully
functional.

---

## Phase 7: Cross-Cutting — Empty/Loading/Error, Responsive, Day 3.1 Verification

**Purpose**: No blank/broken/NaN region anywhere (H4), responsive at all
breakpoints (H9), then the phase's DoD verification.

- [X] T016 Ensure every section has empty, loading, and error behaviour (H4):
  - `frontend/src/pages/WorkoutHistory.jsx`, `frontend/src/pages/WorkoutDetail.jsx`,
    `frontend/src/pages/ExerciseHistory.jsx`: add mock async gate — `useState`
    `{ loading, error }` + `useEffect` `setTimeout` (~400-500ms) then set data;
    loading renders `Spinner` (or card `Skeleton`); error renders a friendly
    `EmptyState` message (never a stack trace); data path unchanged.
  - Forcing empty uses `emptyWorkouts` (swap at import) so all empty states are
    verifiable; audit every `components/history/*.jsx` to confirm its empty
    branch renders.
  - **Size**: M
  - **Files**: the three pages + all `frontend/src/components/history/*.jsx`
  - **Depends**: T008, T012, T015
  - **Accept**: forcing empty shows designed empty states everywhere; loading
    shows spinner/skeleton; error shows friendly message; NOTHING renders
    blank/broken/`NaN`; the five distinct empty states (no workouts, no filter
    matches, not-found, no exercise history, no personal records) all render.

- [X] T017 Responsive adjustments at all breakpoints: encode the spec grids —
  history list `sm:grid-cols-2 xl:grid-cols-3`; filters row wraps to
  stacked on small screens; detail exercise list stacks cleanly <640; PR panel
  stacks under progression on mobile; confirm no horizontal scroll at 1024+ /
  640-1024 / <640; adjust ONLY additive Tailwind classes in the page/component
  files or additive utilities in `frontend/src/index.css`.
  - **Size**: S
  - **Files**: `frontend/src/pages/*.jsx`, `frontend/src/components/history/*.jsx`,
    `frontend/src/index.css` (only if needed)
  - **Depends**: T008, T012, T015
  - **Accept**: at each width layouts reflow with zero horizontal scroll and all
    controls reachable; sidebar drawer works at mobile.

- [X] T018 Final "Day 3.1 Verification": execute the full DoD check and record it:
  - visual consistency vs Day 1.1/2.1 tokens (`dash-card`, `dash-num`,
    `accent-text`, `--color-*`, lime accent, spacing, radius, type) on all three
    pages;
  - filters: category only / date quick (This Week, This Month, Last 3 Months) /
    custom from-to / both combined / clear / no-match empty state;
  - detail view: card → detail, back link, unknown id not-found, no-exercises
    empty state;
  - exercise history + PRs incl. bodyweight-only "No personal records yet";
  - empty/loading/error drill via `emptyWorkouts` swap;
  - responsive at 3 breakpoints with zero horizontal scroll;
  - regression: `/` (Day 1.1), `/progress` + `/goals` (Day 2.1), `/workouts`,
    `/workouts/new`, `/workouts/:id/edit`, `/nutrition`, `/login`, `/profile`
    all still load; `bmi` inert;
  - quality: run `npm run build` in `frontend/` (via `cmd /c "npm run build"` —
    PowerShell blocks `npm.ps1`); grep confirms no `.ts`/`.tsx` introduced; no
    dead imports; no new runtime dependency;
  - create the green IMPL PHR at `history/prompts/006-workout-history/`.
  - **Size**: M
  - **Files**: audit of all Day 3.1 + touched Day 1.1/2.1 files
  - **Depends**: T016, T017
  - **Accept**: build clean; no `.ts`/`.tsx`; Day 1.1 `/` and Day 2.1 pages
    unchanged; manual browser verification recorded (DoD item 10); IMPL PHR
    written.

**Final**: Day 3.1 complete — all 10 spec DoD items verified, build clean, no
TypeScript added.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001, then T002/T003 `[P]`.
- **Foundational (Phase 2)**: Depends on Phase 1; BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 (T006→T007→T008 sequential — shared
  `WorkoutHistory.jsx`).
- **US2 (Phase 4)**: Depends on US1 (same `WorkoutHistory.jsx`); T009 `[P]`
  with T006/T007.
- **US3 (Phase 5)**: Depends on US1 for card-entry navigation + Phase 2 routes;
  component T011 `[P]`-buildable, page T012 sequential.
- **US4 (Phase 6)**: Depends on T010 (ExerciseRow) + Phase 2 routes.
- **Empty/Loading/Error (Phase 7)**: Depends on T008/T012/T015.
- **Responsive (Phase 7)**: Depends on T016.
- **Verification (T018)**: Depends on all phases.

### User Story Dependencies

- **US1 (P1)**: after Phase 2 — no other-story dependency. 🎯 MVP.
- **US2 (P1)**: after US1 (same `WorkoutHistory.jsx`).
- **US3 (P2)**: after US1 (card links) + Phase 2; independent component files.
- **US4 (P3)**: after T010/T003 + Phase 2; independent page file
  (`ExerciseHistory.jsx`) — could proceed in parallel with US3.

### Within Each User Story

- Component first, then wiring into the page file.
- Component tasks marked `[P]` when they touch distinct files; page-wiring tasks
  run sequentially (shared page file).

### Parallel Opportunities

- T002/T003 (setup) after T001.
- T004/T005 (page scaffolds + routes/nav) after Phase 1.
- T006/T007/T009 (CategoryBadge, WorkoutCard, WorkoutHistoryList, HistoryFilters)
  are mutually `[P]`-compatible.
- T011 (ExerciseRow + detail component) `[P]`-buildable.
- US3 (Detail, different page file) and US4 (Exercise History, different page
  file) can proceed in parallel once US1 completes.

---

## Parallel Example: User Story 1 (History List)

```bash
Task: "Create CategoryBadge in frontend/src/components/history/CategoryBadge.jsx"
Task: "Create WorkoutCard in frontend/src/components/history/WorkoutCard.jsx"
Task: "Create WorkoutHistoryList in frontend/src/components/history/WorkoutHistoryList.jsx"
# then, sequentially:
Task: "Wire WorkoutHistoryList into frontend/src/pages/WorkoutHistory.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (constants + data + utils).
2. Complete Phase 2: Foundational (pages, routes, nav).
3. Complete Phase 3: User Story 1 (CategoryBadge + WorkoutCard + list wiring).
4. **STOP and VALIDATE**: `/workouts-history` shows the full history as improved
   workout cards, newest-first, grouped by date. This is the deliverable slice
   of Day 3.1.

### Incremental Delivery

1. Setup + Foundational → pages reachable from nav.
2. US1 history list + cards → verify `/workouts-history`.
3. US2 filters (category + date, combined, clear) → verify.
4. US3 detail view (incl. not-found) → verify.
5. US4 exercise history + personal records → verify `/exercises`.
6. Empty/loading/error everywhere → verify via `emptyWorkouts` swap.
7. Responsive + T018 Day 3.1 Verification + green IMPL PHR → Day 3.1 DONE.

### Parallel Team Strategy

- Team A: US1 → US2 (Workout History page) → US3 (Detail page).
- Team B: US4 (Exercise History page) after T010/T003 — parallel-safe with US3.
- Converge for Phase 7 (empty/loading/error, responsive, verification).

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to a specific user story for traceability.
- All files `.js`/`.jsx` only (no TypeScript).
- Mock data lives in `frontend/src/data/workoutHistoryData.js`; forcing the
  `emptyWorkouts` import drives empty-state verification.
- Filtering/PR/volume derivation happens ONLY in
  `frontend/src/utils/historyUtils.js` — never inline in components.
- No new runtime dependencies (no charting/date/state library).
- Build gate: `cmd /c "npm run build"` in `frontend/` (PowerShell blocks
  `npm.ps1`); `vite build` is the type/syntax smoke check.
- Commit after each task or logical group; stop at each checkpoint to verify.