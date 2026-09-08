---

description: "Task list for the Day 2.1 Progress & Goals feature"

---

# Tasks: Progress & Goals (Day 2.1)

**Input**: Design documents from `/specs/005-progress-goals/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated test suite is in scope for Day 2.1 (per spec Out of Scope —
build/lint smoke check only). Verification is via manual browser checks in the
Polish/Verification phase.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story. All work is in `frontend/` and is
JavaScript-only (`.js`/`.jsx`, no TypeScript). The Day 1.1 dark dashboard is
complete and is reused as-is (only additive wiring).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US10)
- Include exact file paths in descriptions

---

## Phase 1: Setup — Data & Utils Foundation

**Purpose**: Shared inputs every section needs: display constants, the two mock
datasets (with empty variants), and the pure derivation utilities.

Note: T001 then T002-T005 all `[P]` against each other (different files).

- [X] T001 Add Day 2.1 display constants to `frontend/src/data/constants.js`
  (append only — do NOT remove or rename existing exports `QUICK_LOG_ITEMS`,
  `SIDEBAR_MENU`, `NAV_TABS`, `MACRO_COLORS`, `WEEK_DAYS`):
  `MEASUREMENT_FIELDS` = chest/waist/arms/hips/thighs with `cm` unit,
  `GOAL_CATEGORIES` = `['strength','weight','habit','endurance']`,
  `STREAK_TYPES` = workout/check-in/hydration keys with labels + `unit: 'days'`
- [X] T002 [P] Create `frontend/src/data/progressData.js`: export `progressData`
  with `weightEntries` (5+ entries, `{ id, date: "YYYY-MM-DD", weightKg }`,
  oldest→newest), `measurements` (2-3 sessions `{ id, date, chestCm?, waistCm?,
  armsCm?, hipsCm?, thighsCm? }`, measures optional), `performance` (4+ weeks
  `{ id, week, totalVolumeKg, sessions }` oldest→newest), `strengthHistory`
  (3+ records `{ id, exercise, date, prKg, sets, reps }`); export
  `emptyProgressData` with all four arrays `[]`
- [X] T003 [P] Create `frontend/src/data/goalsData.js`: export `goalsData` with
  `goals` (3-4 goals `{ id, title, category, targetValue, currentValue, unit,
  startDate, targetDate, completedAt, milestones: [{ id, title, threshold,
  reachedAt }] }`) covering at least one on-track, one completed, one missed, one
  with milestones AND one with empty `milestones: []`; export `streaks`
  (2-3 entries `{ key, label, current, best, unit: 'days' }` from STREAK_TYPES,
  including one `current: 0` broken streak); export `emptyGoalsData` with both
  arrays `[]`. Example goals: "Squat 120 kg" (strength, 110/120, target date
  future → on-track, with milestones), "Weight 78 kg" (weight, 78/78,
  completedAt set → completed, no milestones), "Run 5K" (endurance, 3/5, target
  date in the past → missed)
- [X] T004 [P] Create `frontend/src/utils/progressUtils.js` (new folder): export
  `progressPct(current, target)` returning a clamped integer 0-100, or `null`
  when `target <= 0` or missing; `goalStatus(goal)` returning exactly
  `'completed'` (currentValue >= targetValue OR completedAt set) |
  `'missed'` (not completed AND targetDate in past, compare `YYYY-MM-DD`
  strings) | `'on-track'` otherwise; `milestoneReached(milestone, pct)` returning
  boolean (pct >= threshold OR reachedAt set)
- [X] T005 [P] Create `frontend/src/utils/streakUtils.js`: export
  `computeStreak(dates, { cadenceDays = 1 })` → `{ current, best, active }`; sort
  unique `YYYY-MM-DD` ascending, walk backwards from most recent, count
  consecutive while gap <= cadenceDays; `active=false` when most recent date is
  outside the cadence window (broken); `best` = longest run anywhere; empty input
  → `{ current: 0, best: 0, active: false }`

**Checkpoint**: Foundation ready — constants, filled+empty mock data, and pure
math utilities exist.

---

## Phase 2: Foundational — Pages, Routing & Navigation

**Purpose**: The two standalone pages, their routes, and the nav entries that
make them reachable. Blocks ALL user stories.

- [X] T006 [P] Create `frontend/src/pages/Progress.jsx`: default-export component
  rendering `DashboardLayout` (import from
  `frontend/src/components/layout/DashboardLayout`) with a page heading "Progress"
  + current date (reuse Day 1.1 greeting styling); leave an empty composition
  area under the heading for later sections; no data logic yet
- [X] T007 [P] Create `frontend/src/pages/Goals.jsx`: same standalone
  `DashboardLayout` shell as T006 with heading "Goals" + current date; empty
  composition area; no data logic yet
- [X] T008 [P] Add routes in `frontend/src/App.jsx`: import `Progress` + `Goals`
  and add top-level `<Route path="/progress" element={<ProtectedRoute>
  <Progress /></ProtectedRoute>}/>` and `<Route path="/goals" element=
  {<ProtectedRoute><Goals /></ProtectedRoute>}/>` beside the existing `/` route
  (outside the `<Layout>` route group, same wrapper pattern as `/`); do not
  modify any existing route
- [X] T009 [P] Add navigation entries in `frontend/src/data/constants.js`:
  append `{ key: 'progress', label: 'Progress', path: '/progress' }` and
  `{ key: 'goals', label: 'Goals', path: '/goals' }` to BOTH `NAV_TABS` (after
  `nutrition`, before `bmi`) and `SIDEBAR_MENU`; leave `bmi` untouched
- [X] T010 [P] Update `frontend/src/components/layout/TopNavbar.jsx`: add
  `'progress'` and `'goals'` to the `implementedTabs` Set (currently
  `['dashboard','workouts','nutrition']`) so the new tabs render as real
  `NavLink`s; `bmi` must remain an inert `<span>` placeholder
- [X] T011 [P] Update `frontend/src/components/layout/Sidebar.jsx`: add
  `progress: TrendingUp` and `goals: Target` to the `menuIcons` map (import both
  from `lucide-react`, verify they exist) so the new sidebar items render icons;
  existing items unchanged

**Checkpoint**: Foundation ready — `/progress` and `/goals` render their page
headings inside the dark shell and are reachable from nav; Day 1.1 routes still
work.

---

## Phase 3: User Story 1 - Tracking Weight on the Progress Page (Priority: P1) 🎯 MVP

**Goal**: The Progress page shows latest weight, a newest-first entry list, and a
session-scoped quick-add.

**Independent Test**: Load `/progress`; confirm the latest weight (value + kg
unit), the newest-first list, and that logging a weight prepends it.

- [X] T012 [P] [US1] Create `frontend/src/components/progress/WeightTracker.jsx`:
  props `{ entries, onAdd }`; render a `dash-card` with a `dash-num` "Latest
  Weight" readout (max-date entry, one decimal, e.g. `78.5 kg`), a numeric input
  + "Log weight" button (disabled when input invalid/empty), and a newest-first
  entry list (date + value, truncated); `entries.length === 0` → shared
  `EmptyState` ("No weight entries yet"); real `<input>`/`<button>` semantics,
  `aria-label` on icon-only controls
- [X] T013 [US1] Wire WeightTracker into `frontend/src/pages/Progress.jsx`: hold
  `weightEntries` in `useState` initialized from `progressData.weightEntries`
  (import from `frontend/src/data/progressData`); pass `onAdd` that prepends
  `{ id, date: todayIsISO(), weightKg }` (session-scoped only, resets on reload);
  `onAdd` must ignore invalid/empty values and never corrupt the list

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Viewing Body Measurements (Priority: P1)

**Goal**: The Progress page shows the five body measures for the latest
measurement session.

**Independent Test**: Load `/progress`; confirm chest/waist/arms/hips/thighs rows
render values + `cm` from the latest session.

- [X] T014 [P] [US2] Create `frontend/src/components/progress/Measurements.jsx`:
  props `{ sessions }`; pick the latest session (max date) and render its five
  measures via `MEASUREMENT_FIELDS` (import from
  `frontend/src/data/constants`) with values + `cm` (one decimal; skip omitted
  measures); `sessions.length === 0` → `EmptyState`; no horizontal scroll when
  multiple sessions exist
- [X] T015 [US2] Wire Measurements into `frontend/src/pages/Progress.jsx` in a
  two-column summary row (`grid sm:grid-cols-2 gap-6`): WeightTracker card +
  Measurements card; pass `progressData.measurements`

**Checkpoint**: User Stories 1 AND 2 work independently.

---

## Phase 5: User Story 3 - Personal Goals, Progress Bars & Status (Priority: P1)

**Goal**: The Goals page shows goal cards with a clamped progress bar,
current/target readout, derived status pill, and target date.

**Independent Test**: Load `/goals`; confirm each card shows title, category,
progress bar fill equal to clamped current/target, current/target readout, target
date, and a correct on-track/completed/missed pill. Milestones (US7) are not yet
rendered.

- [X] T016 [P] [US6] Create `frontend/src/components/progress/StatusBadge.jsx`:
  props `{ status }`; render a pill for `on-track` (success/green), `completed`
  (accent/lime), `missed` (warning/amber), `no-goal` (muted/gray) using theme
  semantic tokens only (no hardcoded hexes); readable labels "On track" /
  "Completed" / "Missed" / "No goal set"
- [X] T017 [P] [US6] Create `frontend/src/components/progress/GoalCard.jsx`:
  props `{ goal }`; import `progressPct` + `goalStatus` from
  `frontend/src/utils/progressUtils` (NO inline math); render title (truncate,
  ellipsis), category, `StatusBadge`, a `ui/ProgressBar` filled to the clamped
  pct, `currentValue/targetValue + unit` readout (thousands separator when large,
  e.g. `12,400 kg`), and target date; when `pct === null` render a 0-width bar +
  "No goal set" caption (never NaN); when `pct === 100` the bar is full.
  Milestones are mounted in T027 — leave only a conditional container guarded by
  `goal.milestones?.length` rendering nothing for now
- [X] T018 [P] [US6] Create `frontend/src/components/progress/GoalsList.jsx`:
  props `{ goals }`; responsive grid `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
  of `GoalCard`s; `goals.length === 0` → `EmptyState` ("No goals yet")
