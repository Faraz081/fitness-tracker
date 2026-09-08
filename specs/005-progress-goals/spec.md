# Feature Specification: Progress & Goals (Day 2.1)

**Feature Branch**: `005-progress-goals`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "Using the Day 2.1 constitution for Progress & Goals, create a detailed Specification (Spec). Project continues from Day 1.1 (Modern Dark Dashboard is already complete and must be reused). Use only .js/.jsx (no TypeScript); keep the same modern dark theme; clean, production-ready, non-over-engineered React. Focus strictly on: Progress page; Weight tracking; Body measurements; Weight progress graph; Workout performance graph; Strength/progression history; Personal goals; Goal progress bars; Goal completion status; Milestones; Streak system. Produce a complete, implementation-ready Specification."

## Assumptions

- Day 2.1 is **frontend-only** and renders with **local mock data** (per the Day
  2.1 constitution P1). No backend, API calls, authentication, or persistence.
- The existing Day 1.1 dark dashboard (`/`) is **complete and unchangeable
  except for additive wiring**: the new pages reuse the `DashboardLayout` shell
  (Sidebar + TopNavbar), the `dash-card`/`dash-num`/`accent-text`/`ring-track`
  utilities, the shared `ui/` primitives, and the dark theme tokens from
  `index.css`. Day 1.1 components are not edited.
- The two new pages render as **standalone routes** `/progress` and `/goals`
  inside the existing `DashboardLayout`, mirroring how Day 1.1 wired the `/`
  route. No auth route and no protected route wrapper is added or changed.
- The Day 1.1 top-nav tabs Dashboard / Workouts / Nutrition already exist.
  Navigation gains **Progress** and **Goals** entries (nav tab and/or sidebar
  menu item) that navigate to the new pages. Any tab with no implemented page
  remains an inert placeholder exactly as Day 1.1 did.
- Measured quantity units are metric: weight in `kg`, body measurements in `cm`,
  volumes in `kg` (lifted weight), counts as integers, streaks in `days`.
- "Log weight" and "log measurement" inputs, if made interactive, update **local
  session state only** and reset to mock data on reload (constitution P8).
- Streak cadence default is **1 day** (a "day streak"). The streak system is
  shown on the **Goals page** (required) and MAY also surface the Day 1.1
  "Workout Streak" summary stat unchanged.
- No [NEEDS CLARIFICATION] items: the constitution resolves scope, routing, state
  handling, and the JS-only constraint. Remaining defaults are documented in this
  Assumptions list.

## User Scenarios & Testing *(mandatory)*

> Stories are ordered by importance. Each story is independently testable and a
> usable slice of the Progress & Goals feature on its own. All stories assume the
> existing dark dashboard shell (Sidebar + Navbar) is present.

### User Story 1 - Tracking Weight on the Progress Page (Priority: P1)

A user opens the **Progress page** and sees their body-weight history: the latest
recorded weight, a short newest-first list of recent weight entries (with dates),
and an input to log a new weight. This is the core data the section exists for.

**Why this priority**: Weight tracking is the flagship numeric dataset of the
Progress feature and the input for the weight graph; without it the rest of the
page has no anchor.

**Independent Test**: Can be fully tested by loading `/progress` and confirming
the latest weight is shown, the entry list renders newest-first, and logging a
new weight appears in the list (session-scoped).

**Acceptance Scenarios**:

1. **Given** mock weight entries exist, **Then** the Progress page shows the most
   recent weight prominently (value + unit) and a newest-first list of weight
   entries with their dates.
2. **Given** the user enters a valid weight and confirms, **Then** the new entry
   appears at the top of the list and the latest-weight readout updates.
3. **Given** no weight entries exist, **Then** the section shows a designed empty
   state ("No weight entries yet") instead of a blank region.

---

### User Story 2 - Viewing Body Measurements (Priority: P1)

A user sees their recent body measurements (chest, waist, arms, hips, thighs)
as values per measuring session, latest session first.

**Why this priority**: Body measurements are an explicit Day 2.1 feature and give
progress context that weight alone cannot.

**Independent Test**: Can be fully tested by loading `/progress` and confirming
the measurement fields render with latest-session values and units.

**Acceptance Scenarios**:

1. **Given** a latest measurement session exists, **Then** the five standard
   measures (chest, waist, arms, hips, thighs) render with values and `cm`.
2. **Given** sessions from multiple dates exist, **Then** the latest session is
   shown first and trailing sessions are reachable without horizontal scroll.
3. **Given** no measurement data exists, **Then** a designed empty state renders
   instead of blank fields.

---

### User Story 3 - Reading the Weight Progress Graph (Priority: P2)

A user views a weight-progress graph over time (line/area) with readable dates,
so the trend (down/up/flat) is visible at a glance.

**Why this priority**: Trend visualization is the "why is my effort working"
answer and is the flagship graph of the Progress page.

**Independent Test**: Can be fully tested by confirming the graph renders points
for each entry with a line connecting them and shows an empty state with no data.

**Acceptance Scenarios**:

1. **Given** at least two weight entries, **Then** the weight graph plots the
   series (weight vs. date) with markers and a connecting line.
2. **Given** exactly one weight entry, **Then** the graph shows that value as a
   marker/point with its label (NOT an empty state).
3. **Given** no weight entries, **Then** the graph shows a designed empty state
   ("No weight entries yet") and never a broken or empty axes.

---

### User Story 4 - Reading the Workout Performance Graph (Priority: P2)

A user views a workout-performance graph (e.g. weekly total volume or sessions)
showing effort over recent weeks.

**Why this priority**: Performance trend ties training output to the Progress
goal; it is the second commissioned graph.

**Independent Test**: Can be fully tested by confirming the performance graph
renders per-week values from its data and its empty state when empty.

**Acceptance Scenarios**:

1. **Given** weekly performance data, **Then** per-week values render as bars (or
   line) with a caption/label for each week.
2. **Given** no performance data, **Then** the graph shows a designed empty state.

---

### User Story 5 - Reviewing Strength / Progression History (Priority: P2)

A user sees their strength history: recorded best lifts / progression records
(exercise, weight lifted, date, sets/reps) newest first.

**Why this priority**: Strength history demonstrates progression concretely and
closes the Progress-page content requirements.

**Independent Test**: Can be fully tested by confirming the strength-history list
renders each record (exercise, value, date) and its empty state.

**Acceptance Scenarios**:

1. **Given** strength records exist, **Then** each shows exercise name, best
   value (e.g. `95 kg`), date, and sets/reps, newest first.
2. **Given** no strength records, **Then** a designed empty state renders.

---

### User Story 6 - Setting and Tracking Personal Goals (Priority: P1)

A user opens the **Goals page** and sees their personal goals as cards, each with
a progress bar (`current/target`), a completion-status indicator, a target date,
and milestones.

**Why this priority**: Personal goals with progress bars and completion status
are the headline of the Goals page and the motivating core of Day 2.1.

**Independent Test**: Can be fully tested by loading `/goals` and confirming each
goal card shows title, progress bar at the correct fill, current/target, status
pill, and target date.

**Acceptance Scenarios**:

1. **Given** goal data, **Then** each goal card renders its title, category, a
   progress bar whose fill equals `current/target` clamped to 0-100%, the
   current/target readout, and the target date.
2. **Given** a goal whose `current >= target` (or `completedAt` set), **Then** the
   status reads **completed** (accent styling).
3. **Given** an uncompleted goal whose `targetDate` is in the past, **Then** the
   status reads **missed** (warning styling).
4. **Given** an open goal still within its target date, **Then** the status reads
   **on-track** (success styling).
5. **Given** no goals exist, **Then** the Goals page shows a designed empty state
   ("No goals yet") and does not render blank.

---

### User Story 7 - Tracking Milestones Inside a Goal (Priority: P2)

A user can see, within each goal card, its milestones (e.g. "50% — 60 kg") each
marked reached or pending.

**Why this priority**: Milestones make long goals feel incremental and are an
explicit Day 2.1 feature; they are owned by their goal, not standalone.

**Independent Test**: Can be fully tested by confirming a goal with milestones
shows each milestone with a reached/pending visual, and goals without milestones
show none (no empty-block strains).

**Acceptance Scenarios**:

1. **Given** a goal with milestones, **Then** each milestone shows its title and a
   reached (checked/accent) or pending (muted) indicator based on progress.
2. **Given** a goal's progress reaches a milestone threshold, **Then** that
   milestone renders as reached, never partially.
3. **Given** a goal without milestones, **Then** no milestone area renders for it.

---

### User Story 8 - Using the Streak System (Priority: P2)

A user sees their current streaks (e.g. Workout, Check-in) with the current count,
the best count, and correct handling when a streak is broken or empty.

