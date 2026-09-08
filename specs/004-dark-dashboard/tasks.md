---

description: "Task list for the Day 1.1 Dark Fitness Tracker Dashboard"
---

# Tasks: Modern Dark Fitness Tracker Dashboard

**Input**: Design documents from `/specs/004-dark-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated test suite is in scope for Day 1.1 (per spec Out of Scope —
build/lint smoke check only). Verification is via manual browser checks in the
Polish phase.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story. All work is in `frontend/` and is
JavaScript-only (`.js`/`.jsx`, no TypeScript).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US8)
- Include exact file paths in descriptions

## Phase 1: Setup & Base Shell

**Purpose**: Project structure, design tokens, UI primitives, mock data, and the
three-region layout shell.

- [X] T001 Create dashboard folder structure under `frontend/src/`:
  `components/layout`, `components/dashboard`, `data`
- [X] T002 [P] Add dark design-system tokens to `frontend/src/index.css` (palette
  #0b0f14/#161b22/#232a33 + lime accent, spacing 4px scale, type scale, radius,
  shadow) without destructively overwriting existing auth styles
- [X] T003 [P] Create UI primitives in `frontend/src/components/ui/`:
  `Card.jsx`, `ProgressBar.jsx`, `EmptyState.jsx`, `Spinner.jsx`; update barrel
  `ui/index.js`
- [X] T004 [P] Create mock data + constants in `frontend/src/data/dashboardData.js`
  and `frontend/src/data/constants.js` (user, summary x6, dailyGoals x4, rings,
  weeklyWorkouts, caloriesSeries, macros, recentWorkouts; EMPTY_DASHBOARD variant)
- [X] T005 Create layout components `frontend/src/components/layout/Sidebar.jsx`,
  `TopNavbar.jsx`, `DashboardLayout.jsx` (three-region: fixed sidebar + top navbar
  + scrollable main)
- [X] T006 Rewrite `frontend/src/pages/Dashboard.jsx` to compose the dashboard
  shell and sections within `<DashboardLayout>`
- [X] T007 Update `frontend/src/App.jsx` so the `/` route renders `Dashboard`
  standalone (not nested in auth Layout/ProtectedRoute); other routes unchanged

## Phase 2: Core Dashboard Sections

**Purpose**: Implement each required dashboard section as a reusable component.

### User Story 1 - Complete Dashboard Landing (Priority: P1)

- [X] T008 [P] [US1] Implement `frontend/src/components/dashboard/Greeting.jsx`
  (personalized greeting + current date); wire into `pages/Dashboard.jsx`
- [X] T009 [P] [US1] Implement `frontend/src/components/dashboard/QuickLog.jsx`
  (Water/Steps/Calories/Sleep/Weight/Workout buttons); wire into `pages/Dashboard.jsx`
- [X] T010 [US1] Implement `frontend/src/components/dashboard/SummaryCard.jsx` +
  `SummaryCards.jsx` (6 stat cards grid); wire into `pages/Dashboard.jsx`
- [X] T014 [US1] Implement `frontend/src/components/dashboard/RecentWorkouts.jsx`
  and `QuickActions.jsx`; wire into `pages/Dashboard.jsx`

### User Story 2 - Reviewing Key Stats on Summary Cards (Priority: P1)

- [X] T010 [US2] Six summary cards render labels/values with correct formatting
  (covered by SummaryCard/SummaryCards in US1) — see T010

### User Story 3 - Tracking Daily Goals with Progress (Priority: P2)

- [X] T011 [US3] Implement `frontend/src/components/dashboard/ProgressCard.jsx` +
  `ProgressCards.jsx` (Hydration/Calories/Steps/Sleep with ProgressBar; zero-target
  -> "No goal set" empty state); wire into `pages/Dashboard.jsx`

### User Story 4 - Glancing at Progress Rings (Priority: P2)

- [X] T012 [US4] Implement `frontend/src/components/dashboard/ActivityRing.jsx` +
  `ActivityRings.jsx` (SVG donut rings with center value; empty -> caption);
  wire into `pages/Dashboard.jsx`

### User Story 5 - Reviewing Charts (Priority: P2)

- [X] T013 [US5] Implement hand-rolled charts
  `frontend/src/components/dashboard/WeeklyChart.jsx`, `CaloriesChart.jsx`,
  `MacroChart.jsx` (Weekly=bar, Calories=line/area, Macro=donut) with EmptyState;
  wire into `pages/Dashboard.jsx`

### User Story 6 - Recent Workouts & Quick Actions (Priority: P2)

- [X] T014 [US6] Recent Workouts list newest-first + Quick Action buttons
  (covered by T014 RecentWorkouts/QuickActions)

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Empty/loading/error states, responsive behaviour, and final
consistency/build verification.

- [X] T015 [US7] Add empty/loading/error branching to every dashboard section
  using shared EmptyState + Spinner; confirm none render blank/broken when forced
  empty
- [X] T016 [US8] Implement responsive behaviour in layout + section components and
  `frontend/src/index.css` (sidebar collapse to icon rail / drawer, tabs collapse,
  no horizontal scroll)
- [X] T017 Polish: reconcile spacing/radius/type, truncate long names, remove dead
  imports; run `npm run build` and lint in `frontend/`; verify no `.ts`/`.tsx`
  introduced; manual browser verification

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 then T002/T003/T004 ([P]) then
  T005-T007 sequentially.
- **Core Sections (Phase 2)**: Depends on Phase 1 (T006/T007).
- **Polish (Phase 3)**: Depends on all of Phase 2.

### Within Each User Story

- Components before wiring into `pages/Dashboard.jsx`.
- Section-specific tasks [P] can run in parallel when they touch different files
  and do not depend on incomplete tasks.

### Parallel Opportunities

- T002, T003, T004 are [P] after T001.
- T008, T009 are [P] after T006/T007.
- Section components (T010-T014) touch distinct files and can be built
  independently, then wired into `pages/Dashboard.jsx` (which is the shared file —
  do wiring sequentially).

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- All files `.js`/`.jsx` only (no TypeScript).
- Mock data lives in `frontend/src/data/dashboardData.js`; forcing `EMPTY_DASHBOARD`
  drives empty-state verification.
- No new runtime dependencies (no charting/state library).
- Commit after each task or logical group; stop at each checkpoint to verify.
