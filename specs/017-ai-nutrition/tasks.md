---

description: "Task list for AI-Powered Nutrition Page (Day 12 — Gemini-powered natural-language logging)"
---

# Tasks: AI-Powered Nutrition Page

**Input**: Design documents from `specs/017-ai-nutrition/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT requested — this feature has no automated suite (Day 12 explicitly defers it; prior-day policy). QA is backend `node --check` + `npm run build` + **manual browser verification** recorded in `quickstart.md` (constitution Day 12 DoD-13). No TDD/unit-test tasks are generated.

**Organization**: Phases are grouped by spec user story in **priority order** (US1–US4 + US6 are P1; US5 is P2), each with an Independent Test. Setup + Foundational phases are prerequisites. Every task is self-contained with exact file paths and the pinned values/codes from `plan.md`, `research.md`, and `contracts/POST-nutrition-analyze.md` — an LLM can execute it without extra context.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Path Conventions

- Web app → `backend/src/` and `frontend/src/` (both touched; no new directories beyond `frontend/src/components/nutrition/`)

## User-Input Mapping

The user's 8-section outline maps to phases as: §1 Audit & Foundation → Phase 1; §2 Secure Gemini Backend → Phase 2; §3 AI Search UX → Phase 3 (US1); §4 Save & Meal Integration → Phase 4 (US2); §5 Dynamic Totals & Filters → Phase 5 (US3); §6 Real-Time Sync & Dashboard → Phases 6+8 (US4 + US5); §7 States/Cleanup/Security → Phase 7 (US6) + Phase 9; §8 Final Verification → Phase 9.

---

## Phase 1: Setup (Audit & Foundation)

**Purpose**: Confirm the existing page/APIs/CRUD to preserve (P24) and identify reusable vs new parts before any code changes. Read-only reconnaissance — no files are modified.

- [X] T001 [P] Audit the existing Nutrition page and record the elements to preserve (heading, Add Entry button, Filter/Search Foods, Breakfast/Lunch/Dinner/Snack filters, date selector, Calories/Protein/Carbs/Fat summary cards, entries section, CRUD) in `specs/017-ai-nutrition/quickstart.md` — read `frontend/src/pages/Nutrition.jsx`
- [X] T002 [P] Audit backend reuse surface — field caps + index in `backend/src/models/Nutrition.js`; routes in `backend/src/routes/nutrition.js`; owner-scoped CRUD + `getNutritionSummary` in `backend/src/services/nutritionService.js`; schemas in `backend/src/utils/validators.js`; optional-env pattern in `backend/src/config/index.js`
- [X] T003 [P] Confirm current date handling, meal filters, summary cards, and the post-mutation refetch/Dashboard-sync flow (default today, `applyFilters`, server summary, `refreshDashboard()` + `load()`) — read `frontend/src/pages/Nutrition.jsx` + `frontend/src/context/DashboardContext.jsx` + `backend/src/services/dashboardService.js`
- [X] T004 [P] Identify reusable vs new: confirm `MealForm` `initialEntry` prefill already covers all FR-008 editable fields (food name, quantity, unit, calories, protein, carbs, fat, meal type, date) and locate the existing empty-state copy + API wrapper — read `frontend/src/components/MealForm.jsx`, `frontend/src/services/api.js`, `frontend/src/pages/Nutrition.jsx`

---

## Phase 2: Foundational (Blocking Prerequisites) — Secure Gemini Backend + Shared Schema

**Purpose**: The backend AI proxy + the additive `source` field + optional env config. This is the shared infrastructure every AI story consumes (US1, US2, US6) and the `source` marker US2 writes. Per `plan.md`/`research.md`/`contracts/POST-nutrition-analyze.md`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete (backend must accept + validate the analyze request before the UI can call it).

- [X] T005 [P] Add optional `GEMINI_API_KEY` read to `backend/src/config/index.js` using the optional pattern (e.g. `process.env.GEMINI_API_KEY` / `?? ''`) — **NOT** `requireEnv` (app MUST boot without it per Day 12)
- [X] T006 [P] Add the `GEMINI_API_KEY=` placeholder line (no real value) to `backend/.env.example`
- [X] T007 [P] Add the optional `source` field to `backend/src/models/Nutrition.js`: `{ type: String, enum: ['ai','manual'], default: 'manual' }`, NOT indexed; no other schema/index/math change
- [X] T008 [P] In `backend/src/utils/validators.js` add `nutritionAnalyzeSchema` (`{ query: string 1–200 trimmed, quantity?: 0.01–1000, unit?: 1–20 }`, `.strict()`) and `nutritionAnalyzeResultSchema` (foodName 1–100, quantity 0.01–1000, unit 1–20 optional/blank→undefined, calories 0–2000, protein/carbs/fat 0–500), and add optional `source: z.enum(['ai','manual'])` to `nutritionEntrySchema`
- [X] T009 Map `source` in `createNutritionEntry` (`source: input.source === 'ai' ? 'ai' : 'manual'`) and serialize `source: n.source ?? 'manual'` in `toNutrition` in `backend/src/services/nutritionService.js` (depends on T007, T008)
- [X] T010 Create `backend/src/services/aiFoodService.js` — stateless `analyzeFood({ query, quantity, unit })`: missing key → `AppError(503, …, 'AI_UNCONFIGURED')`; build strict single-turn prompt (scale to given quantity/unit, else sensible default, non-food → `{"foodName": null}`); `fetch` `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=<GEMINI_API_KEY>` with `contents[{role:'user',parts:[{text}]}]` + `generationConfig { responseMimeType:'application/json', temperature:0.2, maxOutputTokens:400 }`, wrapped in `AbortSignal.timeout(10_000)`; parse `candidates[0].content.parts[0].text` → `JSON.parse` → `nutritionAnalyzeResultSchema`; failures → `AppError(422, 'Food could not be identified. Please try another search.', 'AI_NOT_FOOD')` / `AppError(502, 'AI analysis is temporarily unavailable. Please try again.', 'AI_UNAVAILABLE')` (depends on T005, T008)
- [X] T011 Add `analyzeNutritionHandler` to `backend/src/controllers/nutrition.js` calling `aiFoodService.analyzeFood(req.body)` and returning via `success(res, estimate)` (depends on T010)
- [X] T012 Register `nutritionRouter.post('/analyze', validate(nutritionAnalyzeSchema), analyzeNutritionHandler)` in `backend/src/routes/nutrition.js` **before** the `/:id` routes (depends on T011)
- [X] T013 Verify foundation: `node --check` every new/changed backend module passes; boot the server with `GEMINI_API_KEY` unset and confirm it starts; `POST /api/nutrition/analyze` without the key returns `503 AI_UNCONFIGURED` (not a crash)

**Checkpoint**: Backend proxy + `source` schema are ready — the frontend AI flow can now be built.

---

## Phase 3: User Story 1 - Log Food by Typing Plain Language (Priority: P1) 🎯 MVP

**Goal**: An authenticated user types a natural-language description (e.g. "1 banana", "200g grilled chicken with rice"), triggers "Analyze with AI", and receives a structured, editable estimate (food name, quantity, unit, calories, protein, carbs, fat).

**Independent Test**: A logged-in user types "1 banana", presses "Analyze with AI", and sees a complete editable estimate — "Analyzing food..." shows while pending and a second click while pending is blocked. Works on its own, without save/totals/Dashboard work.

- [X] T014 [P] [US1] Add `analyzeNutrition({ query, quantity, unit })` to `frontend/src/services/api.js` → `apiPost('/api/nutrition/analyze', { query, quantity, unit })`
- [X] T015 [P] [US1] Create presentational `frontend/src/components/nutrition/AiAnalyzer.jsx`: natural-language description `Input`, optional quantity + unit `Input`s, an "Analyze with AI" `Button` that is **disabled when the description is blank or analysis is running** and shows **"Analyzing food..."** while pending; accepts `{ analyzing, error, onAnalyze, onClear }`; reuses existing `Input`/`Button` primitives (black + orange theme preserved, P24)
- [X] T016 [US1] Integrate `AiAnalyzer` into the existing Add-entry modal in `frontend/src/pages/Nutrition.jsx`: add `aiQuery`/`aiQuantity`/`aiUnit`/`aiPreview`/`analyzing`/`aiError` state, render the analyzer above the reused `MealForm`, and call `api.analyzeNutrition(...)` on submit (depends on T014, T015)
- [X] T017 [US1] On analyze success, set a stable `aiPreview = { ...estimate, mealType: 'breakfast' }` and pass `initialEntry={editing ?? aiPreview}` to `MealForm` so every field preflills live via its existing `useEffect([initialEntry, defaultDate])` in `frontend/src/pages/Nutrition.jsx` (depends on T016)
- [X] T018 [US1] Guard duplicate requests: the analyze handler no-ops while `analyzing` is true and the button stays disabled; manual "Add entry" (MealForm without AI) remains fully available in `frontend/src/pages/Nutrition.jsx` (depends on T016)

**Checkpoint**: User Story 1 is independently functional — description → editable AI estimate, no save required.

---

## Phase 4: User Story 2 - Review, Adjust & Save the AI Result (Priority: P1)

**Goal**: The estimate is never auto-saved. The user edits any field, sees "AI-generated nutrition values — please verify before saving.", picks a meal type + date, and explicitly saves — the entry appears immediately in that meal section. Cancelling persists nothing.

**Independent Test**: Open an AI preview, edit fields + pick a meal, Save → an entry is created with `source: 'ai'` and appears in that section; Cancel → no record exists.

- [X] T019 [US2] Add `source: 'ai'` to the create payload when an AI preview is confirmed (spread only for the create branch; editing an existing entry leaves `source` untouched) in `frontend/src/pages/Nutrition.jsx`
- [X] T020 [US2] Ensure Save routes through the existing `api.createNutritionEntry` path and triggers `setDate(payload.date)` + `refreshDashboard()` + `load()` so the new entry appears immediately in the selected meal/date in `frontend/src/pages/Nutrition.jsx` (depends on T019)
- [X] T021 [US2] Clear `aiPreview`/`aiQuery`/`aiQuantity`/`aiUnit`/`aiError` on modal close, cancel, and every fresh "Add entry" open so a cancelled preview persists nothing in `frontend/src/pages/Nutrition.jsx`
- [X] T022 [US2] Confirm the reused `MealForm` meal-type (Breakfast/Lunch/Dinner/Snack) + date selections are stored on the entry and render in the matching meal section/date for all four meal types in `frontend/src/components/MealForm.jsx` + `frontend/src/pages/Nutrition.jsx` (expected: no `MealForm` change)
- [X] T023 [US2] Ensure the verification note **"AI-generated nutrition values — please verify before saving."** is displayed on every AI preview (rendered by `AiAnalyzer`/modal, not on manual entry) in `frontend/src/components/nutrition/AiAnalyzer.jsx`

**Checkpoint**: User Stories 1 AND 2 work — the full describe → review → save loop is deliverable.

---

## Phase 5: User Story 3 - See the Day's Meals, Filters & Dynamic Totals (Priority: P1)

**Goal**: Date defaults to today; meal sections + the four summary cards are populated entirely from the user's real records for the selected date; meal filters show only that meal's real entries; changing the date recollects entries + totals; an empty date shows the mandated empty state.

**Independent Test**: With saved entries, change date and meal filters and watch totals recompute from real records — no refresh, no demo data; an empty date shows zeros + "No nutrition entries for this date."

- [X] T024 [US3] Align the no-entries empty-state heading to the mandated **"No nutrition entries for this date."** while keeping the existing card structure / icon / "Add your first entry" button (copy-only change) in `frontend/src/pages/Nutrition.jsx`
- [X] T025 [US3] Confirm the four summary cards + meal sections render from `getNutritionSummary`/real list entries for the selected date (default today); no static values — `frontend/src/pages/Nutrition.jsx`
- [X] T026 [US3] Confirm breakfast/lunch/dinner/snack filters operate on the user's real saved entries for the selected date only — never a static list in `frontend/src/pages/Nutrition.jsx`
- [X] T027 [US3] Confirm changing the date recollects the entry list, meal sections, and all four totals (zeros + empty state on a date with no entries) in `frontend/src/pages/Nutrition.jsx`

**Checkpoint**: Real-data totals, filters, and date navigation are correct and independent of the AI stories.

---

## Phase 6: User Story 4 - Edit & Delete Existing Entries (Priority: P1)

**Goal**: Existing CRUD is preserved — edit updates the DB and recalcs totals; delete (after confirmation) removes the record and recalcs; cancelling a delete leaves it intact.

**Independent Test**: Edit an entry → totals change; delete an entry → record removed and totals change; cancel a pending delete → entry intact.

- [X] T028 [US4] Confirm the edit flow uses the existing `api.updateNutritionEntry` path, preserves `source`, and recalculates meal sections + all four totals + Dashboard immediately in `frontend/src/pages/Nutrition.jsx`
- [X] T029 [US4] Confirm the delete flow (confirm → `api.deleteNutritionEntry`) removes the record and recalculates every affected total; Cancel leaves the entry intact in `frontend/src/pages/Nutrition.jsx`

**Checkpoint**: All P1 core stories (US1–US4) function independently.

---

## Phase 7: User Story 6 - Graceful Failures & Secure AI Integration (Priority: P1)

**Goal**: The AI path fails gracefully in every mode (no key, service outage, unidentifiable food), shows clear retryable messages, fabricates nothing, keeps manual logging working, and never exposes the credential client-side.

**Independent Test**: Trigger each failure mode and see the correct message, retry works, manual logging still works, and no key string appears in frontend code, responses, or committed files; a cross-user request returns 404 with no leak.

- [X] T030 [US6] Surface the distinct AI errors with a retry action in `frontend/src/pages/Nutrition.jsx` + `frontend/src/components/nutrition/AiAnalyzer.jsx`: `503 AI_UNCONFIGURED` → clear "not configured" message; `502 AI_UNAVAILABLE` → retryable message; `422 AI_NOT_FOOD` → **"Food could not be identified. Please try another search."** (use the `ApiError.code`/`message` from `frontend/src/services/api.js`)
- [X] T031 [US6] Ensure the analyze action re-enables after any failure, no fabricated values are inserted, and manual entry remains fully usable in `frontend/src/pages/Nutrition.jsx` + `frontend/src/components/nutrition/AiAnalyzer.jsx`
- [X] T032 [US6] Static credential audit (record in `quickstart.md`): no `GEMINI_API_KEY`, `generativelanguage`, or `AIza…` strings in `frontend/src` or any committed file; key exists only in local `backend/.env` (quickstart step 4)
- [X] T033 [US6] Two-user isolation check: user B directly requesting user A's nutrition entry id returns `404 NOT_FOUND` and B never sees A's meals/totals (owner-filter `{ owner: req.userId }`) — record result in `quickstart.md`
- [X] T034 [US6] Confirm `POST /api/nutrition/analyze` is `authenticate`-gated and persists nothing (`backend/src/routes/nutrition.js` + `backend/src/services/aiFoodService.js`)

**Checkpoint**: AI failures are honest and safe; no credential exposure; per-user isolation holds.

---

## Phase 8: User Story 5 - Dashboard Stays in Sync (Priority: P2)

**Goal**: Dashboard nutrition values (calories, protein, carbs, fat + related progress) are driven by the same records as the Nutrition page; after any add/edit/delete they reflect the change — no separate dashboard-only dataset.

**Independent Test**: Add/edit/delete an entry on the Nutrition page, view/refresh the Dashboard, and see identical nutrition values; no records → consistent zero/empty state everywhere.

- [X] T035 [US5] Confirm `refreshDashboard()` fires after every add/edit/delete and the page updates with no manual browser refresh in `frontend/src/pages/Nutrition.jsx` + `frontend/src/context/DashboardContext.jsx`
- [X] T036 [US5] Confirm `backend/src/services/dashboardService.js` aggregates the same `Nutrition` records (no new/separate nutrition dataset, `source` excluded from math — P30)
- [X] T037 [US5] Verify Dashboard nutrition values match Nutrition totals after a mutation and stay consistent at zero when no records exist — record in `quickstart.md`

**Checkpoint**: Every spec user story is independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, security hardening, build gates, and the full Day 12 DoD-13 verification recorded in `quickstart.md`.

- [X] T038 [P] Remove/confirm-absent all static/mock/demo nutrition data: grep `frontend/src` + `backend/src` for mock/demo/seed nutrition; confirm every rendered value derives from real records (P26)
- [X] T039 [P] Build/syntax gates: `npm run build` in `frontend/` succeeds clean; `node --check` passes on every new/changed module in `backend/src/`
- [ ] T040 [P] Run the full `quickstart.md` step-5 DoD-13 manual matrix — Breakfast/Lunch/Dinner/Snack AI flows, edit/delete recalculation, date filtering, Dashboard sync, Gemini failure + invalid food, missing key, two-user isolation, empty date, responsive 360/768/1440, prior-day regression — and record PASS/FAIL per row
- [X] T041 [P] Complete `quickstart.md` result tables (static audit, build, DoD compliance) and note any follow-ups; confirm `AGENTS.md` reflects the feature (already refreshed during `/sp.plan`)
- [X] T042 Final polish: consistency pass over the AI panel (theme preserved, P24), remove dead code/temp logs/console noise, and confirm zero new frontend deps and no new required env vars in `frontend/src/` + `backend/src/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (read-only).
- **Foundational (Phase 2)**: Depends on Setup; **BLOCKS all user stories** (the analyze endpoint + `source` schema).
- **User Stories (Phases 3–8)**: All depend on Foundational.
  - US1, US3, US4 can start in parallel after Foundational (US3/US4 are existing-behavior alignment).
  - US2 depends on US1 (needs the preview to exist).
  - US6 depends on US1 (surfaces the analyzer errors) — order by priority: US6 (P1) before US5 (P2).
  - US5 depends on US2/US4 (mutations must exist).
- **Polish (Phase 9)**: Depends on all desired stories.

### User Story Delivery Map

| Story | Priority | Phase | Independent Test |
|-------|----------|-------|------------------|
| US1 Log by typing plain language | P1 | Phase 3 (T014–T018) | Type "1 banana" → Analyze with AI → editable estimate; "Analyzing food..." + duplicate guard |
| US2 Review, adjust & save | P1 | Phase 4 (T019–T023) | Edit fields + pick meal → Save creates `source:'ai'` entry in section; Cancel persists nothing |
| US3 Meals, filters & dynamic totals | P1 | Phase 5 (T024–T027) | Change date/filters → totals recompute from real entries; empty date shows mandated empty state |
| US4 Edit & delete entries | P1 | Phase 6 (T028–T029) | Edit/delete recalc totals; cancel delete keeps record |
| US6 Graceful failures & security | P1 | Phase 7 (T030–T034) | Each failure mode shows correct retryable message; key never client-side; cross-user → 404 |
| US5 Dashboard sync | P2 | Phase 8 (T035–T037) | Mutate on Nutrition → Dashboard shows identical values from same records |

### Within Each Story

- Backend → service → endpoint → frontend wiring (already ordered in phases).
- Verify at each Checkpoint before moving to the next priority.
- Values/codes/strings are pinned in `plan.md` + `contracts/` — implement against them, do not invent.

