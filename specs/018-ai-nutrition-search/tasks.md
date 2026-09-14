# Tasks: Nutrition Search (AI-Powered Food Logging)

**Feature Branch**: `018-ai-nutrition-search`
**Input**: Design documents from `/specs/018-ai-nutrition-search/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)
**Tests**: NOT requested — no automated suites exist in this repo (no `tests/`, no test script). Verification is manual via `quickstart.md` (§3 P27 audit + §4 16-point browser matrix) plus build gates (`node --check`, clean vite build).

**Organization**: Tasks are grouped by user story (US1–US5 from spec.md) to enable independent implementation and testing. The user's 7-phase input maps as follows:

| User phase | Maps to | spec.md user story |
|---|---|---|
| 1 Foundation | Phase 2 Foundational (T004–T007) | pre-story (blocks all) |
| 2 Secure Gemini Lookup | Phase 2 Foundational (T008–T012) | pre-story backend (US5 foundations) |
| 3 Search UI | Phase 4 → User Story 1 (P1) | US1 |
| 4 Add-to-Log Modal | Phase 5 → User Story 2 (P1) | US2 |
| 5 Persistence & Meal Integration | Phase 6 → User Story 3 (P2) | US3 |
| 6 Real-Time Updates & Cleanup | Phase 7 (US4) + Phase 8 Polish | US4 + cross-cutting |
| 7 Final Verification | Phase 8 Polish (T043–T046) | SC-001…SC-008 |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the working baseline and environment contract. Lightweight — this feature is additive on an existing monorepo (backend `Express 5.2.1 / Mongoose 9.9.4 / zod 4.4.3`, frontend `React 19.2.8 / Vite 8.2.2 / React Router 7.18.2`, JS-only per Day 6.1).

- [X] T001 Confirm baseline on branch `018-ai-nutrition-search`: run `git branch --show-current` and `git status`; record that the uncommitted 017 backend work (`backend/src/services/aiFoodService.js`, `POST /api/nutrition/analyze`, `source` field in `backend/src/models/Nutrition.js`) is the intended foundation
- [X] T002 [P] Verify backend environment contract: confirm `GEMINI_API_KEY=` placeholder exists in `backend/.env.example` and `backend/src/config/index.js` loads it optional-at-boot (`process.env.GEMINI_API_KEY ?? ''`, no `requireEnv`)
- [X] T003 [P] Verify build gates pass on the baseline: backend `node --check backend/src/index.js` and `npm run build --prefix frontend` (clean vite build)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented — user's phases 1 (Foundation) and 2 (Secure Gemini Lookup).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Foundation review & confirmations (user phase 1)

- [X] T004 Review existing Nutrition page structure and meal logging flow: read `frontend/src/pages/Nutrition.jsx`, `frontend/src/components/MealForm.jsx`, `frontend/src/services/api.js`; document `MEAL_ORDER` (breakfast/lunch/dinner/snack), today/date handling, and the existing manual save path
- [X] T005 [P] Confirm Nutrition model/API support for saving meal entries: verify `backend/src/models/Nutrition.js` (fields, caps calories 0–2000 / macros 0–500 / quantity 0.01–1000, mealType enum, `source` enum `['ai','manual']` default `'manual'`) and the create endpoint in `backend/src/routes/nutrition.js` accept `{foodName, quantity, unit, calories, protein, carbs, fat, mealType, source:'ai'}`
- [X] T006 [P] Identify integration points for search bar, result card, and add modal in `frontend/src/pages/Nutrition.jsx` (search card above meal sections, "+" → modal, save handler); note existing ui primitives (`Button`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`) from `frontend/src/components/ui/index.js`
- [X] T007 [P] Confirm authenticated user scoping: verify `authenticate` middleware gates the entire `nutritionRouter` in `backend/src/routes/nutrition.js` and every handler filters `{ owner: req.userId }` with cross-user access → `404 NOT_FOUND` in `backend/src/controllers/nutrition.js`

### Secure Gemini Lookup (user phase 2)