**Why this priority**: Streaks are a motivational feedback loop and the final
Day 2.1 feature; they need truthful computation, not fabricated numbers.

**Independent Test**: Can be fully tested by confirming streak cards show current
count + best, that a broken streak (gap > cadence) shows the current streak
resets/broken state, and zero/empty data renders a valid state, never blank.

**Acceptance Scenarios**:

1. **Given** logged dates forming consecutive days up to today, **Then** the
   current streak equals the number of consecutive days and the best streak shows
   the historical maximum.
2. **Given** the most recent logged date is older than the cadence window,
   **Then** the current streak renders as broken (e.g. "0 days — start today")
   while the best streak is preserved.
3. **Given** no streak data at all, **Then** a designed empty state renders.

---

### User Story 9 - Graceful Empty, Loading, and Error States (Priority: P3)

A user never sees a blank or broken region: every data-driven section on both
pages shows a designed empty state, a loading state, and a friendly error state.

**Why this priority**: Matches Day 1.1 behaviour; robustness is a completion
gate for the phase.

**Independent Test**: Can be fully tested by rendering each section with no data
(empty), a pending load (loading), and a simulated failure (error), confirming
none render blank/broken/NaN.

**Acceptance Scenarios**:

1. **Given** no data, **Then** each section renders a consistent empty state
   (icon + short message, e.g. "No weight entries yet").
2. **Given** a section is loading, **Then** a spinner/skeleton is shown.
3. **Given** a section fails, **Then** a friendly message shows — never a stack
   trace.

---

### User Story 10 - Regression on Day 1.1 and Responsive Behaviour (Priority: P3)

The existing Day 1.1 dashboard and the new pages remain fully usable across
desktop, tablet, and mobile without horizontal scrolling.

**Why this priority**: "Do not break Day 1.1" and "fully responsive" are explicit
constraints that gate the whole phase.

**Independent Test**: Can be fully tested by loading `/` (Day 1.1 dashboard
renders unchanged) and resizing `/progress` and `/goals` through desktop, tablet,
and mobile widths.

**Acceptance Scenarios**:

1. **Given** the app is loaded at `/`, **Then** the Day 1.1 dashboard renders
   unchanged (sections, charts, empty states, Quick Log).
2. **Given** tablet width, **Then** the layout reflows (sidebar to icon rail or
   toggle, charts/columns reduce) with no horizontal scroll.
3. **Given** mobile width, **Then** the layout stacks to a single column with no
   horizontal scroll and the sidebar becomes a drawer.

### Edge Cases

- Empty data for one section must not break other sections (isolation).
- Zero/present-but-null target on a goal must show "No goal set" (0-width bar +
  caption), never `NaN%` or a division error.
- A chart with a single point must render that point (marked+labelled), not an
  empty state; zero points renders the empty state.
- Goal progress must clamp to exactly 0-100 (never 135% or -5%).
- Milestones always reached in threshold order; a later milestone can never be
  reached while an earlier one is pending.
- A broken streak keeps its best value; only `current` resets.
- Logging a weight with an invalid/empty value must not corrupt the list.
- Very long goal/exercise names must truncate (ellipsis), not overflow cards.
- Rapid viewport resizing must not leave the layout inconsistent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a **Progress page** reachable from navigation
  (tab and/or sidebar) that renders inside the existing dark layout shell.
- **FR-002**: The Progress page MUST show **weight tracking**: latest weight
  (value + unit), a newest-first history list (date + value), and a way to log a
  new weight (local session state only).
- **FR-003**: The Progress page MUST show **body measurements**: chest, waist,
  arms, hips, and thighs in `cm`, latest session first.
- **FR-004**: The Progress page MUST render a **weight progress graph** (line/
  area) of weight over time, with the empty/single-point rules in FR-013.
- **FR-005**: The Progress page MUST render a **workout performance graph** of
  weekly volume or sessions with per-week captions.
- **FR-006**: The Progress page MUST render a **strength / progression history**
  list (exercise name, best value, date, sets/reps) newest first.
- **FR-007**: The app MUST provide a **Goals page** reachable from navigation
  that renders inside the existing dark layout shell.
- **FR-008**: The Goals page MUST show **personal goals** as cards, each with
  title, category, progress bar (current/target, clamped 0-100), current/target
  readout, target date, and a completion-status indicator.
- **FR-009**: Goal completion status MUST be derived, never hand-entered, and be
  exactly one of **on-track | completed | missed** per the rules in the Goals
  System section.
- **FR-010**: Each goal MAY have **milestones** rendered inside its card, each
  shown reached or pending per the Milestone rules.
- **FR-011**: The Goals page MUST display the **streak system** (current + best
  count per streak type) with correct broken and empty behaviour.
- **FR-012**: Every data-driven section on both pages MUST have a designed empty
  state, a loading state, and a friendly error state (never blank/broken/NaN).
- **FR-013**: Charts MUST behave as specified: zero points → empty state; exactly
  one point → rendered point with label; >= 2 points → full series.
- **FR-014**: Both pages MUST reuse the Day 1.1 dark theme, layout shell, and
  `ui/` primitives; no new runtime dependencies.
- **FR-015**: Both pages MUST be fully responsive with no horizontal scroll at
  desktop, tablet, or mobile widths.

### Project Structure Updates

All new work is **additive** inside the existing `frontend/src/` workspace:

```text
frontend/src/
├── App.jsx                     # ADD two routes: /progress, /goals (standalone,
│                               #   same pattern as the Day 1.1 "/" route)
├── components/
│   ├── progress/               # NEW folder (sections for both pages)
│   │   ├── WeightTracker.jsx
│   │   ├── Measurements.jsx
│   │   ├── WeightChart.jsx
│   │   ├── PerformanceChart.jsx
│   │   ├── StrengthHistory.jsx
│   │   ├── GoalsList.jsx
│   │   ├── GoalCard.jsx
│   │   ├── Milestones.jsx
│   │   ├── StreakRow.jsx
│   │   ├── StreakStat.jsx
│   │   └── StatusBadge.jsx
│   ├── layout/                 # EXISTING — reused (Sidebar, TopNavbar,
│   │                           #   DashboardLayout) UNCHANGED
│   └── ui/                     # EXISTING — reused (Card, ProgressBar,
│                               #   EmptyState, Spinner, index barrel) UNCHANGED
├── pages/
│   ├── Progress.jsx            # NEW — /progress composition
│   └── Goals.jsx               # NEW — /goals composition
├── data/
│   ├── progressData.js         # NEW — weight entries, measurements,
│   │                           #   performance, strength history (+ EMPTY variant)
│   ├── goalsData.js            # NEW — goals + milestones, streaks (+ EMPTY variant)
│   └── constants.js            # ADD — MEASUREMENT_FIELDS, GOAL_CATEGORIES,
│                               #   STREAK_TYPES (keep existing values intact)
└── utils/
    ├── progressUtils.js        # NEW — pure goal/progress math
    └── streakUtils.js          # NEW — pure streak math
```

Integration rules:

- `/progress` and `/goals` render `<Progress />` / `<Goals />` directly inside
  `DashboardLayout` (same standalone wiring as `/` → `<Dashboard />`). No auth
  `Layout`/`ProtectedRoute` wrapper is added or changed.
- Navigation: the existing tab/menu structures gain entries that navigate to
  `/progress` and `/goals`. Implemented tabs use real routes; unimplemented tabs
  stay inert placeholders (Day 1.1 behaviour).
- Day 1.1 files are only touched if strictly additive; `index.css` may gain
  utility/token classes only, `constants.js` may gain exports only.

### Data Shapes

All mock data lives in `data/progressData.js` and `data/goalsData.js`. Every
shape below has a FILLED and an EMPTY example.

**Weight entry** (weight tracking)

```js
{ id: "w1", date: "2026-09-01", weightKg: 78.5 }
```

Filled list: 4+ entries, oldest→newest dates. Empty: `[]`.

**Body measurement** (one object per session)

```js
{ id: "m1", date: "2026-09-01", chestCm: 101, waistCm: 88, armsCm: 38, hipsCm: 98, thighsCm: 60 }
```

All measures optional; a measure with no value is omitted from the object. Filled:
2-3 sessions; Empty: `[]`.

**Workout performance** (per-week aggregate)

```js
{ id: "p1", week: "2026-08-31", totalVolumeKg: 12400, sessions: 4 }
```

Filled: 4+ weeks oldest→newest. Empty: `[]`.

**Strength / progression record**

```js
{ id: "s1", exercise: "Bench Press", date: "2026-09-05", prKg: 95, sets: 4, reps: 8 }
```

Filled: 3+ records; newest first when rendered. Empty: `[]`.

