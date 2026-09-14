# Research: Nutrition Search (AI-Powered Food Logging) — 018-ai-nutrition-search

**Stage**: /sp.plan — Phase 0 (Outline & Research)
**Date**: 2026-09-13
**Source**: constitution v4.2.0 Day 12 (P24–P30 + Required Capabilities + Search/Result/Modal/Empty-State/Failure Rules), spec.md (018), live repo inspection (Nutrition model/service/routes/controller, aiFoodService, validators, config, Nutrition.jsx, AiAnalyzer, api.js, MealForm, ui primitives, DashboardContext), Gemini `generateContent` REST docs (2026)

## Research Questions

**No `NEEDS CLARIFICATION` unknowns remain** — the constitution (Day 12) and spec pin every decision. One leftover marker from the spec (FR-014: "cross-user access semantics beyond the login-scoped contract — e.g. admin visibility") is resolved by P28: Day 12 mandates strict owner scoping, `404` for not-owned ids, and lists "changes to authentication / cross-device sync" as out of scope; there is no admin-support surface. Research therefore verified the **ground truth of the (partially uncommitted) working tree** and finalized the Gemini serving/recalculation mechanics. Findings are recorded as Decision / Rationale / Alternatives.

## Findings

### 1. Backend ground truth — the auth-scoped proxy already exists (uncommitted 017 work)

- **Already implemented in the working tree** (from uncommitted `017-ai-nutrition`):
  - `backend/src/routes/nutrition.js` — `POST /analyze` registered **before** `/:id`, behind `nutritionRouter.use(authenticate)` and `validate(nutritionAnalyzeSchema)`. ✅
  - `backend/src/controllers/nutrition.js` — `analyzeNutritionHandler` → `aiFoodService.analyzeFood(req.body)` → `success(res, estimate)`. ✅
  - `backend/src/services/aiFoodService.js` — stateless Gemini proxy: native `fetch` to `gemini-2.5-flash:generateContent`, `AbortSignal.timeout(10_000)`, `responseMimeType: application/json`, parses `candidates[0].content.parts[0].text`, zod-validates via `nutritionAnalyzeResultSchema`; error taxonomy `503 AI_UNCONFIGURED` / `422 AI_NOT_FOOD` / `502 AI_UNAVAILABLE`. ✅
  - `backend/src/config/index.js` — `GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''` (optional-at-boot, **not** `requireEnv`). ✅
  - `backend/src/models/Nutrition.js` — additive optional `source` enum `['ai','manual']` default `'manual'`, **unindexed**. ✅
  - `backend/src/services/nutritionService.js` — `createNutritionEntry` maps `source: input.source === 'ai' ? 'ai' : 'manual'`; `toNutrition` serializes `source`. ✅
  - `frontend/src/services/api.js` — `analyzeNutrition({ query, quantity, unit })` → `apiPost('/api/nutrition/analyze', …)`. ✅
  - `frontend/src/components/nutrition/AiAnalyzer.jsx` — presentational **embedded** analyzer (description + qty/unit + Analyze). ⚠️ superseded by 018's standalone flow.
- **Decision**: Reuse the entire backend surface. 018 makes **no** new endpoint, **no** new model/collection, **no** new env var, **no** new dependency.
- **Rationale**: P24/P27/P30 — additive-and-non-destructive; the proxy is already auth-gated, key is already backend-only, `source` already capsulates provenance without touching math.
- **Alternatives**: (a) A second analyze endpoint — rejected (constitution mandates **ONE** proxy; reuse). (b) New env vars / model fields for micronutrients — rejected (P30: transient display only). (c) Rewriting the service — rejected (no behavior change needed beyond prompt/schema extension).

### 2. Gemini serving model — gram-denominated serving basis