- [X] T008 [P] Extend backend AI response schema: add optional `fiber`, `sugar`, `sodium` (each `0–500`) and gram serving basis (`quantity` `0.01–1000`, `unit` `'g'`) to `nutritionAnalyzeResultSchema` in `backend/src/utils/validators.js`; keep existing required `foodName`, `calories`, `protein`, `carbs`, `fat`
- [X] T009 Extend the serving prompt in `backend/src/services/aiFoodService.js`: instruct Gemini to return the estimate **in grams** (`quantity` grams, `unit: "g"`, sensible default gram serving for the described food) and include `fiber`/`sugar`/`sodium` in grams **only when known** — omit when unknown, never invent (P26)
- [X] T010 Ensure the live Gemini call + structured parse in `backend/src/services/aiFoodService.js`: native `fetch` to `generateContent` (`responseMimeType: application/json`), `AbortSignal.timeout(10_000)`, parse `candidates[0].content.parts[0].text`, zod-validate via `nutritionAnalyzeResultSchema`, error taxonomy `503 AI_UNCONFIGURED` / `422 AI_NOT_FOOD` / `502 AI_UNAVAILABLE`
- [X] T011 [P] Confirm analyze route wiring: ensure `POST /api/nutrition/analyze` in `backend/src/routes/nutrition.js` is registered **before** `/:id`, behind `authenticate` + `validate(nutritionAnalyzeSchema)`; controller `analyzeNutritionHandler` calls `aiFoodService.analyzeFood` and returns the result in the standard `{ success, data }` envelope
- [X] T012 [P] Map error taxonomy in `backend/src/controllers/nutrition.js`: `503` → "AI analysis is not configured…", `422` → "Food could not be identified…", `502` → "AI analysis is temporarily unavailable…", `400` → validation; no API key or config ever included in error payloads (verified: `AppError` handled centrally by `errorHandler.js`, `validate` → `400 VALIDATION_ERROR`)

**Checkpoint**: Foundation ready — backend analyze endpoint live, key server-only, scoping confirmed. User story implementation can now begin.

---

## Phase 3: User Story 5 - Secure, Isolated AI Backend Proxy and Data Scoping (Priority: P1)

**Goal**: Independently verify the security/isolation contract the whole feature depends on: key never reaches the client, unauth requests rejected, entries strictly owner-scoped (SC-007, SC-008).

**Independent Test**: Search as an authenticated user while inspecting the network tab and built bundle — no AI key reaches the client; with two test users, each retrieves only their own entries and a cross-user id fetch returns `404`.

### Implementation for User Story 5

- [X] T013 [P] [US5] Verify key isolation: run `quickstart.md` §3 P27 audit — `git grep -i "gemini\|AIza"` and `git grep "generateContent"` over `frontend/` return nothing; inspect the built bundle
- [X] T014 [P] [US5] Verify unauth rejection: against a running backend, call `POST /api/nutrition/analyze` and `POST /api/nutrition` with no/expired token → expect `401 UNAUTHORIZED`, no data returned — verified statically (`router.use(authenticate)` + `authenticate` 401 without/invalid token); live probe queued in T044
- [X] T015 [US5] Verify two-user isolation: create users A and B; confirm A cannot `GET`/`PATCH`/`DELETE` B's entry by id (`404`), and lists/summary return only owner data — verified statically (all `nutritionService` queries filter `{ owner }`, `AppError(404)` on miss); live two-user check queued in T044
- [X] T016 [US5] Audit + enforce owner scoping in `backend/src/controllers/nutrition.js` (and `backend/src/services/nutritionService.js` `toNutrition` serializer): patch any query found not filtered by `{ owner: req.userId }`; confirm no endpoint leaks another user's entries (audit result: all `list/get/update/delete/summary` already owner-filtered; serializer exposes entry fields only — no patch required)

**Checkpoint**: Security/isolation verified — US5 independent and passing.

---

## Phase 4: User Story 1 - Natural-Language Food Search Returns a Live AI Result Card (Priority: P1) 🎯 MVP

**Goal**: Search UI — user's phase 3. Single food-name search bar triggers a live backend AI lookup; loading state; a single result card with food name, "AI" badge, "Per Xg serving" label, Calories | Protein | Carbs | Fat, optional Fiber | Sugar | Sodium, and a "+" action (FR-001…FR-005).

**Independent Test**: On the nutrition page, type a natural-language food description and submit — a result card appears with the "AI" badge, "Per {X}g serving", the four macros, and micronutrients when provided; network tab shows only `/api/nutrition/analyze` (no Gemini URL).

### Implementation for User Story 1

- [X] T017 [US1] Create `frontend/src/utils/nutritionUtils.js`: pure helpers `servingGrams(estimate)` (returns `estimate.quantity`) and `scaleServing(estimate, grams)` (each macro × `grams / servingGrams`, rounded) — the single math source for SC-004
- [X] T018 [P] [US1] Create `frontend/src/components/nutrition/AiFoodSearch.jsx`: single search bar (food name only, no macro inputs), submit on Enter/button, `analyzing` state placeholder, latest-submission-wins guard
- [X] T019 [P] [US1] Verify/extend `analyzeNutrition({ query })` in `frontend/src/services/api.js`: calls `apiPost('/api/nutrition/analyze', …)`, surfaces `ApiError(message, code, status)` for error-branching (verified — no change required)
- [X] T020 [US1] Render the result card in `frontend/src/components/nutrition/AiFoodSearch.jsx`: food name, "AI" badge (assistant framing — never authoritative), "Per {X}g serving" via `servingGrams`, Calories | Protein | Carbs | Fat via `scaleServing`
- [X] T021 [US1] Render the optional micronutrient row in `frontend/src/components/nutrition/AiFoodSearch.jsx`: Fiber | Sugar | Sodium when the AI provided them, muted "not available" when absent (never zeros)
- [X] T022 [US1] Add the "+" action on the result card in `frontend/src/components/nutrition/AiFoodSearch.jsx` that surfaces the selected `estimate` via an `onSelect` prop
- [X] T023 [US1] Integrate `AiFoodSearch` into `frontend/src/pages/Nutrition.jsx` above the meal sections (meal sections still render independently of search state)

**Checkpoint**: US1 fully functional and testable independently — **MVP** is complete (Phase 1 + 2 + 3 + 4).

---

## Phase 5: User Story 2 - Add an AI Food to a Meal via the Add-to-Log Modal (Priority: P1)

**Goal**: Add-to-Log modal — user's phase 4. "+" opens a modal with food name + AI badge + Close X, nutrition breakdown, editable Quantity (g) pre-filled from the AI serving, live recalc "For [X]g: [Y] kcal | P | C | F" strictly from real AI data, meal dropdown, Cancel (persists nothing) and "+ Add Food" (FR-005…FR-009).

**Independent Test**: Search a food, click "+", edit the quantity — the summary line recalculates live and matches the AI ratio; select a meal and Cancel — modal closes, nothing persisted; confirm blocked on an invalid quantity.

### Implementation for User Story 2

- [X] T024 [P] [US2] Create `frontend/src/components/nutrition/AddToLogModal.jsx` shell using the existing `Modal` primitive: opened from the result card "+", food name + "AI" badge, Close (X) button (Esc/backdrop also close), nutrition breakdown from the passed `estimate`
- [X] T025 [US2] Add the editable Quantity (g) input in `frontend/src/components/nutrition/AddToLogModal.jsx`, pre-filled with `servingGrams(estimate)`
- [X] T026 [US2] Add live recalculation in `frontend/src/components/nutrition/AddToLogModal.jsx`: "For [X]g: [Y] kcal | P | C | F" recomputed via `scaleServing(estimate, grams)` on every keystroke (strict re-derivation of AI data, SC-004)
- [X] T027 [US2] Add the "Add To" dropdown in `frontend/src/components/nutrition/AddToLogModal.jsx`: Breakfast | Lunch | Dinner | Snack, default Breakfast (align label with existing `MEAL_TYPES`/`MEAL_ORDER` in the codebase)
- [X] T028 [US2] Add Cancel and "+ Add Food" buttons in `frontend/src/components/nutrition/AddToLogModal.jsx`: Cancel closes and persists nothing; "+ Add Food" emits the finalized save payload
- [X] T029 [US2] Add quantity validation + cap guard in `frontend/src/components/nutrition/AddToLogModal.jsx`: block "+ Add Food" when quantity is empty/non-numeric/≤0/>1000 or when `scaleServing` output exceeds server caps (calories ≤ 2000, macros ≤ 500) — block, never clamp or fabricate (P26)

**Checkpoint**: US2 fully functional — modal produces validated, derived-from-AI payloads.

---

## Phase 6: User Story 3 - Saved Food Reflects Instantly Under Its Meal Section (Priority: P2)

**Goal**: Persistence & meal integration — user's phase 5. "+ Add Food" persists a real owner-scoped DB entry; the food appears instantly under the selected meal section with no refresh; meal sections always render, empty ones showing the exact mandated empty state (FR-010, FR-011).

**Independent Test**: Add a food with meal "Lunch" — it appears under the Lunch section immediately without refresh and survives a page reload; a meal with zero foods shows "No food logged for Lunch" + "Use AI search above to find and add foods."

### Implementation for User Story 3

- [X] T030 [US3] Build the save payload in `frontend/src/pages/Nutrition.jsx`: `{ foodName, quantity: <scaled grams>, unit: 'g', calories, protein, carbs, fat, mealType, date, source: 'ai' }` — fiber/sugar/sodium deliberately excluded (transient, P30)
- [X] T031 [US3] Persist via the existing create endpoint: `apiPost('/api/nutrition', payload)` from `frontend/src/services/api.js` — real backend/DB only, no localStorage/sessionStorage
- [X] T032 [US3] Real-time reflection in `frontend/src/pages/Nutrition.jsx`: after a successful save call `load()` + `refreshDashboard()` (existing 100ms-debounced `DashboardContext` pattern) so the entry appears without a manual refresh
- [X] T033 [US3] Render meal sections unconditionally in `frontend/src/pages/Nutrition.jsx`: always show Breakfast | Lunch | Dinner | Snack (replace any `group.items.length > 0 &&` gating)
- [X] T034 [US3] Per-meal empty state in `frontend/src/pages/Nutrition.jsx`: an empty section renders `EmptyState` with exactly "No food logged for {Meal}" and hint "Use AI search above to find and add foods." (FR-011, SC-005)
- [X] T035 [US3] Ordering & multiples in `frontend/src/pages/Nutrition.jsx`: foods under a section listed by recency as persisted; each confirmation creates its own entry (no dedup/merge); populated + empty sections render together

**Checkpoint**: US3 fully functional — save → immediate, persisted reflection.

---

## Phase 7: User Story 4 - Graceful Loading, Error, and Empty Search States (Priority: P2)

**Goal**: Honest states — part of user's phase 6. Loading during AI calls; honest, retryable error/empty states on failure; invalid submissions blocked; latest submission wins (FR-012, FR-015, edge cases).

**Independent Test**: Submit a search while the AI backend is down (or missing key) — an honest error/empty state appears with a retry path and zero fabricated numbers; empty/whitespace searches are blocked before any AI call.

### Implementation for User Story 4

- [X] T036 [P] [US4] Loading state in `frontend/src/components/nutrition/AiFoodSearch.jsx`: show a spinner/skeleton while `analyzing`; disable the submit button as the duplicate-request guard (no partial/fabricated results while loading)
- [X] T037 [US4] Error taxonomy UI in `frontend/src/components/nutrition/AiFoodSearch.jsx`: map `503 AI_UNCONFIGURED` (retryable system message), `502 AI_UNAVAILABLE` (retryable "temporarily unavailable"), `422 AI_NOT_FOOD` ("Food could not be identified. Please try another search."); failed searches are retryable by re-submitting
- [X] T038 [P] [US4] Input validation in `frontend/src/components/nutrition/AiFoodSearch.jsx`: block empty/whitespace-only submit with an inline message — no AI call is made (edge case 1)
- [X] T039 [P] [US4] Latest-submission-wins guard in `frontend/src/components/nutrition/AiFoodSearch.jsx`: ignore stale responses (track the latest query id; only render the response matching the newest submission)

**Checkpoint**: US4 fully functional — all failure paths honest and retryable.

---

## Phase 8: Polish & Cross-Cutting Concerns (user phases 6 cleanup + 7 verification)

**Purpose**: Remove superseded/static code, security audit, build gates, and the full verification matrix.

- [X] T040 Remove superseded embedded analyzer: delete `frontend/src/components/nutrition/AiAnalyzer.jsx` and strip its imports/usages; confirm the manual Add-entry modal and `frontend/src/components/MealForm.jsx` remain untouched
- [X] T041 [P] Remove static/placeholder nutrition behavior: `git grep` the search flow (`frontend/src/components/nutrition/`, `frontend/src/pages/Nutrition.jsx`) for hardcoded/placeholder macro values; ensure no static source of truth is consumed by the new UI (SC-002)
- [X] T042 Run the P27 static audit per `quickstart.md` §3: all six checks pass (no key/generateContent in frontend, `backend/.env` ignored, `.env.example` placeholder only)
- [X] T043 Run build gates: backend `node --check` on `backend/src/services/aiFoodService.js` and `backend/src/utils/validators.js`; frontend `npm run build --prefix frontend` clean
- [ ] T044 Execute `quickstart.md` §4 browser matrix (16 checks): live search results for common foods, result-card fields incl. micronutrient-absent state, modal open/recalc ratio, save to each of the 4 meals, refresh persistence, per-meal empty states, empty/invalid query, missing key, AI failure, two-user isolation, no Gemini URL in network tab, responsive 360/768/1440, prior-day regression — REQUIRES running backend + Mongo + real Gemini key + browser; not executable in this agent session
- [X] T045 [P] Update agent context after implementation: run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` (needs `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force` first)
- [X] T046 Re-verify success criteria SC-001…SC-008 and close the requirements checklist `specs/018-ai-nutrition-search/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — starts immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (backend analyze endpoint + scoping must exist first)
- **User Stories (Phases 3–7)**: All depend on Foundational completion
  - **Phase 3 (US5)**: independent security/verification increment after Foundational
  - **Phase 4 (US1)**: can start after Foundational; no dependency on US5 beyond the endpoint (which is Foundational)
  - **Phase 5 (US2)**: depends on US1's result card ("+" entry point, T022/T023) and on `nutritionUtils` (T017)
  - **Phase 6 (US3)**: depends on US2's finalized save payload (T028/T029)
  - **Phase 7 (US4)**: touches `AiFoodSearch.jsx` alongside US1 — run after US1 to avoid same-file thrash; otherwise independent
