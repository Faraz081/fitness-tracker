# Implementation Plan: AI-Powered Nutrition Page

**Branch**: `017-ai-nutrition` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/017-ai-nutrition/spec.md` (Day 12, constitution v4.4.0 — AI-Powered Nutrition Logging)

## Summary

Upgrade the existing **Nutrition page** into an **AI-powered, real-time** logging experience: users describe food in natural language, the backend proxies the description to **Gemini** through one new auth-scoped endpoint (`POST /api/nutrition/analyze`, server-side key only, zod-validated structured JSON), the estimate renders in the existing add-entry modal as an **editable preview** (via the reused `MealForm` `initialEntry` prefill) with the mandated verification note, and the user's explicit **Save** goes through the existing owner-scoped `POST /api/nutrition` (additive `source: 'ai'` marker) triggering the existing `refreshDashboard()` + refetch so meal sections, daily totals, filters, and the Dashboard update **without a refresh** (P29/P30). No page redesign, no new Mongoose models, zero new FRONTEND dependencies, one optional-at-boot backend env var (`GEMINI_API_KEY`), zero new required env vars. Manual logging and every prior-day feature keep working without a key.

Direct constitution anchors: P24 (existing UI preservation), P25 (AI as assistant — user-verified preview only), P26 (real data only), P27 (secure backend-only integration), P28 (user isolation), P29 (immediate consistency), P30 (single source of truth) — see Constitution Check. Exact reuse surface already located (see [research.md](./research.md)): `routes/nutrition.js`, `services/nutritionService.js`, `models/Nutrition.js`, `utils/validators.js`, `config/index.js`, `pages/Nutrition.jsx`, `components/MealForm.jsx`, `services/api.js`, plus `DashboardContext.refreshDashboard()`.

## Technical Context

**Language/Version**: JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; only **Node native `fetch`** added for Gemini, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react; **zero new frontend dependencies** (A7/D6)
**Storage**: MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection; one **additive optional `source`** field (`'ai' | 'manual'`, default `'manual'`, unindexed) for provenance only — no new models, no math/query change (P30).
**Testing**: No test suite in repo. Gates = backend `node --check` on new/changed modules, `npm run build` (vite) clean, backend unit-testable service structure (mockable Gemini client), and a **manual browser matrix** recorded in quickstart.md (Day 12 DoD-13). No automated frontend suite/CI (prior-day policy).
**Target Platform**: Modern evergreen browsers (web, responsive down to ~360px)
**Project Type**: Web — full-stack additive feature (existing `backend/` + `frontend/` monorepo)
**Performance Goals**: "log by description" end-to-end ≈ <~8s p95 (fast Gemini tier + fixed 10s server timeout cap); after any mutation, meal sections + the four summary cards + Dashboard reflect the change in **<2s with no manual refresh** (SC-003); near-zero added client bundle weight (reuse existing primitives; no new deps).
**Constraints**: P24 — no page redesign/restructure, keep black + orange theme + sections; JS-only files; zero new frontend npm deps; native `fetch` for Gemini (at most one approved backend SDK recorded in Complexity Tracking if substituted); `GEMINI_API_KEY` server-only, optional-at-boot, `.env.example` placeholder only (Pl III); no AI value persisted without explicit user Save (P25); no fake/mock data anywhere (P26); every nutrition query owner-filtered, cross-user → `404` (P28); the exact four mandated state strings (FR-022); duplicate-analyze guard (FR-023); structured JSON only, never raw model text to the client (P27).
**Scale/Scope**: 1 new backend endpoint + 1 stateless service (`aiFoodService.js`) + 1 validator addition + 1 optional config read + 1 `.env.example` placeholder + additive `source` (model + serializer + create route). Frontend: 1 new presentational component (`components/nutrition/AiAnalyzer.jsx`), `pages/Nutrition.jsx` modal additions (analyze panel + preview prefill + save payload `source`), `services/api.js` +1 function, empty-state copy alignment. Existing CRUD/summary/Dashboard code unchanged apart from additive `source`.

## Constitution Check

*GATE: Passed (verified against Day 12 section of `.specify/memory/constitution.md` v4.4.0 — AI-Powered Nutrition Logging, ACTIVE). Re-checked after Phase 1 — still all green.*

| # | Principle / Rule | How the plan satisfies it |
|---|------------------|---------------------------|
| P24 | Existing UI Preservation | No redesign/restructure: AI analyzer + preview live **inside the existing Add-entry modal** above the untouched `MealForm`; all existing sections, theme, heading/cards preserved; only copy alignment of the empty-state heading to the mandated string. |
| P25 | AI as Assistant, Not Authority | Estimate is preview-only; every field editable via `MealForm`; verification note shown; Saved only via explicit user confirmation through the existing `POST /api/nutrition`; Cancel discards. |
| P26 | Real Data Only | All sections/totals/filters/Dashboard read real owner-scoped records via existing endpoints; no mock/demo data; empty date shows "No nutrition entries for this date." |
| P27 | Secure AI Integration | Key only in backend env (`GEMINI_API_KEY`, optional, `.env.example` placeholder, git-ignored `.env`); single auth-scoped proxy endpoint; zod-validated JSON only; 10s server timeout; key never in frontend/network/responses. |
| P28 | User Isolation | `/analyze` is `authenticate`-gated; all queries `{ owner: req.userId }`; cross-user → `404 NOT_FOUND` (never 403/leak). |
| P29 | Immediate Consistency | Save/edit/delete reuses existing `handleSubmit`/`handleDelete` → `setDate` + `refreshDashboard()` + `load()` (existing 100ms-debounced context); no manual refresh, sub-2s. |
| P30 | Single Source of Truth | Totals + Dashboard both from the same `Nutrition` records via server computation (`nutritionService`, `dashboardService`, `getNutritionSummary`); `source` is provenance-only, excluded from all math. |
| Gemini rules | One endpoint, strict JSON, quantity-aware, missing-key/AI-failure graceful | Contract in [contracts/](./contracts/); research.md #2–5; error taxonomy `AI_UNCONFIGURED`/`AI_NOT_FOOD`/`AI_UNAVAILABLE`; no fabricated values. |
| Backend surface | Additive only | One proxy endpoint + optional `source` marker; no new models; existing endpoints/semantics unchanged. |
| Env | `GEMINI_API_KEY` optional at boot | Read via optional config pattern (`config/index.js`), never `requireEnv`; `.env.example` placeholder; no other new env vars. |
| Dependencies | Zero new frontend / native fetch preferred | No frontend install; backend uses native fetch (Node 24); no SDK — Complexity Tracking empty. |
| States (FR-022) | Mandated strings | "Analyzing food..." (analyze button pending), "AI-generated nutrition values — please verify before saving." (preview note), "No nutrition entries for this date." (empty state), "Food could not be identified. Please try another search." (422). |
| Coding standards | JS-only / out-of-scope | All new files `.js`/`.jsx`; photo logging, food DB/catalog, chat, auto-save, new meal types, redesign — all explicitly out of scope. |

**Complexity Tracking**: No violations — zero new frontend deps, native-fetch Gemini (zero new backend deps), one additive model field, one additive endpoint. (Table intentionally empty.)

## Project Structure

### Documentation (this feature)

```text
specs/017-ai-nutrition/
├── plan.md              # This file (/sp.plan output — active)
├── research.md          # Phase 0 output (/sp.plan output)
├── data-model.md        # Phase 1 output (/sp.plan output)
├── quickstart.md        # Phase 1 output (/sp.plan output)
├── contracts/           # Phase 1 output (/sp.plan output)
│   ├── README.md
│   └── POST-nutrition-analyze.md
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── config/index.js          # MODIFIED: optional GEMINI_API_KEY read (no requireEnv)
    ├── utils/validators.js      # MODIFIED: ADD nutritionAnalyzeSchema + nutritionAnalyzeResultSchema; optional source in create schema
    ├── models/Nutrition.js      # MODIFIED: ADD optional source enum ['ai','manual'] default 'manual' (no index)
    ├── services/
    │   ├── nutritionService.js  # MODIFIED: createNutritionEntry maps source; toNutrition serializes source
    │   └── aiFoodService.js     # NEW: stateless Gemini proxy (native fetch, prompt, zod-validate, timeout, errors)
    ├── controllers/nutrition.js # MODIFIED: ADD analyzeNutritionHandler (via aiFoodService; success envelope)
    └── routes/nutrition.js      # MODIFIED: ADD nutritionRouter.post('/analyze', validate(nutritionAnalyzeSchema), analyzeNutritionHandler) BEFORE /:id

frontend/
└── src/
    ├── services/api.js                # MODIFIED: ADD analyzeNutrition({ query, quantity, unit }) -> post /api/nutrition/analyze
    ├── components/nutrition/
    │   └── AiAnalyzer.jsx             # NEW (presentational): natural-language input + optional qty/unit + Analyze button (isLoading "Analyzing food…" + disabled guard) + inline error + verification note
    └── pages/Nutrition.jsx            # MODIFIED: modal gains AiAnalyzer + aiPreview state (initialEntry={editing ?? {...estimate, mealType:'breakfast'}}) + source:'ai' on save + empty-state heading copy
```

**Structure Decision**: Web app, full-stack additive + non-destructive, following the existing monorepo conventions (services/controllers/routes under `backend/src`; pages/components/services under `frontend/src`; feature components in `components/`). The single new component (`AiAnalyzer`) matches the existing `components/search|snippets` subfolder pattern. `MealForm` is intentionally **unchanged** — the AI preview reuses its `initialEntry` prefill contract.

## Phase 0: Research

Full write-up in [research.md](./research.md). Key resolutions:

1. Backend ground truth verified by direct reads: routes/validators caps, service explicit-field mapping (so `source` requires an intentional serializer change), config optional-env pattern, dashboardService already the Nutrition aggregate consumer (P30 in place).
2. **Native `fetch` → Gemini** (zero new backend deps): `POST …/v1beta/models/gemini-2.5-flash:generateContent?key=…`; `contents` single-turn; `generationConfig { responseMimeType:'application/json', temperature:0.2, maxOutputTokens:400 }`; `AbortSignal.timeout(10_000)`; parse `candidates[0].content.parts[0].text` then zod-validate server-side. (SDK alternative rejected — would need a recorded approved dependency.)
3. Error taxonomy: 400 `VALIDATION_ERROR` · 401 `UNAUTHORIZED` · 422 `AI_NOT_FOOD` (message "Food could not be identified. Please try another search.") · 502 `AI_UNAVAILABLE` · 503 `AI_UNCONFIGURED` (missing key, app still boots).
4. Quantity-aware prompt: embed `quantity`+`unit` when given; else instruct a sensible default serving; non-food → `{"foodName": null}` → 422.
5. Frontend: reuse `MealForm` as the editable preview (wrapper `{ ...estimate, mealType: 'breakfast' }` seeds its prefill effect); new presentational `AiAnalyzer` inside the modal; save through the existing create + `refreshDashboard()`/`load()`; empty-state heading aligned to the mandated string.
6. Verification: build + `node --check` + manual DoD-13 matrix (two-user isolation, network-tab key check, responsive, regression). No automated suite (out of scope).

### Best Practices Found

- **Reuse the prefill contract, don't extend the form**: `MealForm` already repopulates from `initialEntry` on identity change — the AI preview becomes just another `initialEntry`. Zero diff on MealForm.
- **Instant consistency already plumbed**: `useDashboardRefresh().refreshDashboard()` + `load()` is the existing mutation-then-refetch pattern; the AI save slots into it (P29/P30) without new state machinery.
- **Envelope + AppError conventions**: route error handling, `success()` responses, `validate/validateQuery` — the analyze endpoint inherits all of them; only new codes are added (no new error envelope shape).
- **Optional-env pattern**: `GEMINI_API_KEY` reads via plain `process.env` fallback (like `COOKIE_NAME`), never `requireEnv` — matches "optional at boot".
- **Server-side validation of AI output** is mandated, not best-practice-optional: malformed/non-JSON model text must never reach the client.

## Phase 1: Design & Contracts

### Data Model (data-model.md)

One additive change to the existing `Nutrition` model — optional `source` (`'ai'|'manual'`, default `'manual'`, unindexed) for provenance/traceability only — plus the **transient** AI analysis result entity (foodName, quantity, unit, calories, protein, carbs, fat; never persisted directly). Full field tables, state transitions, isolation rules in [data-model.md](./data-model.md); summary math and all existing consumers are unchanged by construction.

### API Contracts (contracts/)

One new endpoint — `POST /api/nutrition/analyze` — fully specified in [contracts/POST-nutrition-analyze.md](./contracts/POST-nutrition-analyze.md) (request/response/error JSON + Gemini implementation notes). [contracts/README.md](./contracts/README.md) documents that all other Nutrition surface is unchanged + the one optional env var.

### Backend Design

- `validators.js`: `nutritionAnalyzeSchema` (`.strict()`; `query` 1–200; optional `quantity` 0.01–1000, `unit` 1–20 w/ `quantity`); `nutritionAnalyzeResultSchema` (mirrors create caps; blank unit normalized); `nutritionEntrySchema` + optional `source`.
- `aiFoodService.js`: `analyzeFood({ query, quantity, unit })` — guard key → `AI_UNCONFIGURED`(503); build strict single-turn prompt; native fetch with `AbortSignal.timeout(10_000)`; parse + zod-validate → `AI_UNAVAILABLE`(502) / `AI_NOT_FOOD`(422); return normalized estimate. Stateless; key read from config.
- `controllers/nutrition.js`: `analyzeNutritionHandler` → `success(res, estimate)`.
- `routes/nutrition.js`: `nutritionRouter.post('/analyze', validate(nutritionAnalyzeSchema), analyzeNutritionHandler)` placed before `/:id`.
- `Nutrition.js` model + `nutritionService.js` (`createNutritionEntry`/`toNutrition`): additive `source`.

### Frontend Design

- `api.js`: `analyzeNutrition({ query, quantity, unit })` → `apiPost('/api/nutrition/analyze', …)`.
- `Nutrition.jsx`: modal gains an "Analyze with AI" region — `AiAnalyzer` (description input, optional quantity/unit, disabled-when-blank/analyzing button showing **"Analyzing food…"**, inline error, verification note). On success set stable `aiPreview = { ...estimate, mealType: 'breakfast' }` and render `<MealForm initialEntry={editing ?? aiPreview} …/>`. `handleSubmit` adds `source: 'ai'` to the create payload when `aiPreview` set (edit leaves `source` untouched); existing `setDate/refreshDashboard/load` yield instant consistency. Empty panel and add-cancel clear `aiPreview`/query. Empty-state heading → "No nutrition entries for this date." (structure/button unchanged).
- New `components/nutrition/AiAnalyzer.jsx`: controlled, presentational, reuses `Input`/`Button` primitives (theme preserved P24), `aria` labels on icon/analyze controls, reduced-motion friendly (existing guards).

### Quickstart Verification

Full steps + result tables in [quickstart.md](./quickstart.md): `.env.example` placeholder → build/`node --check` → P27 static audit (no key strings in frontend/repo, no `/generateContent` client-side) → 16-point manual DoD-13 matrix (analyze flow, quantity-aware, editable preview + note, save→meals/totals/Dashboard, edit/delete recalc, invalid food, duplicate guard, Gemini failure, missing key, empty date, two-user isolation, network-tab check, responsive 360/768/1440, regression).

## Phase 2: Task Breakdown (for /sp.tasks)

Tasks will be ordered by dependency (backend-first so the endpoint exists before frontend wiring):

### Group 1 — Backend: secure Gemini proxy
- T01: `validators.js` — add `nutritionAnalyzeSchema` + `nutritionAnalyzeResultSchema`; optional `source` in `nutritionEntrySchema`
- T02: `config/index.js` — optional `GEMINI_API_KEY` read (no `requireEnv`)
- T03: `models/Nutrition.js` — additive `source` enum + default (no index); `nutritionService.js` maps/serializes `source` (create + serializer)
- T04: `services/aiFoodService.js` — native-fetch proxy, strict prompt, 10s timeout, zod-validate, error taxonomy (503/502/422), stateless + mockable
- T05: `controllers/nutrition.js` + `routes/nutrition.js` — `analyzeNutritionHandler`; `POST /analyze` registered before `/:id`

### Group 2 — Frontend: analyze + preview + save
- T06: `services/api.js` — `analyzeNutrition()`
- T07: `components/nutrition/AiAnalyzer.jsx` — description + qty/unit inputs, analyze button (isLoading/disabled guard), inline error, verification note
- T08: `pages/Nutrition.jsx` — AI panel in modal, `aiPreview` → `MealForm initialEntry`, `source:'ai'` on save, empty-state heading copy

### Group 3 — QA & governance
- T09: Build/`node --check` gate + P27 static audit (quickstart step 4)
- T10: Manual DoD-13 browser matrix (quickstart step 5) + results recorded in quickstart.md
- T11: AGENTS.md refresh (update-agent-context) + `.env.example` placeholder + final polish

## Risks & Unknowns

| Risk | Mitigation | Status |
|------|------------|--------|
| Gemini returns malformed/non-JSON output | Server-side zod validation → 502/422; never forwarded to client; retryable | MITIGATED |
| Missing/expired key breaks the app | `GEMINI_API_KEY` optional-at-boot (not `requireEnv`); 503 graceful path; manual logging unaffected | MITIGATED |
| AI estimate silently wrong per-serving | Quantity-aware prompt + user review/edit before save (P25); verification note mandates awareness | MITIGATED |
| Latency > 2s dashboard/totals sync | Existing refetch + debounced refresh pattern reused; totals recompute via existing server summary | MITIGATED |
| `source` field regressing existing writes/aggregations | Additive optional field; default `'manual'`; excluded from all aggregation paths | MITIGATED |
| Two-user data leak via new endpoint | `/analyze` authenticate-gated + all owner-scoped queries remain; manual two-user check in matrix | MITIGATED |
| Key exposure | Key only in backend env; static + network-tab audit; `.env.example` placeholder only | MITIGATED |
| Page layout drift (P24) | AI UI confined to the existing modal; no reordering of page sections; build + visual pass | MITIGATED |

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` after plan creation to record the AI-Powered Nutrition Logging upgrade (Day 12: `POST /api/nutrition/analyze`, optional `GEMINI_API_KEY`, additive `source` field, new `aiFoodService.js`, `AiAnalyzer.jsx`, zero new deps) in AGENTS.md.