- **Decision**: The service prompt will instruct the model to return the serving **in grams**: `quantity` (grams, 0.01–1000) and `unit: "g"` (a sensible default gram serving for the described food, e.g. `100` → "Per 100g serving"). The result card renders **"Per {X}g serving"** from `estimate.quantity`.
- **Rationale**: SC-004 / FR-006 — live recalculation must be a strict re-derivation of the AI's per-serving data. A gram basis makes the frontend helper a single pure ratio (`grams / servingGrams`) with no unit-conversion or hidden constants, so "For [X]g: [Y] kcal | P | C | F" is provably traceable to the AI response.
- **Alternatives**: (a) Per-100g-reference scaling server-side — rejected (the model already scales inline; switching to a fixed 100g reference would ignore the food's natural serving and add an unneeded second scaling step). (b) Keeping arbitrary units ("1 cup"/"1 bowl") and converting — rejected (unit conversion introduces guesswork and breaks the "real AI data" traceability). (c) No serving basis — rejected (modal cannot recalculate).

### 3. Fiber / Sugar / Sodium — optional, validated, transient only

- **Decision**: Extend `nutritionAnalyzeResultSchema` with `fiber`, `sugar`, `sodium` — each `z.number().min(0).max(500).optional()` (gram-scale, aligned with existing macro caps). Frontend renders them as a second row **only when present**; absent values show a muted **"not available"** placeholder — never `0`, never invented (P26: "never fabricated zeros").
- **Rationale**: FR-003 requires the optional row; P30 forbids persisting a second nutrition dataset; P26 forbids fabricating values. Optional + validated keeps the model lenient and the UI honest.
- **Alternatives**: Required fields — rejected (Gemini may legitimately omit micronutrients; forcing would fabricate). Persisting them — rejected (P30 / model unchanged).

### 4. Frontend flow — replace the embedded analyzer with the mandated standalone surface

- **Decision**: New `components/nutrition/AiFoodSearch.jsx` (single natural-language search bar + loading/error/empty states + **result card**) and `components/nutrition/AddToLogModal.jsx` (Close X, food name + AI badge, breakdown, editable Quantity (g), live recalc line, Add To dropdown, Cancel / "+ Add Food"). `pages/Nutrition.jsx` renders the search card **above** the meal sections and wires "+" → modal → save. The uncommitted `AiAnalyzer.jsx` embedded panel is **superseded and removed** (017's approach, not an 018-reuse target).
- **Rationale**: The 018 spec (US1–US5) explicitly defines a **dedicated** search → result-card → modal flow that differs from 017's "analyze inside the Add-entry modal, prefill MealForm" approach. Building the spec'd surface is P24-respecting (nothing existing+shipped is removed — 017 is uncommitted work-in-progress being replaced by this plan) and keeps the manual Add-entry modal + `MealForm` fully intact for manual logging.
- **Alternatives**: (a) Keep `AiAnalyzer` + `MealForm` prefill (017 approach) — rejected (does not satisfy US1 result card or the modal's mandated elements/live-recalc line). (b) Reuse `MealForm` inside the new modal — rejected (spec mandates a bespoke modal; `MealForm` is the manual path and already unchanged).

### 5. Live recalculation — pure function, server-cap guarded

- **Decision**: `utils/nutritionUtils.js` exports `scaleServing(estimate, grams)` → `{ calories, protein, carbs, fat }` (each = round(aiValue × grams / servingGrams)); `servingGrams(estimate)` returns `estimate.quantity`. The modal renders `"For {X}g: {Y} kcal | {P}g P | {C}g C | {F}g F"` and recomputes on every quantity keystroke. Before save the modal validates: quantity present, positive, ≤1000, and **scaled values within server caps** (calories ≤ 2000, macros ≤ 500 — the `nutritionEntrySchema` caps). If out of range, "+ Add Food" is blocked with a friendly message.
- **Rationale**: SC-004 (exact ratio equality at the AI serving) + P26 (never clamp/fabricate to force a save) + P30 (create validation remains the single source-of-truth gate). A blocked, honest save beats a silently clamped fake.
- **Alternatives**: Client-side independent ratios — rejected (FR-006 forbids non-AI constants). Clamping scaled output — rejected (fabrication). Extending server caps — rejected (P30/P24: existing endpoint semantics unchanged).

### 6. Real-time reflection & per-meal empty states

- **Decision**: Save flows through the existing `createNutritionEntry` → `setDate(payload.date)` + `load()` + `refreshDashboard()` (the existing 100ms-debounced context; `Nutrition.jsx` already does this in `handleSubmit`). Meal sections render **unconditionally** for the four `MEAL_ORDER` items; an empty section shows the mandated `EmptyState`: **"No food logged for {Meal}"** with hint **"Use AI search above to find and add foods."** (FR-011 exact strings). The current page hides empty sections (`group.items.length > 0 &&`) — 018 changes that to always-render-4 with per-meal empty states; the blanket "No nutrition entries for this date." branch remains only for the zero-entries case.
- **Rationale**: P29 (no manual refresh; real persistence; immediate reflection) + P26 (honest per-meal emptiness invites the AI search) + FR-011.
- **Alternatives**: Keep section hiding — rejected (fails FR-011's per-meal state; the spec + constitution both call for per-meal empty states rendered).

### 7. Error taxonomy & duplicate-request guard (unchanged, mapped to UI)

- **Decision**: Reuse the existing codes — `503 AI_UNCONFIGURED` (missing key → retryable guidance, manual logging unaffected), `422 AI_NOT_FOOD` ("Food could not be identified. Please try another search."), `502 AI_UNAVAILABLE` (timeout/5xx/non-JSON → retryable), `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`. The search button disables while `analyzing` (duplicate guard, FR-012); `api.js` already surfaces `ApiError(message, code, status)` so the UI branches per code.
- **Rationale**: No new backend behavior; the frontend only maps codes to honest, retryable copy (P27/P25).
- **Alternatives**: Retry/hard-refresh machinery — rejected (retry = re-run search client-side; last-wins state).

### 8. Verification strategy (no automated test suite)

- **Decision**: Gates = `npm run build` (vite, MUST be clean), backend `node --check` on changed modules, P27 static audit (no `GEMINI`/key strings in frontend, no client `/generateContent`), and a **manual browser matrix** recorded in quickstart.md covering the Day 12 DoD-12 list (search → live result; result card fields incl. Fiber/Sugar/Sodium-absent state; modal open + live recalc ratio; save to each of 4 meals → correct placement, totals, Dashboard, no refresh; per-meal empty states; empty/invalid query; missing key; unrecognized food; Gemini failure; two-user isolation; network-tab key check; responsive 3 breakpoints; prior-day regression). Optional live check only with a real local key (never committed).
- **Rationale**: Prior-day policy — no automated frontend suite/CI (out of scope); evidence-based manual sign-off is the established convention (013/014/017 pattern).
- **Alternatives**: Vitest/Playwright — rejected (out of scope + zero-new-deps).

## Consolidated Decisions

All resolved; zero `[NEEDS CLARIFICATION]` markers remain. Full data-model details in [data-model.md](./data-model.md); the (extended) endpoint contract in [contracts/](./contracts/); verification steps in [quickstart.md](./quickstart.md).