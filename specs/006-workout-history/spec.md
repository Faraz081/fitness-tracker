# Feature Specification: Activities & Workout History

**Feature Branch**: `006-workout-history`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "/sp.specify — Using the Day 3.1 constitution for Activities & Workout History, create a detailed Specification (Spec)."

## Overview

This feature extends the Fitness Tracker with a complete **Activities & Workout
History** section, continuing the existing modern dark dashboard (Day 1.1) and
the Progress & Goals pages (Day 2.1). Users can review their full workout
history, open a single workout to see its detail, browse per-exercise history
with sets/reps/weight progression, filter the history by workout category and
date, see derived personal records / best performance, and view improved workout
cards — all inside the existing dashboard layout, using only `.js` and `.jsx`
files and the established dark visual language.

This is a **frontend-only, mock-data** phase. It reuses the existing
`DashboardLayout` (Sidebar + TopNavbar), UI primitives, and design tokens. No
backend, real API, authentication wiring, TypeScript, or new runtime dependency
is introduced. It must not break or regress the Day 1.1 dashboard or the Day 2.1
Progress & Goals pages.

## User Scenarios & Testing *(mandatory)*

The following user stories are prioritized by user value and are each
independently testable so a working MVP can be delivered incrementally.

### User Story 1 - View the Complete Workout History (Priority: P1)

The user opens the Workout History page and sees their full list of recorded
workouts, newest first, presented as improved workout cards inside the existing
dashboard shell.

**Why this priority**: Browsing the entire workout history is the core value of
the feature and the entry point for everything else (detail view, filtering,
personal records). Without it the remaining stories have nothing to attach to.

**Independent Test**: Can be fully tested by navigating to the Workout History
page and confirming every recorded workout is rendered newest-first as a card
showing its name, category, date, and summary, plus the designed empty state when
there is no history.

**Acceptance Scenarios**:

1. **Given** the user has recorded workouts, **When** they open the Workout
   History page, **Then** all workouts render as cards ordered newest-first by
   date.
2. **Given** the user has recorded workouts, **When** they open the Workout
   History page, **Then** each card shows the workout name, category, date, and a
   summary (e.g. exercise count / total sets, and total volume where weighted).
