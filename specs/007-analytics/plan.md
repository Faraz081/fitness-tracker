# Implementation Plan: Analytics Module (Day 4.1)

**Branch**: `007-analytics` | **Date**: 2026-09-09 | **Spec**: [specs/007-analytics/spec.md](./spec.md)
**Input**: Day 4.1 constitution (`.specify/memory/constitution.md`, v3.3.0) + feature specification.

## 1. Overall Approach

### 1.1 High-Level Sequence

1. **Data + constants + utils layer** — append `ANALYTICS_PERIODS`, `CHART_COLORS`,
   `MACRO_TYPES`, `COMPARISON_PERIODS` to `constants.js` (append-only); create the
   analytics mock dataset (`data/analyticsData.js`, filled + EMPTY variant); create
   the PURE derivation module (`utils/analyticsUtils.js`) encoding range
   resolution, frequency bucketing, volume/1RM/weight/calorie/macro/comparison/
   progress-score math exactly once. Every section reads from these; nothing is
   computed inline (A8).
2. **Page scaffold + routing + navigation** — `pages/Analytics.jsx` inside the
   existing `DashboardLayout`, `components/analytics/AnalyticsPage.jsx` composer,
   the `/analytics` route in `App.jsx` (mirrors `/progress` wiring), and the
   `Analytics` entries in `SIDEBAR_MENU`/`NAV_TABS` + `implementedTabs` +
   `menuIcons` (A10). No existing nav entry is removed or repurposed.
3. **Shared presentational building blocks** — `ChartCard`, `MetricCard`,
   `TrendIndicator`, and the two interactive hand-rolled SVG chart primitives
   (`SvgLineChart`, `SvgBarChart`) that every section consumes (A7: no chart
   library; A8: hover values, `viewBox` + `w-full` scaling).
4. **Fitness summary + shared filters** — `FitnessSummary` (progress score,
   streak, totals, top insight via `buildSummary`) + `DateRangeFilter` (period
   presets, custom from/to, category filter). These drive every section (FR-005).
5. **Workout Frequency** — `WorkoutFrequency` bar chart over the selected range
   with previous-period comparison and hover counts (US3).
6. **Weight Trend + Calories + Macros** — `WeightTrend` (goal line + delta),
   `CaloriesTrend` (consumed vs burned + deficit/surplus), `MacroTrends`
   (P/C/F trend + averages) (US5, US6).
7. **Exercise Performance** — `ExercisePerformance` with exercise selector,
   volume over time, weight/reps progression, and estimated 1RM trend via the
   Epley formula (US4 — the deepest slice, scheduled late).
8. **Period Comparison** — `PeriodComparison` current vs previous period
   side-by-side with deltas/trend direction (US7).
9. **Cross-cutting** — empty/loading/error on every section (A6), responsive
   reflow (A9), polish, build verification, and Day 1.1/2.1/3.1 regression
   (FR-024).

### 1.2 Design & Technical Decisions Locked by Constitution/Spec

- **Language**: JavaScript only — `.js` for data/utils/constants, `.jsx` for
  components/pages. Strictly NO TypeScript (A2).
- **Frontend-only, mock data**: no backend, API, auth, persistence, or env
  changes (A1). All data imports from `frontend/src/data/`; `services/` and all
  prior-day pages are untouched.
- **No new runtime dependencies**: reuse React 19 + Vite 8 + React Router 7 +
  Tailwind v4 and the Day 1.1 `ui/` primitives (`Card`, `Badge`, `EmptyState`,
  `Spinner`, `Skeleton`, `ProgressBar`, `Select`, `Input`) + dark tokens
  (`dash-card`, `dash-num`, `accent-text`, `--color-accent`, `--color-line`,
  `--color-ink*`) (A3, A7). All charts are hand-rolled SVG.
- **Routing decision (explicit)**: `App.jsx` gains ONE new top-level route
  `<Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />`
  beside `/progress` — matching the standing route pattern. No existing route
  changes; `/workouts`, `/workouts/new`, `/workouts/:id/edit`,
  `/workouts-history`, `/workouts/:id`, `/exercises`, `/nutrition`, `/goals`,
  `/profile`, `/login`, `/register` all remain.
- **Navigation (A10)**: `constants.js` gains an `analytics` entry in
  `SIDEBAR_MENU` (after `history`, before `profile`) and `NAV_TABS` (after
  `history`, before `bmi`), label "Analytics", path `/analytics`.
  `TopNavbar.jsx`'s `implementedTabs` gains `'analytics'`; `Sidebar.jsx`'s
  `menuIcons` gains `analytics` → `BarChart3` (lucide-react; fallback
  `Dumbbell`). `bmi` stays inert.
- **Date convention**: all dates are `YYYY-MM-DD` strings; range filtering is
  plain inclusive string comparison; absent bounds = unbounded (spec Edge Cases).
  Preset bounds are computed in a pure `resolveRange(period, {from,to}, today)`
  (injected `today` so tests hand-check without a clock).