**Goal** (personal goal with nested milestones)

```js
{
  id: "g1",
  title: "Squat 120 kg",
  category: "strength",
  targetValue: 120,
  currentValue: 110,
  unit: "kg",
  startDate: "2026-06-01",
  targetDate: "2026-10-15",
  completedAt: null,          // set to an ISO date when completed
  milestones: [
    { id: "ms1", title: "50% — 60 kg", threshold: 50, reachedAt: "2026-07-10" },
    { id: "ms2", title: "75% — 90 kg", threshold: 75, reachedAt: null }
  ]
}
```

Filled: 3-4 goals covering at least one `on-track`, one `completed`, one
`missed`, and at least one goal with milestones; one goal with empty milestones.
Empty: `[]`.

**Streak** (display-level record)

```js
{ key: "workout", label: "Workout Streak", current: 12, best: 21, unit: "days" }
```

Filled: 2-3 streak types (e.g. workout, check-in), including one with
`current: 0` (broken) to exercise the broken state. Empty: `[]`.

### Component Breakdown

| Component | File | Responsibility |
|-----------|------|----------------|
| Progress page | `pages/Progress.jsx` | Composes the Progress-page sections inside `DashboardLayout`, owns page-level state, passes data/handlers down. |
| Goals page | `pages/Goals.jsx` | Composes the Goals-page sections inside `DashboardLayout`, owns page-level state. |
| WeightTracker | `components/progress/WeightTracker.jsx` | Latest-weight readout + quick-add input + newest-first entry list. Handles session-scoped add. |
| Measurements | `components/progress/Measurements.jsx` | Latest measurement session values (`cm`). |
| WeightChart | `components/progress/WeightChart.jsx` | Hand-rolled line/area chart of weight over time (empty/single/multi behaviour, FR-013). |
| PerformanceChart | `components/progress/PerformanceChart.jsx` | Hand-rolled weekly performance chart (bars or line) with week captions. |
| StrengthHistory | `components/progress/StrengthHistory.jsx` | Newest-first strength/progression records list. |
| GoalsList | `components/progress/GoalsList.jsx` | Responsive grid of `GoalCard`s; renders the empty state when no goals. |
| GoalCard | `components/progress/GoalCard.jsx` | One goal: title, category, `StatusBadge`, progress bar + current/target, target date, embedded `Milestones`. |
| Milestones | `components/progress/Milestones.jsx` | Milestone checklist (reached/pending) for one goal; renders nothing when a goal has no milestones. |
| StreakRow | `components/progress/StreakRow.jsx` | Wrapping row of `StreakStat` cards; renders the empty state when no streaks. |
| StreakStat | `components/progress/StreakStat.jsx` | One streak: icon + prominent current count + unit, secondary "Best: N"; handles `current: 0` broken display. |
| StatusBadge | `components/progress/StatusBadge.jsx` | Pill showing goal status: on-track / completed / missed / no-goal. |

### Progress Page Layout

Order and arrangement (matches Day 1.1 card language; responsive grids):

1. **Page heading** — "Progress" title with the current date (reuses the
   greeting styling).
2. **Two-column summary row** (`sm:grid-cols-2`):
   - **Weight tracking card** — "Latest Weight" big number (`dash-num`), a
     quick-add input + button ("Log weight"), and the newest-first entry list.
   - **Body measurements card** — the five measures (chest, waist, arms, hips,
     thighs) with `cm` and latest-session values.
3. **Charts row** (`xl:grid-cols-3`):
   - **Weight progress graph** (`xl:col-span-2`).
   - **Workout performance graph** (`xl:col-span-1`).
4. **Strength / progression history** — full-width section below the charts
   (newest first).

The Goals page renders on its own tab:

1. **Page heading** — "Goals" title + current date.
2. **Streak row** — full-width wrapping row of `StreakStat` cards.
3. **Goals grid** — `sm:grid-cols-2 lg:grid-cols-3` grid of `GoalCard`s with the
   empty state when none.

### Graphs & Visualizations

- All graphs are **hand-rolled SVG** reusing the Day 1.1 approach: `viewBox`
  scaling, `w-full`, no overflow, `role="img"` + `aria-label`.
- **Weight progress graph**: x = date, y = weightKg.
  - 0 points → `EmptyState` ("No weight entries yet").
  - 1 point → a single labelled marker/value (its date + value), NOT empty.
  - ≥ 2 points → line/area series with point markers; each point has a `title`
    (date + value) for hover.
- **Workout performance graph**: weekly `totalVolumeKg` (or sessions).
  - 0 points → `EmptyState`.
  - ≥ 1 point → bars (or line) per week with a week caption; values in `title`.
- **Strength / progression history**: a list, not a chart; newest first; each
  row shows exercise, `prKg` + unit, date, sets/reps. 0 records → `EmptyState`.
- Chart colors use theme tokens (accent line/fill, panel background, ink
  captions). No library colors, no hardcoded hexes.

### Goals System

- **Progress calculation** — `progressPct(current, target)` on
  `utils/progressUtils.js`: integer 0-100 clamped. `target <= 0` or missing →
  returns `null`; the card renders a 0-width bar + "No goal set" caption (never
  `NaN%`).
- **Completion status** — `goalStatus(goal)` derives from data only:
  - `completed` when `currentValue >= targetValue` OR `completedAt` is set.
  - `missed` when not completed AND `targetDate` is in the past.
  - `on-track` otherwise.
- **Milestones** — each milestone has a `threshold` (0-100). A milestone is
  reached when `progressPct >= threshold` OR its `reachedAt` is set. Reached =
  checked/accent; pending = muted. Milestones render inside their goal card only;
  goals with no milestones render no milestone area. Milestones always reach in
  threshold order.
- **Status indicator** — `StatusBadge` pill: `on-track` = success (green),
  `completed` = accent (lime), `missed` = warning (amber), `no-goal` = muted
  (gray) — using the theme's semantic colors only.

### Streak System

- **Calculation** — `computeStreak(dates, { cadenceDays = 1 })` on
  `utils/streakUtils.js` (pure): sort unique `YYYY-MM-DD` dates ascending; walk
  backwards from the most recent date; count consecutive dates while each gap is
  ≤ `cadenceDays`; a gap larger than `cadenceDays` breaks the current streak.
  Returns `{ current, best, active }` where `active = false` when the most recent
  date is older than the cadence window (broken).
- **Display** — each `StreakStat` shows an icon, a prominent current count +
  unit (e.g. "12 days"), and a secondary "Best: N". When real dates are
  available the workout streak MUST be derived via `computeStreak`; otherwise the
  mock `current`/`best` values flow through the same formatting helpers.
- **Broken streak** — when `active = false` or `current = 0`, the card renders
  the current streak as resets e.g. "0 days — start today" (never blank), while
  `best` is preserved.
- **Empty** — no streak data → designed `EmptyState` ("No streak data yet").

### State Management

- Mock data is imported from `data/progressData.js` and `data/goalsData.js` and
  is the single source of truth for initial render (never re-created in
  components).
- Each page owns its slices with `useState`: `weightEntries` (and a piece of
  session-added entries), plus whatever sections need to mutate locally.
- Section components are **props-driven** (data + optional handlers), matching
  Day 1.1 patterns (`SummaryCards`, `ProgressCards`).
- If two components must share a slice (e.g. quick-add must update both the
  latest-weight readout and the list), the state lives in the page and both get
  it via props. No Context is required for these two pages; if a later page
  needs it, one `Context` in `context/` is acceptable — never a state library.
- Derivation (progress %, status, milestones, streaks) happens in `utils/` pure
  functions; components only render and format.

### UI & Design Rules

- **Theme consistency**: same dark palette (deep charcoal surfaces, elevated
  `dash-card`, `#161b22‑family` panels, muted borders), lime `--color-accent`,
  `dash-num` headline numerals, and 4px spacing scale as Day 1.1. Reuse
  `ui/Card`, `ui/ProgressBar`, `ui/EmptyState`, `ui/Spinner`.
- **Progress bars**: reuse `ui/ProgressBar`; accent fill on track, muted track;
  0/`null` goal → empty bar + "No goal set" caption.
- **Status indicators**: `StatusBadge` pill only, using theme semantic colors
  (success/accent/warning/muted) — no invented color meanings.
- **Numbers**: weight/measurements to one decimal (`78.5 kg`, `88.0 cm`); volumes
  with thousands separators (`12,400 kg`); streak counts as integers + unit.
- **Typography/naming**: long goal/exercise names `truncate` with ellipsis.
- **Responsive**: desktop full layout; tablet reflows (columns reduce, sidebar
  to icon rail/toggle); mobile single column, sidebar drawer, no horizontal
  scroll at any width.