### Parallel Opportunities

- Phase 1: T001–T004 all [P] (read-only).
- Phase 2: T005–T008 all [P] (different files); T009, T010 after; T011 → T012 → T013 sequential.
- Phase 3: T014 + T015 [P] (different files); T016 → T017/T018 sequential (all `Nutrition.jsx` except T015).
- Phase 5: T024–T027 mostly `Nutrition.jsx` (sequential edits, but independently verifiable).
- Phase 9: T038–T041 all [P]; T042 last.

---

## Parallel Example: Phase 3 (US1)

```bash
# Launch the two independent file tasks together:
Task: "T014 [P] [US1] Add analyzeNutrition(...) to frontend/src/services/api.js"
Task: "T015 [P] [US1] Create frontend/src/components/nutrition/AiAnalyzer.jsx"

# Then the sequential Nutrition.jsx wiring:
Task: "T016 [US1] Integrate AiAnalyzer into the Add-entry modal in frontend/src/pages/Nutrition.jsx"
Task: "T017 [US1] Render aiPreview as editable MealForm initialEntry"
Task: "T018 [US1] Duplicate-request guard + manual entry still available"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — backend proxy blocks everything).
3. Complete Phase 3: US1 (description → editable AI estimate).
4. **STOP and VALIDATE**: run the US1 Independent Test; check `503 AI_UNCONFIGURED` when no key.
5. Demo if ready — that alone proves the headline AI capability securely.

### Incremental Delivery

1. Setup + Foundational → secure backend proxy ready.
2. US1 → MVP (natural-language estimate).
3. US2 → full save loop (entry appears in meal section).
4. US3 → real-data totals/filters/date.
5. US4 → CRUD preserved.
6. US6 → failure/security hardening.
7. US5 → Dashboard sync.
8. Polish → final DoD-13 verification + quickstart results.

### Parallel Team Strategy

With multiple contributors after Foundational: Developer A → US1→US2 (AI flow); Developer B → US3+US4 (existing-behavior alignment); Developer C → US6 (failure/security) then US5 (Dashboard sync).

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps each task to its spec user story for traceability.
- No test tasks: tests were not requested; QA is manual + build gates per Day 12 policy.
- Every task carries exact paths + pinned values/error codes/strings — no additional context needed.
- Backend-first: never start frontend AI wiring before T012 lands.
- Out of scope (do NOT add): page redesign, photo/barcode logging, food DB/catalog, AI chat, auto-save without confirmation, new meal types, new frontend deps, new required env vars, automated CI/visual tests.
- Reminder: `stash@{0}` still holds the 016-dynamic-goals-page working tree (incl. the Day 12 constitution amendment) — pop it when 016 work resumes.
