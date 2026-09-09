---

description: "Task list for Search & Filtering feature implementation"
---

# Tasks: Search & Filtering (Day 5.1)

**Input**: Design documents from `specs/008-search-filtering/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/filter-contract.md`, `quickstart.md`

**Tests**: No automated test suite exists in this repo (no `tests/`, no `npm test` script). Tests are OPTIONAL per rules and are therefore delivered as **manual verification** recorded in each story's *Independent Test* (steps below) plus the verification tasks in the Final Polish phase. No TDD test tasks are generated.

**Organization**: Tasks are grouped by user story (from `spec.md`) so each story is independently implementable and testable.

## Format: `- [ ] [ID] [P?] [Story] Description`

- `- [ ]` prefix: markdown checkbox (unchanged when a task is done)
- **[P]**: can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: `[US1]`, `[US2]`, `[US3]`, `[US4]` — maps to the user story in `spec.md`
- Description always contains exact file paths under `frontend/src/`

## Path Conventions

Web app (frontend-only feature): all paths under `frontend/src/`. No backend changes, no new routes, no new runtime dependencies (JS only, `.js`/`.jsx`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment, confirm a passing baseline, pin the contract for the tasks that follow.

- [X] T001 Verify feature environment: run `powershell -ExecutionPolicy Bypass -File .specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and confirm `FEATURE_DIR = specs/008-search-filtering`; `git branch --show-current` = `008-search-filtering`; confirm `frontend/.env` (or `VITE_API_URL`) is present for the live-backend pages
- [X] T002 Establish baseline build: run `cmd /c "npm run build"` in `frontend/` and confirm it passes clean with zero errors before any changes (reference for regression)
- [X] T003 Load and confirm design contracts: verify the planned new file paths (`frontend/src/utils/filterUtils.js`, `frontend/src/hooks/useDebouncedValue.js`, `frontend/src/components/search/*`) are absent (no collision) and the URL param contract (search/category/dateOption/from/to/mealTypes) in `specs/008-search-filtering/contracts/filter-contract.md` matches the plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared, pure filter layer + UI primitives that EVERY user story consumes.

**CRITICAL**: No user story work begins until this phase is complete (User Story 1 depends on T004–T007; User Stories 2–3 additionally depend on the shared search components; User Story 4 additionally depends on T010).

- [X] T004 Create the pure filter module `frontend/src/utils/filterUtils.js` exporting exactly (per `contracts/filter-contract.md`): `todayISO()`, `matchesSearch(text, query)` (case-insensitive `toLocaleLowerCase()` substring, literal/no-regex, empty query → true), `filterBySearch(items, query, textFor)`, `filterByDateRange(items, { from, to }, dateKey = 'date')` (inclusive ISO-string compare, missing bound = unbounded), `filterByCategory(items, categories, key = 'category')` and `filterByMealType(items, mealTypes, key = 'mealType')` (pass when empty/`['all']`, else `includes`), `applyFilters(items, { search, textFor, from, to, dateKey, categories, mealTypes })` (single-pass AND composition), `resolveDateRange(option, { from, to }, today = todayISO())` (all/week/month/last3/last6/lastYear/custom with local Monday-week/1st-of-month/Jan-1 bounds), `hasActiveFilters(filters)` truth table, `filtersToSearchParams(filters, include?)` (omits defaults; mealTypes comma-joined), `parseSearchParams(params, defaults)` (validates enums/dates; unknowns → defaults). Pure functions only — no mutation, no date library, no imports beyond none
- [X] T005 Extend `frontend/src/data/constants.js` APPEND-ONLY: add `{ key: 'last6', label: 'Last 6 Months' }` and `{ key: 'lastYear', label: 'This Year' }` to `DATE_FILTER_OPTIONS`, keeping `custom` last and NOT removing/renaming existing entries
- [X] T006 Create `frontend/src/hooks/useDebouncedValue.js` exporting `useDebouncedValue(value, delay = 250)`: returns `value` immediately on mount, emits the latest value only after 250ms of silence, clears the pending timer on unmount (no `.ts`, no extra deps)
- [X] T007 [P] Create `frontend/src/components/search/SearchInput.jsx` — DUMB controlled component `{ id, label, value, onChange, placeholder, className }`: dark-token styling matching `frontend/src/components/history/HistoryFilters.jsx` (`border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 pl-10 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none rounded-xl`), lucide `Search` icon left, `X` clear button right (calls `onChange('')` only when `value` non-empty), `<label htmlFor={id}>` + `aria-labelledby`; NO debounce inside the component
- [X] T008 [P] Create `frontend/src/components/search/FilterBar.jsx` — container `{ title, children, collapsible, open, onToggle, activeCount }`: responsive grid `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` on `sm+`; under 768px when `collapsible` hides children behind a "Filters" toggle `Button` (lucide `SlidersHorizontal`) with active-count badge
- [X] T009 [P] Create `frontend/src/components/search/FilterChip.jsx` — removable active-filter chip `{ label, onRemove }`: accent-tinted pill (`rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-3 py-1 text-xs`), `<X>` remove button with `aria-label="Remove {label}"`, no corpse/empty-chip rendering
- [X] T010 [P] Create `frontend/src/components/search/ActiveFilters.jsx` — `{ chips: [{ id, label, onRemove }], onClearAll }`: renders chips in `flex flex-wrap gap-2` (wrapping per S9), shows a "Clear all filters" text button ONLY when `chips.length > 0` (S6), wraps the row in `aria-live="polite"`, uses `frontend/src/components/ui/Button` for the clear action

**Checkpoint**: Foundation ready — user story implementation can begin; T007–T010 are all parallelizable.

---

## Phase 3: User Story 1 — Workout Search & Filter (Priority: P1) 🎯 MVP

**Goal**: On `/workouts` (WorkoutList), search by title/notes/exercise name AND filter by category AND date range (presets + custom); on `/workouts-history` (Activities), add the same search additively and fix the Last 6 Months / This Year presets (spec US1; constitution date-range presets).

**Independent Test**: On `/workouts`, type `bench` → only workouts whose title, notes, or exercise names contain "bench" (case-insensitive); select category `Strength` → only strength workouts; pick preset `Last 3 Months` and a `custom from/to` → correct inclusive bounds (inverted `from > to` → zero results); combine all three → AND results; zero matches → "No workouts match your filters" empty state with a clear action; on `/workouts-history`, search narrows the grouped list and `Last 6 Months`/`This Year` resolve to correct date bounds.

- [X] T011 [P] [US1] Integrate search + category + date-range into `frontend/src/pages/WorkoutList.jsx`: add page state `searchDraft`/`search` (via `useDebouncedValue`), `category`, `dateOption`, `from`, `to`; render `SearchInput` (`label="Search workouts"`, placeholder "Search by name, notes, or exercise…" — textFor joined from `[w.title, w.notes, w.category, ...(w.exercises||[]).map(ex => ex.name)]`), category `<select>` (All + `WORKOUT_CATEGORIES`, `HistoryFilters` styling) and date `<select>` over `DATE_FILTER_OPTIONS` (custom → two `type="date"` inputs) inside `FilterBar`; compute `filtered = useMemo(() => applyFilters(workouts, { search, textFor, from, to, categories: category }), [workouts, search, category, from, to])`; render `{filtered.length} workouts` results header; render `EmptyState` "No workouts match your filters" with a clear action when `filtered.length === 0 && workouts.length > 0` (keep the existing full-list empty state); basic "Clear all filters" button visible when `hasActiveFilters` is true, resetting all six state values. Load path unchanged — `api.listWorkouts()` still called exactly once on mount (search/filter never refetches)
- [X] T012 [US1] Extend `frontend/src/utils/historyUtils.js`: expand `filterWorkouts(workouts, { category = 'all', from, to, query = '' })` so a non-empty `query` also keeps only workouts whose `[w.name, w.notes, w.category, ...(w.exercises||[]).map(ex => ex.name)]` joined string matches (case-insensitive `includes`); empty `query` MUST preserve current behavior exactly; no other exported function changes
- [X] T013 [US1] Integrate additive search into `frontend/src/pages/WorkoutHistory.jsx` (depends on T012): add `searchDraft`/`search` via `useDebouncedValue` + `SearchInput` above the existing `HistoryFilters`; pass `query: search` to `filterWorkouts`; DELETE the page-local `startOfWeek`/`toISODate`/`resolveDateBounds` and import the shared `resolveDateRange` from `frontend/src/utils/filterUtils.js` so `Last 6 Months` / `This Year` resolve correctly; the existing "Clear filters" button now also clears `searchDraft`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently (MVP).

---

## Phase 4: User Story 2 — Nutrition Search & Filter (Priority: P2)

**Goal**: On `/nutrition`, search food entries by name AND filter by meal type (multi-select toggle chips) over the loaded day, with day totals unchanged (spec US2).

**Independent Test**: On `/nutrition`, type `chicken` → only entries whose food name contains "chicken" (case-insensitive); toggle Breakfast/Lunch/Dinner/Snack chips → only those meals; combine search + chips → AND; summary cards (calories/P/C/F) remain FULL-day totals; zero matches → "No nutrition entries match your filters" empty state with clear action; the existing single-date picker still loads that day.

- [X] T014 [P] [US2] Integrate search + meal-type filter into `frontend/src/pages/Nutrition.jsx`: add `searchDraft`/`search` via `useDebouncedValue` + `mealTypes` array state (default `[]`); render `SearchInput` ("Search foods…"; textFor = `[e.foodName, e.mealType, MEAL_META[e.mealType]?.label ?? ''].join(' ')`) and meal-type toggle `FilterChip`s (derived from the page's existing `MEAL_META`/`MEAL_ORDER`, click toggles membership, active chip visually on) inside a `FilterBar` above the existing date row; compute `filtered = useMemo(() => applyFilters(entries, { search, textFor, mealTypes }), [entries, search, mealTypes])` and build the meal `grouped` sections from `filtered`; render `EmptyState` "No nutrition entries match your filters" + clear action when `filtered.length === 0 && entries.length > 0` (keep the existing "No entries for this date" state); summary cards stay driven by `summary` (never recomputed from `filtered`); the existing single-date picker is the date filter (unchanged); basic "Clear all filters" resetting search + mealTypes

**Checkpoint**: User Stories 1 and 2 now both work independently.

---

## Phase 5: User Story 3 — Exercise Search (Priority: P3)

**Goal**: On `/exercises`, search by exercise name so only matching exercise groups render (spec US3).

**Independent Test**: On `/exercises`, type `squat` → only exercise groups whose name contains "squat" (case-insensitive) render (with their Personal Records); typing gibberish → "No exercises match your filters / try a broader search term" empty state with clear action; clearing the search restores all groups.

- [X] T015 [P] [US3] Integrate search into `frontend/src/pages/ExerciseHistory.jsx`: add `searchDraft`/`search` via `useDebouncedValue`; render `SearchInput` ("Search exercises…") between the page heading and the group list; filter the exercise-name list via `filterBySearch(names, search, (n) => n)` BEFORE mapping into the existing `frontend/src/components/history/ExerciseHistory.jsx` component (component itself unchanged); render `EmptyState` "No exercises match your filters" + "Clear search" action when `search` is non-empty and zero groups match (keep the existing no-history empty state otherwise)

**Checkpoint**: All three data-domain user stories are independently functional.

---

## Phase 6: User Story 4 — Clear Filters & Filter State via URL (Priority: P4)

**Goal**: Active filters surface as individually removable chips, "Clear all filters" resets state AND URL params, and filter state round-trips through URL query params (refresh + back/forward) on every filtered page (spec US4; S5/S6/S10).

**Independent Test**: On `/workouts`, apply `search=bench` + category + date range → URL shows `?search=bench&category=...&dateOption=...`; refresh restores state; browser back/forward round-trips; direct nav to `/workouts?search=bench&category=strength` pre-applies filters; clicking an X on a chip removes ONLY that filter; "Clear all filters" resets search + all filters AND strips the URL params; on `/nutrition`, meal-type toggles reflect as `mealTypes=lunch,dinner`; on `/exercises`, `search` round-trips.

- [X] T016 [US4] Wire `hasActiveFilters`/`ActiveFilters` + URL sync into `frontend/src/pages/WorkoutList.jsx` (depends on T011, T010): initialize the six filter states from `parseSearchParams(useSearchParams())` on mount; on any filter change write `filtersToSearchParams(...)` via `setSearchParams(replace: false)`; render `ActiveFilters` chips (search term, category label, date-range label) with per-chip removal and "Clear all filters" resetting state + deleting params
- [X] T017 [US4] Wire `ActiveFilters` + URL sync into `frontend/src/pages/WorkoutHistory.jsx` (depends on T013, T010): sync `search`, `category`, `dateOption`, `from`, `to` params via `useSearchParams` (drops the page-local date state in favor of the shared resolver output consumed from the URL); chips + clear-all reset both state and params
- [X] T018 [P] [US4] Wire `ActiveFilters` + URL sync into `frontend/src/pages/Nutrition.jsx` (depends on T014, T010): sync `search` and `mealTypes` (comma-joined) params; `date` stays a component input (NOT URL-synced — it is the existing page date filter); chips for search + each selected meal with per-chip removal; "Clear all filters" clears search + mealTypes + params
- [X] T019 [P] [US4] Wire URL sync + clear into `frontend/src/pages/ExerciseHistory.jsx` (depends on T015): sync the single `search` param via `useSearchParams` (initialize on mount, write on change, clear on reset), "Clear search"/clear-all updates the URL
- [X] T020 [US4] Accessibility pass across `frontend/src/pages/WorkoutList.jsx`, `WorkoutHistory.jsx`, `Nutrition.jsx`, `ExerciseHistory.jsx` and `frontend/src/components/search/*`: confirm every `SearchInput`/date/select/toggle has an associated `<label>`/`aria-label`; wrap the filtered list regions in `aria-live="polite"`; verify full keyboard flow (Tab through search → selects → chips → clear-all; Enter/Escape behave natively); states announce to screen readers (S10 / FR-017/018/019)

**Checkpoint**: All four user stories complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consistency, performance, and final verification across all filtered pages.

- [X] T021 Visual consistency audit: confirm new search/filter controls match the Dashboard/`HistoryFilters` dark theme exactly (same dark tokens, green accent, card/spacing rhythm, no large side gaps) on `WorkoutList`, `WorkoutHistory`, `Nutrition`, `ExerciseHistory` (FR-020); adjust classes only — no behavioral changes
- [X] T022 Responsive + progressive-disclosure pass: verify `FilterBar` stack/collapse at 1280 / 768 / `<640` (S7, S9), chips wrap, zero horizontal overflow at any viewport incl. 320px (SC-007)
- [X] T023 Performance check: temporarily generate a large in-memory dataset (300+ workouts, 100+ nutrition entries) on the affected pages and verify filtered results respond < 100 ms perceived after the 250ms debounce (single-pass `applyFilters` in `useMemo`, no refetch, no jank/layout thrash); remove the test dataset afterwards (SC-001/002, S8)
- [X] T024 Combination & edge-case manual pass: search + category + date-range + meal-type combinations; 100+ char search strings; special characters `(`, `*`, `@` treated literally; inverted `from > to` → zero results + empty state; identical-name items not deduplicated; refresh + back/forward URL round-trip per page; clear-all per page (spec Edge Cases; SC-003/004/005; FR-009/010/011/012)
- [X] T025 Final gates + regression: `cmd /c "npm run build"` in `frontend/` clean; grep confirms no `.ts`/`.tsx` added; `package.json` unchanged (zero new runtime deps — SC-009); regression pass on prior-day pages `/`, `/progress`, `/goals`, `/analytics`, `/workouts/new`, `/workouts/:id/edit`, `/profile`, `/login` and the filtered pages with default (no-filter) state; run `specs/008-search-filtering/quickstart.md` validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — runs first (verification only).
- **Foundational (Phase 2)**: Depends on Setup; **BLOCKS all user stories** (every story imports `filterUtils.js`, `useDebouncedValue.js`, `SearchInput`; US4 additionally requires `ActiveFilters`).
- **User Stories (Phase 3–6)**:
  - **US1 (P1)**: `T011` (parallel with `T012`) → `T013` (needs `T012`).
  - **US2 (P2)**: independent of US1 (different page file) — only needs Foundation.
  - **US3 (P3)**: independent of US1/US2 (different page file) — only needs Foundation.
  - **US4 (P4)**: depends on the page integrations from US1 (`T011`/`T013`), US2 (`T014`), US3 (`T015`) and on `ActiveFilters` (T010); its four page tasks run in parallel.
- **Polish (Final)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundation. `T011`/`T012` parallel then `T013`.
- **User Story 2 (P2)**: Can start as soon as Foundation completes — INDEPENDENT of US1 (no shared source file with WorkoutList/WorkoutHistory).
- **User Story 3 (P3)**: Can start as soon as Foundation completes — INDEPENDENT of US1/US2.
- **User Story 4 (P4)**: After US1+US2+US3 page work; cross-cutting.

### Within Each User Story

- Page state wiring → filter rendering → empty-state/clear → (US4) URL + chips. Core behavior precedes cross-cutting enhancements.

### Parallel Opportunities

- Foundation: `T007`, `T008`, `T009`, `T010` all parallel (each a new file in `frontend/src/components/search/`; T004/T005/T006 also independent of them).
- US1: `T011` (WorkoutList) parallel with `T012` (historyUtils) — different files; `T013` follows `T012`.
- US2 `T014` and US3 `T015` run in parallel with US1 and with each other (distinct page files).
- US4: `T018` (Nutrition) and `T019` (Exercises) parallel with `T016`/`T017` (distinct pages); `T020` after all four.

---

## Parallel Example: User Story 1

```bash
# Launch the two independent US1 implementation files together:
git worktree: "T011 WorkoutList.jsx integration"
git worktree: "T012 historyUtils.js filterWorkouts query support"

# After T012 completes (T013 depends on it):
git worktree: "T013 WorkoutHistory.jsx additive search"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify env + baseline build).
2. Complete Phase 2: Foundational (T004–T010 — CRITICAL, blocks every story).
3. Complete Phase 3: User Story 1 (Workout search + filter on `/workouts` and additive search on `/workouts-history`).
4. **STOP and VALIDATE**: per the US1 Independent Test (above).
5. Deploy/demo if ready — this alone delivers the highest-value slice (FR-001/002/003, constitution date presets, empty state).

### Incremental Delivery

1. Setup + Foundation → foundation ready.
2. US1 (Workouts) → test independently → demo (MVP).
3. US2 (Nutrition) → test independently → demo.
4. US3 (Exercises) → test independently → demo.
5. US4 (Clear-all + URL state) → test independently → demo.
6. Polish (visual/responsive/performance/edge gates) → final validate.

### Parallel Team Strategy (3 developers)

1. Team completes Setup + Foundation together.
2. Developer A: US1 (`T011`+`T012`+`T013`). Developer B: US2 (`T014`). Developer C: US3 (`T015`).
3. Once US1–US3 land, one developer takes US4 (`T016`–`T020`), then Polish (`T021`–`T025`).

---

## Deferred Work (NOT tasks — see plan.md §9 Complexity Tracking)

- **Global / cross-app search bar in `TopNavbar`** (user input item "Global Search grouped or labeled"): deferred — the ratified spec scopes search to the three pages; shared `SearchInput`/`FilterBar` make a future cross-app bar a trivial follow-up. Do NOT build a navbar search input in this feature.
- **Date-range selector on the Nutrition page**: not built — the existing single-date picker IS the Nutrition date filter (spec FR-006; upstream `listNutrition({date})` returns one day; no backend changes allowed). Date presets + custom range are delivered on Workouts/Activities via `resolveDateRange`.
- Nutrition "day totals" intentionally remain full-day (filters narrow the meal list only).

## Notes

- [P] tasks = different files, no dependency on incomplete tasks.
- [Story] label maps each task to its user story for traceability: US1 workouts, US2 nutrition, US3 exercises, US4 clear + URL state.
- Each user story is a complete, independently testable increment; verify at each checkpoint.
- Commit after each task or logical group (per repo convention — do not commit unless asked).
- Verify the build after T025 and run the quickstart checklist (`specs/008-search-filtering/quickstart.md`).
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence (only US4 depends on earlier pages).