- [X] T019 [US6] Wire GoalsList into `frontend/src/pages/Goals.jsx`: render the
  page heading + `GoalsList` fed by `goalsData.goals` (import from
  `frontend/src/data/goalsData`)

**Checkpoint**: Navigate to `/goals` — cards render with bars, readouts, dates,
and derived status pills across all mock goal states.

---

## Phase 6: User Story 4 - Reading the Weight Progress Graph (Priority: P2)

**Goal**: A hand-rolled SVG line/area chart of weight over time with the
0/1/≥2-point rules.

**Independent Test**: Load `/progress`; confirm the graph plots the series WITH
≥2 points, and the 1-point (labelled marker, not empty) and 0-point (empty state)
variants by swapping data.

- [X] T020 [P] [US3] Create `frontend/src/components/progress/WeightChart.jsx`:
  props `{ entries }`; hand-rolled SVG reusing the Day 1.1 chart approach
  (`viewBox`, `w-full`, `role="img"` + `aria-label`, theme tokens for line/fill/
  captions, no library); x = date, y = weightKg:
  - 0 points → `EmptyState` ("No weight entries yet")
  - 1 point → a single labelled marker (its date + value), NOT an empty state
  - ≥2 points → line/area series with point markers, every point has a `title`
    (date + value) for hover; no overflow, no NaN
