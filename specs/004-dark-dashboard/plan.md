# Implementation Plan: Modern Dark Fitness Tracker Dashboard

**Branch**: `004-dark-dashboard` | **Date**: 2026-09-08 | **Spec**: [specs/004-dark-dashboard/spec.md](./spec.md)
**Input**: Day 1.1 constitution (`.specify/memory/constitution.md`, v3.0.0) + feature specification.

## 1. Overall Approach

### 1.1 High-Level Sequence

1. **Base shell** — establish the three-region layout (fixed Sidebar + TopNavbar + scrollable
   Main) and the shared `DashboardLayout`.
2. **Design system** — define the dark theme tokens (colors, spacing, type, radius, shadow)
   centrally in `frontend/src/index.css`, plus the reusable `ui/*` primitives (`Card`,
   `ProgressBar`, `EmptyState`, `Spinner`).
3. **Mock data layer** — a single source of seed data in `frontend/src/data/` so every section
   reads from imports, never from scattered literals, and empty states are switchable.
4. **Section-by-section build** — Greeting, Quick Log, Summary cards, Progress cards, Rings,
   Charts (Weekly/Calories/Macro), Recent Workouts, Quick Actions. Each is an independent
   component composed into `pages/Dashboard.jsx`.
5. **Empty / loading / error states** — one `EmptyState` primitive reused by every section, with
   a deterministic way to force "no data" for verification.
6. **Responsive behaviour** — breakpoint rules for sidebar collapse and navbar compaction.
7. **Polish & verification** — visual pass against the reference, responsive pass, empty-state pass.

### 1.2 Design & Technical Decisions Locked by Constitution/Spec

- **Language**: JavaScript only — `.js` for logic/util/data, `.jsx` for anything rendering JSX.
  Strictly NO TypeScript, no `.ts`/`.tsx`, no `@ts-check` (Constitution D1, Principle V override).
- **No new runtime dependencies**: build with the existing React 19 + Vite 8 + React Router 7 +
  Tailwind v4 stack. Charts and rings are hand-rolled SVG/CSS; no charting library (D6).
- **State**: local `useState` per section; lift to Context only if two+ components share a value.
  No external state library (D7).
- **Layout fidelity**: exact three-region layout with the Quick Log row and all required sections
  is NON-NEGOTIABLE (D2).
- **Empty states**: every data-driven section MUST expose empty/loading/error behaviour (D5).
- **Routing decision (explicit)**: The new dashboard shell renders at the primary route `/` as a
  self-contained component with mock data, independent of auth. Target `App.jsx` edit: the `/`
  route element becomes the rewritten `pages/Dashboard.jsx` (the dark shell), no longer nested
  inside the shared auth `Layout`/`ProtectedRoute`. All other routes (`/login`, `/register`,
  `/profile`, `/workouts*`, `/nutrition`) remain unchanged. This is the minimal, non-destructive
  wiring that satisfies FR-001 ("primary route") and the constitution's standalone-mock option.
  No backend, auth, or API changes are made.
- **Data source**: all values come from `frontend/src/data/dashboardData.js` (mock); a `constants.js`
  holds Quick Log options, nav items, tab labels, and macro colors.

## 2. Ordered Task List

> Each task lists ID, title, files, implementation, acceptance criteria, and dependencies.
> Order is sequential unless a task is marked **[P]** (parallelizable — different files, no
> dependency on an incomplete task). Story labels `[US#]` map to spec user stories.

### Phase 1 — Setup & Base Shell (Constitution Check gate)

- [ ] T001 Create the dashboard folder structure under `frontend/src/` (directories:
  `components/layout`, `components/dashboard`, `components/ui`, `data`). No file logic.
  - Files: `frontend/src/components/layout/`, `frontend/src/components/dashboard/`,
    `frontend/src/components/ui/` (already exists), `frontend/src/data/`
  - Acceptance: directories exist; git shows them (or `.gitkeep` if empty dirs not tracked).
  - Depends: none.

- [ ] T002 Define the dark design-system tokens and base styles in `frontend/src/index.css`
  (Tailwind v4 `@theme` or CSS variables): palette (background `#0b0f14`, surface `#161b22`,
  border `#232a33`, primary accent lime/green, text near-white/muted), spacing (4px scale),
  type scale, radius, shadow. Do NOT overwrite existing auth-page styles destructively; append a
  dashboard token block.
  - Files: `frontend/src/index.css`
  - Acceptance: tokens exist and are referenced by class/var; dark colors present.
  - Depends: T001.

- [ ] T003 Build the reusable UI primitives and barrel export.
  - Files: `frontend/src/components/ui/Card.jsx`, `ProgressBar.jsx`, `EmptyState.jsx`,
    `Spinner.jsx`, and update `frontend/src/components/ui/index.js`
  - Acceptance: `Card` renders an elevated surface with title/optional action; `ProgressBar`
    renders a track+fill per a `value`/`max` (0-filled never breaks); `EmptyState` renders
    icon+message+optional action; `Spinner` renders a CSS spinner; barrel exports all four.
  - Depends: T002.
  - [P]

- [ ] T004 Create the mock data and constants modules.
  - Files: `frontend/src/data/dashboardData.js`, `frontend/src/data/constants.js`
  - Acceptance: `dashboardData.js` exports an object exposing `user` (name for greeting),
    `summary`, `dailyGoals` (Hydration/Calories/Steps/Sleep with current+target+unit),
    `rings`, `weeklyWorkouts`, `caloriesSeries`, `macros`, `recentWorkouts`; exports a
    `clearAll()`-style helper or `EMPTY` variant to force empty states; `constants.js` exports
    `QUICK_LOG_ITEMS`, `SIDEBAR_MENU`, `NAV_TABS`, `MACRO_COLORS`.
  - Depends: T001.
  - [P]

- [ ] T005 Build the layout components: `Sidebar`, `TopNavbar`, `DashboardLayout`.
  - Files: `frontend/src/components/layout/Sidebar.jsx`, `TopNavbar.jsx`, `DashboardLayout.jsx`
  - Implementation: `Sidebar` shows logo top, menu items Dashboard/Exercise/Nutrition from
    `SIDEBAR_MENU`, profile block (avatar+name+email) pinned bottom; `TopNavbar` shows logo +
    "Fitness Tracker" left, center tabs Dashboard/Workouts/Nutrition/Goals/BMI, user avatar+name
    right; `DashboardLayout` composes Sidebar + TopNavbar + a main `<Outlet/>`/children region.
    Include responsive hooks (see T016) but default desktop full.
  - Acceptance: the three-region layout renders at desktop with sidebar fixed, navbar sticky top.
  - Depends: T003, T004.
  - [US1]

- [ ] T006 Rewrite `frontend/src/pages/Dashboard.jsx` to compose the dashboard shell and sections.
  - Files: `frontend/src/pages/Dashboard.jsx`
  - Implementation: render `<DashboardLayout>` containing the main content; initially greet +
  Quick Log + a placeholder that will be filled by later tasks (or document which sections are
  to be composed). Progressive — this file is extended by T007-T014.
  - Acceptance: `/` renders the shell without crashing; greeting + Quick Log visible.
  - Depends: T005.
  - [US1]

- [ ] T007 Update `App.jsx` routing so the `/` route renders `Dashboard` standalone (not nested in
  the auth `Layout`/`ProtectedRoute`), keeping all other routes unchanged.
  - Files: `frontend/src/App.jsx`
  - Implementation: route `/` element = `<Dashboard />` at top level. Leave `/login`, `/register`,
    `/profile`, `/workouts`, `/workouts/new`, `/workouts/:id/edit`, `/nutrition` inside the shared
    `Layout` as-is. This wires the mock-data standalone shell to the primary route (FR-001).
  - Acceptance: visiting `/` shows the dark dashboard shell; existing auth routes still work.
  - Depends: T006.
  - [US1]

### Phase 2 — Core Dashboard Sections (user stories)

- [ ] T008 [US1] Implement the Greeting + current date section.
  - Files: `frontend/src/components/dashboard/Greeting.jsx`; wire into `pages/Dashboard.jsx`
  - Implementation: personalized greeting ("Good morning, {name}" style) using `dailyGreeting()`
    from a small util or inline, and the current date formatted for display. Name from mock `user`.
  - Acceptance: greeting uses the mock display name; current date renders correctly for the user's
    locale/timezone.
  - Depends: T006, T004.
  - [P]

- [ ] T009 [US1] Implement the Quick Log row (Water, Steps, Calories, Sleep, Weight, Workout).
  - Files: `frontend/src/components/dashboard/QuickLog.jsx`; wire into `pages/Dashboard.jsx`
  - Implementation: render six labelled buttons from `QUICK_LOG_ITEMS`; each is presentational
    (may locally increment an ephemeral counter via `useState`, but MUST NOT hit a backend).
    Buttons get the Quick Log button style (see Design System in constitution).
  - Acceptance: all six labels render; each is focusable; no network calls.
  - Depends: T006, T004.
  - [P]

- [ ] T010 [US1] Implement the six Summary cards.
  - Files: `frontend/src/components/dashboard/SummaryCard.jsx` (reusable),
    `frontend/src/components/dashboard/SummaryCards.jsx` (grid); wire into `pages/Dashboard.jsx`
  - Implementation: `SummaryCard` renders label, formatted value, optional icon + trend indicator;
    `SummaryCards` maps `dashboardData.summary` to Total Workouts, Total Exercises, Calories
    Burned, Calories Consumed, Current Weight, Workout Streak in a responsive grid.
  - Acceptance: all six labels/values render from mock data with correct formatting.
  - Depends: T006, T004, T003 (Card).
  - [US1]

- [ ] T011 [US2] Implement the four Daily Goal / Progress cards with progress bars.
  - Files: `frontend/src/components/dashboard/ProgressCard.jsx` (reusable),
    `frontend/src/components/dashboard/ProgressCards.jsx` (grid); wire into `pages/Dashboard.jsx`
  - Implementation: each card shows label, current/target with unit, and a `ProgressBar` at the
    correct percentage; a zero/undefined target shows 0% + "No goal set" empty state, never NaN.
  - Acceptance: Hydration/Calories/Steps/Sleep render with correct bars; zero-target renders the
    empty state.
  - Depends: T006, T003 (ProgressBar, EmptyState), T004.
  - [US3]

- [ ] T012 [US2] Implement the Activity / Progress rings.
  - Files: `frontend/src/components/dashboard/ActivityRing.jsx` (reusable SVG ring),
    `frontend/src/components/dashboard/ActivityRings.jsx` (row); wire into `pages/Dashboard.jsx`
  - Implementation: SVG donut where stroke-dash offset reflects value/max, center label/value;
    empty data → empty-state caption, never a misleading fill.
  - Acceptance: rings render proportional fills and center values; empty renders caption.
  - Depends: T006, T003 (EmptyState), T004.
  - [US4]

- [ ] T013 [US2] Implement the Weekly Workout chart, Calories chart, Macro chart (hand-rolled).
  - Files: `frontend/src/components/dashboard/WeeklyChart.jsx`, `CaloriesChart.jsx`,
    `MacroChart.jsx`; wire into `pages/Dashboard.jsx`
  - Implementation: WeeklyChart = bar chart of `weeklyWorkouts` by day; CaloriesChart = line/area
    of `caloriesSeries`; MacroChart = proportional donut/bars of `macros` protein/carbs/fat using
    `MACRO_COLORS`. Each renders `EmptyState` when its data is empty; no charting library.
  - Acceptance: all three render from mock data; empty data → empty state; no new dependency.
  - Depends: T006, T003 (EmptyState), T004.
  - [US5]

- [ ] T014 [US1] Implement the Recent Workouts section and Quick Action buttons.
  - Files: `frontend/src/components/dashboard/RecentWorkouts.jsx`,
    `frontend/src/components/dashboard/QuickActions.jsx`; wire into `pages/Dashboard.jsx`
  - Implementation: RecentWorkouts lists `recentWorkouts` newest-first (name, date, category,
    metric); empty → empty state; QuickActions renders shortcut buttons (presentational or
    links to existing routes).
  - Acceptance: list renders from mock data or empty state; quick action buttons present/focusable.
  - Depends: T006, T003 (EmptyState, Card), T004.
  - [US6]

### Phase 3 — Empty States, Responsive, Polish (cross-cutting)

- [ ] T015 [US3] Ensure every section exposes empty/loading/error states via the shared pattern.
  - Files: all `frontend/src/components/dashboard/*.jsx` + `frontend/src/pages/Dashboard.jsx`
  - Implementation: add a per-section empty branch using `EmptyState`; add a `Spinner`-based
    loading branch (a section-level `useState` for `loading`/`error` driven by mock async helpers
    or a toggle in `dashboardData.js` to force empty). Confirm none render blank/broken.
  - Acceptance: forcing empty data shows designed empty states for every section; loading shows
    spinner; error shows friendly message, never a stack trace.
  - Depends: T008-T014.
  - [US7]

- [ ] T016 [US3] Implement responsive behaviour at tablet and mobile breakpoints.
  - Files: `frontend/src/components/layout/Sidebar.jsx`, `TopNavbar.jsx`,
    `frontend/src/components/dashboard/*.jsx`, `frontend/src/index.css`
  - Implementation: >=1024px full sidebar; 640–1024px sidebar collapses to icon rail or toggle;
  <640px sidebar becomes overlay/drawer opened from navbar, center tabs collapse to a menu or
    scrollable strip, content grids reflow to fewer columns. No horizontal page scroll.
  - Acceptance: at each breakpoint layout is usable with zero horizontal scroll and controls
    reachable.
  - Depends: T005, T008-T014.
  - [US8]

- [ ] T017 Polish: consistency & build verification.
  - Files: all dashboard components, `frontend/src/index.css`, `frontend/src/pages/Dashboard.jsx`
  - Implementation: reconcile spacing/radius/type with the design tokens; truncate long names with
    ellipsis; remove dead imports; confirm no `.ts`/`.tsx` introduced; run `npm run build` in
    `frontend/` and the lint script per package.json.
  - Acceptance: `npm run build` succeeds; lint clean; visual pass matches reference.
  - Depends: T015, T016.
  - No story label.

## 3. File Creation Order

Create files in this exact dependency-safe sequence:

1. `frontend/src/index.css` (design tokens — T002)
2. `frontend/src/components/ui/Card.jsx`
3. `frontend/src/components/ui/ProgressBar.jsx`
4. `frontend/src/components/ui/EmptyState.jsx`
5. `frontend/src/components/ui/Spinner.jsx`
6. `frontend/src/components/ui/index.js` (update barrel)
7. `frontend/src/data/constants.js`
8. `frontend/src/data/dashboardData.js`
9. `frontend/src/components/layout/Sidebar.jsx`
10. `frontend/src/components/layout/TopNavbar.jsx`
11. `frontend/src/components/layout/DashboardLayout.jsx`
12. `frontend/src/pages/Dashboard.jsx` (rewrite)
13. `frontend/src/App.jsx` (edit `/` route)
14. `frontend/src/components/dashboard/Greeting.jsx`
15. `frontend/src/components/dashboard/QuickLog.jsx`
16. `frontend/src/components/dashboard/SummaryCard.jsx`
17. `frontend/src/components/dashboard/SummaryCards.jsx`
18. `frontend/src/components/dashboard/ProgressCard.jsx`
19. `frontend/src/components/dashboard/ProgressCards.jsx`
20. `frontend/src/components/dashboard/ActivityRing.jsx`
21. `frontend/src/components/dashboard/ActivityRings.jsx`
22. `frontend/src/components/dashboard/WeeklyChart.jsx`
23. `frontend/src/components/dashboard/CaloriesChart.jsx`
24. `frontend/src/components/dashboard/MacroChart.jsx`
25. `frontend/src/components/dashboard/RecentWorkouts.jsx`
26. `frontend/src/components/dashboard/QuickActions.jsx`

## 4. State Management Plan

- **Local `useState` per section only.** Each section that reacts to user interaction (e.g.
  Quick Log buttons, a per-section loading/error toggle) owns its `useState`; there is no global
  store.
- **Static dashboard content** is imported from `frontend/src/data/dashboardData.js`, not stored
  in component state. Components read props derived from these imports.
- **Shared/dynamic state**: only raise state to `pages/Dashboard.jsx` (or a single
  `DashboardDataContext` in `frontend/src/context/`) if two or more sections must read/update the
  same value. Do not add a state library.
- **Empty-state handling**: `dashboardData.js` provides the normal dataset plus a way to force
  empty data (e.g. an exported `EMPTY_DASHBOARD` variant or a boolean toggle). Every section reads
  its slice and, when empty, renders the shared `EmptyState` (icon + message) instead of content.
  Loading/error are modeled with a lightweight per-section `{ loading, error }` convention driven
  by mock async helpers; loading renders `Spinner`, error renders a friendly message.

## 5. Testing & Verification Plan

- **Visual checks against reference**: load `/`, compare the Sidebar, TopNavbar, Quick Log row,
  and every section's palette/spacing/typography/card style to the dark-themed screenshot; record
  any drift and fix before Done.
- **Section completeness**: confirm all ten dashboard-content items (greeting, summary cards,
  progress cards, rings, three charts, recent workouts, quick actions, empty states) render.
- **Responsive checks**: at 1024+, 640–1024, and <640 widths, confirm sidebar/tab collapse rules,
  no horizontal scroll, controls reachable.
- **Empty-state checks**: force empty data (via the `EMPTY_DASHBOARD` variant) and confirm every
  section shows a designed empty state and no broken/NaN UI; confirm loading shows `Spinner` and
  error shows a friendly message.
- **Build/quality checks**: `npm run build` (vite build) in `frontend/` succeeds; lint clean;
  grep confirms no `.ts`/`.tsx` files were introduced by this phase.
- **Regression**: existing routes (`/login`, `/profile`, `/workouts*`, `/nutrition`) still load.

## 6. Definition of Done

Day 1.1 is complete only when ALL hold:

- [ ] Three-region layout renders at `/`: fixed left Sidebar (logo, Dashboard/Exercise/Nutrition,
      profile block bottom), TopNavbar (logo + "Fitness Tracker", center tabs
      Dashboard/Workouts/Nutrition/Goals/BMI, avatar+name right), and main Quick Log row.
- [ ] Greeting + current date render with the mock display name.
- [ ] Six summary cards (Total Workouts, Total Exercises, Calories Burned, Calories Consumed,
      Current Weight, Workout Streak) render with correct formatted values.
- [ ] Four daily goal/progress cards (Hydration, Calories, Steps, Sleep) render with correct bars;
      zero-target shows "No goal set".
- [ ] Activity/progress rings render proportional fills and center values.
- [ ] Weekly Workout, Calories, and Macro charts render from mock data (hand-rolled, no new lib).
- [ ] Recent Workouts lists newest-first (or empty state); Quick Action buttons are present.
- [ ] Every data-driven section has designed empty, loading, and friendly error states.
- [ ] Responsive at desktop/tablet/mobile with zero horizontal scroll.
- [ ] All files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime dependency added without a
      recorded Complexity Tracking justification.
- [ ] `npm run build` succeeds; lint clean.
- [ ] Manual browser verification recorded (sections, Quick Log, empty/loading/error, responsive).

## 7. Out of Scope Reminder

MUST NOT be built in Day 1.1:

- Any backend changes (endpoints, data models, auth, services, database).
- Real authentication, registration, or login UI changes; the dashboard is mock-data standalone.
- Wiring real API data via `services/` (all data is local mock).
- Full CRUD behind Quick Log buttons (presentational/placeholder only).
- TypeScript adoption or conversion (.js/.jsx only).
- Data persistence, offline/PWA, i18n, dark/light toggle.
- Automated test suite and CI beyond an optional build/lint smoke check.
- Deployment or production hosting.
- New charting or state libraries.

These MUST NOT be silently added; open a new spec if one is required.

## Complexity Tracking

> Fill only if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
