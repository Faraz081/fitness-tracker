# Implementation Plan: Progress & Goals (Day 2.1)

**Branch**: `005-progress-goals` | **Date**: 2026-09-08 | **Spec**: [specs/005-progress-goals/spec.md](./spec.md)
**Input**: Day 2.1 constitution (`.specify/memory/constitution.md`, v3.1.0) + feature specification.

## 1. Overall Approach

### 1.1 High-Level Sequence

1. **Data + utils layer** — the mock datasets (`progressData.js`, `goalsData.js`),
   constants (`MEASUREMENT_FIELDS`, `GOAL_CATEGORIES`, `STREAK_TYPES`), and the PURE
   derivation helpers (`progressUtils.js`, `streakUtils.js`) that encode the goal/streak
   rules exactly once. Every section reads from these; nothing is computed inline.
2. **Pages + routing + navigation** — scaffold `pages/Progress.jsx` and `pages/Goals.jsx`
   (each renders inside the existing `DashboardLayout`), add the two standalone routes
   in `App.jsx`, and wire the existing `Sidebar`/`TopNavbar` so Progress and Goals become
   real, navigable tabs.
3. **Progress page sections** — build each section as an isolated component, wiring them
   into `pages/Progress.jsx` in order: WeightTracker → Measurements → WeightChart →
   PerformanceChart → StrengthHistory.
4. **Goals page sections** — StatusBadge + GoalCard (progress bar, status, target date),
   GoalsList grid, Milestones, and the Streak row (StreakStat/StreakRow), wired into
   `pages/Goals.jsx`.
5. **Cross-cutting** — empty/loading/error states on every section (shared
   `EmptyState`/`Spinner`), responsive reflow, then polish + build verification + Day 1.1
   regression.

### 1.2 Design & Technical Decisions Locked by Constitution/Spec

- **Language**: JavaScript only — `.js` for data/utils, `.jsx` for components/pages.
  Strictly NO TypeScript (Constitution P2; extends Principle V override).
- **Frontend-only, mock data**: no backend, API, auth, persistence, or env changes (P1).
  All data imports from `frontend/src/data/`; `services/` untouched.
- **No new runtime dependencies**: reuse React 19 + Vite 8 + React Router 7 + Tailwind v4
  and the Day 1.1 `ui/` primitives (`Card`, `ProgressBar`, `EmptyState`, `Spinner`) + dark
  tokens (`--color-*`, `dash-card`, `dash-num`, `accent-text`, `ring-track`). All charts
  are hand-rolled SVG (P5).
- **State**: page-level `useState` slices; props-driven sections; pure `utils/` for
  derivation; no state library, no Context required (P8).
- **Routing decision (explicit)**: Day 1.1 made `/` a standalone shell. Day 2.1 mirrors
  that: `App.jsx` gains two top-level routes `/progress` → `<Progress/>` and `/goals` →
  `<Goals/>`, each rendering its own `DashboardLayout`. No auth `Layout`/`ProtectedRoute`
  wrapper is added or changed; `/login`, `/register`, `/profile`, `/workouts*`,
  `/nutrition` are untouched.
- **Navigation**: `frontend/src/data/constants.js` gains `progress` and `goals` entries in
  `NAV_TABS` and `SIDEBAR_MENU`; `TopNavbar.jsx`'s `implementedTabs` set and
  `Sidebar.jsx`'s `menuIcons` map gain the corresponding keys. `bmi` stays an inert
  placeholder. Day 1.1 layout components are otherwise unchanged.
- **Metric units**: weight `kg` (one decimal), measurements `cm`, volume `kg` (thousands
  separator), streak counts integer + unit.
- **Streak cadence**: 1 day. All streak values derive via pure `computeStreak` when dates
  are available; mock `current`/`best` otherwise (still through shared formatters).
- **Wrapper convention**: `pages/*.jsx` render `<DashboardLayout>` around their section
  composition (same as `pages/Dashboard.jsx`). Section components live under
  `components/progress/` and are pure-ish (data + optional handlers as props).

## 2. Ordered Task List

> Each task lists ID, title, files, implementation, acceptance criteria, and dependencies.
> Order is sequential unless marked **[P]** (different files, no dependency). Stories
> [US#] map to spec user stories (US1 weight, US2 measurements, US3 weight graph,
> US4 performance graph, US5 strength history, US6 goals+status, US7 milestones, US8
> streaks, US9 empty/loading/error, US10 responsive+regression).

### Phase 1 — Data Layer, Utils, Pages, Routing (Constitution Check gate)

- [ ] T001 Extend the shared constants module with Day 2.1 display metadata.
  - Files: `frontend/src/data/constants.js` (append only)
  - Implementation: add `MEASUREMENT_FIELDS` (`[{ key: 'chestCm', label: 'Chest', unit: 'cm' }, { key: 'waistCm', ... }, { key: 'armsCm', ... }, { key: 'hipsCm', ... }, { key: 'thighsCm', ... }]`),
    `GOAL_CATEGORIES` (`['strength','weight','habit','endurance']`), `STREAK_TYPES`
    (`[{ key: 'workout', label: 'Workout Streak' }, { key: 'checkin', label: 'Check-in Streak' }, { key: 'hydration', label: 'Hydration Streak' }]`).
    Do NOT remove or rename existing exports (`QUICK_LOG_ITEMS`, `SIDEBAR_MENU`, `NAV_TABS`, `MACRO_COLORS`).
  - Acceptance: new exports exist; existing exports unchanged; file remains `.js`.
  - Depends: none.
  - [P]

- [ ] T002 Create the mock datasets for both pages (filled + empty variants).
  - Files: `frontend/src/data/progressData.js`, `frontend/src/data/goalsData.js`
  - Implementation:
    - `progressData.js`: exports `progressData` = `{ weightEntries, measurements, performance, strengthHistory }`
      and `emptyProgressData` (all arrays `[]`). Shapes per spec "Data Shapes": weight entry
      `{ id, date, weightKg }`; measurement session `{ id, date, chestCm?, waistCm?, armsCm?, hipsCm?, thighsCm? }`;
      performance point `{ id, week, totalVolumeKg, sessions }`; strength record
      `{ id, exercise, date, prKg, sets, reps }`. Filled data: ≥4 weight entries (oldest→newest),
      2-3 measurement sessions, ≥4 performance weeks, ≥3 strength records.
    - `goalsData.js`: exports `goalsData` = `{ goals, streaks }` and `emptyGoalsData` (both `[]`).
      Goals follow the spec shape: `{ id, title, category, targetValue, currentValue, unit, startDate, targetDate, completedAt, milestones: [{ id, title, threshold, reachedAt }] }`.
      Filled data MUST include at least one `on-track` (no completedAt, targetDate future, current < target),
      one `completed` (completedAt set or current >= target), one `missed` (no completedAt, targetDate past),
      one goal with milestones, and one goal with NO milestones. Streaks: 2-3 entries from `STREAK_TYPES`
      shapes `{ key, label, current, best, unit: 'days' }`, including at least one with `current: 0`
      (broken) to exercise the broken state.
  - Acceptance: all exports exist with spec-compliant shapes; empty variants are `[]`; no `.ts`.
  - Depends: T001 (uses constants labels).
  - [P]

- [ ] T003 Implement the pure goal/progress math helpers.
  - Files: `frontend/src/utils/progressUtils.js` (new `utils/` folder)
  - Implementation (all exported pure functions):
    - `progressPct(current, target)` → integer 0-100; `target <= 0` or non-number → returns `null`.
    - `goalStatus(goal)` → `'completed'` if `goal.currentValue >= goal.targetValue` OR `goal.completedAt`;
      else `'missed'` if `goal.targetDate` is a past date (YYYY-MM-DD < today); else `'on-track'`.
      Use a date-safe comparison (compare `YYYY-MM-DD` strings lexicographically against a local
      `todayISO()` helper or `new Date().toISOString().slice(0,10)`); no date library.
    - `milestoneReached(milestone, pct)` → boolean (`pct >= milestone.threshold` OR `milestone.reachedAt`).
  - Acceptance: `progressPct(110,120)===92`, `progressPct(120,120)===100`, `progressPct(0,0)===null`,
    `goalStatus` returns exactly the three strings for the mock goals in T002; thresholds behave per spec.
  - Depends: none.
  - [US1, US6, US7]