3. **Given** the user has no workouts recorded, **When** they open the Workout
   History page, **Then** a designed empty state is shown (e.g. "No workouts
   recorded yet") rather than a blank region.
4. **Given** the Workout History page is loading, **When** the page is first
   opened, **Then** a loading state (spinner/skeleton) is shown.

---

### User Story 2 - Filter the Workout History (Priority: P1)

The user can narrow the workout history by workout category and/or by date
(quick ranges or a custom from/to range), combined together, to find specific
workouts.

**Why this priority**: Filtering is what makes history usable as the list grows;
category and date filters are the two dimensions explicitly required and they
compose into one search experience.

**Independent Test**: Can be fully tested by applying a category filter, then a
date filter, then both together, and confirming the list updates to show only
matching workouts, including a distinct "no matches" empty state.

**Acceptance Scenarios**:

1. **Given** the user is on the Workout History page, **When** they select a
   workout category, **Then** only workouts of that category are shown.
2. **Given** the user is on the Workout History page, **When** they select a date
   range (quick range or custom from/to), **Then** only workouts within that
   range are shown.
3. **Given** the user has selected both a category and a date range, **When**
   both filters are active, **Then** only workouts matching BOTH criteria are
   shown (combined / AND behavior).
4. **Given** the active filters match no workouts, **When** the list would be
   empty, **Then** a distinct "No workouts match your filters" empty state with a
   clear-filters action is shown (different from the no-workouts-at-all state).
5. **Given** the user has applied filters, **When** they clear them, **Then** the
   full newest-first history is restored.

---

### User Story 3 - View a Single Workout's Detail (Priority: P2)

From any workout card, the user opens a dedicated detail view showing the
workout's full information and every exercise with its sets, reps, and weight,
plus the navigational path back to the history.

**Why this priority**: Detail view makes each workout's record readable and is a
natural next step after browsing; it also surfaces the sets/reps/weight history
required by the feature. It is P2 because it depends on the history list from
US1 but can be delivered independently.

**Independent Test**: Can be fully tested by clicking a workout card, confirming
the detail view renders the workout header and each exercise with sets/reps/
weight, and that an unknown workout id shows a "not found" empty state with a
back link.

**Acceptance Scenarios**:

1. **Given** the user sees a workout card, **When** they open the workout, **Then**
   a detail view shows the workout name, category, date, optional notes, and a
   list of exercises.
2. **Given** the workout has exercises, **When** the detail view renders, **Then**
   each exercise shows its name, sets, reps, and weight (or "Bodyweight"), and
   its derived volume where a weight exists.
3. **Given** an unknown workout id is requested, **When** the detail view cannot
   find the workout, **Then** a friendly "Workout not found" empty state with a
   back-to-history link is shown.
4. **Given** the user is in the detail view, **When** they activate the back
   action, **Then** they are returned to the Workout History page.

---

### User Story 4 - Browse Exercise History and Personal Records (Priority: P3)

The user opens the Exercise History page to see, for each exercise, its
progression across all workouts (sets/reps/weight over time), and the derived
best performance / personal records, without entering any record values
manually.

**Why this priority**: Personalized exercise history with best performance is
valuable but builds on the workout data model established by US1–US3, so it is
the final vertical slice.

**Independent Test**: Can be fully tested by opening the Exercise History page,
confirming per-exercise progression (sets/reps/weight) is listed, and that the
best lift and best set shown are derived from the workout data (never entered
by the user), with an empty state when an exercise has no weighted history.

**Acceptance Scenarios**:

1. **Given** the user has workouts with exercises, **When** they open the
   Exercise History page, **Then** exercises are listed with their progression
   across workouts (sets/reps/weight over time).
2. **Given** an exercise has weighted history, **When** the Exercise History
   page renders, **Then** a Personal Records panel shows that exercise's best
   lift and best set derived from the history.
3. **Given** an exercise has no weighted history, **When** the Personal Records
   panel would be empty, **Then** a "No personal records yet" empty state is shown
   (never `0 kg` or `NaN`).
4. **Given** the user has no exercise history, **When** the Exercise History page
   opens, **Then** a designed "No exercise history yet" empty state is shown.

---

### Edge Cases

- What happens when a workout has no exercises? The detail view renders the
  workout header with a "No exercises in this workout" empty state, and the card
  count shows zero.
- What happens when filters match no workouts? A distinct "No workouts match
  your filters" empty state appears, separate from the no-workouts-at-all state.
- What happens when an unknown workout id is opened? A "Workout not found"
  empty state with a back link; the app never crashes.
- How are bodyweight exercises handled in calculations? Exercises with weight
  `0`/`undefined` are treated as bodyweight; they are excluded from derived
  best-lift/volume records but still counted as part of the exercise count.
- How is the empty history distinguished from a filtered-empty history? Two
  distinct empty states: one for "no data at all" and one for "no matches for
  the current filters", the latter offering a clear-filters action.
- What happens when the date range has no bound? Absent bounds are treated as
  unbounded (i.e. all dates in that direction).

## Requirements *(mandatory)*

### Functional Requirements

#### FR-001: Workout History List
The system MUST show the complete list of the user's workouts, newest-first by
date, as interactive workout cards on the Workout History page.

#### FR-002: Improved Workout Cards
Each workout card MUST display the workout name, category, date, and a summary
(exercise count and/or total sets, and total volume where weighted). Each card
MUST be an interactive link to that workout's detail view and MUST be
keyboard-accessible with a visible focus state.

#### FR-003: Workout Categories
The system MUST support a fixed set of workout categories (strength, cardio,
flexibility, hybrid, other). Each workout MUST belong to exactly one category,
and every category MUST have a stable display label and a distinct visual
indicator (badge color).

#### FR-004: Category Filtering
The user MUST be able to filter the workout history by a single workout category,
including an option to show all categories.

#### FR-005: Date-Based Filtering
The user MUST be able to filter the workout history by date using quick ranges
(All, This Week, This Month, Last 3 Months) and/or a custom inclusive from/to
date range.

#### FR-006: Combined Filtering
When both a category and a date filter are active, the system MUST show only
workouts matching BOTH criteria (AND behavior). Filtering MUST produce a new,
correctly-ordered result set and MUST NOT mutate the underlying workout data.

#### FR-007: Filter Empty State
When no workouts match the active filters, the system MUST show a distinct "No
workouts match your filters" empty state with a clear-filters action, separate
from the no-workouts-at-all state.

#### FR-008: Workout Detail View
The system MUST provide a detail view for a single workout showing its name,
category, full date, optional notes, and its exercises with each exercise's name,
sets, reps, and weight (or "Bodyweight"), plus derived per-exercise volume where
a weight exists.

#### FR-009: Detail Not Found
When a requested workout does not exist, the system MUST show a "Workout not
found" empty state with a link back to the history, rather than failing.

#### FR-010: Back to History
The detail view MUST provide a clear navigation action to return to the Workout
History page.

#### FR-011: Exercise History
The system MUST provide an Exercise History view where, for an exercise, the
user can see its recorded progression across workouts (sets, reps, weight over
time).

#### FR-012: Personal Records / Best Performance
The system MUST derive and display personal records/best performance from the
workout data: the best lift (highest weight), the best set (highest set volume),
and, where meaningful, total workout volume. These values MUST be derived —
never entered or stored by the user.

#### FR-013: PR Empty State
When an exercise has no weighted history, the Personal Records panel MUST show a
"No personal records yet" empty state, never a zero or invalid number.

#### FR-014: Empty / Loading / Error States
Every data-driven section MUST show a designed empty state (no data), a loading
state (spinner/skeleton), and a friendly error message (never a stack trace)
when the data source fails.

#### FR-015: Responsive Behaviour
The Workout History, Detail, and Exercise History views MUST be fully responsive
with no horizontal page scroll at any breakpoint; grids reflow/stack on smaller
screens.

#### FR-016: Reuse of Existing Dashboard
The new pages MUST render inside the existing dashboard shell (Sidebar +
TopNavbar) and reuse the established dark theme, design tokens, and UI
primitives. The Day 1.1 dashboard and Day 2.1 Progress & Goals pages MUST remain
unchanged and functional (no regression).

#### FR-017: Navigation Integration
The new pages MUST be reachable from the existing navigation. Adding a
"History"/"Activities" entry to the sidebar/top-nav is allowed; existing nav
entries MUST NOT be removed or repurposed. Any tab without an implemented page
stays an inert placeholder.

### Key Entities

- **Workout**: A recorded training session owned by the user, with a name, a
  single category, a date, optional notes, and a set of embedded exercises.
- **Exercise**: A sub-item of a workout describing one performed lift/activity,
  with a name, sets, reps, an optional weight, and optional notes.
- **Category**: A fixed classification of workouts (strength, cardio,
  flexibility, hybrid, other) used for grouping and filtering.
- **Workout Card**: The improved, reusable presentation unit for a workout
  within the history list.
- **Personal Record / Best Performance**: Derived metrics (best lift, best set,
  best/current volume) computed from the workout/exercise data, never stored.
- **Filters (Category + Date)**: Derived selection criteria used to narrow the
  workout history; the selected category and date range.

## Assumptions

- The phase is **frontend-only with local mock data**, matching Day 1.1 and Day
  2.1. No backend, API call, authentication, or persistence is introduced.
- All code is **`.js` and `.jsx` only** (no TypeScript), per the constitution's
  JavaScript-only override extended to Day 3.1.
- The existing `DashboardLayout` shell (Sidebar + TopNavbar), `ui/` primitives
  (`Card`, `Badge`, `EmptyState`, `Spinner`, `Skeleton`, `Select`, `Input`), and
  dark design tokens are reused as-is; no new runtime dependency is added.
- Workout `date` values are `YYYY-MM-DD` strings so filtering is a simple,
  reliable string comparison consistent with Day 2.1.
- "Best lift" is the highest recorded `weightKg` for an exercise (ignoring
  bodyweight records); "best set" is the single set with the highest volume
  (`sets × reps × weightKg`).
- The Workout History, Detail, and Exercise History pages render as standalone
  routes inside the dashboard layout, mirroring how `/progress` and `/goals`
  render in Day 2.1, and do not touch the existing auth-phase `/workouts*`
  CRUD routes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their entire workout history on the Workout History
  page, ordered newest-first, with every workout presented as a card.
- **SC-002**: Users can filter the history by category, by date (quick or custom
  range), and by both together, and see the list update immediately to matching
  workouts in the correct order.
- **SC-003**: Users can open any workout card and reach a detail view showing the
  workout's name, category, date, notes, and each exercise's sets/reps/weight
  within one click-step.
- **SC-004**: Users can view per-exercise progression and derived personal
  records (best lift, best set) on the Exercise History page without keying in
  any record value.
- **SC-005**: 100% of data-driven sections have a designed empty state, loading
  state, and friendly error state — no section renders blank, broken, or with
  invalid numbers.
- **SC-006**: All three new views are fully responsive at desktop, tablet, and
  mobile with no horizontal scroll, and the Day 1.1 dashboard and Day 2.1
  Progress & Goals pages still render correctly (no regression).

## Out of Scope

The following are NOT part of this feature and MUST NOT be built:

- Any backend, API, database, model, route, or server-side logic change.
- Authentication, registration, login changes, or additional auth protection.
- TypeScript adoption or conversion of existing files.
- Real persistence, storage, sync, import/export, or device integrations.
- Creating, editing, or deleting workouts from these pages, or changing the
  existing auth-phase Workout List/Form CRUD.
- Exercise library/catalog (muscle groups), supersets, rest timers, or dedicated
  per-exercise endpoints.
- Advanced analytics: one-rep-max estimation beyond recorded lifts, trend
  forecasting, form/technique analysis.
- Notifications, reminders, push, email, social sharing, leaderboards.
- A frontend automated test suite or CI.
- New runtime dependencies (charting, date, or state libraries).
- Deployment or production hosting.
