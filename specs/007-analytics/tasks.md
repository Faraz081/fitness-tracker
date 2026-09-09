---
description: "Task list for the Day 4.1 Analytics Module feature"
---

# Tasks: Analytics Module (Day 4.1)

**Input**: Design documents from `/specs/007-analytics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated test suite is in scope for Day 4.1 (per spec Out of
Scope — build/lint smoke check only). Verification is via manual browser checks
in the Polish/Verification phase.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story. All work is in `frontend/` and is
JavaScript-only (`.js`/`.jsx`, no TypeScript). The Day 1.1 dark dashboard, Day
2.1 Progress & Goals, and Day 3.1 History pages are complete and reused as-is
(only additive wiring). Execution sequence follows the plan's approved order
(which encodes the requested build order: nav+layout → data → filters+summary →
frequency → weight → calories+macros → exercise performance → comparison →
polish); the MVP slice is User Stories 1-3 (all P1). Each story still sits in its
own phase with an independent test.

## Format: `- [ ] [ID] [P?] [Story] Title — primary file`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US7, from spec.md)
- Include exact file paths in descriptions; every task lists Size (S/M/L),
  Depends, Files, and Acceptance criteria.

---

## Phase 1: Setup — Constants, Mock Data & Pure Derivation Utils

**Purpose**: Shared inputs every section needs: the analytics constants, the
mock dataset (filled + EMPTY variant), and the pure aggregation utilities.

Note: T001, then T002/T003 `[P]` against each other (different files).

- [ ] T001 Add Day 4.1 constants to `frontend/src/data/constants.js` (append
  only — do NOT remove/rename any existing export). Add exactly four exports:
  - `ANALYTICS_PERIODS` = `[{ key: 'last30', label: 'Last 30 Days' }, { key:
    'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key:
    'last3', label: 'Last 3 Months' }, { key: 'last6', label: 'Last 6 Months' },
    { key: 'lastYear', label: 'Last Year' }, { key: 'custom', label: 'Custom
    Range' }]` (default preset key = `'last30'`);
  - `CHART_COLORS` = `{ accent: 'var(--color-accent)', secondary: '#60A5FA',
    muted: 'var(--color-ink-muted)', surplus: '#F87171' }`;
  - `MACRO_TYPES` = `[{ key: 'protein', label: 'Protein', color: '#A3E635' }, {
    key: 'carbs', label: 'Carbs', color: '#60A5FA' }, { key: 'fat', label:
    'Fat', color: '#F472B6' }]`;
  - `COMPARISON_PERIODS` = `[{ key: 'week', label: 'This Week vs Last Week' },
    { key: 'month', label: 'This Month vs Last Month' }]`.
  - **Size**: S
  - **Files**: `frontend/src/data/constants.js`
  - **Depends**: —
  - **Accept**: the four new named exports exist with the exact keys/labels
    above; all prior exports (`QUICK_LOG_ITEMS`, `SIDEBAR_MENU`, `NAV_TABS`,
    `MACRO_COLORS`, `WEEK_DAYS`, `MEASUREMENT_FIELDS`, `GOAL_CATEGORIES`,
    `STREAK_TYPES`, `WORKOUT_CATEGORIES`, `PR_FIELDS`, `DATE_FILTER_OPTIONS`)
    unchanged; file stays `.js`.

- [ ] T002 [P] Create `frontend/src/data/analyticsData.js` exporting
  `analyticsData` (object) and `emptyAnalyticsData` (object with all arrays
  `[]`, `goalWeightKg: null`, `insightPool` empty). Raw inputs only (no derived
  values — derivation lives in `analyticsUtils.js`):
  - `workouts`: `import { workouts } from './workoutHistoryData'` (Day 3.1
    array, UNCHANGED), then append ~9 additional mock workouts dated
    2025-09 … 2026-05 using the same `{ id, name, category, date, notes,
    exercises: [{ id, name, sets, reps, weightKg }] }` shape and
    `WORKOUT_CATEGORIES` keys, so Last 3/6 Months, Last Year, and a full 12-month
    window each resolve to a distinct non-empty slice; include `Bench Press`
    across ≥6 dated workouts with increasing `weightKg`, plus one
    bodyweight-only exercise (all records `weightKg: 0`/omitted — for the "No
    estimated 1RM yet" state). Keep the existing Sep 2026 workouts (This
    Week/This Month already have data).
  - `weightEntries`: `[{ id, date, weightKg }]` spanning 2025-09 → 2026-09
    (~14 points); include one date with TWO entries (duplicate-date rule);
  - `calorieDays`: `[{ date, consumed, burned, deficit }]` with `deficit =
    burned - consumed`; daily for the last 30 days + weekly samples for
    2025-12 … 2026-06; both deficit and surplus days present;
  - `macroDays`: `[{ date, protein, carbs, fat, calories }]` with the same date
    coverage as `calorieDays`;
  - `goalWeightKg: 75`; `insightPool` = candidate insight sentences keyed by
    factor (`consistency`, `calories`, `weight`).
  - **Size**: M
  - **Files**: `frontend/src/data/analyticsData.js`
  - **Depends**: T001 (period keys informational)
  - **Accept**: exports exist; shapes match the constitution "Data Shape
    Decisions"; the 9 Day 3.1 workouts appear unchanged; every preset
    (last30/week/month/last3/last6/lastYear) resolves to a non-empty distinct
    slice; `emptyAnalyticsData` truly empty; no `.ts`.

- [ ] T003 [P] Create `frontend/src/utils/analyticsUtils.js` (new `utils/`
  entry); all functions pure, no date library, no mutation; inclusive
  `YYYY-MM-DD` string bounds with absent = unbounded:
  - `resolveRange(periodKey, { from, to }, today = todayString())` → `{ from,
    to }` today-relative for presets (`last30` = last 29 days + today; `week` =
    from Monday; `month` = 1st of month; `last3`/`last6`/`lastYear` = N days);
    `custom` passes bounds through (missing bound stays `undefined`; `from > to`
    allowed — aggregators return empty);
  - `bucketForRange(from, to)` → `'day'` (≤ ~10 days), `'week'` (≤ ~120),
    else `'month'`;
  - `isoWeekLabel(date)` / `monthLabel(date)` pure label formatters;
  - `computeFrequency(workouts, { from, to })` → `[{ label, date, count }]`
    ascending by bucket (reused for the previous window);
  - `estimate1RM(weightKg, reps)` → `weightKg * (1 + reps / 30)` or `null`
    when `reps < 1` or `weightKg <= 0`;
  - `exerciseHistory(exerciseName, workouts, { from, to })` → ascending
    `[{ date, sets, reps, weightKg, volumeKg, estimated1RM }]` with `volumeKg =
    sets * reps * weightKg` (0 for bodyweight) and `estimated1RM` per `estimate1RM`;
  - `computeExerciseVolume(exerciseName, workouts, { from, to })` →
    `[{ label, volumeKg }]` bucket-aggregated;
  - `computeWeightTrend(entries, { from, to })` → `{ points: [{ date,
    weightKg }], changeKg, latest }` (dedupe by date → latest wins; ascending;
    `changeKg = last − first` or 0 when < 2 points; single point allowed);
  - `computeCalories(days, { from, to })` → `{ points: [{ date, consumed,
    burned, deficit }], avgConsumed, avgBurned, netDeficit }`;
  - `aggregateMacros(days, { from, to })` → `{ points: [{ date, protein,
    carbs, fat }], averages: { protein, carbs, fat }, calorieAvg }`;
  - `comparePeriods(current, previous)` → `[{ metric, label, current, previous,
    delta }]` for `workouts`, `volume`, `calories`, `weightChange`; `[]` when
    either side has no data;
  - `computeProgressScore(workouts, weightEntries, calorieDays, { from, to })`
    → `null` when < 7 days of data AND all inputs empty, else `{ score, factors:
    { consistency: 0-40, calories: 0-30, weight: 0-30 } }` (consistency =
    sessions-per-week clamped `0..4 / 4 * 40`; calories = `|deficit| <= 300`
    adherence fraction × 30; weight = progress toward goal clamped `0..1 * 30`);
  - `buildSummary(workouts, weightEntries, calorieDays, { from, to },
    goalWeightKg, insightPool)` → `{ progressScore, streakDays, totalWorkouts,
    avgCalories, weightChange, topInsight, factors }` (streak via
    `computeStreak` from `utils/streakUtils.js`) or `null` when insufficient;
  - `mostFrequentExercise(workouts, { from, to })` → name with most records in
    range, alphabetical tie-break;
  - formatters `formatKg` (1dp + `kg`), `formatCalories` (whole +
    thousands-separated + `kcal`), `formatPct` (whole + `%`), `formatDelta`.
  - **Size**: L
  - **Files**: `frontend/src/utils/analyticsUtils.js`
  - **Depends**: T002
  - **Accept**: range resolution correct vs fixed `today`; frequency groups
    hand-count; Epley hand-check (`75 × (1 + 8/30) = 95`); bodyweight →
    `volumeKg: 0`, `estimated1RM: null`; duplicate weight date keeps latest;
    single-point weight trend returns one point + `changeKg: 0`; calorie/macro
    averages + comparison deltas hand-check; `buildSummary` returns `null` under
    < 1 week; input arrays never mutated; no `.ts`.

**Checkpoint**: Foundation ready — constants, filled+empty mock data, and pure
aggregation utilities exist (user-specified "Data Aggregation Layer" done).

---

## Phase 2: Foundational — Page Scaffold, Routing, Navigation & Shared Primitives

**Purpose**: The `/analytics` page inside the dark shell, its route + nav entry,
and the shared presentational/chart building blocks every section consumes.
Blocks ALL user stories.

- [ ] T004 [P] Create the two page scaffolds:
  - `frontend/src/pages/Analytics.jsx`: `export default function Analytics()`
    returning `<DashboardLayout>` (import from
    `frontend/src/components/layout/DashboardLayout`) around
    `<AnalyticsPage />`;
  - `frontend/src/components/analytics/AnalyticsPage.jsx`: the composer;
    renders a `PageHeading` (current-date line + `dash-num` h1 "Analytics",
    reusing the Day 2.1 `Progress.jsx` `PageHeading` pattern) plus one empty
    `dash-card` placeholder; no data logic yet.
  - **Size**: S
  - **Files**: `frontend/src/pages/Analytics.jsx`,
    `frontend/src/components/analytics/AnalyticsPage.jsx`
  - **Depends**: —
  - **Accept**: once routed (T005), `/analytics` renders its heading inside the
    dark shell without crashing.

- [ ] T005 [P] Wire routes + navigation (surgical edits):
  - `frontend/src/App.jsx`: import `Analytics` from `./pages/Analytics`; add
    beside `/progress` exactly one top-level route:
    `<Route path="/analytics" element={<ProtectedRoute><Analytics
      /></ProtectedRoute>} />`; do NOT touch any existing route.
  - `frontend/src/data/constants.js`: append `{ key: 'analytics', label:
    'Analytics', path: '/analytics' }` to `SIDEBAR_MENU` (after `history`,
    before `profile`) and to `NAV_TABS` (after `history`, before `bmi`);
    `bmi` untouched.
  - `frontend/src/components/layout/TopNavbar.jsx`: add `'analytics'` to the
    `implementedTabs` Set; `bmi` stays an inert `<span>` placeholder.
  - `frontend/src/components/layout/Sidebar.jsx`: add `analytics: BarChart3` to
    `menuIcons` (import `BarChart3` from `lucide-react`; fall back to `Dumbbell`
    if missing); existing items unchanged. Active-state styling comes free from
    the existing `NavLink` `isActive` logic — verify it highlights Analytics.
  - **Size**: S
  - **Files**: `frontend/src/App.jsx`, `frontend/src/data/constants.js`,
    `frontend/src/components/layout/TopNavbar.jsx`,
    `frontend/src/components/layout/Sidebar.jsx`
  - **Depends**: T004
  - **Accept**: `/analytics` loads; sidebar item + nav tab navigate and show
    active state; `/`, `/progress`, `/goals`, `/workouts*`, `/workouts-history`,
    `/workouts/:id`, `/exercises`, `/nutrition`, `/login`, `/profile` all still
    load; `bmi` inert.

- [ ] T006 [P] Create the analytics primitives
  `frontend/src/components/analytics/ChartCard.jsx`,
  `frontend/src/components/analytics/MetricCard.jsx`,
  `frontend/src/components/analytics/TrendIndicator.jsx`:
  - `ChartCard` props `{ title, caption, children, loading, error }`: `dash-card`
    wrapper with `dash-num` title + optional muted caption; `loading` → shared
    `Skeleton` (import from `frontend/src/components/ui`); `error` → friendly
    `EmptyState` ("This section could not be loaded. Try again.") — never a
    stack trace; otherwise children (which handle their own empty state).
  - `MetricCard` props `{ label, value, unit, trend }`: small `dash-card` stat
    (muted label, `dash-num` value, optional `<TrendIndicator />` line).
  - `TrendIndicator` props `{ direction, delta, context = 'neutral', invert =
    false }`: up/down/flat arrow + delta; up/positive = lime accent, flat =
    muted, red ONLY for surplus/surplus-calorie context; weight-down →
    accent when `context === 'weight'` (weight loss = positive); arrow + delta
    text (never color-only).
  - **Size**: M
  - **Files**: the three files above (new `analytics/` folder)
  - **Depends**: —
  - **Accept**: primitives render correctly for sample props; no new color
    meanings beyond accent/muted/red; long labels truncate; loading/error
    branches in `ChartCard` render `Skeleton`/friendly-error.

- [ ] T007 [P] Create the interactive hand-rolled SVG chart primitives
  `frontend/src/components/analytics/charts/SvgLineChart.jsx` and
  `frontend/src/components/analytics/charts/SvgBarChart.jsx` (NO library):
  - `SvgLineChart` props `{ series: [{ key, label, color, points: [{ x-label,
    value }] }], height = 220, area, guide }`: y-scale across all series; each
    series a `polyline` (accent-gradient area fill when `area`) with per-point
    `<circle>` `<title>` tooltips ("Sep 1, 2026 · 82.5 kg"); optional dashed
    `guide` line `{ value, label }`; x-axis end labels muted; `viewBox` +
    `w-full` + `role="img"` + `aria-label`; handles 1 point (single marker) and
    2+ (line).
  - `SvgBarChart` props `{ series: [{ label, color, values: [{ x-label,
    value }] }], group = false, height = 220 }`: vertical bars, grouped
    side-by-side when `group` (current vs previous comparison); per-bar `<title>`
    tooltip; `viewBox` + `w-full` + `role="img"` + `aria-label`.
  - Both are PURE render — no data computation, state, or fetching.
  - **Size**: M
  - **Files**: the two files above (new `analytics/charts/` folder)
  - **Depends**: —
  - **Accept**: line/bar charts render for multi-series, area, guide,
    single-point, and zero-point cases; tooltips present per point; grouped bars
    align; SVGs scale with card width; aria labels present; no library imported.

**Checkpoint**: Foundation ready — the page is reachable from nav inside the dark
shell (tight layout matching Dashboard), and the shared chart/card/trend
primitives exist. User story implementation can now begin.

---

## Phase 3: User Story 1 - Access the Analytics Dashboard and Read the Fitness Summary (Priority: P1) 🎯 MVP

**Goal**: The Analytics page opens from navigation with the item highlighted and
shows the overall Fitness Summary card (progress score, streak, totals, weight
change, top insight) plus the ordered analytics section framework — all inside
the Dashboard shell.

**Independent Test**: Select "Analytics" in the sidebar; confirm the page renders
inside the dashboard shell with the nav item highlighted, the summary card shows
a derived score/status + insight + streak + totals (or the "Log more data to see
your fitness summary" insufficient-data state), and the analytics sections appear
in order (frequency, exercise performance, weight, calories, macros, comparison
slots visible as loading/filled cards).

- [ ] T008 [US1] Create `frontend/src/components/analytics/FitnessSummary.jsx`:
  props `{ summary, loading, error }`; full-width `dash-card` with a large
  `dash-num` progress score + "/100" + status label ("On track"), a
  `MetricCard` row (total workouts, avg calories, weight change, each with a
  `TrendIndicator`), the streak `MetricCard`, and the `topInsight` sentence
  (`accent-text`); `loading` → `Skeleton`; `error` → friendly `EmptyState`;
  `summary === null` → `EmptyState` "Log more data to see your fitness summary"
  with guidance to log workouts. All values are DERIVED (via `buildSummary`) —
  never stored/fabricated.
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/FitnessSummary.jsx`
  - **Depends**: T003, T006
  - **Accept**: summary shows score, streak, totals, weight change, insight;
    insufficient-data state on `null`; loading/error branches render; numbers
    use `dash-num`.

- [ ] T009 [US1] Establish the AnalyticsPage composition (part 1) in
  `frontend/src/components/analytics/AnalyticsPage.jsx`:
  - page-level `useState` slices: `{ dataSource ('filled'|'empty'), period
    ('last30'), from, to, category ('all'), exerciseName (null), loading, error
    }` with the Day 2.1 mock-async gate (`useEffect` + `setTimeout` ~500 ms +
    `cancelled` flag); loading → page-level `Spinner` or per-card `Skeleton`;
    error → friendly `EmptyState`; empty via `emptyAnalyticsData` swap;
  - a `resolveRange(period, { from, to })` call plus a `useMemo` aggregator
    (keyed on `[dataSource, from, to, category, exerciseName]`) that currently
    computes ONLY the summary slice (`buildSummary`);
  - render order: `<FitnessSummary />` then the six section slots
    (`WorkoutFrequency`, `ExercisePerformance`, `WeightTrend`, `CaloriesTrend`,
    `MacroTrends`, `PeriodComparison`) each rendered as a `ChartCard` in
    `loading` state for now (later story phases replace each slot with its real
    component in the single aggregator);
  - `dataSource === 'empty'` → verify every visible slot shows its empty
    fallback.
  - **Size**: L
  - **Files**: `frontend/src/components/analytics/AnalyticsPage.jsx`
  - **Depends**: T008, T007, T003, T002, T005
  - **Accept**: `/analytics` shows the summary (derived) + grid of ordered
    section cards; preset changes re-render summary; loading/error/empty paths
    all render without crash; no horizontal scroll.

**Checkpoint**: US1 fully functional and testable independently — this is the
MVP deliverable.

---

## Phase 4: User Story 2 - Filter Analytics by Time Range and Category (Priority: P1)

**Goal**: A shared filter panel (period presets + custom range + category)
drives the summary and every section together.

**Independent Test**: On `/analytics`, switch every preset (This Week, This
Month, Last 3 Months, Last 6 Months, Last Year, default Last 30 Days), apply a
Custom Range (incl. missing-bound and inverted cases), select a category
(Strength/Cardio/…), and Reset — the summary (and later, all wired sections)
update together for the same window, and workout-driven sections respect the
category.

- [ ] T010 [US2] Create `frontend/src/components/analytics/DateRangeFilter.jsx`
  and wire it into `AnalyticsPage.jsx`: props `{ period, onPeriod, from, to,
  onFrom, onTo, category, onCategory, onReset }`; a compact controlled row using
  `ui/Select` + `ui/Input`:
  - period `Select` over `ANALYTICS_PERIODS` (default `last30`);
  - category `Select` over "All categories" + the five `WORKOUT_CATEGORIES`;
  - when `period === 'custom'`: two `Input type="date"` fields (`from`, `to`),
    missing bound allowed (unbounded);
  - "Reset" `Button` shown when any control is non-default (`onReset` restores
    `period='last30'`, `category='all'`, clears `from`/`to`);
  - label `htmlFor`/`id` + `aria-label` wiring everywhere.
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/DateRangeFilter.jsx`
  - **Depends**: T001, T006, T009
  - **Accept**: each control is a real select/input; custom date inputs appear
    only for `custom`; reset appears only when a filter is active and restores
    defaults; category options come from `WORKOUT_CATEGORIES`.
  - [P] with T008 (different file — may build ahead).

**Checkpoint**: US1 AND US2 work independently; the summary now responds to the
shared time range + category.

---

## Phase 5: User Story 3 - Read Workout Frequency (Priority: P1)

**Goal**: A bar chart of workouts per day/week for the selected period, with a
previous-period comparison and hover counts.

**Independent Test**: On `/analytics`, confirm the Workout Frequency section
renders bars matching hand-counted workouts per bucket for the window, tooltips
show count + label, a previous-period series appears (adjacent/overlay) when the
equal-length preceding window has data, and "No workouts recorded for this
period" shows when the range is empty.

- [ ] T011 [US3] Create `frontend/src/components/analytics/WorkoutFrequency.jsx`
  and wire it into `AnalyticsPage.jsx` (replace the frequency slot; extend the
  `useMemo` aggregator to add `frequency` (current window via
  `computeFrequency`) and `frequencyPrev` (equal-length immediately-preceding
  window)):
  - props `{ frequency, previous, rangeLabel, loading, error }`; `ChartCard` +
    `SvgBarChart` (single bars, or grouped with `previous` in muted color);
    bucket per `bucketForRange`; tooltip = count + date/week label; caption line
    states the window (e.g. "Sep 1 - Sep 8, 2026 · 4 workouts");
  - `frequency` empty → `EmptyState` "No workouts recorded for this period"
    with guidance to log workouts; `previous` empty → omit comparison (no error).
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/WorkoutFrequency.jsx`
  - **Depends**: T003, T007, T009
  - **Accept**: bars match hand-counts; tooltips reveal count + label; previous
    comparison renders when present, omitted when not; empty state correct; no
    broken axes.

**Checkpoint**: US1, US2, US3 (all P1) complete — the MVP is feature-complete.

---

## Phase 6: User Story 5 - Track Body Weight and Calorie Trends (Priority: P2)

**Goal**: A weight line chart (with optional goal line + change delta) and a
consumed-vs-burned calories chart with averages and net deficit/surplus.

**Independent Test**: Confirm the Body Weight Trend renders weight over time + a
dashed goal line (75 kg) + change-delta, a single recorded point renders as a
marker (not an error), and "No weight entries for this period" when empty;
confirm Calories renders consumed vs burned with averages and a net
deficit/surplus indication, and "No calorie data for this period" when empty.

- [ ] T012 [US5] Create `frontend/src/components/analytics/WeightTrend.jsx` and
  wire it into `AnalyticsPage.jsx` (add `weightTrend` via `computeWeightTrend`
  to the aggregator): props `{ trend, goalWeightKg, loading, error }`;
  `ChartCard` + `SvgLineChart` (accent line + area gradient), dashed goal line
  via the `guide` prop when in y-range; below the chart `MetricCard` "Change
  since {firstDate}" with `formatKg(changeKg)` + weight-context
  `TrendIndicator` (down = positive); single-point → marker + value (never an
  empty state); `points` empty → `EmptyState` "No weight entries for this
  period".
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/WeightTrend.jsx`
  - **Depends**: T003, T007, T009
  - **Accept**: line/goal/delta render; single-entry marker; duplicate-date
    input uses latest; empty state on no entries; never an error for 1 point.

- [ ] T013 [US5] Create `frontend/src/components/analytics/CaloriesTrend.jsx`
  and wire it into `AnalyticsPage.jsx` (add `calories` via `computeCalories`):
  props `{ calories, loading, error }`; `ChartCard` + `SvgLineChart` with TWO
  series — consumed (`CHART_COLORS.secondary`) vs burned (`CHART_COLORS.accent`)
  — with deficit/surplus shading between the curves where it reads cleanly
  (deficit = accent, surplus = `CHART_COLORS.surplus`); `MetricCard` row: avg
  consumed, avg burned, and net deficit/surplus with a contextual
  `TrendIndicator` (e.g. "Avg deficit: 200 kcal/day"); `points` empty →
  `EmptyState` "No calorie data for this period".
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/CaloriesTrend.jsx`
  - **Depends**: T003, T007, T009
  - **Accept**: both series render with correct colors; averages + net
    deficit/surplus hand-check; tooltips show date + both values; empty state.

**Checkpoint**: US5 (Weight + Calories) functional alongside US1-3.

---

## Phase 7: User Story 6 - Read Macronutrient Trends (Priority: P3)

**Goal**: Protein/Carbs/Fat trends plus average daily intake for the period.

**Independent Test**: Confirm the Macronutrient section renders three lines
(Protein/Carbs/Fat in `MACRO_TYPES` colors) with average-daily-intake stats, and
"No nutrition data for this period" when empty.

- [ ] T014 [US6] Create `frontend/src/components/analytics/MacroTrends.jsx` and
  wire into `AnalyticsPage.jsx` (add `macros` via `aggregateMacros`): props
  `{ macros, loading, error }`; `ChartCard` + `SvgLineChart` with three series
  from `MACRO_TYPES`; `MetricCard` row of average daily intake per macro ("Avg
  Protein: 150 g · Avg Carbs: 220 g · Avg Fat: 65 g"); `points` empty →
  `EmptyState` "No nutrition data for this period".
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/MacroTrends.jsx`
  - **Depends**: T001, T003, T007, T009
  - **Accept**: three lines in `MACRO_TYPES` colors; averages hand-check;
    tooltips show date + all three values; empty state correct.

**Checkpoint**: US6 functional.

---

## Phase 8: User Story 4 - Analyse Exercise Performance (Priority: P2)

**Goal**: Per-exercise strength progression — volume over time, weight and reps
progression, and estimated 1RM trend (Epley) — driven by an exercise selector.

**Independent Test**: On `/analytics`, pick exercises from the selector; confirm
volume/weight/reps/1RM charts render from recorded history (Epley values
hand-check), a bodyweight-only exercise shows "No estimated 1RM yet" (never a
broken/zero chart), and "No exercise data for this period" when the range has no
exercises.

- [ ] T015 [US4] Create `frontend/src/components/analytics/ExercisePerformance.jsx`
  and wire it into `AnalyticsPage.jsx` (add `exerciseNames`
  via `uniqueExerciseNames` (reuse from `utils/historyUtils`) on the ranged +
  category-filtered workouts, `exercise` via `mostFrequentExercise`, plus
  `history` via `exerciseHistory` and `volume` via `computeExerciseVolume`;
  `exerciseName` reset to default when range/category/data-source changes):
  - exercise `Select` (real control, `ui/Select`) listing names in the current
    range/category;
  - 2×2 responsive grid (1 col mobile) of `ChartCard`s: **Volume over time**
    (`SvgBarChart`, `volumeKg` per bucket), **Weight progression**
    (`SvgLineChart`), **Reps progression** (`SvgLineChart`), **Estimated 1RM
    trend** (`SvgLineChart`, `estimated1RM` per date);
  - when the exercise's recorded history has NO weighted records (all
    `estimated1RM === null`): the 1RM card renders the plain "No estimated 1RM
    yet" note (not a blank/zero chart);
  - no exercise data in range → `EmptyState` "No exercise data for this period";
    long exercise names `truncate`.
  - **Size**: L
  - **Files**: `frontend/src/components/analytics/ExercisePerformance.jsx`
  - **Depends**: T003, T007, T009
  - **Accept**: selector switches views; charts render from recorded sets; Epley
    hand-checks; bodyweight-only → "No estimated 1RM yet" + bodyweight markers;
    empty state on no data; long names truncate.

**Checkpoint**: US4 (the deepest slice) functional.

---

## Phase 9: User Story 7 - Compare Current vs Previous Period (Priority: P3)

**Goal**: Side-by-side current-vs-previous comparison across Workouts, Volume,
Calories (avg), and Weight change with contextual deltas.

**Independent Test**: Confirm the Comparison section renders both periods for the
four metrics with hand-checked deltas and context-aware trend direction (weight
down = positive), and "Not enough data for comparison" when either period is
empty.

- [ ] T016 [US7] Create `frontend/src/components/analytics/PeriodComparison.jsx`
  and wire it into `AnalyticsPage.jsx` (add `comparison` via `comparePeriods`
  and `previousLabel` — the equal-length immediately-preceding window, e.g.
  "Last Week"): props `{ comparison, previousLabel, loading, error }`; a
  `ChartCard` with a two-column (current vs previous) layout of `MetricCard`s
  for Workouts, Volume, Calories (avg), Weight change, each pair showing both
  values + a `TrendIndicator` delta with context-aware direction; optionally an
  augmentation `SvgBarChart` for the deltas; `comparison` empty → `EmptyState`
  "Not enough data for comparison" — never zero/blank fabricated values.
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/PeriodComparison.jsx`
  - **Depends**: T003, T006, T007, T009
  - **Accept**: four metrics hand-check; trend arrows contextual; previous
    window equal-length + immediately preceding; either period empty → designed
    empty state.

**Checkpoint**: All seven user stories functional — the full grid is composed in
`AnalyticsPage.jsx`.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: No blank/broken/NaN region anywhere (A6), responsive at all
breakpoints (A9), then the phase's DoD verification.

- [ ] T017 Empty/loading/error audit + responsive sweep:
  - audit every one of the seven sections in
    `frontend/src/components/analytics/*.jsx` to confirm each independently
    renders a designed `EmptyState` (data absent), a `Skeleton`/`Spinner`
    (loading), and a friendly error (error, never a stack trace) — force all via
    the `emptyAnalyticsData` swap and a temporary error flag (removed before
    Done);
  - encode the spec layouts: chart grid `grid-cols-1 xl:grid-cols-2` (2 cols
    desktop, 1 mobile), `PeriodComparison` full-width, summary card full-width,
    filter row `flex-wrap` → stacked <640, exercise 2×2 → 1 col on mobile; all
    charts `viewBox` + `w-full`; confirm ZERO horizontal scroll at 1024+ /
    640-1024 / <640; adjust ONLY additive Tailwind classes or strictly-additive
    utilities in `frontend/src/index.css` if needed.
  - **Size**: M
  - **Files**: `frontend/src/components/analytics/*.jsx`,
    `frontend/src/pages/Analytics.jsx`, `frontend/src/index.css` (if needed)
  - **Depends**: T008-T016
  - **Accept**: forcing empty shows every designed empty state; loading shows
    skeleton/spinner; error shows friendly message everywhere; nothing renders
    blank/broken/`NaN`; layouts reflow with zero horizontal scroll; all controls
    reachable; sidebar drawer works at mobile.

- [ ] T018 Final "Day 4.1 Verification": execute the full DoD check and record
  it (visual + functional + build + regression):
  - visual consistency vs Day 1.1/2.1/3.1 tokens (`dash-card`, `dash-num`,
    `accent-text`, `--color-*`, lime accent, spacing, radius, type) on
    `/analytics`; content fills the width with no large empty side gaps;
  - filters: every preset (last30 default, week, month, last3, last6, lastYear),
    custom from/to (incl. missing-bound and inverted), category (Strength etc.),
    Reset — all sections update together; category narrows frequency/exercise/
    comparison only;
  - summary: score/streak/totals/weight-change/insight; < 1 week → "Log more
    data" empty; frequency counts + previous-period; exercise performance
    (selector, Epley, volume, bodyweight-only "No estimated 1RM yet"); weight
    goal line + single-point marker; calories + macros averages; comparison
    deltas + "Not enough data for comparison";
  - empty/loading/error drill via `emptyAnalyticsData` swap + error flag;
  - performance: with the ~12-month dataset, preset switching + hovering respond
    without visible lag (single `useMemo` aggregator — spot-check `lastYear`);
  - responsive at 3 breakpoints with zero horizontal scroll;
  - regression: `/` (Day 1.1), `/progress` + `/goals` (Day 2.1),
    `/workouts-history` + `/workouts/:id` + `/exercises` (Day 3.1), `/workouts`,
    `/workouts/new`, `/workouts/:id/edit`, `/nutrition`, `/login`, `/profile`
    all still load; Day 3.1 mock array untouched; `bmi` inert;
  - quality: run `npm run build` in `frontend/` (via `cmd /c "npm run build"` —
    PowerShell blocks `npm.ps1`); grep confirms no `.ts`/`.tsx` introduced; no
    dead imports; no new runtime dependency;
  - create the green IMPL PHR at `history/prompts/007-analytics/`.
  - **Size**: L
  - **Files**: audit of all Day 4.1 + touched Day 1.1/2.1/3.1 files
  - **Depends**: T017
  - **Accept**: build clean; no `.ts`/`.tsx`; prior-day pages unchanged; manual
    browser verification recorded (DoD item 13); IMPL PHR written.

**Final**: Day 4.1 complete — all 14 spec/constitution DoD items verified, build
clean, no TypeScript added, no new dependencies.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001, then T002/T003 `[P]`.
- **Foundational (Phase 2)**: Depends on Phase 1; BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2; T008 `[P]`-buildable with T007, T009
  rewires `AnalyticsPage.jsx`.
- **US2 (Phase 4)**: Depends on US1 (same `AnalyticsPage.jsx` — page state
  exists from T009); T010 `[P]` with T008.
- **US3 (Phase 5)**: Depends on T009 + T003/T007; replaces the frequency slot +
  extends the aggregator.
- **US5 (Phase 6)**: Depends on T009 + T003/T007; two new section slots
  (T012/T013 `[P]` against each other — different files).
- **US6 (Phase 7)**: Depends on T009 + T003/T007.
- **US4 (Phase 8)**: Depends on T009 + T003/T007 (deepest slice — scheduled
  late per the approved build order).
- **US7 (Phase 9)**: Depends on T009 + T003/T006/T007; completes the grid.
- **Polish (Phase 10)**: Depends on all sections (T017) → final verification
  (T018).

### User Story Dependencies

- **US1 (P1)**: after Foundational — no other-story dependency. 🎯 MVP.
- **US2 (P1)**: after US1 (shared `AnalyticsPage.jsx` filter state).
- **US3 (P1)**: after US1 page composition; independent section slot.
- **US5 (P2)**: after US1 page composition; independent slots (scheduled before
  US4 per plan/build-order rationale).
- **US6 (P3)**: after US1 page composition; independent slot (seeded with
  US5's aggregator pattern).
- **US4 (P2)**: after US1 page composition; independent slot (most complex — the
  engine's build order places it last among sections, before comparison).
- **US7 (P3)**: after US1 page composition; completes the ordered grid.

### Within Each User Story

- Component first, then wiring into `AnalyticsPage.jsx`.
- Component tasks marked `[P]` when they touch distinct files; page-wiring tasks
  run sequentially (shared `AnalyticsPage.jsx` / `pages/Analytics.jsx` file).
- Each section's wiring also extends the SINGLE `useMemo` aggregator — never
  compute data inside a component (A8).

### Parallel Opportunities

- T002/T003 (mock data + utils) after T001.
- T004/T005/T006/T007 (scaffolds, routes/nav, primitives, chart primitives)
  across Phase 2 — all `[P]`-compatible (distinct files).
- T008 (FitnessSummary) `[P]` with T010 (DateRangeFilter).
- T012/T013 (WeightTrend + CaloriesTrend) mutually `[P]`.
- After US1's composition is established, US3, US4, US5, US6, US7 all touch
  DISTINCT section files and could be parallelized (each extends the aggregator
  and replaces its own slot).

---

## Parallel Example: User Story 5 (Weight + Calories)

```bash
Task: "Create WeightTrend in frontend/src/components/analytics/WeightTrend.jsx"
Task: "Create CaloriesTrend in frontend/src/components/analytics/CaloriesTrend.jsx"
# then, sequentially (shared page file):
Task: "Wire both sections into AnalyticsPage.jsx and extend the aggregator"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (constants + data + utils).
2. Complete Phase 2: Foundational (page, route, nav, primitives).
3. Complete Phase 3: User Story 1 (FitnessSummary + page composition).
4. **STOP and VALIDATE**: `/analytics` is reachable with the nav item active and
   shows the derived Fitness Summary card + ordered section framework. This is
   the deliverable slice of Day 4.1.

### Incremental Delivery

1. Setup + Foundational → pages reachable from nav.
2. US1 summary + shell → verify `/analytics`.
3. US2 filters → verify all presets/custom/category drive the summary together.
4. US3 frequency → verify counts + previous-period comparison.
5. US5 weight + calories → verify trends + empty states.
6. US6 macros → verify P/C/F trends + averages.
7. US4 exercise performance → verify selector + Epley + 1RM states.
8. US7 comparison → verify deltas + "not enough data" state (grid complete).
9. Polish: empty/loading/error everywhere + responsive → verify via
   `emptyAnalyticsData` swap + 3 breakpoints.
10. T018 Final Verification + green IMPL PHR → Day 4.1 DONE.

### Parallel Team Strategy

- Team A: US1 → US2 → US3 (P1 core).
- Team B: after US1 composition, US5 (weight + calories) → US6 (macros) in
  parallel-safe separate slots.
- Team C: US4 (exercise performance) — the deepest slice, parallel-safe once the
  aggregator exists.
- Team D: US7 (comparison).
- Converge for Phase 10 (audit + responsive + final verification).

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to a specific user story for traceability.
- All files `.js`/`.jsx` only (no TypeScript).
- Mock data lives in `frontend/src/data/analyticsData.js` (+ the UNCHANGED
  `workoutHistoryData.js` `workouts` import); forcing the `emptyAnalyticsData`
  swap drives empty-state verification.
- ALL analytics derivation happens ONLY in `frontend/src/utils/analyticsUtils.js`
  (reusing `streakUtils.computeStreak` / `historyUtils.workoutVolume` +
  `uniqueExerciseNames`) — never inline in components.
- No new runtime dependencies (no charting/date/state library); all charts are
  hand-rolled SVG.
- Build gate: `cmd /c "npm run build"` in `frontend/` (PowerShell blocks
  `npm.ps1`); `vite build` is the type/syntax smoke check.
- Commit after each task or logical group; stop at each checkpoint to verify.