- [X] T021 [US3] Wire WeightChart into `frontend/src/pages/Progress.jsx` in a
  charts row (`grid gap-6 xl:grid-cols-3`): WeightChart at `xl:col-span-2`, fed
  by the current `weightEntries` so the Quick Log reflects immediately

**Checkpoint**: Weight graph renders the filled series with point labels/titles.

---

## Phase 7: User Story 5 - Reading the Workout Performance Graph (Priority: P2)

**Goal**: A hand-rolled SVG weekly performance chart (bars or line) with per-week
captions.

**Independent Test**: Load `/progress`; each week renders a value + caption; empty
data shows the designed empty state.

- [X] T022 [P] [US4] Create `frontend/src/components/progress/PerformanceChart.jsx`:
  props `{ data }`; weekly `totalVolumeKg` (or sessions) as bars with a week
  caption/label per bar, values in `title`, volume formatted with thousands
  separator (e.g. `12,400 kg`); 0 points → `EmptyState`; same SVG/theme
  conventions as T020, no library
- [X] T023 [US4] Wire PerformanceChart into `frontend/src/pages/Progress.jsx` at
  `xl:col-span-1` in the same charts row as T021, fed by `progressData.performance`

**Checkpoint**: Performance graph renders per-week values + captions.

---

## Phase 8: User Story 6 - Reviewing Strength / Progression History (Priority: P2)

**Goal**: Newest-first list of strength records (exercise, best value, date,
sets/reps).

**Independent Test**: Load `/progress`; each record shows exercise name, `prKg` +
unit, date, and `sets × reps`, newest first; empty state works.

- [X] T024 [P] [US5] Create `frontend/src/components/progress/StrengthHistory.jsx`:
  props `{ records }`; sort newest-first by `date`; each row: exercise name
  (truncate, ellipsis), `prKg` + unit, date, `sets × reps`; `records.length === 0`
  → `EmptyState`
- [X] T025 [US5] Wire StrengthHistory into `frontend/src/pages/Progress.jsx` as a
  full-width section below the charts row, fed by `progressData.strengthHistory`

**Checkpoint**: All five Progress-page sections render with the filled data.

---

## Phase 9: User Story 7 - Tracking Milestones Inside a Goal (Priority: P2)

**Goal**: Each goal with milestones shows a reached/pending checklist inside its
card.

**Independent Test**: Load `/goals`; a goal with milestones shows each milestone
checked/accent (reached) or muted (pending); a goal without milestones shows no
milestone area.

- [X] T026 [P] [US7] Create `frontend/src/components/progress/Milestones.jsx`:
  props `{ goal }`; render a checklist when `goal.milestones?.length > 0`; each
  milestone shows its title with reached (checked/accent via
  `reachedAt` set or `pct >= threshold`) or pending (muted) state using
  `milestoneReached` from `frontend/src/utils/progressUtils`; reach strictly in
  threshold order (a later milestone can never be reached while an earlier one is
  pending); when the goal has no milestones render NOTHING (no empty block)
- [X] T027 [US7] Mount `<Milestones goal={goal} />` inside the guarded container
  created in T017 `frontend/src/components/progress/GoalCard.jsx` (renders only
  when the goal has milestones)

**Checkpoint**: Milestone reached/pending visuals verified per threshold; goals
without milestones unaffected.

---

## Phase 10: User Story 8 - Using the Streak System (Priority: P2)

**Goal**: Streak cards show current count + best, with correct broken and empty
behaviour.

**Independent Test**: Load `/goals`; each card shows current count + unit and
"Best: N"; a broken streak (`current: 0`) shows "0 days — start today" while best
is preserved; empty data shows the designed empty state.

- [X] T028 [P] [US8] Create `frontend/src/components/progress/StreakStat.jsx`:
  props `{ streak }`; icon by key (workout → Flame, checkin → CalendarCheck,
  hydration → Droplets from `lucide-react`, verify they exist), prominent
  `current` count + unit (e.g. "12 days"), secondary "Best: N"; when `current ===
  0` render "0 days — start today" (never blank) while `best` stays visible
- [X] T029 [P] [US8] Create `frontend/src/components/progress/StreakRow.jsx`:
  props `{ streaks }`; wrapping flex/grid row of `StreakStat`s; `streaks.length
  === 0` → `EmptyState` ("No streak data yet")
- [X] T030 [US8] Wire StreakRow into `frontend/src/pages/Goals.jsx` as a
  full-width row above the goals grid: when workout dates are available derive
  the workout streak `current`/`active` via `computeStreak` from
  `frontend/src/utils/streakUtils` (fields then flow through the same formatting);
  otherwise use the mock `current`/`best` values from `goalsData.streaks`