- **Accessibility**: real `<button>`/`<input>` semantics, `aria-label` on
  icon-only controls, `role="img"` + `aria-label` on SVG charts, visible
  focus-visible rings in accent color.

### Key Entities

- **WeightEntry**: a dated body-weight reading (`date`, `weightKg`).
- **BodyMeasurement**: a dated session of optional per-site measures in `cm`
  (chest, waist, arms, hips, thighs).
- **PerformancePoint**: a per-week aggregate (week, total volume, session count).
- **StrengthRecord**: a dated best-effort lift (exercise, `prKg`, sets, reps).
- **Goal**: a personal target (title, category, target/current + unit, start and
  target dates, completion flag) owning a list of **Milestones** (threshold +
  reached date). A goal's status is derived, never stored as a free string.
- **Streak**: a counted consecutive-day run for a behaviour (label, current,
  best, unit), computed/validated via the streak rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An existing user can reach both pages from navigation and see every
  required section render with mock data in under 2 seconds from page load.
- **SC-002**: 100% of the sections in FR-001 through FR-015 are present and
  fulfill their acceptance scenarios on the rendered pages.
- **SC-003**: Every data-driven section demonstrates a designed empty state, a
  loading state, and a friendly error state; none can render blank, broken, or
  `NaN`.
- **SC-004**: Goal progress bars fill exactly to the clamped 0-100 percentage; a
  non-positive/no target goal renders the "No goal set" state; goal statuses are
  exactly `on-track | completed | missed` and match the rules in all mock goals.
- **SC-005**: Streak counts match `computeStreak` results for the mock date
  data; a gap breaks the current streak while preserving `best`; `current = 0`
  renders a valid "start today" state.
- **SC-006**: No regression on the Day 1.1 dashboard at `/` (sections, charts,
  Quick Log, empty states) after adding the new routes.
- **SC-007**: At desktop, tablet, and mobile widths both new pages are usable
  with zero horizontal scrolling and all controls reachable.
- **SC-008**: The new pages visually match the Day 1.1 dark design language
  (tokens, cards, accent, typography, spacing) without a visible style break.

### Definition of Done (Day 2.1 Checklist)

- [ ] `/progress` renders inside the existing `DashboardLayout` (dark shell).
- [ ] Weight tracking: latest weight, newest-first list, quick-add (session
      state), and empty state all work.
- [ ] Body measurements: five measures in `cm`, latest session first, empty
      state works.
- [ ] Weight progress graph: 0 / 1 / ≥2 point behaviours per FR-013.
- [ ] Workout performance graph: per-week values + captions + empty state.
- [ ] Strength / progression history: newest-first list + empty state.
- [ ] `/goals` renders inside the existing `DashboardLayout`.
- [ ] Goal cards: title, category, progress bar (0-100 clamped), current/target,
      target date, derived status badge.
- [ ] Status derivations verified across `on-track`, `completed`, `missed`, and
      the `no-goal` (target ≤ 0) states.
- [ ] Milestones render reached/pending per threshold inside their goal card.
- [ ] Streaks show current + best; broken (0/active=false) and empty states
      verified.
- [ ] Every section has empty / loading / error states (none blank/broken/NaN).
- [ ] Responsive at desktop / tablet / mobile with no horizontal scroll.
- [ ] Day 1.1 `/` dashboard regression check passes.
- [ ] All files `.js`/`.jsx`; no new runtime dependencies; `npm run build` clean;
      manual browser verification recorded.

## Out of Scope

- Backend, API, or database changes of any kind (no models, routes, controllers,
  services, or server-side stats/aggregation).
- Real authentication, registration, or login behavior; protecting `/progress`
  and `/goals` behind auth (they render standalone with mock data).
- TypeScript adoption, conversion of existing files, or `tsconfig` changes
  governing the frontend.
- Real persistence, sync, import/export (CSV, Fitbit, Apple Health), or device
  integrations.
- Notifications, reminders, push, email, social sharing, or leaderboards.
- Advanced analytics: one-rep-max estimation beyond recorded lifts, trend
  forecasting, machine-learning coaching, body-composition estimation.
- Goal/measurement creation-and-management UI beyond the mock goal list and the
  session-scoped quick-add described here.
- New charting, date, or state libraries.
- Automated test suite and CI for the frontend (optional smoke check only).
- Deployment or production hosting.

These MUST NOT be silently added to Day 2.1; open a new spec if one is required.