- **Time-range presets** (`ANALYTICS_PERIODS`): `last30` "Last 30 Days"
  (DEFAULT per constitution), `week` "This Week", `month` "This Month",
  `last3` "Last 3 Months", `last6` "Last 6 Months", `lastYear` "Last Year",
  `custom` "Custom Range" (from/to date inputs). This is the constitution's quick
  set (superset of spec FR-003's four presets + custom) so both gates hold.
- **Category filter (FR-004/005)**: a single category `Select` (All +
  `WORKOUT_CATEGORIES`, the exact existing set) narrows workout-driven sections
  (frequency, exercise performance, comparison workouts/volume); weight/calories/
  macros respond to the time range only (they have no category).
- **Derivation rules (single source, pure)**: all math lives ONLY in
  `utils/analyticsUtils.js`:
  - Total volume = `sets × reps × weightKg`; weight `0`/`undefined` = bodyweight
    (contributes 0 volume, never a 1RM). Reuses `historyUtils.workoutVolume`
    for a single workout where applicable; analytics functions operate on the
    ranged & category-filtered workout list.
  - Estimated 1RM (Epley) = `weightKg * (1 + reps / 30)` when `reps >= 1` and
    `weightKg > 0`; otherwise `null` → "No estimated 1RM yet".
  - Calories deficit = `burned - consumed` (negative = deficit / net burn);
    surplus/deficit shading contextual (deficit = green when weight-loss goal).
  - Progress score (0–100) = workout consistency (0–40) + calorie adherence
    (0–30) + weight-trend alignment (0–30), all pure; returns `null` when less
    than one week of data exists → "Log more data to see your fitness summary".
  - Comparison "previous period" = the immediately-preceding window of EQUAL
    length to the selected range (last week, prior 3 months, or `from-Δ..from-1`
    for custom), matching FR-015/SC: deltas across Workouts, Volume, Calories
    avg, Weight change.
  - Weight trend dedupes duplicate dates to the most recent entry (spec Edge
    Cases); single point renders as a marker (never an error).
- **Empty/loading/error (A6)**: page holds `{ loading, error, dataSource }`
  with the Day 2.1 mock-async gate (`setTimeout` ~500 ms, `cancelled` flag,
  friendly error branch — never a stack trace). Every data-driven section
  independently renders loading (`Skeleton` in `ChartCard`), error (friendly
  `EmptyState`), and empty (section-specific designed `EmptyState` guiding the
  user to log data) branches. Empty forced via `emptyAnalyticsData`.
- **Sparse data (FR-019)**: all charts handle 0, 1, and few points; 1 point =
  marker with value; no `NaN`/broken axes/fabricated values anywhere.
- **Performance (A8/FR-021)**: mock dataset spans ~12 months; per-range
  aggregations are computed once in the page via `useMemo` keyed on
  `[dataSource, range.from, range.to, category, exerciseName]` and passed to
  dumb section components. Aggregation functions are single-pass, pure, and
  memoizable; charts never compute data.

## 2. Ordered Task List

> Each task lists ID, title, files, implementation, acceptance criteria, and dependencies.
> Order is sequential unless marked **[P]** (different files, no dependency). Stories
> [US#] map to spec user stories (US1 summary/nav, US2 filters, US3 frequency,
> US4 exercise performance, US5 weight+calories, US6 macros, US7 comparison).

### Phase 1 — Data Layer, Utils, Page Scaffold, Routing, Navigation (Constitution Check gate)

- [ ] T001 Append analytics constants (append-only).
  - Files: `frontend/src/data/constants.js` (append only)
  - Implementation: append exactly four exports; DO NOT remove/rename any
    existing export (`QUICK_LOG_ITEMS`, `SIDEBAR_MENU`, `NAV_TABS`,
    `MACRO_COLORS`, `WEEK_DAYS`, `MEASUREMENT_FIELDS`, `GOAL_CATEGORIES`,
    `STREAK_TYPES`, `WORKOUT_CATEGORIES`, `PR_FIELDS`, `DATE_FILTER_OPTIONS`).
    - `ANALYTICS_PERIODS` = `[{ key: 'last30', label: 'Last 30 Days' },
      { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' },
      { key: 'last3', label: 'Last 3 Months' }, { key: 'last6', label: 'Last 6
      Months' }, { key: 'lastYear', label: 'Last Year' }, { key: 'custom',
      label: 'Custom Range' }]` (default preset key `'last30'`).
    - `CHART_COLORS` = `{ accent: 'var(--color-accent)', secondary: '#60A5FA',
      muted: 'var(--color-ink-muted)', surplus: '#F87171' }` (single export for
      chart series + deficit/surplus shading).
    - `MACRO_TYPES` = `[{ key: 'protein', label: 'Protein', color: '#A3E635' },
      { key: 'carbs', label: 'Carbs', color: '#60A5FA' }, { key: 'fat', label:
      'Fat', color: '#F472B6' }]` — colors identical to the existing
      `MACRO_COLORS` palette.
    - `COMPARISON_PERIODS` = `[{ key: 'week', label: 'This Week vs Last Week' },
      { key: 'month', label: 'This Month vs Last Month' }]` (display metadata for
      `PeriodComparison` labels).
  - Acceptance: four new named exports exist with the exact keys/labels above;
    all prior exports unchanged; file stays `.js`.
  - Depends: none.
  - [P]

- [ ] T002 Create the analytics mock dataset (filled + EMPTY variants).
  - Files: `frontend/src/data/analyticsData.js` (new)
  - Implementation: export `analyticsData` (object) and `emptyAnalyticsData`
    (all arrays `[]`, `goalWeightKg: null`, insight pool empty). Raw inputs
    (derivation stays in `analyticsUtils.js`, per constitution Data Shape
    Decisions — only the RAW data lives here):
    - `workouts`: the analytics window. `import { workouts } from
      './workoutHistoryData'` (Day 3.1 array, UNCHANGED — keeps Day 3.1 pages
      byte-identical) then append ~9 additional mock workouts dated across
      2025-09 … 2026-05 (older months: strength/hybrid/cardio mixed, using the
      SAME `{ id, name, category, date, notes, exercises: [{ id, name, sets,
      reps, weightKg }] }` shape and `WORKOUT_CATEGORIES` keys) so Last 3/6
      Months, Last Year, and a full 12-month window each resolve to distinct,
      non-empty slices. Keep the existing Sep 2026 workouts (This Week/This
      Month already have data). Repeat `Bench Press` across ≥6 dated workouts
      with increasing `weightKg` so volume + 1RM trends are visible; include a
      bodyweight-only exercise (e.g. `Plank`, and an exercise whose every record
      has `weightKg: 0`/omitted) to reach the "No estimated 1RM yet" state.
    - `weightEntries`: `[{ id, date, weightKg }]` spanning 2025-09 → 2026-09
      (~14 points, shape = Day 2.1 `progressData.weightEntries`); include at
      least one day with TWO entries to exercise the duplicate-date rule.
    - `calorieDays`: `[{ date, consumed, burned, deficit }]` — DAILY entries for
      the last 30 days predating/including 2026-09-09, plus weekly samples for
      2025-12 … 2026-06, so This Week / This Month / Last 3 Months each produce
      a distinct non-empty slice with different averages. `deficit =
      burned - consumed` (negative = net burn); include both deficit and surplus
      days.
    - `macroDays`: `[{ date, protein, carbs, fat, calories }]` with the same
      date coverage as `calorieDays`; protein/carbs/fat in grams.
    - `goalWeightKg: 75` (below the mock's trailing ~77.6 kg so the goal line
      reads as an active weight-loss target).
    - `insightPool`: static candidate insight strings keyed by factor
      (`consistency`, `calories`, `weight`) used by `buildSummary` to pick the
      top insight sentence.
  - Acceptance: exports exist; shapes match the constitution "Data Shape
    Decisions"; `workouts` array includes all 9 Day 3.1 entries unchanged plus
    the appended older ones; every preset (last30/week/month/last3/last6/
    lastYear) resolves to a non-empty distinct slice; both empty variants are
    truly empty; no `.ts`.
  - Depends: T001 (period keys referenced in comments only — arrays keyed by
    category/exercise names, so T001 is informational for this task).
  - [P]

- [ ] T003 Implement the pure analytics derivation module.
  - Files: `frontend/src/utils/analyticsUtils.js` (new `utils/` entry)
  - Implementation (all exported pure functions; NO date library; NO mutation;
    every function takes `{ from, to }`-style inclusive string bounds with
    absent = unbounded):
    - `resolveRange(periodKey, { from, to }, today = todayString())` → `{ from,
      to }`. Presets computed today-relative: `last30` = `[today-29d, today]`;
      `week` = `[start-of-week(Monday), today]`; `month` = `[1st of month,
      today]`; `last3`/`last6`/`lastYear` = `[today-Nd, today]`; `custom`
      passes `from`/`to` through (missing bound stays `undefined`). Returns
      `{ from, to }` even when `from > to` (aggregators then yield empty).
    - `bucketForRange(from, to)` → `'day'` when span ≤ ~10 days, `'week'` when
      ≤ ~120 days, else `'month'` — drives frequency bar buckets.
    - `isoWeekLabel(date)` / `monthLabel(date)`: pure formatters for bucket
      labels (e.g. `"Sep 1"`, `"Sep 2026"`) — hand-rolled, no date lib.
    - `computeFrequency(workouts, { from, to })` → `[{ label, date, count }]`
      (workouts grouped by `bucketForRange`, ascending date). Also
      `computeFrequency(workouts, { from: prevFrom, to: prevTo })` reused for the
      previous-period series.
    - `estimate1RM(weightKg, reps)` → `weightKg * (1 + reps / 30)`, or `null`
      when `reps < 1` or `weightKg <= 0`.
    - `exerciseHistory(exerciseName, workouts, { from, to })` → ascending
      `[{ date, sets, reps, weightKg, volumeKg, estimated1RM }]` where
      `volumeKg = sets * reps * weightKg` (0 for bodyweight) and `estimated1RM
      = estimate1RM(...)` (null for bodyweight). Bodyweight records stay in the
      history (counted) but carry `volumeKg: 0`, `estimated1RM: null`.
    - `computeExerciseVolume(exerciseName, workouts, { from, to })` →
      `[{ label, volumeKg }]` bucket-aggregated (Σ per bucket).
    - `computeWeightTrend(entries, { from, to })` → `{ points: [{ date,
      weightKg }], changeKg, latest }`: filters range, dedupes by date
      (most recent entry wins), sorts ascending; `changeKg = last - first`
      (0 when < 2 points); `points` may have length 1 (marker, not an error).
    - `computeCalories(days, { from, to })` → `{ points: [{ date, consumed,
      burned, deficit }], avgConsumed, avgBurned, netDeficit }` (netDeficit =
      avg burned − avg consumed; `null`/0 when no points).
    - `aggregateMacros(days, { from, to })` → `{ points: [{ date, protein,
      carbs, fat }], averages: { protein, carbs, fat }, calorieAvg }`.
    - `comparePeriods(current, previous)` → per-metric
      `[{ metric, label, current, previous, delta }]` for `workouts`, `volume`,
      `calories`, `weightChange` (current/previous passed in; `delta =
      current - previous`). Returns `[]` when either side has no data.
    - `computeProgressScore(workouts, weightEntries, calorieDays, { from, to })`
      → `null` when the range spans < 7 days AND all three inputs are empty
      (insufficient data rule); else `{ score, factors: { consistency: number
      0-40, calories: number 0-30, weight: number 0-30 } }` per the
      constitution weightings: consistency = sessions-per-week in range mapped
      `clamp(weeks, 0, 4) / 4 * 40`; calories = adherence fraction (`days |
      deficit | <= 300 kcal` ÷ tracked days) × 30; weight = progress toward goal
      `clamp((startKg - latestKg) / (startKg - goalWeightKg) |> 0..1) * 30`
      (0 factor when goal/entries missing).
    - `buildSummary(workouts, weightEntries, calorieDays, { from, to },
      goalWeightKg, insightPool)` → consolidated
      `{ progressScore, streakDays, totalWorkouts, avgCalories, weightChange,
      topInsight, factors }` (streak via `computeStreak` from
      `utils/streakUtils.js` on the ranged workout dates) — or `null` when
      `computeProgressScore` is `null`.
    - `mostFrequentExercise(workouts, { from, to })` → name with the most
      records in range, alphabetical tie-break (default for the selector).
    - Formatters: `formatKg(n)` (1 decimal + `kg`), `formatCalories(n)`
      (whole, thousands-separated + `kcal`), `formatPct(n)` (whole + `%`),
      `formatDelta(n, unit)` (`+1/week`, `-2.5 kg`, `flat`).
  - Acceptance: range resolution is correct against fixed `today` values;
    frequency groups match hand-counts; Epley matches hand math (e.g.
    `75 kg × (1 + 8/30) = 95`); bodyweight records yield `volumeKg: 0`,
    `estimated1RM: null`; duplicate weight dates keep the latest; single-point
    weight trend returns one point + `changeKg: 0`; calorie/macro averages and
    comparison deltas hand-check; `buildSummary` returns `null` under < 1 week;
    none of the input arrays are mutated; no `.ts`.
  - Depends: T002.
  - [US2, US3, US4, US5, US6, US7]

- [ ] T004 Scaffold the Analytics page + composer (heading + shell only).
  - Files: `frontend/src/pages/Analytics.jsx` (new),
    `frontend/src/components/analytics/AnalyticsPage.jsx` (new)
  - Implementation:
    - `pages/Analytics.jsx`: `export default function Analytics()` returning
      `<DashboardLayout>` around `AnalyticsPage` — mirrors `pages/Progress.jsx`.
    - `components/analytics/AnalyticsPage.jsx`: the composer; renders a
      `PageHeading` (current-date line + `dash-num` h1 "Analytics", reusing the
      `Progress.jsx` `PageHeading` pattern) followed by a single placeholder
      `dash-card` for now. No logic beyond composition yet (wired by T008-T015).
  - Acceptance: temporarily routed (T005), `/analytics` renders its heading
    inside the dark shell without crashing.
  - Depends: T002, T003.
  - [US1]

- [ ] T005 Wire the `/analytics` route and navigation (small, surgical edits).
  - Files: `frontend/src/App.jsx`, `frontend/src/data/constants.js`,
    `frontend/src/components/layout/TopNavbar.jsx`,
    `frontend/src/components/layout/Sidebar.jsx`
  - Implementation:
    - `App.jsx`: add `<Route path="/analytics" element={<ProtectedRoute>
      <Analytics /></ProtectedRoute>} />` beside `/progress` (import
      `Analytics` from `./pages/Analytics`). Leave all other routes untouched.
    - `constants.js`: add to `SIDEBAR_MENU` (after `history`, before `profile`)
      `{ key: 'analytics', label: 'Analytics', path: '/analytics' }` and the
      same entry to `NAV_TABS` (after `history`, before `bmi`).
    - `TopNavbar.jsx`: add `'analytics'` to `implementedTabs`.
    - `Sidebar.jsx`: add `analytics: BarChart3` to `menuIcons` (lucide-react
      `BarChart3` exists in the installed package; fallback `Dumbbell`
      otherwise).
  - Acceptance: `/analytics` loads; nav tab + sidebar item navigate and show
    active state; `/`, `/progress`, `/goals`, `/workouts*`, `/workouts-history`,
    `/workouts/:id`, `/exercises`, `/nutrition`, `/login`, `/profile` all still
    load; `bmi` still inert.
  - Depends: T004.
  - [US1]

### Phase 2 — Shared Building Blocks, Fitness Summary, Shared Filters

- [ ] T006 Implement `ChartCard`, `MetricCard`, `TrendIndicator`.
  - Files: `frontend/src/components/analytics/ChartCard.jsx`,
    `frontend/src/components/analytics/MetricCard.jsx`,
    `frontend/src/components/analytics/TrendIndicator.jsx` (new `analytics/`)
  - Implementation:
    - `ChartCard` props `{ title, caption, children, loading, error }`: a
      `dash-card` wrapper (same padding/border as Day 1.1 cards) with a
      `dash-num text-lg` title, optional muted caption, and body = children.
      When `loading` → `Skeleton` block; when `error` → friendly `EmptyState`
      ("This section could not be loaded. Try again.") — never a stack trace;
      otherwise children (which handle their own empty state).
    - `MetricCard` props `{ label, value, unit, trend }`: small `dash-card`
      stat (label muted, `dash-num` value, optional `TrendIndicator` line).
    - `TrendIndicator` props `{ direction, delta, context = 'neutral',
      invert = false }`: renders an up/down/flat arrow + delta using semantic
      colors — up/positive = `var(--color-accent)` (green), down/negative =
      `var(--color-accent)` too when `invert`/weight-loss context (weight going
      down is positive), flat = muted; explicit red only for surplus/surplus
      calorie context. Arrow glyph is inline SVG or a unicode arrow with
      `aria-hidden`, delta text next to it. Contextual mapping documented in the
      component (constitution UI/UX rules).
  - Acceptance: the three primitives render correctly for sample props; hover/
    focus states clean; no new color meanings beyond accent/muted/red;
    long labels truncate; accessible (text not color-only for direction — arrow
    + delta text).
  - Depends: none (uses `ui/` + tokens only).
  - [US1, US6, US7]

- [ ] T007 Implement the interactive SVG chart primitives.
  - Files: `frontend/src/components/analytics/charts/SvgLineChart.jsx`,
    `frontend/src/components/analytics/charts/SvgBarChart.jsx` (new
    `analytics/charts/`)
  - Implementation (hand-rolled SVG, NO library — A7):
    - `SvgLineChart` props `{ series: [{ key, label, color, points: [{ x-label,
      value }] }], height = 220, area, guide }`: computes min/max across all
      series (y-pad), draws each series as a `polyline` (stroke = color,
      strokeWidth 2) with optional area `polygon` fill (accent-gradients like
      Day 2.1 `WeightChart`); each point is a `<circle>` carrying a `<title>`
      tooltip (`"Sep 1, 2026 · 82.5 kg"`) — hover reveals exact values (FR-017);
      optional `guide` `{ value, label }` renders a distinct dashed horizontal
      goal line (weight goal); x-axis ends labelled in muted text; `viewBox` +
      `w-full` + `role="img"` + `aria-label` (A9). Handles 1 point (centered
      marker), 2+ points (line).
    - `SvgBarChart` props `{ series: [{ label, color, values: [{ x-label,
      value }] }], group = false, height = 220 }`: vertical bars (single-series
      or grouped side-by-side for previous-period comparison); each bar has a
      `<title>` tooltip; axis-labels/captions muted; `viewBox` + `w-full` +
      `role="img"` + `aria-label`. Zero-series → renders nothing (caller shows
      `EmptyState`).
    - Both are PURE render: no data computation, no state, no fetching.
  - Acceptance: line/bar charts render correctly for multi-series, area,
    guide-line, single-point, and zero-point cases; `<title>` tooltips present
    per point; group bars align for current vs previous; SVGs scale with card
    width; aria labels present; no library imported.
  - Depends: T006.
  - [US3, US4, US5, US6]

- [ ] T008 [US1] Implement `FitnessSummary`.
  - Files: `frontend/src/components/analytics/FitnessSummary.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ summary, loading, error }`. Renders a full-width
    `dash-card` (constitution layout: top row spanning columns) containing:
    progress score as a large `dash-num` (e.g. `72` with `/100` muted) + status
    label ("On track"), a `MetricCard` row for total workouts, avg calories,
    and weight change (each with a `TrendIndicator` delta), the current streak
    (`MetricCard`, value = `summary.streakDays`, unit `days`), and the
    `topInsight` sentence (prominent, `accent-text`). `loading` → `Skeleton`;
    `error` → friendly `EmptyState`; `summary === null` → `EmptyState` "Log more
    data to see your fitness summary" with message guiding to log workouts
    (FR-002 insufficient-data state). All values are the DERIVED output of
    `buildSummary` — never stored/fabricated (FR-020).
  - Acceptance: summary card shows score, streak, totals, weight change, and an
    insight sentence; insufficient data (< 1 week) shows the "Log more data"
    state; loading/error branches render; numbers use `dash-num`.
  - Depends: T003, T006.
  - [US1]

- [ ] T009 [US2] Implement the shared filter panel (period + custom range +
  category).
  - Files: `frontend/src/components/analytics/DateRangeFilter.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ period, onPeriod, from, to, onFrom, onTo,
    category, onCategory, onReset }`. A compact row of real controls using
    `ui/Select` + `ui/Input`:
    - period `Select` over `ANALYTICS_PERIODS` (default `last30`), labelled
      "Period";
    - category `Select` over "All categories" + the five `WORKOUT_CATEGORIES`,
      labelled "Category";
    - only when `period === 'custom'`: two `Input type="date"` fields
      (`from`, `to`) — missing bound allowed (unbounded that direction);
    - a "Reset" `Button` shown when any control is non-default (period ≠
      `last30`, category ≠ all, or filters active), calling `onReset`.
    All controls are controlled (`value`/`onChange`) with `label` + `id` +
    `aria-label` wiring (accessibility).
  - Acceptance: preset/category selects render with correct options; custom
    reveals from/to date fields only then; reset appears only when changes are
    active and restores defaults; every chart re-renders together when these
    change (verified in later tasks).
  - Depends: T001, T006.
  - [US2]

### Phase 3 — Workout Frequency

- [ ] T010 [US3] Implement `WorkoutFrequency`.
  - Files: `frontend/src/components/analytics/WorkoutFrequency.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ frequency, previous, rangeLabel, loading, error }`
    (data computed by the page via `computeFrequency` for both the current window
    and the EQUAL-LENGTH immediately-preceding window — FR-007). Renders a
    `ChartCard` with an `SvgBarChart`: single bars = current period (bucket per
    `bucketForRange`); `previous` present → grouped/adjacent muted-color bars.
    Bar tooltips show the exact count and date/week label (FR-006/017). A
    caption line states the window (e.g. "Sep 1 - Sep 8, 2026 · 4 workouts").
    `frequency` empty → `EmptyState` "No workouts recorded for this period" with
    guidance to log workouts; `previous` empty → comparison simply omitted
    (not an error).
  - Acceptance: bars match hand-counted per-bucket counts; tooltips reveal
    count + label; previous period renders adjacent group when present and is
    omitted when absent; empty state on no data; no broken axes.
  - Depends: T003, T007.
  - [US3]

### Phase 4 — Weight Trend, Calories, Macros

- [ ] T011 [US5] Implement `WeightTrend`.
  - Files: `frontend/src/components/analytics/WeightTrend.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ trend, goalWeightKg, loading, error }` where
    `trend` = `computeWeightTrend` output. Renders a `ChartCard` with
    `SvgLineChart` (accent line + area gradient, like Day 2.1 `WeightChart`),
    and — when `goalWeightKg` is set and within the y-range — the dashed
    distinct goal line via the `guide` prop (FR-012). Below the chart:
    `MetricCard` "Change since {firstDate}" with `formatKg(changeKg)` + a
    `TrendIndicator` (down = positive in weight-loss context). ONE point renders
    as a marker with its value (never an empty state, FR-019/SC). `points`
    empty → `EmptyState` "No weight entries for this period".
  - Acceptance: line/goal-line/delta render; single-entry marker; duplicate-date
    input uses latest; no weight entries → empty state; no error for 1 point.
  - Depends: T003, T007.
  - [US5]

- [ ] T012 [US5] Implement `CaloriesTrend`.
  - Files: `frontend/src/components/analytics/CaloriesTrend.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ calories, loading, error }` (`computeCalories`
    output). `ChartCard` + `SvgLineChart` with TWO series — consumed
    (`CHART_COLORS.secondary`) vs burned (`CHART_COLORS.accent`) — and
    deficit/surplus shading between the curves (deficit = accent/green,
    surplus = `CHART_COLORS.surplus`/red when burned < consumed) where it reads
    cleanly (FR-013). `MetricCard` row: "Avg consumed" (`formatCalories`), "Avg
    burned", and net deficit/surplus `MetricCard` with a contextual
    `TrendIndicator` (e.g. "Avg deficit: 200 kcal/day"). `points` empty →
    `EmptyState` "No calorie data for this period".
  - Acceptance: two series render with correct colors; averages + net
    deficit/surplus hand-check; tooltips show date + both values; empty state
    correct.
  - Depends: T003, T007.
  - [US5]

- [ ] T013 [US6] Implement `MacroTrends`.
  - Files: `frontend/src/components/analytics/MacroTrends.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ macros, loading, error }` (`aggregateMacros`
    output). `ChartCard` + `SvgLineChart` with three series (Protein/Carbs/Fat
    via `MACRO_TYPES` colors) showing each macro over time (FR-014 trend view),
    plus an `MetricCard` row of average daily intake per macro
    ("Avg Protein: 150 g · Avg Carbs: 220 g · Avg Fat: 65 g"). `points` empty →
    `EmptyState` "No nutrition data for this period".
  - Acceptance: three lines render in `MACRO_TYPES` colors; averages hand-check
    against mock days; tooltips show date + all three values; empty state.
  - Depends: T001, T003, T007.
  - [US6]

### Phase 5 — Exercise Performance

- [ ] T014 [US4] Implement `ExercisePerformance` (the deepest slice).
  - Files: `frontend/src/components/analytics/ExercisePerformance.jsx`; wire
    into `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ exerciseName, onExercise, exerciseNames, history,
    volume, loading, error }` (data via `exerciseHistory` +
    `computeExerciseVolume`; names via ranged `uniqueExerciseNames` from
    `historyUtils`). Layout:
    - an exercise `Select` (real control, `ui/Select`) populated with exercise
      names present in the current range/category, defaulting to
      `mostFrequentExercise`; switching calls `onExercise` (state lifted to the
      page, reset when range/category changes);
    - a 2×2 responsive grid (1 col mobile) of `ChartCard`s: **Volume over time**
      (`SvgBarChart`, `volumeKg` per bucket), **Weight progression**
      (`SvgLineChart`, `weightKg` per date), **Reps progression**
      (`SvgLineChart`, `reps` per date), **Estimated 1RM trend**
      (`SvgLineChart`, `estimated1RM` per date when any non-null — FR-010);
    - when the selected exercise has ONLY bodyweight records (all
      `estimated1RM === null`) the 1RM card shows the plain "No estimated 1RM
      yet" note (its own crafted state, NOT a zero/blank chart); weight chart
      then also shows the bodyweight marker style per `SvgLineChart` rules.
    No exercise data in range → `EmptyState` "No exercise data for this period".
    All values derived from recorded sets (computed, never entered — FR-010/020).
  - Acceptance: selector lists ranged exercises and switches views; volume/
    weight/reps/1RM charts render from recorded history; Epley values
    hand-check; bodyweight-only exercise shows "No estimated 1RM yet" and never
    a broken axis; empty state on no exercise data; long names truncate.
  - Depends: T003, T007.
  - [US4]

### Phase 6 — Period Comparison

- [ ] T015 [US7] Implement `PeriodComparison`.
  - Files: `frontend/src/components/analytics/PeriodComparison.jsx`; wire into
    `components/analytics/AnalyticsPage.jsx`
  - Implementation: props `{ comparison, previousLabel, loading, error }`
    (`comparePeriods` output + the previous-window label, e.g. "Last Week").
    Renders a `ChartCard` with a two-column (current vs previous) layout of
    `MetricCard`s for Workouts, Volume, Calories (avg), and Weight change
    (FR-015), each pair showing both values and a `TrendIndicator` delta
    (+1 workout, -200 kcal avg, -0.5 kg) with context-appropriate direction
    (weight down = positive). Where deltas are meaningfully shown, a small
    grouped `SvgBarChart` may augment. `comparison` empty (either period has no
    data) → `EmptyState` "Not enough data for comparison" (FR-016) — never
    zero/blank fabricated values.
  - Acceptance: four metrics render side-by-side with correct deltas
    (hand-checked); trend direction arrows contextual; previous window is
    equal-length + immediately preceding (per resolveRange); either period empty
    → designed empty state.
  - Depends: T003, T006, T007.
  - [US7]

### Phase 7 — Cross-Cutting (Empty/Loading/Error, Responsive, Polish)

- [ ] T016 [A6/FR-018] Compose the page: shared state, single aggregator,
  empty/loading/error everywhere.
  - Files: `frontend/src/pages/Analytics.jsx` (complete),
    `frontend/src/components/analytics/AnalyticsPage.jsx` (complete, all
    sections composed in the constitution's order)
  - Implementation:
    - `pages/Analytics.jsx` state: `{ dataSource ('filled'|'empty'), period
      ('last30'), from, to, category ('all'), exerciseName (null → default),
      loading, error }` with the Day 2.1 mock-async gate (`useState` +
      `useEffect` + `setTimeout` ~500 ms + `cancelled` flag). `empty` swap uses
      `emptyAnalyticsData`; the error branch is user-triggered during
      verification (a temporary flag, removed before Done).
    - Selection `useState` and the range live here (lifted — shared by every
      section, FR-005) and are passed to `AnalyticsPage`.
    - `AnalyticsPage.jsx` computes ONE `useMemo` aggregator keyed on
      `[dataSource, from, to, category, exerciseName]` that calls the pure
      `analyticsUtils` functions once to produce
      `{ summary, frequency, frequencyPrev, exerciseNames, exercise, history,
      volume, weightTrend, calories, macros, comparison, previousLabel }` and
      passes slices to sections. NEVER recomputes in components (A8).
      `exerciseName` resets to default when `dataSource`, range, or category
      changes. Sections composed in spec order: FitnessSummary → DateRangeFilter
      → WorkoutFrequency → ExercisePerformance → WeightTrend → CaloriesTrend →
      MacroTrends → PeriodComparison.
    - Every one of the seven sections receives `loading`/`error` and renders
      `Skeleton`/friendly-error/`EmptyState` branches (T006-T015 already encode
      these; T016 audits and fixes any gap). Loading shows one page-level
      `Spinner` OR per-card `Skeleton` (choose per-card `Skeleton` in
      `ChartCard` for consistency).
  - Acceptance: switching every preset + custom range + category updates ALL
    sections together (SC-003); forcing `empty` shows the designed empty state
    in every section and nothing blank/broken/`NaN`; forcing `error` shows
    friendly errors everywhere, never a stack trace; exercise selector resets on
    filter change.
  - Depends: T008, T009, T010, T011, T012, T013, T014, T015.
  - [US1, US2, US3, US4, US5, US6, US7]

- [ ] T017 [A9/FR-022] Responsive behaviour at all breakpoints.
  - Files: `pages/Analytics.jsx`, `components/analytics/*.jsx` (grid/tailwind
    adjustments only), `frontend/src/index.css` (strictly-additive tokens ONLY
    if genuinely missing, e.g. a chart-axis muted class — else none)
  - Implementation: encode the spec layouts — chart grid `grid-cols-1 xl:grid-cols-2`
    (2 cols desktop, 1 mobile) with `PeriodComparison` full-width; summary card
    full width; filter row `flex-wrap` → stacked <640; exercise 1RM grid 2×2 →
    1 col mobile; all charts `viewBox` + `w-full` so they reflow with card width.
    Zero horizontal scroll enforced at 1024+, 640-1024, <640.
  - Acceptance: at each width layouts reflow with zero horizontal scroll; every
    control reachable; charts keep readable axes.
  - Depends: T016.
  - [US1]

- [ ] T018 Final polish: consistency, build, regression, PHR handoff.
  - Files: audit all Day 4.1 + touched Day 1.1/2.1/3.1 files
  - Implementation: reconcile spacing/radius/type with the dark tokens; truncate
    long exercise names; remove dead imports; verify no `.ts`/`.tsx`; confirm no
    new runtime dependency; run `npm run build` in `frontend/` (frontend has no
    lint/test script — vite build is the smoke gate); perform manual browser
    verification (Analytics page, all seven sections, hover tooltips, all
    presets + custom + category + reset, exercise selector, empty/loading/error
    swaps, responsive at 3 breakpoints); regression on `/` (Day 1.1), `/progress`
    + `/goals` (Day 2.1), `/workouts-history` + `/workouts/:id` + `/exercises`
    (Day 3.1), plus `/workouts`, `/workouts/new`, `/workouts/:id/edit`,
    `/nutrition`, `/login`, `/profile`; record manual verification; create the
    green plan→tasks handoff note.
  - Acceptance: build clean; no `.ts`/`.tsx`; no prior-day regression; manual
    verification recorded (DoD item 13); all 14 constitution DoD items
    demonstrably met.
  - Depends: T016, T017.

## 3. File Creation Order

Create/update files in this dependency-safe sequence:

1. `frontend/src/data/constants.js` (append — T001)
2. `frontend/src/data/analyticsData.js` (new — T002)
3. `frontend/src/utils/analyticsUtils.js` (new — T003)
4. `frontend/src/pages/Analytics.jsx` (new scaffold — T004)
5. `frontend/src/components/analytics/AnalyticsPage.jsx` (new scaffold — T004)
6. `frontend/src/App.jsx` (edit route — T005)
7. `frontend/src/components/layout/TopNavbar.jsx` (edit implementedTabs — T005)
8. `frontend/src/components/layout/Sidebar.jsx` (edit menuIcons — T005)
9. `frontend/src/components/analytics/ChartCard.jsx` (new — T006)
10. `frontend/src/components/analytics/MetricCard.jsx` (new — T006)
11. `frontend/src/components/analytics/TrendIndicator.jsx` (new — T006)
12. `frontend/src/components/analytics/charts/SvgLineChart.jsx` (new — T007)
13. `frontend/src/components/analytics/charts/SvgBarChart.jsx` (new — T007)
14. `frontend/src/components/analytics/FitnessSummary.jsx` (new — T008)
15. `frontend/src/components/analytics/DateRangeFilter.jsx` (new — T009)
16. `frontend/src/components/analytics/WorkoutFrequency.jsx` (new — T010)
17. `frontend/src/components/analytics/WeightTrend.jsx` (new — T011)
18. `frontend/src/components/analytics/CaloriesTrend.jsx` (new — T012)
19. `frontend/src/components/analytics/MacroTrends.jsx` (new — T013)
20. `frontend/src/components/analytics/ExercisePerformance.jsx` (new — T014)
21. `frontend/src/components/analytics/PeriodComparison.jsx` (new — T015)
22. `frontend/src/pages/Analytics.jsx` + `frontend/src/components/analytics/AnalyticsPage.jsx` (wire T016)
23. `frontend/src/index.css` (strictly-additive utilities ONLY if T017 needs them)

## 4. State Management Plan

- **Data source of truth**: mock module `frontend/src/data/analyticsData.js`
  (`analyticsData` / `emptyAnalyticsData`), plus the UNCHANGED Day 3.1
  `data/workoutHistoryData.js` weekday array imported into it. Components never
  re-create data; `data/` and `utils/` are the only places data and math live.
- **Page-level state slices** (`useState` in `pages/Analytics.jsx`): `dataSource`
  (`'filled'`/`'empty'`), `period` (default `'last30'`), `from`, `to`, `category`
  (default `'all'`), `exerciseName` (default `null` → `mostFrequentExercise`),
  plus `loading`/`error` for the mock async gate. Filter state is shared by every
  section, so it lives here (constitution: "lift state only when two or more
  components share it") and flows down as props.
- **Single aggregator**: `AnalyticsPage` computes the derived dataset ONCE via
  `useMemo` keyed on `[dataSource, from, to, category, exerciseName]` using
  `analyticsUtils` pure functions; sections receive ready-to-render slices. No
  section computes, filters, or aggregates (A8). `exerciseName` resets when
  range/category/data-source changes (recompute default).
- **Derivation**: `resolveRange`, `bucketForRange`, `computeFrequency`,
  `exerciseHistory`, `estimate1RM`, `computeExerciseVolume`, `computeWeightTrend`,
  `computeCalories`, `aggregateMacros`, `comparePeriods`,
  `computeProgressScore`, `buildSummary`, `mostFrequentExercise`, and the
  formatters live ONLY in `utils/analyticsUtils.js` as pure functions; result
  formatting is inline where trivial. `historyUtils.workoutVolume`/`uniqueExerciseNames`
  and `streakUtils.computeStreak` are reused (not duplicated).
- **Empty-state handling**: `emptyAnalyticsData` forces "no data"; every section
  checks its own slice (each of the seven sections has a distinct, designed
  `EmptyState` per constitution). Loading = `Skeleton` in `ChartCard`s; error =
  friendly `EmptyState`, never a stack trace. No global store; no Context
  (constitution: none required).

## 5. Testing & Verification Plan

- **Visual checks against the dark theme**: load `/analytics`; compare card
  surface, border/radius, `dash-num` numerals, lime accent, chart colors,
  spacing, and typography with `/`, `/progress`, `/goals`. Record any drift and
  fix before Done.
- **Filter behaviour**: every `ANALYTICS_PERIODS` preset (last30 default, week,
  month, last3, last6, lastYear) + Custom Range (from/to, missing bound,
  inverted `from > to`) + category (Strength etc.) + Reset — assert all sections
  update together with the correct window; category narrows frequency/exercise/
  comparison only; weight/calories/macros follow the time range.
- **Summary + score**: hand-check `buildSummary` math against the mock
  (score weightings, streak via `computeStreak`, totals); force < 1 week of data
  → "Log more data to see your fitness summary".
- **Frequency**: hand-count per-bucket bars; previous-period series equals the
  immediately-preceding window of equal length; tooltips show count + label;
  no data → "No workouts recorded for this period".
- **Exercise performance**: switch exercises; Epley hand-check
  (`75 kg × (1 + 8/30) = 95`); volume hand-check (`4×8×62.5 = 2,000 kg`);
  bodyweight-only exercise → "No estimated 1RM yet", weight chart renders
  bodyweight markers; no exercise data → "No exercise data for this period".
- **Weight trend**: line + goal line (75 kg dashed); change delta from period
  start; single-entry marker (not an error); duplicate-date latest-wins; no
  entries → "No weight entries for this period".
- **Calories/Macros**: consumed vs burned colors; net deficit/surplus and
  averages hand-checked; P/C/F averages hand-checked; tooltips; respective empty
  states.
- **Comparison**: deltas hand-checked across Workouts/Volume/Calories/Weight
  change; contextual direction (weight down = positive); either period empty →
  "Not enough data for comparison".
- **Empty/loading/error**: swap to `emptyAnalyticsData` and confirm every section
  shows its designed empty state; loading shows `Skeleton`/`Spinner`; error shows
  friendly messages everywhere; nothing renders blank/broken/`NaN`.
- **Responsive checks**: at 1024+, 640-1024, <640 confirm the chart grid, the
  filter row, the exercise grid, and the summary card reflow with zero horizontal
  scroll; sidebar toggle still works.
- **Build/quality**: `npm run build` (vite build) in `frontend/` succeeds; grep
  confirms no `.ts`/`.tsx` introduced; no dead imports; no new runtime
  dependency.
- **Performance**: with the ~12-month dataset, filter switching and hovering
  respond without visible lag (single `useMemo` aggregator — no per-render
  recompute); spot-check longest preset (`lastYear`).
- **Regression**: `/` (Day 1.1), `/progress` + `/goals` (Day 2.1),
  `/workouts-history` + `/workouts/:id` + `/exercises` (Day 3.1), plus
  `/workouts`, `/workouts/new`, `/workouts/:id/edit`, `/nutrition`, `/login`,
  `/profile` all unchanged; nav active states correct; `bmi` still inert; Data 3.1
  mock array untouched.

## 6. Definition of Done

Day 4.1 is complete only when ALL hold:

- [ ] `/analytics` renders inside the existing dark `DashboardLayout` with the
      `Analytics` sidebar/tab item active, and shows, in order: Fitness Summary,
      Workout Frequency, Exercise Performance, Body Weight Trend, Calories,
      Macronutrients, and Period Comparison.
- [ ] Fitness Summary shows the derived progress score, current streak, total
      workouts, avg calories, weight change, and a top insight; insufficient data
      (< 1 week) shows the "Log more data to see your fitness summary" state —
      values are computed via pure functions, never fabricated.
- [ ] The shared filter (period presets incl. default Last 30 Days, Custom
      Range, and category) updates every section together; workout-driven
      sections respect the category filter; reset restores defaults.
- [ ] Workout Frequency charts sessions per day/week with previous-period
      comparison and hover counts.
- [ ] Exercise Performance shows volume over time, weight and reps progression,
      and the estimated 1RM trend (Epley) for a selectable exercise, with
      "No estimated 1RM yet" for bodyweight-only exercises.
- [ ] Weight Trend renders with an optional distinct goal line and a change
      delta; a single point renders as a marker; Calories shows consumed vs
      burned with averages and a net deficit/surplus indication.
- [ ] Macros show Protein/Carbs/Fat trends plus average daily intake; Comparison
      shows current vs previous period side-by-side with contextual deltas and
      "Not enough data for comparison" when either period is empty.
- [ ] Every chart is interactive (hover tooltips) and responsive; all seven
      sections have designed empty, loading, and error states — none render
      blank/broken/`NaN`.
- [ ] Design matches the existing dark dashboard: same tokens, cards, accent,
      type; content fills the width (no large empty side gaps); fully responsive
      with no horizontal scroll at any breakpoint.
- [ ] All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime
      dependency; no backend, API, env, or model changes; Day 3.1 mock array
      unchanged.
- [ ] `npm run build` (vite build) succeeds cleanly.
- [ ] Manual browser verification is recorded (all sections, hover tooltips,
      every preset + custom + category, exercise selector, empty/loading/error,
      responsive at 3 breakpoints, prior-day regression).
- [ ] Navigation: `Analytics` entry navigates correctly; `bmi` remains inert; no
      existing nav entry removed or repurposed; auth-phase routes unchanged.

## 7. Out of Scope Reminder

MUST NOT be built in Day 4.1:

- Backend, API, controller, service, model, or database changes of any kind;
  server-side analytics computation/aggregation; calling existing `services/`
  API code.
- Authentication, registration, login changes, or protecting `/analytics` behind
  additional auth beyond the existing shell.
- TypeScript adoption or conversion (`.js`/`.jsx` only); `tsconfig` changes
  governing the frontend.
- Real persistence, storage, sync, import/export, or device integrations.
- Social sharing, leaderboards, or comparison with other users.
- AI-generated coaching advice or recommendations.
- Export to PDF/CSV.
- Advanced/ML analytics: predictive modeling, anomaly detection,
  body-composition estimation beyond recorded data, forecasting beyond period
  comparison.
- Notifications, reminders, push, email, or analytics-threshold alerts.
- Editing/deleting workouts from these pages, or any change to Day 1.1/2.1/3.1
  pages, routes, or data modules (beyond the surgical, additive nav edits).
- New runtime dependencies (charting, date, or state libraries).
- Automated test suite and CI (optional build/lint smoke only).
- Deployment or production hosting; env-var or config changes.

These MUST NOT be silently added; open a new spec if one is required.

## 8. Constitution Check

*GATE: Passes before Phase 0 research; re-checked after Phase 1 design.*

| Gate | Result | Evidence |
|------|--------|----------|
| A1 Frontend-only, mock data | PASS | All sections consume `data/analyticsData.js` + unchanged Day 3.1 `workouts`; zero backend/API/env/auth tasks (T001-T018); `services/` untouched |
| A2 JavaScript-only | PASS | Every created/edited file is `.js`/`.jsx`; no `.ts`/`.tsx`, no `@ts-check` (T018 greps) |
| A3 Reuse shell + primitives | PASS | `DashboardLayout`, `ui/` primitives (`Card`, `Select`, `Input`, `EmptyState`, `Spinner`, `Skeleton`), `dash-card`/`dash-num`/`accent-text` tokens reused; `ChartCard`/`MetricCard`/`TrendIndicator` are new non-colliding analytics primitives |
| A4 Data-driven clarity | PASS | Each section answers one question (frequency, strength, weight, calories, macros, comparison, summary); no raw data dumps; TopInsight + trends over vanity numbers |
| A5 Progressive disclosure | PASS | Summary card + filters visible without scrolling; detailed charts below; drill-down via exercise selector |
| A6 Empty/loading/error everywhere | PASS | T016 mandates `EmptyState`/`Skeleton`/friendly-error on all seven sections; distinct named empty states per constitution; `emptyAnalyticsData` swap drills |
| A7 No new runtime deps | PASS | No library added anywhere in T001-T018; all charts hand-rolled SVG (T007) |
| A8 Interactive + performant charts | PASS | `SvgLineChart`/`SvgBarChart` hover tooltips (T007); single `useMemo` aggregator (T016); aggregation ONLY in pure `analyticsUtils.js` (T003), reuse of `streakUtils`/`historyUtils` |
| A9 Fully responsive, desktop-first | PASS | T017 encodes 2-col → 1-col grids, wrap/stack filters, `viewBox` + `w-full` charts; zero horizontal scroll |
| A10 Nav additive + non-destructive | PASS | T005 adds `analytics` only; `bmi` stays inert; existing nav entries/routes untouched; Day 3.1 nav + `/exercises` intact |
| Routing stays standalone | PASS | `/analytics` mirrors Day 1.1 `/` + Day 2.1 `/progress` wiring; auth/CRUD routes untouched |
| Additive-only to prior-day files | PASS | Touches only `App.jsx`, `constants.js`, `TopNavbar.jsx`, `Sidebar.jsx`, `index.css` (optional) — all surgical/additive; new files live in new `analytics/` folders |
| Chart primitives scope | PASS | `charts/` subfolder + 3 shared primitives are additive within `analytics/`, non-colliding with `ui/` exports (A3's "new shared primitives ONLY when needed" — justified by 6 chart sections sharing identical SVG behaviour) |

Result: **No violations** — nothing requires Complexity Tracking justification.

## 9. Complexity Tracking

> Fill only if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |