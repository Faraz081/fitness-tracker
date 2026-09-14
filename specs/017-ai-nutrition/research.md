# Research: AI-Powered Nutrition Page (017-ai-nutrition)

**Stage**: /sp.plan — Phase 0 (Outline & Research)
**Date**: 2026-09-13
**Source**: constitution v4.4.0 Day 12 (P24–P30 + Gemini AI Analysis Rules), spec.md (017), live repo inspection (Nutrition model/service/routes/page/MealForm/api.js/validators/config/dashboardService), Gemini `generateContent` REST docs (2026)

## Research Questions

There were **no `NEEDS CLARIFICATION` unknowns** in Technical Context — the constitution (Day 12) and the existing codebase pin every decision: the exact endpoint to add (`POST /api/nutrition/analyze`), the exact request/response shape, quantity-aware behaviour, the single env var (`GEMINI_API_KEY`, optional at boot), error taxonomy, the four mandated state strings, and the reuse of the existing Nutrition CRUD + summary + Dashboard aggregates. Research therefore verified the **ground truth of the codebase** and finalized the Gemini integration mechanics. Findings are recorded as Decision / Rationale / Alternatives for each.

## Findings

### 1. Nutrition backend ground truth (verified by direct file reads)

- `backend/src/models/Nutrition.js` — fields: `owner` (ObjectId → User, required), `foodName` (max 100), `quantity` (default 1, 0.01–1000), `unit` (max 20), `calories` (required, 0–2000), `protein`/`carbs`/`fat` (default 0, 0–500), `mealType` enum `breakfast|lunch|dinner|snack` (required), `date` (Date), `timestamps`; index `{ owner, date, mealType }`.
- `backend/src/routes/nutrition.js` — `POST /`, `GET /`, `GET /summary/daily`, `GET /:id`, `PATCH /:id`, `DELETE /:id`; all behind `authenticate` + zod `validate`/`validateQuery`. No route conflicts with a new `POST /analyze` (reserved verb position; still registered before `/:id` for robustness).
- `backend/src/services/nutritionService.js` — owner-scoped CRUD; `createNutritionEntry` **explicitly maps only the 7 known fields + mealType + date**, so an additive `source` field never reaches persistence unless the service + serializer are extended intentionally. `getNutritionSummary` is the server-side daily aggregate (P30 single source of truth).
- `backend/src/utils/validators.js` — `nutritionEntrySchema` (create) is **not `.strict()`**; `nutritionQuerySchema` requires `date` as `YYYY-MM-DD`. New `nutritionAnalyzeSchema` + `nutritionAnalyzeResultSchema` must mirror the same caps.
- `backend/src/middleware/validate.js` — success → `req.body = result.data`; failure → `AppError(400, 'Validation failed', 'VALIDATION_ERROR')`.
- `backend/src/config/index.js` — `requireEnv` (fail-fast) vs plain-optional pattern. **`GEMINI_API_KEY` MUST be read as an optional var** (`process.env.GEMINI_API_KEY`), NOT `requireEnv` — the app must boot and manual logging must work without it (constitution Day 12).
- `backend/src/controllers/nutrition.js` + `services/nutritionService.js` use `success(res, data, code)`/`success(res, data)` envelope; errors via `AppError(status, message, code)` → `errorHandler`.

### 2. Gemini integration via Node native `fetch` (zero new backend deps)

- **Decision**: Call the Gemini REST API with Node's native `fetch` (Node 24 LTS) — no SDK. Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=GEMINI_API_KEY`. Body: `{ contents: [{ role: 'user', parts: [{ text: <prompt> }] }], generationConfig }`. Parse `candidates[0].content.parts[0].text` as JSON, then zod-validate server-side.
- **Rationale**: The constitution lists native `fetch` as the preferred path ("Node 24, zero new deps"); `@google/generative-ai` would require recording a constitution-approved single backend dependency in Complexity Tracking. Native fetch is stable on Node 24, needs no install, and the auth model is a simple header/query key.
- **Alternatives**: (a) `@google/generative-ai` SDK — rejected (needs approved dependency + install; adds nothing native fetch doesn't give for a single-turn JSON call). (b) A self-hosted LLM proxy — rejected (new infrastructure + new env/config, violates "one optional-at-boot server variable").

### 3. Model choice + generation config

- **Decision**: `models/gemini-2.5-flash` with `generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 400 }`; single-turn `contents` array of length 1. Model name is a **hard-coded server constant** (no new env var).
- **Rationale**: gemini-2.5-flash is the fast/cheap tier well-suited to small structured JSON extraction; low temperature = deterministic schema-compliant output; `responseMimeType: application/json` forces valid JSON (no markdown fences), making server-side parse+zod validation trivial. A fixed 10s `AbortSignal.timeout` bounds cost/latency and satisfies "analysis call MUST have a server-side timeout".
- **Alternatives**: `gemini-2.5-pro` — rejected (slower/higher cost, same accuracy for this trivial task). Configurable model env var — rejected (only `GEMINI_API_KEY` may be added).

### 4. Analyze endpoint design + error taxonomy

- **Decision**: `POST /api/nutrition/analyze` behind `authenticate` (stateless; no DB writes). Request `{ query: string(1..200), quantity?: number(0.01..1000), unit?: string(1..20) }` (zod `.strict()`). On success returns `{ foodName, quantity, unit, calories, protein, carbs, fat }` validated against `nutritionAnalyzeResultSchema` (same caps as the create schema). Errors: `503 AI_UNCONFIGURED` (missing `GEMINI_API_KEY`), `422 AI_NOT_FOOD` with message **"Food could not be identified. Please try another search."** (model signals unrecognized input), `502 AI_UNAVAILABLE` (network/timeout/5xx/non-JSON or out-of-schema model output), `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`. All via the standard `AppError`/envelope.
- **Rationale**: One owner-scoped (auth-gated), state-unbound endpoint is exactly what the constitution mandates; server-side zod validation guarantees the frontend never parses raw model text (P27); distinct codes give the frontend a retryable vs "change prompt" UX.
- **Alternatives**: Client-side Gemini call — rejected (absolute P27 violation). Multiple AI endpoints (analyze+status+retry) — rejected (constitution allows exactly one; retry = replay same request client-side). Returning raw model text for client parsing — rejected (P27/Gemini rules).

### 5. Quantity-aware prompt handoff

- **Decision**: The server prompt embeds the trimmed `query` plus, when provided, `quantity` + `unit`, with explicit instructions: "When quantity+unit are provided, scale the estimate to that serving; when absent, supply a sensible default serving for the described food." Output must still be STRICT JSON matching the schema; if the text is not food/drink, return `{"foodName": null}` which the service maps to 422 `AI_NOT_FOOD`.
- **Rationale**: FR-006/SC-002 — quantity-aware estimates and a reasonable default serving, both remaining user-editable (P25).
- **Alternatives**: Post-process scaling server-side from a per-100g reference — rejected (model scaling inline is simpler, keeps one source of truth for the estimate, and stays quantity-aware by construction).

### 6. Frontend integration — reuse `MealForm` as the editable preview (P24, minimal diff)

- **Decision**: No page restructuring (P24). A new presentational `frontend/src/components/nutrition/AiAnalyzer.jsx` panel is added **inside the existing Add-entry modal** above the reused `MealForm`. On success the parent `Nutrition.jsx` stores a stable `aiPreview` object (`{ ...estimate, mealType: 'breakfast' }`) and passes it as `initialEntry` to `MealForm`, which already repopulates all fields live via its `useEffect([initialEntry, defaultDate])` (verified: `MealForm.jsx:21-43`). The **verification note** ("AI-generated nutrition values — please verify before saving.") renders between analyzer and form. Save submits the existing `POST /api/nutrition` (unchanged `handleSubmit` => `api.createNutritionEntry`) with `source: 'ai'` when `aiPreview` is set, then `setDate(payload.date)` + `refreshDashboard()` + `load()` — the existing P29/P30 instant-consistency path, no new refetch machinery.
- **Rationale**: `MealForm` already has every editable field required by FR-008 (food name, quantity, unit, calories, protein, carbs, fat, meal type, date) and an `initialEntry` prefill hook; reusing it keeps the modal layout/theme identical, minimizes diff, and guarantees save goes through the normal create path (P25).
- **Alternatives**: (a) A dedicated AI-preview card separate from MealForm — rejected (duplicate fields, two save paths, more code). (b) Modifying `MealForm` to add an `aiMode` — rejected (the `initialEntry` prefill already does the job with zero changes; the default-mealType wrapper object is attached by the parent). (c) Inline AI UI directly in `Nutrition.jsx` — rejected (a 344-line page gaining ~100 more lines; the small component keeps concerns separate and matches the `components/nutrition|search` subfolder convention).

### 7. Mandated state strings (FR-022 defines exact copy)

- **Decision**: `"Analyzing food..."` shown via the existing `Button` `isLoading` state (analyze disabled while pending → also satisfies the duplicate-request guard FR-023); `"Loading nutrition data..."` — the existing `ListSkeleton` loading branch is retained (loading already idiomatic; no string change required for the content-behavior, but the analysis preview uses the mandated analyzing string verbatim); the empty/date-with-no-entries state keeps its `EmptyState` structure and button while its heading copy is aligned to the mandated **"No nutrition entries for this date."** (currently "No entries for this date" — copy-only change, layout/component unchanged); `"Food could not be identified. Please try another search."` surfaces from 422 `AI_NOT_FOOD`. A generic retryable error banner (existing `text-error` styling) covers 502/503.
- **Rationale**: FR-022 pins these strings; P24 preserves structure, theme, and sections — copy alignment does not redesign the page.
- **Alternatives**: Leaving current copy untouched — rejected (fails FR-022's exact-string requirements in Acceptance testing). Adding a bespoke spinner component — rejected (existing `Button.isLoading` primitive is sufficient and zero-dep).

### 8. Verification strategy (no automated test suite)

- **Decision**: Gates = `npm run build` (vite, MUST be clean), backend `node --check` on new/changed modules, and a **manual browser matrix** recorded in quickstart.md covering the constitution's Day 12 DoD-13 list (natural-language analyze, quantity-aware estimate, editable preview + verification note, save → meal/totals/Dashboard auto-update, edit/delete recalculation, invalid food, missing-API-key, Gemini-failure, two-user isolation, empty-date, responsive 3 breakpoints, prior-day regression). Optional live check only when a real key is available locally/CI (never committed).
- **Rationale**: Prior-day policy (Day 9/12) — frontend automated test suites and CI are explicitly out of scope; evidence-based manual sign-off is the established convention (013/011 quickstart results pattern).
- **Alternatives**: Adding Vitest/Playwright — rejected (explicitly out of scope + zero-new-deps).

## Consolidated Decisions

All resolved; zero `[NEEDS CLARIFICATION]` markers remain. Full data-model details in [data-model.md](./data-model.md); the endpoint contract in [contracts/](./contracts/); verification steps in [quickstart.md](./quickstart.md).