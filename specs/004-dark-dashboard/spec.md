# Feature Specification: Modern Dark Fitness Tracker Dashboard

**Feature Branch**: `004-dark-dashboard`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "Using the Day 1.1 constitution for the Modern Dark Fitness Tracker Dashboard, create a detailed Specification (Spec). Build a modern dark-themed dashboard in React using only .js/.jsx (no TypeScript), matching the reference screenshot, with fixed sidebar, top navbar, Quick Log buttons, and the full set of dashboard sections."

## Assumptions

- The dashboard is frontend-only and renders with **local mock data** supplied for
  display; no backend, authentication, or API calls are required (per the Day 1.1
  constitution Out of Scope).
- The reference screenshot named in the Day 1.1 request is the **visual authority**
  for exact colors/spacing/typography. Where the written spec and the screenshot
  disagree, the written requirement is binding; the implementing agent should match
  the screenshot as closely as the written rules allow.
- A single primary accent hue (lime/green family) is assumed to match the reference;
  the exact hex is finalized in the plan/implementation against the screenshot.
- "Personalizes" the greeting using the current date and a fixed/default display name
  from mock data (no real user profile is wired in Day 1.1).
- Progress "targets" for Hydration/Calories/Steps/Sleep and chart values are provided
  as mock seed values; empty states are demonstrable by rendering sections with no data.

## User Scenarios & Testing *(mandatory)*

> Stories are ordered by importance. Each story is independently testable and
> delivers a usable slice of the dashboard on its own.

### User Story 1 - Landing on a Complete Dashboard Landing (Priority: P1)

A user opens the Fitness Tracker and lands on a polished dark dashboard showing a
personalized greeting, today's date, the Quick Log row, summary stats, daily goals,
rings, and charts in the exact three-region layout (sidebar + navbar + content).

**Why this priority**: This is the entire Day 1.1 deliverable — the dashboard IS
the feature. Seeing every section render correctly is the core value.

**Independent Test**: Can be fully tested by loading the dashboard and confirming
the left sidebar (logo, Dashboard/Exercise/Nutrition, profile block), the top navbar
(logo + "Fitness Tracker", center tabs Dashboard/Workouts/Nutrition/Goals/BMI, user
avatar + name), and the main content Quick Log row plus all content sections render.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **Then** a fixed left sidebar shows the logo,
   the main menu items Dashboard/Exercise/Nutrition, and a user profile block
   (avatar + name + email) at the bottom.
2. **Given** the dashboard is loaded, **Then** the top navbar shows the logo +
   "Fitness Tracker" text, center tabs Dashboard/Workouts/Nutrition/Goals/BMI, and a
   user avatar + name on the right.
3. **Given** the dashboard is loaded, **Then** the main content area shows a row of
   Quick Log buttons labelled Water, Steps, Calories, Sleep, Weight, Workout.