- **Polish (Phase 8)**: depends on all desired stories complete

### User Story Dependencies

- **US5 (P1)**: after Foundational — no story deps (isolation verification)
- **US1 (P1)**: after Foundational — no story deps (search UI built on the Foundational endpoint). **Suggested MVP slice**
- **US2 (P1)**: after US1 (needs result card "+" and `scaleServing`) — independently testable once wired
- **US3 (P2)**: after US2 (needs modal confirm payload) — independently testable via save/reflect/empty-state
- **US4 (P2)**: after US1 (same component); kept sequentially to avoid same-file conflict

### Within Each User Story

- Core implementation before integration
- US1: utils (`T017`) → api surface (`T019`) → component shell (`T018`) → render (`T020`,`T021`) → action (`T022`) → integration (`T023`)
- US2: shell (`T024`) → inputs/actions (`T025`–`T028`) → validation guard (`T029`)
- US3: payload (`T030`) → persist (`T031`) → reflection (`T032`) → sections/empty states (`T033`,`T034`) → ordering (`T035`)
- US4: loading (`T036`) → errors (`T037`) → validation (`T038`) → stale-guard (`T039`)
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003 together
- **Phase 2**: T005–T007 together; T008 + T011 + T012 together (different files); **T009 and T010 are sequential** (same file `aiFoodService.js`)
- **Phase 3 (US5)**: T013, T014 together
- **Phase 4 (US1)**: T017 + T018 + T019 together (different files: `nutritionUtils.js`, `AiFoodSearch.jsx`, `api.js`)
- **Phase 5 (US2)**: T024 (shell) parallel-safe; T025–T029 sequential (same component)
- **Phase 7 (US4)**: T038, T039 parallel-safe alongside T036/T037 areas
- **Phase 8**: T041, T045 together (different targets)
- Different user stories can be worked in parallel by different developers once Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# Launch the pure-math, component shell, and api surface together:
Task: "Create frontend/src/utils/nutritionUtils.js (servingGrams, scaleServing)"
Task: "Create frontend/src/components/nutrition/AiFoodSearch.jsx shell + search bar"
Task: "Verify/extend analyzeNutrition({ query }) in frontend/src/services/api.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — backend analyze endpoint, key server-only, scoping)
3. Complete Phase 3: US5 — verify the security contract (cheap, gates trust)
4. Complete Phase 4: User Story 1
5. **STOP and VALIDATE**: US1 independent test — result card with live AI macros, no client Gemini access
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready (backend analyze live)
2. US5 → security verified
3. US1 → **MVP** (live AI result card) → test independently → demo
4. US2 → modal + live recalc → test independently → demo
5. US3 → save/reflect/empty states → test independently → demo
6. US4 → honest failure states → test independently → demo
7. Polish → cleanup, audit, full quickstart matrix

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Developer A: US5 (isolation verification)
3. Developer B: US1 → US2 (search + modal)
4. Developer C: after B merges US1, US4 (honest states on the same component)
5. US3 after US2; Polish after all stories

---

## Notes

- [P] tasks = different files, no dependencies (exception-none enforced; same-file edits are always sequential)
- [Story] label maps task to the spec user story for traceability (US1–US5)
- Each user story is independently completable + testable via its **Independent Test**
- No automated tests exist in this repo — all verification is `quickstart.md` §3/§4 + build gates; SC-001…SC-008 re-checked in T046
- Commit after each task or logical group (do not commit unless asked)
- Stop at any checkpoint to validate a story independently
- Avoid: vague tasks, same-file [P] conflicts, cross-story dependencies that break independence