**Checkpoint**: Streak cards correct for active, broken, and missing data.

---

## Phase 11: User Story 9 - Graceful Empty, Loading, and Error States (Priority: P3)

**Goal**: No blank/broken/NaN region on either page; each has loading, error, and
empty behaviour.

**Independent Test**: Force empty data (render both pages with `emptyProgressData`/
`emptyGoalsData`) and a simulated load/error; confirm designed states everywhere.

- [X] T031 [US9] Add a mock async gate to `frontend/src/pages/Progress.jsx`:
  `useState` slices `{ loading, error }` + `useEffect` `setTimeout` (~400-500ms)
  then set data; while loading render `Spinner` (from `frontend/src/components/
  ui`); on error render a friendly `EmptyState` ("Something went wrong" style,
  never a stack trace); data path unchanged
- [X] T032 [US9] Add the same mock async gate (loading/`Spinner`, friendly error)
  to `frontend/src/pages/Goals.jsx`; data path unchanged
- [X] T033 [US9] Empty-state drill down: render BOTH pages with
  `emptyProgressData` / `emptyGoalsData` (swap at import) and confirm EVERY
  section shows its designed `EmptyState` (weight, measurements, weight graph,
  performance graph, strength history, goals list, streak row) and that none
  render blank, broken, or NaN; restoring the filled imports restores normal
  rendering

**Checkpoint**: Loading shows a spinner, errors show friendly messages, and
every empty section shows a designed state — nothing blank/broken/NaN.

---

## Phase 12: User Story 10 - Regression & Responsive Behaviour (Priority: P3)

**Goal**: Day 1.1 is unbroken; both new pages are usable with zero horizontal
scroll at all widths.

**Independent Test**: Load `/` (Day 1.1 dashboard renders unchanged) and resize
`/progress` and `/goals` through desktop, tablet, and mobile widths.

- [X] T034 [US10] Responsive pass on `frontend/src/pages/Progress.jsx` +
  `frontend/src/pages/Goals.jsx` + all `frontend/src/components/progress/*`:
  verify summary row `sm:grid-cols-2`, charts row `xl:grid-cols-3`, strength
  history full width, goals grid `sm:grid-cols-2 lg:grid-cols-3`, streak row
  wraps; sidebar drawer at mobile; no horizontal scroll at 1024+ / 640-1024 /
  <640; rapid resizing leaves layout consistent; adjust ONLY additive
  Tailwind classes or additive utility classes in `frontend/src/index.css`
- [X] T035 [US10] Regression check: load `/` and confirm the Day 1.1 dashboard
  renders unchanged (sections, charts, Quick Log, empty states); confirm
  `/profile`, `/workouts`, `/workouts/new`, `/nutrition` still load; nav active
  states correct; `BMI` tab still inert; `/login`/`/register` untouched

**Checkpoint**: Day 1.1 dashboard unchanged; both new pages responsive with no
horizontal scroll.

---

## Phase 13: Final Polish & Day 2.1 Verification

**Purpose**: Visual consistency with Day 1.1, clean build, and the phase's
DoD verification.

- [X] T036 Polish + verification: reconcile Day 2.1 spacing/radius/typography
  with Day 1.1 tokens (`dash-card`, `dash-num`, `accent-text`, `--color-*`);
  truncate long goal/exercise names; remove dead imports; confirm every spec
  DoD checkbox (goals/statuses across on-track/completed/missed/no-goal,
  milestones, streaks, empty/loading/error, responsive, `/` regression);
  run `npm run build` (vite) in `frontend/` (via `cmd /c` — PowerShell blocks
  `npm.ps1`); grep confirms no `.ts`/`.tsx` introduced; record manual browser
  verification; create the green IMPL PHR at
  `history/prompts/005-progress-goals/`

