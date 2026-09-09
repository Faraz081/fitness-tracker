# Feature Specification: Analytics Module (Day 4.1)

**Feature Branch**: `007-analytics`  
**Created**: 2026-09-09  
**Status**: Draft  
**Input**: User description: "/sp.specify — Create a detailed functional specification for the Analytics module of the FitTrack application based on the constitution already defined."

## Overview

This feature adds a dedicated **Analytics** page to the Fitness Tracker that
gives users clear, visual insight into their fitness progress. Continuing the
existing modern dark dashboard (Day 1.1), the Progress & Goals pages (Day 2.1),
and the Activities & Workout History pages (Day 3.1), users can review: an
overall fitness summary, workout frequency, exercise performance (volume,
weight/reps progression, estimated 1RM trend), body weight trend, calories
(consumed vs burned), macronutrient trends, and weekly/monthly comparisons — all
driven by interactive charts and a shared time-range/category filter panel.

This is a **frontend-only, mock-data** phase. It reuses the existing
`DashboardLayout` (Sidebar + TopNavbar), UI primitives, and design tokens. No
backend, real API, authentication wiring, TypeScript, or new runtime dependency
is introduced. It must not break or regress any prior page. The page must be
visually indistinguishable from the Dashboard: same left sidebar, card style,
border radius, spacing, tight layout, typography, and green accent color, with
content filling the available width (no large empty dark areas).

## User Scenarios & Testing *(mandatory)*

The following user stories are prioritized by user value and are each
independently testable so a working MVP can be delivered incrementally.

### User Story 1 - Access the Analytics Dashboard and Read the Fitness Summary (Priority: P1)

The user opens the Analytics page from the main navigation and immediately sees,
at a glance, their overall progress: a fitness summary card (progress score/status
and a key highlight), their current streak, total workouts in the period, and the
analytics sections below it — all inside the existing dashboard shell with the
"Analytics" nav item highlighted as active.

**Why this priority**: The analytics front door — navigation, page shell, and the
at-a-glance summary — is the core value of the feature and the anchor every other
section hangs on. Without it the remaining stories have nothing to attach to.

**Independent Test**: Can be fully tested by selecting "Analytics" in the
sidebar, confirming the page renders inside the dashboard shell with the nav item
highlighted, the fitness summary card shows a progress score/status plus a key
highlight, a streak, and total workouts for the selected period, and the required
analytics sections are present in the specified order.

**Acceptance Scenarios**:

1. **Given** the user is anywhere in the app, **When** they select "Analytics" in
   the left sidebar, **Then** the Analytics page opens inside the existing
   dashboard shell and the "Analytics" nav item is highlighted as active.
2. **Given** the Analytics page has enough data, **When** it renders, **Then** an
   overall fitness summary card shows a progress score/status, at least one key
   highlight (e.g. "Workout consistency improved 20% this month"), the current
   streak, and the total workouts in the selected period.
3. **Given** the Analytics page renders, **When** the user scrolls, **Then** the
   required sections appear in order: Workout Frequency, Exercise Performance,
   Body Weight Trend, Calories, Macronutrients, and Comparison.
4. **Given** the user has insufficient data (< 1 week), **When** the summary card
   would have no basis, **Then** a helpful "Log more data to see your fitness
   summary" state is shown instead of fabricated numbers.

---

### User Story 2 - Filter Analytics by Time Range and Category (Priority: P1)

The user narrows the whole Analytics page using a shared time-range selector
(This Week | This Month | Last 3 Months | Custom Range) and an optional category
filter (All, Strength, Cardio, ...), and every chart and summary updates together.

**Why this priority**: Filters are what make analytics meaningful over time; a
single shared filter that drives every section is a core requirement of the
feature and changes how all data is read.

**Independent Test**: Can be fully tested by switching between every preset and
applying a custom range and a category filter, confirming every chart and the
summary update together for the same data window.

**Acceptance Scenarios**:

1. **Given** the user is on the Analytics page, **When** they select "This Week",
   "This Month", "Last 3 Months" or a Custom Range, **Then** every chart and the
   summary card update to show data for exactly that window.
2. **Given** the user chooses Custom Range, **When** they set a from and to date,
   **Then** all sections use that inclusive range.
3. **Given** the user selects a workout category filter (e.g. Strength), **When**
   the filter applies, **Then** workout-driven sections (frequency, exercise
   performance, volume, comparison) reflect only workouts of that category.
4. **Given** the user has applied filters, **When** they reset them, **Then** the
   full-range, all-categories view is restored.

---

### User Story 3 - Read Workout Frequency (Priority: P1)

The user sees how often they train: a chart of workouts per day/week for the
selected period, with the previous period shown alongside so they can see whether
consistency is improving.

**Why this priority**: Frequency is the simplest, highest-signal progress
indicator and forms the P1 core alongside the summary. It requires the least
domain model and is the entry point to the analytics experience.

**Independent Test**: Can be fully tested by opening the Analytics page and
confirming the Workout Frequency chart renders sessions per day/week for the
selected period, plus a previous-period comparison, and a helpful empty state when
no workouts exist.

**Acceptance Scenarios**:

1. **Given** the user has workouts in the selected period, **When** the Workout
   Frequency section renders, **Then** a bar/line chart shows the number of
   workouts per day/week (bucket size suitable for the period).
2. **Given** the chart renders, **When** the user hovers a bar/point, **Then** the
   exact workout count and its date/week are shown.
3. **Given** the previous period also has data, **When** the section renders,
   **Then** a comparison with the previous period is shown (overlay or adjacent
   values).
4. **Given** the user has no workouts in the period, **When** the section renders,
   **Then** a designed "No workouts recorded for this period" empty state with
   guidance to log workouts is shown.

---

### User Story 4 - Analyse Exercise Performance (Priority: P2)

The user selects a specific exercise and sees its strength progression over time:
total volume (sets × reps × weight), weight progression, reps progression, and an
estimated one-rep-max (1RM) trend.

**Why this priority**: Per-exercise strength insight is the deepest value in the
feature and directly answers "Am I getting stronger?". It is P2 because it builds
on logged workout/exercise history and involves exercise selection.

**Independent Test**: Can be fully tested by choosing an exercise from a selector
and confirming its volume-over-time chart, weight progression, reps progression,
and estimated 1RM trend render from the recorded history, with a designed empty
state for bodyweight-only or absent history.

**Acceptance Scenarios**:

1. **Given** the user has recorded exercises, **When** the Exercise Performance
   section renders, **Then** strength volume over time (total volume =
   sets × reps × weight) is shown for the selected period.
2. **Given** the section has an exercise selector, **When** the user picks an
   exercise, **Then** the view updates to that exercise's weight progression, reps
   progression, and estimated 1RM trend over time.
3. **Given** an exercise has weighted history, **When** its 1RM trend renders,
   **Then** the estimated 1RM is derived from the recorded sets (weight and reps
   of the set) — never entered or guessed.
4. **Given** an exercise has only bodyweight records (no weight), **When** the
   section renders, **Then** the estimated 1RM is not shown for that exercise and
   a plain "No estimated 1RM yet" note is shown instead.
5. **Given** the user has no exercise data in the period, **When** the section
   renders, **Then** a designed "No exercise data for this period" empty state is
   shown.

---

### User Story 5 - Track Body Weight and Calorie Trends (Priority: P2)

The user sees their body weight over time (with an optional goal-weight line and
the change since the start of the period) and their calorie picture (consumed vs
burned, daily/weekly averages, and surplus/deficit indication).

**Why this priority**: Weight and calories are the two headline body-composition
metrics users most often act on; they are read together and are P2 because they
pull from weight and nutrition-style history rather than simple workout counts.

**Independent Test**: Can be fully tested by confirming the Body Weight Trend chart
renders the user's weight points with an optional goal line and a change value
from the period start, and that the Calories section shows consumed vs burned with
averages and a surplus/deficit flag.

**Acceptance Scenarios**:

1. **Given** the user has weight entries in the period, **When** the Body Weight
   Trend section renders, **Then** a line chart shows weight over time plus the
   change from the start of the period; a single recorded point renders as a
   marker, not an error.
2. **Given** a goal weight is set, **When** the section renders, **Then** a
   distinct goal-weight line is shown on the chart.
3. **Given** the user has no weight entries in the period, **When** the section
   renders, **Then** a designed "No weight entries for this period" empty state is
   shown.
4. **Given** the user has calorie data in the period, **When** the Calories section
   renders, **Then** calories consumed vs calories burned are shown as two series
   with daily/weekly averages and an overall surplus or deficit indication.
5. **Given** the user has no calorie data in the period, **When** the section
   renders, **Then** a designed "No calorie data for this period" empty state is
   shown.

---

### User Story 6 - Read Macronutrient Trends (Priority: P3)

The user sees their nutrition composition: daily Protein / Carbs / Fat trends and
average daily intake for the selected period.

**Why this priority**: Macro insight completes the nutrition picture but builds on
nutrition-style data and adds less actionability on its own than frequency,
strength, weight, and calories, so it is the later slice.

**Independent Test**: Can be fully tested by confirming the Macronutrient section
renders Protein/Carbs/Fat trends (stacked area or multi-line) plus average daily
intake, and a designed empty state when no nutrition data exists in the period.

**Acceptance Scenarios**:

1. **Given** the user has nutrition data in the period, **When** the Macronutrient
   section renders, **Then** Protein, Carbs, and Fat trends are shown for the
   period.
2. **Given** the section renders, **When** the user reads it, **Then** the average
   daily intake for Protein, Carbs, and Fat in the selected period is displayed.
3. **Given** the user has no nutrition data in the period, **When** the section
   renders, **Then** a designed "No nutrition data for this period" empty state is
   shown.

---

### User Story 7 - Compare Current vs Previous Period (Priority: P3)

The user sees a side-by-side comparison of the current period against the previous
period across Workouts, Volume, Calories, and Weight change, so they can judge
progress direction at a glance.

**Why this priority**: Period-over-period comparison makes trends actionable and
explicitly required, but depends on multiple other sections' data being available,
so it is the final slice.

**Independent Test**: Can be fully tested by confirming the Comparison section
shows current vs previous period side-by-side (or dual charts) for Workouts,
Volume, Calories, and Weight change with deltas, plus an empty state when either
period lacks data.

**Acceptance Scenarios**:

1. **Given** both the current and previous periods have data, **When** the
   Comparison section renders, **Then** the two periods are shown side by side for
   Workouts, Volume, Calories, and Weight change.
2. **Given** both periods have data, **When** the user reads the section, **Then**
   each metric shows its delta/trend direction (up, down, or flat).
3. **Given** either the current or previous period has no data, **When** the
   section renders, **Then** a designed "Not enough data for comparison" empty
   state is shown rather than zero/blank values.
4. **Given** the user has changed the time range, **When** the section re-renders,
   **Then** the previous period is the window immediately preceding the selected
   one and equal in length.

---

### Edge Cases

- What happens when there is no data at all? Every section shows a designed empty
  state that explains why and guides the user (e.g. "Start logging workouts to see
  your analytics"); the page never renders blank regions.
- What happens with sparse data (one workout, one weight entry, one nutrition
  day)? Sections still render; single-point charts show a marker with its value
  and are NOT empty states for data that exists; no `NaN`, zero, or broken chart.
- What happens when the previous comparison period is empty? The Comparison
  section shows "Not enough data for comparison" instead of fabricated zeros.
- How are bodyweight exercises handled in derived 1RM/volume? Weight `0`/
  `undefined` means bodyweight; they are excluded from estimated 1RM and weighted
  volume but counted in exercise/workout counts.
- What happens if a custom range has only a start or only an end? The missing
  bound is treated as unbounded in that direction.
- What happens if a custom range starts after it ends? The range is clamped/
  handled without error and the sections show no results rather than a crash.
- What happens when duplicate dates exist (e.g. two weight entries same day)? The
  most recent entry for a date is used for that date's trend point.
- What happens when an exercise appears in multiple categories? Its progression
  aggregates across all matching workouts (subject to the category filter).
- What happens when the selected category filter matches no workouts? Workout-
  driven sections show their empty states rather than empty axes.
- How must charts behave with 12+ months of history? They remain smooth and
  responsive; data is aggregated so hovering and filtering stay instant.
- What happens when an exercise name is very long? The label truncates neatly
  rather than overflowing the card or chart.

## Requirements *(mandatory)*

### Functional Requirements

#### FR-001: Analytics Navigation
The system MUST expose an "Analytics" item in the left sidebar navigation. When
the Analytics page is open, that item MUST be highlighted as active. Existing nav
entries MUST NOT be removed or repurposed.

#### FR-002: Fitness Summary Card
The Analytics page MUST show an overall fitness summary card containing a progress
score or status, at least one key highlight (e.g. an improvement statement like
"Workout consistency improved 20% this month"), the current streak, and total
workouts in the selected period. When data is insufficient (< 1 week), the card
MUST show a designed "Log more data" state rather than fabricated values.

#### FR-003: Time Range Filter
The user MUST be able to select a time range from presets: This Week, This Month,
Last 3 Months, and a Custom Range (inclusive from/to dates).

#### FR-004: Category Filter
The user MUST be able to optionally filter by workout category (All, Strength,
Cardio, and any other configured categories). The filter list MUST be derived from
the same category set used elsewhere in the app.

#### FR-005: Shared Filters
The selected time range and category filter MUST apply to every chart and the
summary card together, so all sections always reflect the same window and scope.

#### FR-006: Workout Frequency Chart
The system MUST show workout frequency for the selected period as a bar or line
chart (sessions per day/week, bucket chosen for the period).

#### FR-007: Frequency Comparison
The Workout Frequency section MUST show a comparison with the previous period
(overlay or adjacent values) when the previous period has data.

#### FR-008: Exercise Performance - Volume
The system MUST show strength volume over time (total volume = sets × reps ×
weight) for the selected period.

#### FR-009: Exercise Selector
The user MUST be able to select a specific exercise; the Exercise Performance
section MUST show the selected exercise's weight progression, reps progression,
and estimated 1RM trend.

#### FR-010: Estimated 1RM
The system MUST derive an estimated 1RM from each set's recorded weight and reps.
It MUST be computed, never entered or guessed. Bodyweight-only exercises (no
recorded weight) MUST NOT display an estimated 1RM; a plain "No estimated 1RM yet"
note is shown instead.

#### FR-011: Body Weight Trend
The system MUST show a line chart of body weight over the selected period, with
the weight change from the start of the period displayed. A single recorded point
renders as a marker with its value.

#### FR-012: Goal Weight Line
When a goal weight exists, the Body Weight Trend chart MUST show an optional,
visually distinct goal-weight line.

#### FR-013: Calories Consumed vs Burned
The system MUST show calories consumed vs calories burned for the selected period
as two data series, with daily/weekly averages and an overall surplus or deficit
indication.

#### FR-014: Macronutrient Trends
The system MUST show Protein, Carbs, and Fat trends for the selected period
(stacked area or multi-line) and display the average daily intake for each macro.

#### FR-015: Period Comparison
The system MUST provide a weekly/monthly comparison of the current period vs the
previous period (equal length, immediately preceding) shown side by side, covering
Workouts, Volume, Calories, and Weight change, with a delta/trend direction for
each metric.

#### FR-016: Comparison Empty State
When either the current or previous period has no data, the Comparison section
MUST show a designed "Not enough data for comparison" empty state.

#### FR-017: Interactive Charts
Every chart MUST be interactive: hovering a data point reveals the exact values
(date/week and metric value) via a tooltip. Charts MUST be responsive and smooth;
a consistent color palette with the app's green primary accent MUST be used.

#### FR-018: Empty States
Every data-driven section MUST show a designed, helpful empty state when it has no
data, and that empty state MUST guide the user toward the action that populates it.
Loading and friendly error states MUST also be present on every section (never a
stack trace).

#### FR-019: Sparse-Data Handling
The page MUST remain fully usable with sparse data: existing data points still
render, single points are markers, and no section shows broken axes, `NaN`, or
fabricated values.

#### FR-020: Real User Data Only
The system MUST display only user-owned data. It MUST NOT invent, estimate, or
approximate missing data; when data is insufficient it MUST say so clearly.

#### FR-021: Performance with Historical Data
The system MUST stay responsive and smooth with large historical datasets (12+
months): charts render without visible lag and hovering/filtering respond without
delay. Where possible, data is pre-aggregated.

#### FR-022: Responsive Behaviour
The Analytics page MUST be fully responsive with no horizontal scroll at any
breakpoint; grids and charts reflow/stack on smaller screens.

#### FR-023: Visual Consistency with Dashboard
The Analytics page MUST be visually indistinguishable from the Dashboard in style:
same left sidebar, card style and border radius, spacing and tight side layout,
typography, and green accent color. Content MUST fill the available width without
large empty dark areas.

#### FR-024: No Regression
The Day 1.1 dashboard, Day 2.1 Progress/Goals, and Day 3.1 History/Detail/Exercise
pages MUST continue to render and function unchanged.

### Key Entities

- **Analytics Page**: The dedicated `/analytics` view that composes the summary
  card, shared filters, and ordered analytics sections inside the dashboard shell.
- **Fitness Summary**: The card presenting progress score/status, a key highlight,
  current streak, and total workouts for the selected period.
- **Time Range**: The shared filter window (preset or custom from/to) applied to
  all sections.
- **Category Filter**: The optional workout-category scope (All, Strength, Cardio,
  ...) applied to workout-driven sections.
- **Workout Frequency Data**: Derived daily/weekly workout counts for the period,
  plus the previous period's counts for comparison.
- **Exercise Performance Record**: Per-exercise history of sets, reps, weight,
  computed volume, and derived estimated 1RM used for progression charts.
- **Weight Trend Entry**: A dated body-weight value, plus an optional goal weight.
- **Calorie Record**: A day's consumed vs burned calories (and resulting
  surplus/deficit).
- **Macro Record**: A day's Protein, Carbs, and Fat intake.
- **Comparison Period**: The previous window (equal length, immediately preceding
  the selected range) used for side-by-side deltas across Workouts, Volume,
  Calories, and Weight change.

## Assumptions

- The phase is **frontend-only with local mock data**, matching Day 1.1, Day 2.1,
  and Day 3.1. No backend, API call, authentication, or persistence is introduced.
- All code is **`.js` and `.jsx` only** (no TypeScript), per the constitution's
  JavaScript-only override extended to Day 4.1.
- The existing `DashboardLayout` shell (Sidebar + TopNavbar), `ui/` primitives,
  and dark design tokens are reused as-is; **no new runtime dependency** (no
  charting/date/state library) is added — charts are hand-rolled SVG matching the
  prior days.
- Dates are `YYYY-MM-DD` strings so range filtering is a consistent string
  comparison (matching Day 2.1/3.1).
- Estimated 1RM is computed with the Epley formula `weight × (1 + reps / 30)`
  (per the Day 4.1 constitution) and is derived from each recorded set.
- Total volume = sets × reps × weight; weight `0`/`undefined` means bodyweight and
  is excluded from estimated 1RM and weighted volume but counted in counts.
- Calories consumed come from mock nutrition history; calories burned from mock
  activity/workout history; deficit = burned − consumed.
- The comparison "previous period" is the immediately preceding window of equal
  length to the selected range (e.g. last week for This Week, the prior 3 months
  for Last 3 Months).
- The progress score is a derived 0–100 composite (workout consistency, calorie
  adherence, weight-trend alignment) shown as a score when enough data exists,
  otherwise an explicit insufficient-data state.
- The category filter list uses the existing workout category set (All, Strength,
  Cardio, and any other configured categories).
- The page renders as a standalone route inside the dashboard layout, mirroring
  `/progress` and `/goals`, and does not touch existing routes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reach the Analytics page from the left sidebar and see it
  highlighted as active while on it, on every supported screen size.
- **SC-002**: All required analytics capabilities are present and functional:
  fitness summary, workout frequency, exercise performance, body weight trend,
  calories, macronutrients, and period comparison.
- **SC-003**: 100% of the time-range presets plus the custom range update every
  chart and the summary together; the category filter updates workout-driven
  sections consistently.
- **SC-004**: Users can view a selected exercise's weight, reps, and estimated 1RM
  progression within two clicks of landing on the page.
- **SC-005**: 100% of data-driven sections have a designed empty, loading, and
  friendly error state — no section renders blank, broken, or with invalid numbers
  under absent or sparse data.
- **SC-006**: Every rendered chart point reveals its exact value on hover.
- **SC-007**: The Analytics page is visually indistinguishable from the Dashboard
  (same shell, cards, spacing, typography, green accent, full-width layout) and
  prior pages show no regression.
- **SC-008**: The page remains responsive and smooth with 12+ months of mock
  history: it renders, and hovering/filtering respond without visible lag.
- **SC-009**: No horizontal page scroll at desktop, tablet, or mobile breakpoints.

## Out of Scope

The following are NOT part of this feature and MUST NOT be built:

- Any backend, API, database, model, route, or server-side logic; server-side
  analytics computation or aggregation.
- Authentication, registration, login changes, or additional auth protection.
- TypeScript adoption or conversion of existing files.
- Real persistence, storage, sync, import/export, or device integrations.
- Social sharing of analytics; comparison with other users or leaderboards.
- AI-generated coaching advice or recommendations.
- Export to PDF/CSV.
- Advanced/ML analytics: predictive modeling, anomaly detection, body-composition
  estimation beyond recorded data, trend forecasting beyond period comparison.
- Notifications, reminders, push, email, or threshold-based alerts.
- A frontend automated test suite or CI.
- New runtime dependencies (charting, date, or state libraries).
- Deployment or production hosting.