4. **Given** the dashboard is loaded, **Then** a personalized greeting (e.g. "Good
   morning, Alex") is shown with the current date formatted for display.

---

### User Story 2 - Reviewing Key Stats on Summary Cards (Priority: P1)

A user can read at a glance their headline fitness numbers from the summary card
grid: Total Workouts, Total Exercises, Calories Burned, Calories Consumed, Current
Weight, Workout Streak.

**Why this priority**: Summary cards are the primary "at a glance" value; they
consume the largest visual area alongside the greeting.

**Independent Test**: Can be fully tested by checking each of the six summary cards
renders its label and a value (and where applicable a trend indicator) sourced from
mock data.

**Acceptance Scenarios**:

1. **Given** mock summary data exists, **Then** six summary cards render with labels
   Total Workouts, Total Exercises, Calories Burned, Calories Consumed, Current
   Weight, and Workout Streak, each showing its corresponding value.
2. **Given** a summary value is present, **Then** it is formatted appropriately
   (e.g. counts as integers, weight in kg, calories in kcal).

---

### User Story 3 - Tracking Daily Goals with Progress (Priority: P2)

A user can see their progress against daily goals for Hydration, Calories, Steps,
and Sleep, each shown as a progress card with a progress bar and a target/current
readout.

**Why this priority**: Goal progress is the motivating layer of a fitness dashboard
and reinforces the daily-planning value.

**Independent Test**: Can be fully tested by confirming four progress cards render,
each with a label, current/target values, and a visually correct progress bar filling
to the correct percentage.

**Acceptance Scenarios**:

1. **Given** daily goal data, **Then** four progress cards (Hydration, Calories,
   Steps, Sleep) render, each with a progress bar whose fill reflects
   current/target.
2. **Given** a section has no goal/target data, **Then** the card shows a 0% bar and
   a "No goal set" caption with an empty state (no broken fraction).

---

### User Story 4 - Glancing at Progress Rings (Priority: P2)

A user can read an at-a-glance completion indicator from activity/progress rings
(e.g. weekly activity, workouts this week, steps goal) rendered as ring/donut
visualizations.

**Why this priority**: Rings provide a compact, iconic status readout that matches
the reference layout's visual identity.

**Independent Test**: Can be fully tested by confirming at least one ring renders a
circular progress fill proportionate to its value and shows a center label/value
when data exists.

**Acceptance Scenarios**:

1. **Given** ring data, **Then** one or more activity/progress rings render, each
   displaying a circular fill proportional to its value with a center value/label.
2. **Given** no ring data, **Then** the ring renders an empty-state caption instead
   of a broken or misleading value.

---

### User Story 5 - Reviewing Charts: Weekly Workouts, Calories, Macros (Priority: P2)

A user can review three data charts: a weekly workout chart, a calories chart, and a
macro chart, all rendering meaningful trends/composition from mock data.

**Why this priority**: Charts communicate trends and balance that text cannot; they
complete the "dashboard" feel of the reference.

**Independent Test**: Can be fully tested by confirming weekly workout, calories, and
macro charts each render from their mock data and show a designed empty state when
empty.

**Acceptance Scenarios**:

1. **Given** weekly data, **Then** the weekly workout chart renders bars for the
   days of the week reflecting values.
2. **Given** calorie-series data, **Then** the calories chart renders the series as a
   line/area/bar appropriate to the reference.
3. **Given** macro totals, **Then** the macro chart renders a proportional breakdown
   (protein/carbs/fat).
4. **Given** no data for a chart, **Then** that chart renders its empty state with a
   short message instead of a blank or broken axes.

---

### User Story 6 - Recent Workouts & Quick Actions (Priority: P2)

A user can see their most recent workouts in a list and reach common shortcuts via
quick action buttons/links.

**Why this priority**: Recent workouts and quick actions turn the dashboard into a
launchpad rather than a static report.

**Independent Test**: Can be fully tested by confirming the recent workouts list
renders the latest entries (or its empty state) and that quick action buttons are
present and clickable.

**Acceptance Scenarios**:

1. **Given** recent workout data, **Then** the recent workouts section lists the
   most recent workouts (name, date, category, brief metrics such as exercise count
   or duration) newest first.
2. **Given** no recent workouts, **Then** the section renders an empty state
   ("No recent workouts yet").
3. **Given** the dashboard is loaded, **Then** quick action buttons are present and
   each is focusable/clickable.

---

### User Story 7 - Graceful Empty, Loading, and Error States (Priority: P3)

A user never sees a blank or broken region: every data-driven section shows a
designed empty state when there is no data, a loading indicator while loading, and a
friendly message on error.

**Why this priority**: Polish and robustness; must hold without breaking the primary
display of the dashboard.

**Independent Test**: Can be fully tested by rendering each section with no data
(empty state), a simulated pending load (loading state), and a simulated failure
(error state), and confirming none render blank/broken.

**Acceptance Scenarios**:

1. **Given** no data for any section, **Then** each section shows a consistent empty
   state (icon + short message) rather than nothing.
2. **Given** a section is loading, **Then** a spinner/skeleton is shown.
3. **Given** a section fails to load, **Then** a friendly message is shown and never
   a stack trace.

---

### User Story 8 - Responsive on Tablet and Mobile (Priority: P3)

A user can use the dashboard on smaller screens: the layout adapts so nothing is
cut off or requires horizontal scrolling.

**Why this priority**: Responsiveness is a stated requirement; smaller-screen
usability is the final acceptance hurdle.

**Independent Test**: Can be fully tested by resizing to tablet and mobile widths and
confirming the sidebar collapses appropriately, tabs remain reachable, and there is
no horizontal scroll.

**Acceptance Scenarios**:

1. **Given** a tablet-width viewport, **Then** the sidebar collapses to an icon rail
   (or is toggled) and the grid columns reduce.
2. **Given** a mobile-width viewport, **Then** the sidebar becomes an overlay/drawer
   opened from the top navbar, center tabs collapse to a menu or scrollable strip,
   and there is no horizontal page scroll.

### Edge Cases

- Empty data for any one section must not break the others (isolation).
- Zero target on a progress card must not produce a division-by-zero or "NaN%" —
   it shows the "No goal set" empty state.
- Chart with a single point or no points must render an empty state, not a broken axe.
- Very long names (user name, workout names) must truncate gracefully (ellipsis)
  rather than overflow the layout.
- Rapid viewport resizing must not leave the layout in an inconsistent state.
- Missing/deleted mock data must fall back to the empty state, never a crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a dashboard at the primary route with a three-region
  layout: fixed left sidebar, top navbar, and a scrollable main content area.
- **FR-002**: The left sidebar MUST show a logo at the top, the main menu items
  Dashboard, Exercise, and Nutrition, and a user profile block (avatar + name +
  email) pinned at the bottom.
- **FR-003**: The top navbar MUST show the logo + "Fitness Tracker" text on the left,
  center navigation tabs Dashboard, Workouts, Nutrition, Goals, and BMI, and the user
  avatar + name on the right.
- **FR-004**: The main content area MUST show a row of Quick Log buttons labelled
  Water, Steps, Calories, Sleep, Weight, and Workout.
- **FR-005**: The dashboard MUST display a personalized greeting (using a display
  name) and the current date.
- **FR-006**: The dashboard MUST render six summary cards: Total Workouts, Total
  Exercises, Calories Burned, Calories Consumed, Current Weight, and Workout Streak.
- **FR-007**: The dashboard MUST render four daily goal/progress cards (Hydration,
  Calories, Steps, Sleep), each with a progress bar reflecting current vs. target.
- **FR-008**: The dashboard MUST render activity/progress rings with proportional
  circular fills and center values.
- **FR-009**: The dashboard MUST render a weekly workout chart, a calories chart, and
  a macro chart from the section's data source.
- **FR-010**: The dashboard MUST render a recent workouts section listing the latest
  workouts, newest first.
- **FR-011**: The dashboard MUST render quick action buttons/shortcuts.
- **FR-012**: Every data-driven section MUST have a designed empty state, a loading
  state, and a friendly error state.
- **FR-013**: The dashboard MUST be fully responsive with no horizontal scroll at
  desktop, tablet, or mobile widths.
- **FR-014**: The visual style MUST follow the dark theme as defined in the Dashboard
  Design System.

### Key Entities *(include if feature involves data)*

- **DashboardSummary**: Aggregate stats shown on the summary cards — totalWorkouts,
  totalExercises, caloriesBurned, caloriesConsumed, currentWeightKg, workoutStreak.
- **DailyGoal**: A daily target with a label (Hydration/Calories/Steps/Sleep), a
  current value, a target value, and a unit.
- **ProgressRing**: A named circular metric with a value and an optional target/max.
- **WeeklyWorkoutPoint**: A day-of-week label and a workout-count value.
- **CaloriesSeriesPoint**: A date/label and a calorie value.
- **MacroBreakdown**: Protein, carbs, and fat grams (or percentage) totals.
- **RecentWorkout**: Display fields for a logged workout (name, date, category,
  metric), newest first.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all required sections (sidebar, navbar, Quick Log,
  greeting, six summary cards, four progress cards, rings, three charts, recent
  workouts, quick actions) on first load within 2 seconds.
- **SC-002**: 100% of the required sections listed in FR-001 through FR-014 are
  present on the rendered dashboard.
- **SC-003**: At desktop, tablet, and mobile widths the layout is usable with zero
  horizontal scrolling and all interactive controls reachable.
- **SC-004**: Every data-driven section demonstrates a designed empty state, a
  loading state, and a friendly error state; no section can render blank or broken.
- **SC-005**: The dashboard visually matches the dark themed reference in palette,
  spacing, typography, and card styling as closely as the written rules allow.

## Out of Scope

- Backend changes (no endpoints, data models, auth, or service changes).
- Real authentication, registration, or login UI changes.
- Wiring real API data; all data is local mock/seed data.
- Full CRUD behavior behind Quick Log buttons (they are presentational/placeholder
  and MAY increment local state only).
- TypeScript conversion or adoption (must stay `.js`/`.jsx`).
- Data persistence, offline cache, service workers, PWA.
- i18n/localization and a dark/light theme toggle.
- Automated test suite and CI (optional smoke check only).
- Deployment or production hosting.
- New charting or state libraries.

These MUST NOT be added to Day 1.1; open a new spec if one is required.