**Final**: Day 2.1 complete — all 15 spec DoD items verified, build clean, no
TypeScript added.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001, then T002-T005 `[P]`.
- **Foundational (Phase 2)**: Depends on Phase 1; BLOCKS all user stories.
- **User Stories (Phase 3-12)**: All depend on Phase 2 (T006-T011).
  - US1 → US2 → US3/4/5 sequence in `Progress.jsx` (shared composition file —
    wire sequentially).
  - US6 (Goals) is independent of US1-US5 (different page file).
  - US7 depends on US6 (mounts into `GoalCard.jsx`).
  - US8 depends on US6 (wires into `Goals.jsx`).
- **Empty/Loading/Error (Phase 11)**: Depends on all section components.
- **Responsive/Regression (Phase 12)**: Depends on Phase 11.
- **Polish/Verification (Phase 13)**: Depends on all phases.

### User Story Dependencies

- **US1 (P1)**: after Phase 2 — no other-story dependency.
- **US2 (P1)**: after US1 (same `Progress.jsx`).
- **US6 (P1)**: after Phase 2 — independent of US1-US5 (different page file).
- **US3/US4/US5 (P2)**: sequential into `Progress.jsx` after US2. Each
  component file is independently buildable `[P]`.
- **US7 (P2)**: depends on US6 `GoalCard.jsx`.
- **US8 (P2)**: depends on US6 `Goals.jsx` + utils/stroke `computeStreak`.
- **US9 (P3)**: all sections present.
- **US10 (P3)**: all pages/wiring present.

### Within Each User Story

- Component first, then wiring into the page file.
- Component tasks marked `[P]` when they touch distinct files; page-wiring tasks
  run sequentially (shared page file).

### Parallel Opportunities

- T002-T005 (setup) after T001; T006/T007 (page scaffolds); T008/T009/T010/T011
  (routes + nav) after scaffolds.
- Section components inside each story ([P]) can be built independently, then
  wired into the shared page file in order.
- US6 (Goals page) can proceed in parallel with the Progress-page stories
  (US1-US5) — different page file.
- T016/T017/T018 (StatusBadge/GoalCard/GoalsList), T020/T022/T024 (charts/list)
  components are mutually independent.

---

## Parallel Example: User Story 3 (Goals)

```bash
Task: "Create StatusBadge in frontend/src/components/progress/StatusBadge.jsx"
Task: "Create GoalCard in frontend/src/components/progress/GoalCard.jsx"
Task: "Create GoalsList in frontend/src/components/progress/GoalsList.jsx"
# then, sequentially:
Task: "Wire GoalsList into frontend/src/pages/Goals.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (constants + data + utils).
2. Complete Phase 2: Foundational (pages, routes, nav).
3. Complete Phase 3: User Story 1 (WeightTracker + wiring).
4. **STOP and VALIDATE**: `/progress` shows weight tracking end-to-end
   (session-scoped add). This is the deliverable slice of Day 2.1.

### Incremental Delivery

1. Setup + Foundational → pages reachable from nav.
2. US1 weight tracking → verify `/progress`.
3. US2 measurements → verify.
4. US6 goals (bar/status) → verify `/goals`.
5. US3/US4/US5 graphs + history → verify.
6. US7 milestones, US8 streaks → verify.
7. US9 empty/loading/error, US10 responsive/regression → verify.
8. T036 polish + build + green PHR → Day 2.1 DONE.

### Parallel Team Strategy

- Team A: Progress page stories (US1 → US2 → US3/4/5 wiring order).
- Team B: Goals page stories (US6 → US7/US8) — different files, parallel-safe.
- Converge for US9/US10/T036 (shared page files).

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to a specific user story for traceability.
- All files `.js`/`.jsx` only (no TypeScript).
- Mock data lives in `frontend/src/data/progressData.js` + `goalsData.js`;
  forcing the `emptyProgressData`/`emptyGoalsData` imports drives empty-state
  verification.
- Derivation (progress %, status, milestones, streaks) happens ONLY in
  `frontend/src/utils/progressUtils.js` + `streakUtils.js` — never inline.
- No new runtime dependencies (no charting/date/state library).
- Build gate: `cmd /c "npm run build"` in `frontend/` (PowerShell blocks
  `npm.ps1`); `vite build` is the type/syntax smoke check.
- Commit after each task or logical group; stop at each checkpoint to verify.