- [ ] T004 Implement the pure streak math helper.
  - Files: `frontend/src/utils/streakUtils.js`
  - Implementation: `computeStreak(dates, { cadenceDays = 1 } = {})` → `{ current, best, active }`.
    Sort unique `YYYY-MM-DD` ascending; walk backwards from the most recent date; increment while each
    gap `<= cadenceDays`; `active=false` when the most recent date is older than `cadenceDays` from today
    (or when `dates` is empty → `{ current: 0, best: 0, active: false }`). `best` = longest consecutive run
    anywhere in the sorted dates.
  - Acceptance: consecutive-date input yields expected `current`; a gap breaks `current`;
    empty input returns zeroed object with `active:false`.
  - Depends: none.
  - [P]
  - [US8]

- [ ] T005 Scaffold the two pages (heading + `DashboardLayout` shell).
  - Files: `frontend/src/pages/Progress.jsx`, `frontend/src/pages/Goals.jsx`
  - Implementation: each page is `export default function`, returns
    `<DashboardLayout>` wrapping page heading (reuse greeting styling: current date + `dash-num`
    title "Progress"/"Goals"). Placeholder section areas are composed by T007-T011 (Progress) and
    T012-T015 (Goals). No logic beyond heading for now.
  - Acceptance: temporarily routed (see T006), each page renders its heading inside the dark shell
    without crashing.
  - Depends: T002, T003.
  - [US1, US6]

- [ ] T006 Wire routes and navigation (small, surgical edits).
  - Files: `frontend/src/App.jsx`, `frontend/src/data/constants.js`,
    `frontend/src/components/layout/TopNavbar.jsx`, `frontend/src/components/layout/Sidebar.jsx`
  - Implementation:
    - `App.jsx`: add top-level `<Route path="/progress" element={<Progress/>}/>` and
      `<Route path="/goals" element={<Goals/>}/>` beside the existing `/` route. Leave all other
      routes untouched.
    - `constants.js`: append `{ key: 'progress', label: 'Progress', path: '/progress' }` and
      `{ key: 'goals', label: 'Goals', path: '/goals' }` to `NAV_TABS` (after `nutrition`, before
      `bmi`) and the same two entries to `SIDEBAR_MENU`.
    - `TopNavbar.jsx`: add `'progress'` and `'goals'` to `implementedTabs`.
    - `Sidebar.jsx`: add `progress: LineChart` and `goals: Target` to `menuIcons` (lucide-react;
      both exist in the installed package).
  - Acceptance: `/progress` and `/goals` load their pages; nav tab + sidebar items navigate and show
    active state; `/`, `/login`, `/profile`, `/workouts*`, `/nutrition` still work; `bmi` still inert.
  - Depends: T005.
  - [US1, US10]

### Phase 2 — Progress Page Sections

- [ ] T007 [US1] Implement weight tracking (latest + quick-add + list).
  - Files: `frontend/src/components/progress/WeightTracker.jsx`; wire into `pages/Progress.jsx`
  - Implementation: props `{ entries, onAdd }`. Renders a `dash-card`: "Latest Weight" as `dash-num`
    (formatted `78.5 kg`), a numeric input + "Log weight" button (invalid/empty disabled), and a
    newest-first list of entries (date + value). `entries.length === 0` → `EmptyState` ("No weight
    entries yet"). `onAdd({ weightKg })` is provided by the page (T016 pattern: guarded, session-only).
  - Acceptance: latest value renders; add prepends; empty state shows when empty; no network calls.
  - Depends: T005, T002.

- [ ] T008 [US2] Implement body measurements.
  - Files: `frontend/src/components/progress/Measurements.jsx`; wire into `pages/Progress.jsx`
  - Implementation: props `{ sessions }`. Selects the latest session (max date); renders the five
    `MEASUREMENT_FIELDS` rows with their values + `cm` (omitted measures skipped). No sessions →
    `EmptyState`.
  - Acceptance: latest-session values render with units; empty state shows when empty.
  - Depends: T005, T002.
  - [P]

- [ ] T009 [US3] Implement the weight progress graph (hand-rolled SVG).
  - Files: `frontend/src/components/progress/WeightChart.jsx`; wire into `pages/Progress.jsx`
  - Implementation: props `{ entries }`. Sort by `date`. 0 points → `EmptyState`; 1 point → a single
    labelled marker (date + `weightKg`) NOT an empty state; ≥2 points → scaled line/area with point
    markers, each `<circle>`/point gets `title`/`aria-label`. `<svg viewBox>` + `w-full`,
    `role="img"`, gradient/area + line use `var(--color-accent)`; captions use `--color-ink-muted`.
    No charting library.
  - Acceptance: 0/1/≥2-point cases render per spec FR-013; no overflow; values visible on hover/title.
  - Depends: T005, T002.
  - [P]

- [ ] T010 [US4] Implement the workout performance graph.
  - Files: `frontend/src/components/progress/PerformanceChart.jsx`; wire into `pages/Progress.jsx`
  - Implementation: props `{ data }`. Per-week bars (or line) from `{ week, totalVolumeKg, sessions }`,
    with week captions and per-bar `title` (value). 0 points → `EmptyState`. Same SVG conventions as
    T009; volume formatted with thousands separator (e.g. `12,400 kg`).
  - Acceptance: weeks render with captions; empty state; no overflow; no new dependency.
  - Depends: T005, T002.
  - [P]

- [ ] T011 [US5] Implement strength / progression history.
  - Files: `frontend/src/components/progress/StrengthHistory.jsx`; wire into `pages/Progress.jsx`
  - Implementation: props `{ records }`. Renders newest-first list of strength records (exercise name,
    `prKg` + unit, date, `sets × reps`), long names truncate. 0 records → `EmptyState`.
  - Acceptance: list renders newest-first; empty state; truncation on long names.
  - Depends: T005, T002.
  - [P]

### Phase 3 — Goals Page Sections

- [ ] T012 [US6] Implement StatusBadge + GoalCard.
  - Files: `frontend/src/components/progress/StatusBadge.jsx`,
    `frontend/src/components/progress/GoalCard.jsx`; wire into `pages/Goals.jsx`
  - Implementation:
    - `StatusBadge` props `{ status }` → pill with status classes: `on-track` success (green),
      `completed` accent (lime), `missed` warning (amber), `no-goal` muted (gray) using `--color-*`
      vars; readable label text ("On track"/"Completed"/"Missed"/"No goal set").
    - `GoalCard` props `{ goal }`: uses `progressPct` + `goalStatus` (imported from utils, NOT inline
      math); renders title (truncate), category, `StatusBadge`, a `ui/ProgressBar` at the pct, the
      `currentValue/targetValue unit` readout, target date, and `<Milestones>` (T014) when milestones
      exist. `pct === null` → bar at 0 + "No goal set" caption (badge `no-goal`). `pct === 100` →
      bar full.
  - Acceptance: card renders with correct bar fill, readout, and derived badge for each mock goal;
    `pct null` shows "No goal set"; no inline math in render.
  - Depends: T003, T002, T014 (Milestones built in a later task — T012 wires the slot, T014 fills it).
  - [US6, US7]

- [ ] T013 [US6] Implement the Goals grid + empty state.
  - Files: `frontend/src/components/progress/GoalsList.jsx`; wire into `pages/Goals.jsx`
  - Implementation: props `{ goals }`. Responsive grid (`sm:grid-cols-2 lg:grid-cols-3`) of `GoalCard`s.
    `goals.length === 0` → `EmptyState` ("No goals yet").
  - Acceptance: grid renders all mock goals; empty state; reflows at breakpoints.
  - Depends: T012.
  - [US6]

- [ ] T014 [US7] Implement milestones inside a goal card.
  - Files: `frontend/src/components/progress/Milestones.jsx`; wire into `GoalCard.jsx`
  - Implementation: props `{ goal }`. When `goal.milestones?.length`, render a checklist under the
    goal content: each milestone title + reached (checked/accent using `milestoneReached(m, pct)`) or
    pending (muted). When the goal has no milestones → render nothing (no empty block).
  - Acceptance: reached milestones render checked/accent, pending muted; milestone-less goals render
    no milestone area; never shows an empty/blank milestone block.
  - Depends: T003, T012.
  - [US7]

- [ ] T015 [US8] Implement the streak row and streak stats.
  - Files: `frontend/src/components/progress/StreakStat.jsx`,
    `frontend/src/components/progress/StreakRow.jsx`; wire into `pages/Goals.jsx`
  - Implementation:
    - `StreakStat` props `{ streak }`: icon by key (`workout` Flame, `checkin` CalendarCheck,
      `hydration` Droplets — lucide-react), prominent current count + unit (e.g. "12 days"), secondary
      "Best: N". `current === 0` → "0 days — start today" (valid, never blank).
    - `StreakRow` props `{ streaks }`: wrapping flex/grid of `StreakStat`s; empty → `EmptyState`
      ("No streak data yet").
    - When workout dates are available (progressData), the workout streak derived via `computeStreak`
      may override the mock `current`; implement the derivation in the page or a plain helper so the
      helper path is exercised.
  - Acceptance: current + best render; broken (0) state renders valid text; empty state; derivation
    matches `computeStreak` for mock dates.
  - Depends: T004, T002.
  - [US8]

### Phase 4 — Cross-Cutting (Empty/Loading/Error, Responsive, Polish)

- [ ] T016 [US9] Ensure every section has empty, loading, and error behaviour.
  - Files: `pages/Progress.jsx`, `pages/Goals.jsx` (add a mock async gate), all
    `components/progress/*.jsx` (audit empty branches)
  - Implementation: each page holds `{ loading, error, data }` via `useState` + `useEffect` mock timer
    (~400ms) then loads `progressData`/`goalsData`; loading renders `<Spinner>`; error renders a
    friendly message (never a stack trace); otherwise sections render, each already handling empty via
    `EmptyState`. Provide a clean way to force empty (import `emptyProgressData`/`emptyGoalsData`) for
    verification. Any section missing an empty branch gets one.
  - Acceptance: forcing empty shows designed empty states everywhere; loading shows spinner; error
    shows friendly message; none render blank/broken/NaN.
  - Depends: T007-T015.
  - [US9]

- [ ] T017 [US10] Responsive adjustments at all breakpoints.
  - Files: `pages/Progress.jsx`, `pages/Goals.jsx`, `components/progress/*.jsx` (grid/tailwind
    adjustments only), `frontend/src/index.css` (additive utilities ONLY if needed)
  - Implementation: encode the spec layout with responsive grids — summary row `sm:grid-cols-2`;
    charts row `xl:grid-cols-3` (weight graph `xl:col-span-2`, performance graph `xl:col-span-1`);
    strength history full width; goals grid `sm:grid-cols-2 lg:grid-cols-3`; streak row wrapping.
    Confirm no horizontal scroll at 1024+, 640–1024, <640.
  - Acceptance: at each width layout reflows with zero horizontal scroll and all controls reachable.
  - Depends: T007-T015.
  - [US10]

- [ ] T018 Final Polish: consistency, build, lint, regression.
  - Files: audit all Day 2.1 + touched Day 1.1 files
  - Implementation: reconcile spacing/radius/type with Day 1.1 tokens; truncate long names; remove
    dead imports; verify no `.ts`/`.tsx`; run `npm run build` in `frontend/`; run lint if a script
    exists (frontend has none — `typecheck` = `vite build`, so build is the smoke gate); verify
    `/` (Day 1.1 regression), `/progress`, `/goals`, and existing routes; create the green PHR.
  - Acceptance: build clean; no `.ts`/`.tsx`; Day 1.1 `/` unchanged; green PHR written.
  - Depends: T016, T017.

## 3. File Creation Order

Create/update files in this dependency-safe sequence:

1. `frontend/src/data/constants.js` (append — T001)
2. `frontend/src/utils/progressUtils.js` (new — T003)
3. `frontend/src/utils/streakUtils.js` (new — T004)
4. `frontend/src/data/progressData.js` (new — T002)
5. `frontend/src/data/goalsData.js` (new — T002)
6. `frontend/src/pages/Progress.jsx` (new — T005)
7. `frontend/src/pages/Goals.jsx` (new — T005)
8. `frontend/src/App.jsx` (edit routes — T006)
9. `frontend/src/components/layout/TopNavbar.jsx` (edit implementedTabs — T006)
10. `frontend/src/components/layout/Sidebar.jsx` (edit menuIcons — T006)
11. `frontend/src/components/progress/WeightTracker.jsx` (new — T007)
12. `frontend/src/components/progress/Measurements.jsx` (new — T008)
13. `frontend/src/components/progress/WeightChart.jsx` (new — T009)
14. `frontend/src/components/progress/PerformanceChart.jsx` (new — T010)
15. `frontend/src/components/progress/StrengthHistory.jsx` (new — T011)
16. `frontend/src/components/progress/StatusBadge.jsx` (new — T012)
17. `frontend/src/components/progress/Milestones.jsx` (new — T014)
18. `frontend/src/components/progress/GoalCard.jsx` (new — T012, wires T014)
19. `frontend/src/components/progress/GoalsList.jsx` (new — T013)
20. `frontend/src/components/progress/StreakStat.jsx` (new — T015)
21. `frontend/src/components/progress/StreakRow.jsx` (new — T015)
22. `frontend/src/pages/Progress.jsx` (wire sections T007-T011)
23. `frontend/src/pages/Goals.jsx` (wire sections T012-T015)

(24. `frontend/src/index.css` additive utilities ONLY if needed by T017.)

## 4. State Management Plan

- **Data source of truth**: mock modules `frontend/src/data/progressData.js` and
  `frontend/src/data/goalsData.js`, imported by the pages; components never re-create data.
- **Per-page state slices** (`useState` in `pages/Progress.jsx` / `pages/Goals.jsx`):
  - `weightEntries` (init `progressData.weightEntries`) — quick-add appends a new entry
    (`{ id, date: today, weightKg }`), updating both the latest readout and the list.
  - `loading` / `error` per page for the mock async gate (T016).
  - `goals` and `streaks` may stay static imports OR live in page state if a future quick-interaction
    requires it; default to static props for Goals.
- **Prop flow**: pages pass data + minimal handlers to section components. No global store, no
  Context required (lift only if a second component needs the same slice — none do here).
- **Derivation**: `progressPct`, `goalStatus`, `milestoneReached`, `computeStreak` live ONLY in
  `utils/` as pure functions; components render + format results (P7).
- **Empty-state handling**: the `emptyProgressData` / `emptyGoalsData` variants force "no data";
  every section checks its input and renders the shared `EmptyState` (icon + short message). Loading
  renders `Spinner`; error renders a friendly message; none may render blank/broken/NaN.

## 5. Testing & Verification Plan

- **Visual checks against the Day 1.1 dark theme**: load `/progress` and `/goals`; compare card
  surface, border/radius, `dash-num` numerals, lime accent, spacing, and typography with `/`.
  Record any drift and fix before Done.
- **Graph behaviour**: weight graph at 0 / 1 / ≥2 points (force via data variants) — assert
  EmptyState / labelled single point / full series per spec FR-013; performance graph bars with week
  captions; no overflow at any card width; values visible via `title`.
- **Progress bar / goal logic**: verify `progressPct` clamping (0-100), the "No goal set" state for
  `target <= 0`, status derivation across `on-track | completed | missed` for every mock goal, and
  milestone reached/pending states (including no-milestone goals).
- **Streak logic**: verify `computeStreak` with consecutive dates, a gap, and empty input; confirm
  the broken (`current: 0` / `active: false`) card shows "0 days — start today" and `best` is
  preserved.
- **Empty-state checks**: swap to `emptyProgressData`/`emptyGoalsData` and confirm every section
  shows a designed empty state and nothing renders blank/broken/NaN; loading shows `Spinner`; error
  shows a friendly message.
- **Responsive checks**: at 1024+, 640–1024, <640 widths confirm grids reflow (summary row,
  charts row, goals grid, streak row), sidebar toggle still works, and there is zero horizontal
  scroll.
- **Build/quality**: `npm run build` (vite build) in `frontend/` succeeds; grep confirms no
  `.ts`/`.tsx` introduced; no dead imports; no new runtime dependency.
- **Regression**: `/` (Day 1.1 dashboard) unchanged; `/login`, `/profile`, `/workouts*`,
  `/nutrition` still load; nav active states correct.

## 6. Definition of Done

Day 2.1 is complete only when ALL hold:

- [ ] `/progress` renders inside the existing dark `DashboardLayout` shell.
- [ ] Weight tracking: latest weight, newest-first list, session-scoped quick-add, empty state.
- [ ] Body measurements: five measures in `cm`, latest session first, empty state.
- [ ] Weight progress graph: 0 / 1 / ≥2 point behaviours per FR-013 (labels, no NaN).
- [ ] Workout performance graph: per-week values + captions + empty state.
- [ ] Strength / progression history: newest-first list + empty state.
- [ ] `/goals` renders inside the existing dark `DashboardLayout` shell.
- [ ] Goal cards: title, category, progress bar (0-100 clamped), current/target readout, target
      date, derived `StatusBadge`.
- [ ] Status derivations verified for `on-track`, `completed`, `missed`, and `no-goal` (target ≤ 0).
- [ ] Milestones render reached/pending per threshold inside their goal card; milestone-less goals
      render no milestone area.
- [ ] Streaks show current + best; broken (0) and empty states verified; derivation matches
      `computeStreak`.
- [ ] Every section has designed empty, loading, and error states (none blank/broken/NaN).
- [ ] Responsive at desktop / tablet / mobile with zero horizontal scroll.
- [ ] Day 1.1 `/` dashboard regression check passes; `/login`, `/profile`, `/workouts*`,
      `/nutrition` unchanged.
- [ ] All files `.js`/`.jsx`; no new runtime dependency; `npm run build` clean; green PHR written;
      manual browser verification recorded.

## 7. Out of Scope Reminder

MUST NOT be built in Day 2.1:

- Backend, API, controller, service, model, or database changes of any kind; server-side stats.
- Real authentication, registration, or login behaviour; protecting `/progress`/`/goals` behind
  auth (standalone mock pages).
- TypeScript adoption or conversion (`.js`/`.jsx` only), `tsconfig` changes governing the frontend.
- Real persistence, sync, CSV/Fitbit/Apple Health import/export, device integrations.
- Notifications, reminders, push, email, social sharing, leaderboards.
- Advanced analytics: 1RM estimation beyond recorded lifts, forecasting, ML coaching,
  body-composition estimation.
- Goal/measurement create-edit-delete UI beyond the mock list and the session-scoped quick-add.
- New charting, date, or state libraries.
- Automated test suite and CI (optional build/lint smoke only).
- Deployment or production hosting.

These MUST NOT be silently added; open a new spec if one is required.

## 8. Constitution Check

*GATE: Must pass before Phase 0 research and be re-checked after Phase 1 design.*

| Gate | Result | Evidence |
|------|--------|----------|
| P1 Frontend-only mock, no backend/API/auth/env | PASS | All sections consume `data/` mock modules; zero API/env/backend tasks (T001-T018) |
| P2 JavaScript-only | PASS | Every created/edited file is `.js`/`.jsx`; no `.ts`/`.tsx`, no `@ts-check` |
| P3 Reuse Day 1.1 shell + primitives | PASS | `DashboardLayout`, `ui/` primitives, `--color-*` tokens reused; no forked markup |
| P4 Empty/loading/error everywhere | PASS | T016 mandates `EmptyState`/`Spinner`/friendly-error on every section via `empty*Data` variants |
| P5 No new runtime deps | PASS | All charts hand-rolled SVG; no library added anywhere in T001-T018 |
| P6 Charts interpretable | PASS | T009/T010 specify `title`/captions/aria + scaling, no overflow, labelled single point |
| P7 Derived values pure in `utils/` | PASS | `progressUtils.js`/`streakUtils.js` only place for pct/status/milestone/streak math |
| P8 Local state only | PASS | Page-level `useState`; props-driven sections; no store, no Context required |
| P9 Responsive desktop-first | PASS | T017 encodes the spec grids for all breakpoints; zero horizontal scroll |
| Additive-only to Day 1.1 files | PASS | Only `App.jsx`, `constants.js`, `TopNavbar.jsx`, `Sidebar.jsx`, `index.css` (optional) touched, all additive/surgical |
| Routing stays standalone | PASS | `/progress`, `/goals` mirror the Day 1.1 `/` wiring; auth routes untouched |

Result: **No violations** — nothing requires Complexity Tracking justification.

## 9. Complexity Tracking

> Fill only if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |