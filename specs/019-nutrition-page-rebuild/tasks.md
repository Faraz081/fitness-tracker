# Tasks: Nutrition Page Rebuild (AI Food Search)

**Input**: Design documents from `/specs/019-nutrition-page-rebuild/`
**Prerequisites**: plan.md (done), spec.md (done), research.md (done), data-model.md (done), contracts/ (done)

**Tests**: No test tasks are generated. The feature specification does not request automated tests, and the repository has no test framework (verified in plan/research: no `tests/` files, no ESLint, no test/lint scripts). Verification is the recorded manual browser script in `quickstart.md` (constitution v5.0.0 DoD #9) plus the build gates (`node --check`/`vite build`).

**Organization**: Tasks are grouped by user story (spec.md priorities) to enable independent implementation and testing. The 8 user-specified build sections map onto the stories: §1→US1 (deletion), §2–4→US2 (shell + search UI + result), §5→US4 + US3 (tabs/empty states; add/persist), §6→US3, §7–8→strict scope + final verification (cross-cutting).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/` (per plan.md structure). **Backend is UNCHANGED** — all tasks are in `frontend/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature workspace and the reused frontend/backend surface are ready. No new dependencies, no backend changes (plan.md decision).

- [X] T001 Verify branch is `019-nutrition-page-rebuild`; confirm design docs exist (`specs/019-nutrition-page-rebuild/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.nutrition.yaml`, `quickstart.md`) and record the pre-rebuild working tree state (`git status`)
- [X] T002 [P] Confirm `frontend/src/services/api.js` already exports `analyzeNutrition({ query, quantity, unit })`, `createNutritionEntry(payload)`, and `listNutrition(filters)` — record line numbers; do NOT add new functions
- [X] T003 [P] Confirm reused primitives + icons are importable: `Button`, `Input`, `Badge`, `EmptyState` from `frontend/src/components/ui`; lucide-react icons `Utensils`, `UtensilsCrossed`, `Coffee`, `Sun`, `Moon`, `Clock`, `Search`, `Plus`, `X`, `AlertCircle` — record the ui barrel exports (`frontend/src/components/ui/index.js` if present)

**Checkpoint**: Workspace verified — no repo/dependency changes were allowed; any finding here is recorded, not fixed by adding packages.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The only foundation this feature needs is knowledge of the exact deleted/reused surface. Not applicable further — the foundation *is* the deletion (US1), which must gate all build tasks per constitution AF1.

**⚠️ CRITICAL**: No user story build work may begin until Phase 3 (US1 deletion) is complete and confirmed.

- (No tasks — see US1 below. AF1 Delete-First makes US1 the blocking prerequisite for every build task.)

**Checkpoint**: After US1, foundation is ready — build stories US2/US3/US4 can proceed.

---

## Phase 3: User Story 1 - Clean-Slate Deletion (Priority: P1) 🎯

**Goal**: After this story, the broken Nutrition page and every file created specifically for it are fully removed, with no patched or partial reuse (AF1). The `/nutrition` route still resolves to a minimal stub so the app keeps building.

**Independent Test**: `git status`/`rg` shows no imports or files for `AddToLogModal`, `nutritionUtils`, `MealForm`, or the old `AiFoodSearch` anywhere in `frontend/src`; `App.jsx` still routes `path="/nutrition"` to `frontend/src/pages/Nutrition.jsx` (now a bare stub). Delivers a true clean slate.

### Implementation for User Story 1

- [X] T004 [US1] Identify page-specific files and prove orphaned status: run `rg "AddToLogModal|nutritionUtils|MealForm|AiFoodSearch|servingGrams|scaleServing" frontend/src` and record every import site (expected: only old `Nutrition.jsx`/`AiFoodSearch.jsx`/`AddToLogModal.jsx`); confirm `SearchInput`/`FilterBar`/`ActiveFilters`/`filterUtils`/`useDebouncedValue` are ALSO used by `WorkoutList.jsx`/`WorkoutHistory.jsx`/`ExerciseHistory.jsx` so they stay
- [X] T005 [P] [US1] Delete `frontend/src/components/nutrition/AddToLogModal.jsx`
- [X] T006 [P] [US1] Delete `frontend/src/utils/nutritionUtils.js`
- [X] T007 [P] [US1] Delete `frontend/src/components/MealForm.jsx`
- [X] T008 [P] [US1] Delete the old `frontend/src/components/nutrition/AiFoodSearch.jsx` (rebuilt fresh in US2)
- [X] T009 [US1] Strip `frontend/src/pages/Nutrition.jsx` to a minimal stub (render only the page container; remove ALL state, handlers, imports: `MealForm`, `AiFoodSearch`, `AddToLogModal`, `SearchInput`, `FilterBar`, `ActiveFilters`, `useDebouncedValue`, `filterUtils`, `applyFilters`, `useSearchParams`, date/summary/modal/delete/edit logic) so the `/nutrition` route still compiles
- [X] T010 [US1] Confirm deletion complete: `rg "AddToLogModal|nutritionUtils|MealForm|servingGrams|scaleServing|NUTRITION_CAPS" frontend/src` returns NOTHING; confirm `App.jsx` route `path="/nutrition"` → `./pages/Nutrition` still resolves; do NOT start any new build UI before this passes

**Checkpoint**: Old implementation fully gone — gated by AF1. The rebuild may now begin.

---

## Phase 4: User Story 2 - Search Bar + Live AI Result (Priority: P1) 🎯

**Goal**: The stub becomes a page with the exact Header, one Search Bar, and one Search Result section. Every search is a live Gemini lookup through the existing auth-scoped analyze proxy (AF4/AF7); result renders food name, serving size, CAL/P/C/F badges, "+". State: user-defined §2 (page shell + header), §3 (search UI), §4 (search result).

**Independent Test**: Open `/nutrition` → header shows fork/utensil icon + "AI Food Search"; type `banana` → Search → section "1 RESULT — CLICK TO ADD" with Clear on the right and one row (food name, serving size e.g. "per 118g", CAL/P/C/F badges in distinct colors, "+"); Clear removes it; duplicate submits blocked while in flight; 503/422/502 each show a clear retryable message and write nothing. Delivers live-AI food lookup.

### Implementation for User Story 2

- [X] T011 [P] [US2] Rebuild Header in `frontend/src/pages/Nutrition.jsx`: fork/utensil icon (lucide `Utensils`) in the existing `gradient-primary ... rounded-xl` treatment + title exactly `AI Food Search`; no other page sections beyond the composition slots for Search/Result/Tabs/Section (FR-002)
- [X] T012 [US2] Create `frontend/src/components/nutrition/AiFoodSearch.jsx` (new file): `<form>` with ONE input (ui `Input`, id `ai-food-name`, placeholder `banana`, `maxLength={200}`), a `Search` button (ui `Button` type submit, lucide `Search`), and the exact helper text `Supports natural language — try 'large chicken breast' or '100g of oats with milk'` below (FR-003)
- [X] T013 [US2] Wire submit in `AiFoodSearch.jsx`: on submit call `api.analyzeNutrition({ query: trimmed })` (live Gemini through `POST /api/nutrition/analyze`); guard empty input ("Enter a food or drink to search."), block re-submit while `analyzing` (in-flight guard), and keep a `requestSeq` ref to discard stale responses (FR-004, FR-005)
- [X] T014 [US2] Render Search Result section in `AiFoodSearch.jsx`: section label `1 RESULT — CLICK TO ADD`, a `Clear` link/button on the right (`X` icon), and one result row: food name, serving size text `per {quantity}{unit}` (e.g. `per 118g` — from the Analyze response), four `Badge`s `CAL`/`P`/`C`/`F` in four distinct colors, and a `+` button (`Plus` icon) that calls `onSelect(estimate)` (FR-006; data is ONLY the live response — no static/hardcoded values)
- [X] T015 [US2] Implement Clear in `AiFoodSearch.jsx`: resets `result` (and any error) to null with nothing persisted anywhere; result section is not rendered until the first successful search (FR-007; spec Edge Case "no search yet")
- [X] T016 [US2] Implement loading + failure states in `AiFoodSearch.jsx`: spinner/status text while in flight; map `ApiError` → clear retryable messages — 503/`AI_UNCONFIGURED` ("AI analysis is not configured..."), 502/`AI_UNAVAILABLE` ("temporarily unavailable..."), 422/`AI_NOT_FOOD` ("could not be identified..."); NEVER write data on failure (FR-013, SC-008)
- [X] T017 [US2] Add `onSelect` callback prop handling so the parent `Nutrition.jsx` receives the selected estimate object (wired to persistence in US3, T021) — `AiFoodSearch` stays minimal and does not persist anything itself

**Checkpoint**: User Story 2 independently functional — live search + result + Clear + failure states all work with no meal logging yet.

---

## Phase 5: User Story 3 - Add to Active Meal + Real Persistence (Priority: P1)

**Goal**: Meal tabs (Breakfast/Lunch/Dinner/Snacks with icons) exist, today's entries load and group under them, and "+" saves the live estimate to the real owner-scoped `Nutrition` collection (`source: 'ai'`) shown instantly and after reload. State: user-defined §6 (add food + persistence) and the tab mechanism from §5.

**Independent Test**: With Breakfast active, search `banana` → "+" → entry appears under Breakfast instantly (no refresh) with macros; reload → still present (real DB, SC-004); adding under each of the other tabs lands in the right meal; a second user never sees the entry (SC-005 — list is owner-scoped).

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `frontend/src/components/nutrition/MealTabs.jsx`: exactly four tabs Breakfast / Lunch / Dinner / Snacks (internal values `breakfast|snack` per `MEAL_ORDER` constant, label "Snacks" for value `snack`), icons `Coffee` / `Sun` / `Moon` / `Clock` (lucide), `aria-pressed` active state, `onChange(mealType)` callback, button styling matching the ui patterns (FR-009; research.md decision: value `snack` label `Snacks`)
- [X] T019 [US3] In `Nutrition.jsx`: add `activeTab` state (default `breadfast` = `'breakfast'` per spec Assumptions), `entries` state, and a mount effect calling `api.listNutrition({ date: today })` (helper `today()` YYYY-MM-DD, as in the old page) then grouping entries by `mealType` (FR-011; research.md decision: today-only listing)
- [X] T020 [P] [US3] Create `frontend/src/components/nutrition/MealSection.jsx`: pure render of one meal's entries — food name, serving (quantity+unit), and `{calories} kcal · {protein}g P · {carbs}g C · {fat}g F`; renders a basic empty fallback here (exact empty-state text/icon is finalized in US4, T023)
- [X] T021 [US3] Implement `handleAddFood(estimate)` in `Nutrition.jsx`: `api.createNutritionEntry({ foodName, quantity, unit, calories, protein, carbs, fat, mealType: activeTab, source: 'ai' })` (fields match `nutritionAnalyzeResultSchema`; fiber/sugar/sodium are NOT included — display-only per P26/P30), then append the returned entry to `entries` and call `refreshDashboard()` from `useDashboardRefresh` — no page reload (FR-008, FR-011, AF5; research.md: persist Analyze response verbatim, no scaling)
- [X] T022 [US3] Compose the page in `Nutrition.jsx`: Header (T011) → `<AiFoodSearch onSelect={handleAddFood} />` → `<MealTabs active={activeTab} onChange={setActiveTab} />` → `<MealSection mealType={activeTab} entries={grouped[activeTab]} />`; item adds from the result go to the currently active tab (FR-008; spec Assumption: "currently active meal" = selected tab)

**Checkpoint**: User Stories 2 + 3 both independently functional — search + add + real persistence, entry visible under the right meal and surviving reload.

---

## Phase 6: User Story 4 - Empty States & Graceful Failures (Priority: P2)

**Goal**: Every meal with zero entries shows the designed exact empty state; failure paths are confirmed honest and retryable; the page is clean before the first search. State: user-defined §5 (tabs + empty states) and §4 error handling.

**Independent Test**: Switching to a meal with nothing saved shows the plate/utensils icon + `No food logged for [Meal Name]` + `Use AI search above to find and add foods.` for all four meals; searching with AI unconfigured/unavailable/non-food shows the right clear message and saves nothing (SC-007, SC-008).

### Implementation for User Story 4

- [X] T023 [US4] Finalize empty state in `frontend/src/components/nutrition/MealSection.jsx` for 0 entries: plate/utensils icon (lucide `UtensilsCrossed`), title exactly `No food logged for {MealLabel}` (Breakfast/Lunch/Dinner/Snacks), hint exactly `Use AI search above to find and add foods.` — reuse the ui `EmptyState` primitive (FR-010)
- [X] T024 [P] [US4] Verify failure-path UX end to end in `AiFoodSearch.jsx` + `Nutrition.jsx`: 503 `AI_UNCONFIGURED` (key unset), 502 `AI_UNAVAILABLE` (e.g. stop backend), 422 `AI_NOT_FOOD` (e.g. `purple`), and empty-query guard each produce a clear, retryable message with zero data written (FR-013, SC-008); no placeholder/fabricated result ever renders (P26)
- [X] T025 [US4] Confirm clean initial state in `Nutrition.jsx`: before any search the page shows only Header, Search Bar, tabs, and meal sections (no result section, no fake foods) — spec Edge Case "no search has been run yet" (AF3)

**Checkpoint**: All four user stories independently functional and honest.

---

## Phase 7: Strict Scope Enforcement (Cross-Cutting)

**Purpose**: Prove the delivered page contains ONLY the required five-part structure (user-defined §7; FR-015, SC-006, AF6). This is a verification phase — it must fail loudly on any violation.

- [X] T026 Audit `frontend/src/pages/Nutrition.jsx` and `frontend/src/components/nutrition/*`: no date picker (`type="date"`/`Calendar`), no separate macro summary bar, no extra filters, no duplicate search bars, no page-specific sidebar widgets — record exact composition lines found
- [X] T027 Audit new page code: no UI or state for delete/edit/manual-add/modal/quantity-editing (P25 flow NOT reintroduced); no Fiber/Sugar/Sodium rows or values rendered (P26/P30 display-only → these may appear in payloads but never in the UI); no `localStorage`/`sessionStorage` storing food data (AF5); no reference to removed files (`AddToLogModal`, `nutritionUtils`, `MealForm`)
- [X] T028 Confirm composition is structurally the exact five parts only (Header, Search Bar, Search Result, Meal Tabs, Meal Section) in `Nutrition.jsx` and that no other exported route/nav surface was touched (`App.jsx`, `frontend/src/data/constants.js` unchanged)

**Checkpoint**: Scope is provably locked to the required structure.

---

## Phase 8: Final Verification (Polish & Cross-Cutting)

**Purpose**: Deterministic sign-off on constitution v5.0.0 DoD #9 + spec SC-001..SC-010 (user-defined §8). Record results; nothing is "done" until this passes.

- [X] T029 Run build gates: `npm run typecheck --prefix backend` (sanity; expect no changed node backend files) and `npm run typecheck --prefix frontend` (= `vite build`) — both must pass cleanly with zero errors/warnings on new/changed files
- [ ] T030 Execute and record the full manual verification script from `specs/019-nutrition-page-rebuild/quickstart.md` (14 steps): deletion-first confirm; exact header/search bar/helper text; live search + result format; Clear; per-meal adds (Breakfast/Lunch/Dinner/Snacks); empty states; refresh persistence; failure paths (key unset, non-food, backend down); two-user isolation; no horizontal scroll at 3 breakpoints; Dashboard/Reports/Workouts regression (existing saved nutrition data still renders in reports)
- [X] T031 Record results and wrap up: write the verification outcome into `specs/019-nutrition-page-rebuild/quickstart.md` verification block (or PR notes); update `AGENTS.md` Recent Changes only if the tech lines changed; confirm the final `git status` shows only intended files and draft the commit group by logical section (deletion ✂ → shell/search → tabs/persist → polish)

**Checkpoint**: Feature complete and signed off against the constitution DoD and spec success criteria.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — first.
- **Foundational (Phase 2)**: Merged into US1 (AF1 delete-first). **US1 BLOCKS all build work** — this is the constitutional gate.
- **User Stories**: US1 → US2 → US3 → US4 (sequential priority order per spec: US1 P1, US2 P1, US3 P1, US4 P2). US3 depends on US2's `onSelect` (T017); US4 depends on US3's tabs/sections (US2 T012–T016 for failures).
- **Scope Enforcement (Phase 7) + Final Verification (Phase 8)**: After all stories.

### User Story Dependencies

- **US1 (P1)**: None — starts immediately after Setup. Blocks everything (AF1).
- **US2 (P1)**: US1 complete (fresh files). Independent of US3/US4.
- **US3 (P1)**: US2 complete (`onSelect`/estimate plumbing, T017) + US1.
- **US4 (P2)**: US3 complete (tabs + sections exist) + US2 (error states).
- **Phases 7/8**: All stories complete.

### Within Each User Story

- Delete-first verification (T010) before any build task.
- Base file creation before same-file enhancements (T012 → T013/T014/T015/T016 within `AiFoodSearch.jsx`; T011/T019/T021/T022 sequence within `Nutrition.jsx`).
- Component creation ([P] where different files) before page composition wiring (T022).

### Parallel Opportunities

- **Setup**: T002 [P] and T003 [P] in parallel.
- **US1**: T005, T006, T007, T008 [P] — four independent file deletes in parallel; then T009 (page strip) → T010 (confirm).
- **US2**: T011 [P] (Nutrition.jsx header) parallel with T012 (build AiFoodSearch), since different files; then T013→T017 sequential inside `AiFoodSearch.jsx`.
- **US3**: T018 [P] (MealTabs) and T020 [P] (MealSection) in parallel with T019 (page state) — all different files; T021/T022 wire the page (sequential after them).
- **US4**: T024 [P] (AiFoodSearch failures) in parallel with T023 (MealSection empty state).
- **Phases 7/8**: Sequential (scope proof before sign-off).

---

## Parallel Example: User Story 2 (build three pieces in parallel)

```bash
# Launch these together (different files, no deps on each other):
Task: "T011 [P] [US2] Rebuild Header in frontend/src/pages/Nutrition.jsx ..."
Task: "T012 [US2] Create frontend/src/components/nutrition/AiFoodSearch.jsx ..."

# Then inside AiFoodSearch.jsx, sequential same-file chain:
Task: "T013 wire submit -> api.analyzeNutrition"
Task: "T014 render result section + badges"
Task: "T015 implement Clear"
Task: "T016 loading + failure states"
```

```bash
# Parallel example: User Story 3 component creation
Task: "T018 [P] [US3] Create MealTabs.jsx"
Task: "T020 [P] [US3] Create MealSection.jsx"
Task: "T019 [US3] page state + today load in Nutrition.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only) ⚠️ CONSTITUTIONAL GATE

1. Complete Phase 1 (Setup).
2. Complete Phase 3 (US1 deletion) — this is **mandatory** before anything else (AF1). **STOP and VALIDATE** T010 before writing a single line of new page code.

### Incremental Delivery (recommended for this feature)

1. Setup → US1 deletion → **validate** (clean slate confirmed).
2. **MVP increment**: US2 (live search + result). Search works standalone; demo-able.
3. Add US3 (tabs + "+" + persistence). Core value — search, add, and durable meals.
4. Add US4 (exact empty states + verified failure UX). Polish.
5. Phase 7 scope audit → Phase 8 full manual verification → sign-off. (Suggested MVP = US1 + US2 + US3, since persistence is the point of the page; US4 is a P2 follow-on.)

### Parallel Team Strategy

1. Single pass path honors the sequential 1→8 user order; the [P] markers above enable two devs to split component creation (US2 header vs AiFoodSearch; US3 MealTabs/MealSection vs page wiring) and the four US1 deletes.
2. US4 files (MealSection, AiFoodSearch) can be worked in parallel with US3 page wiring once US2/US3 file owners are distinct.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps the task to the spec user story for traceability (US1 deletion, US2 search/result, US3 add+persist, US4 empty/failures). Phases 7–8 are cross-cutting (no story label).
- Backend is **untouched** — if any task requires editing `backend/**`, STOP and re-plan (plan.md gate: zero backend changes).
- Zero new dependencies — if any task requires a new npm package, STOP (plan.md gate).
- No automated tests exist; the recorded manual verification (T030) is the sign-off per constitution v5.0.0 DoD #9. Commit after each task or logical group.
- Never reintroduce Day 12 P25's modal/editable flow or P24's "preserve old UI" (Day 13 AF1–AF3 supersede both for the Nutrition page).
