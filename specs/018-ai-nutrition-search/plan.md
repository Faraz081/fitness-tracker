# Implementation Plan: Nutrition Search (AI-Powered Food Logging)

**Branch**: `018-ai-nutrition-search` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/018-ai-nutrition-search/spec.md` (Day 12, constitution v4.2.0 — AI-Powered Nutrition Search)

## Summary

Build a **dedicated, real-time AI food search flow** on the existing Nutrition page: a single search bar accepts **only natural-language food names**; every search is proxied by the authenticated backend to **Gemini live** (`POST /api/nutrition/analyze`, server-side key only, zod-validated structured JSON); the estimate renders as a **result card** (food name + "AI" badge, "Per Xg serving" label, Calories | Protein | Carbs | Fat, plus a Fiber | Sugar | Sodium row); a **"+" action** opens the **Add-to-Log modal** (Close X, editable **Quantity (g)**, live recalculation "For [X]g: [Y] kcal | P | C | F" derived strictly from the AI's real per-serving data, **Add To** dropdown Breakfast/Lunch/Dinner/Snack, Cancel and "+ Add Food"); confirming **persists** through the existing owner-scoped `POST /api/nutrition` (additive `source: 'ai'` marker) and the entry appears **instantly under the selected meal section** with no refresh via the existing `load()` + `refreshDashboard()` pattern. Meal sections always render — an empty section shows **"No food logged for [Meal]"** with the hint **"Use AI search above to find and add foods."** No page redesign, no new Mongoose models/collections, zero new FRONTEND dependencies, optional-at-boot backend env var already present (`GEMINI_API_KEY`). Manual logging, CRUD, filters, summary cards, and the Dashboard keep working unchanged (P24/P30).

This plan supersedes the uncommitted `017-ai-nutrition` embedded-analyzer approach (`AiAnalyzer` inside the Add-entry modal + `MealForm` preview): 018 replaces it with the standalone **search → result card → Add-to-Log modal** surface the spec mandates (US1–US5), while the manual Add-entry modal remains for manual logging.

Direct constitution anchors: P24 (existing UI preservation), P25 (AI as assistant — editable-before-save review), P26 (live AI only, honest empty states, no fabricated values), P27 (backend-only key, single auth-scoped proxy), P28 (user isolation), P29 (real persistence + immediate reflection), P30 (single source of truth — `source` provenance only). See Constitution Check.

## Technical Context

**Language/Version**: JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; Gemini via **Node native `fetch`**, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react + Tailwind v4 + existing ui primitives (`Button`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`); **zero new frontend dependencies** (A7/D6)
**Storage**: MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection and the **already-shipped additive optional `source`** field (`'ai' | 'manual'`, default `'manual'`, unindexed) for provenance only — no new models, no math/query change (P30). Fiber/Sugar/Sodium are **transient display values from the AI response**, never persisted (P26/P30).
**Testing**: No test suite in repo. Gates = backend `node --check` on changed modules, `npm run build` (vite) clean, backend service + frontend recalculation helpers structured as pure/stateless functions (mockable Gemini client), and a **manual browser matrix** recorded in quickstart.md (Day 12 DoD-12). No automated frontend suite/CI (prior-day policy).
**Target Platform**: Modern evergreen browsers (web, responsive down to ~360px)
**Project Type**: Web — full-stack additive feature (existing `backend/` + `frontend/` monorepo)
**Performance Goals**: search → result card end-to-end **< 5s p95** (SC-001, fast Gemini tier + fixed 10s server timeout cap); after save, the selected meal section + four summary cards + Dashboard reflect the change **< 2s with no manual refresh** (SC-003); near-zero added client bundle weight (reuse existing primitives; no new deps).
**Constraints**: P24 — no page redesign/restructure; keep black + orange theme, sections, filters, summary, CRUD; JS-only files (`.js`/`.jsx`); zero new frontend npm deps; native `fetch` for Gemini (no SDK); `GEMINI_API_KEY` server-only, optional-at-boot, `.env.example` placeholder only (Pl III); no AI value persists without explicit user confirmation in the Add-to-Log modal (P25); no fake/mock/placeholder data anywhere (P26); every nutrition query owner-filtered, cross-user → `404` (P28); exact mandated empty-state strings (FR-011); duplicate-analyze guard (FR-012); structured JSON only, never raw model text to the client (P27); scaled save values MUST respect the existing server caps (calories ≤ 2000, macros ≤ 500, quantity 0.01–1000).
**Scale/Scope**: Backend — extend `aiFoodService.js` prompt/schema for Fiber/Sugar/Sodium + gram serving basis (endpoint + auth + envelope already exist). Frontend — 2 new components under `components/nutrition/` (`AiFoodSearch.jsx` search + result card; `AddToLogModal.jsx`), 1 new pure util (`utils/nutritionUtils.js`), `pages/Nutrition.jsx` wiring + per-meal empty states, `services/api.js` reuse (no change needed), `AiAnalyzer.jsx` superseded/removed.

## Constitution Check

*GATE: Passed (verified against Day 12 section of `.specify/memory/constitution.md` v4.2.0 — AI-Powered Nutrition Search, ACTIVE). Re-checked after Phase 1 — still all green.*

| # | Principle / Rule | How the plan satisfies it |
|---|------------------|---------------------------|
| P24 | Existing UI Preservation | No redesign: the AI search card + result card attach **above** the existing meal sections; summary cards, filters, CRUD, theme, and the manual Add-entry modal remain untouched and functional. New UI reuses `Button`/`Input`/`Select`/`Badge`/`Modal`/`EmptyState` primitives. No route/nav/element removed (the uncommitted `AiAnalyzer.jsx` embedded panel is replaced by the now-mandated standalone flow, not an existing shipped surface). |
| P25 | AI as Assistant, Not Authority | User types only a natural-language food name (no manual macro entry to search). Result is an estimate displayed with the "AI" badge + verification note; quantity editable in the modal; values recalculate from the **real AI per-serving data** (never hardcoded ratios); nothing persists until "+ Add Food" is confirmed; Cancel discards. |
| P26 | Real Data Only & Live AI | Every search hits Gemini live through the backend (no static/keyword database); no fake foods or placeholder entries pre-fill the page; empty meals show the exact mandated state; Fiber/Sugar/Sodium render only when the AI provides them (else "not available"), never fabricated zeros. |
| P27 | Secure AI Integration | Key already backend-only (`config/index.js` optional read, `.env.example` placeholder, git-ignored `.env`); single auth-scoped proxy endpoint; zod-validated structured JSON only (extended with optional fiber/sugar/sodium); 10s server timeout; key never in frontend/network/responses. |
| P28 | User Isolation | `/analyze` is `authenticate`-gated (already in place); all queries `{ owner: req.userId }`; cross-user → `404 NOT_FOUND`. |
| P29 | Immediate Consistency & Real Persistence | Save writes to the real `Nutrition` collection via existing owner-scoped create with `source: 'ai'`; after save, `load()` + `refreshDashboard()` (existing 100ms-debounced pattern) update the meal section, totals, filters, and Dashboard with no manual refresh. Local state only for the transient pre-save preview. |
| P30 | Single Source of Truth | All meal sections/totals/Dashboard derive from the same real `Nutrition` records via server computation; `source` is provenance-only and excluded from all math; AI result is transient, discarded after save. |
| Search & Result Flow | Result card + "+" → modal is the only governed path | The standalone search card renders the result with AI badge + "Per Xg serving" + macros + Fiber/Sugar/Sodium; "+" opens the Add-to-Log modal. No other entry point bypasses the review modal. |
| Add-to-Log Modal | Mandated elements | Close (X), food name + AI badge, nutrition breakdown, editable Quantity (g), live "For [X]g: [Y] kcal \| P \| C \| F", Add To dropdown, Cancel / "+ Add Food". |
| Empty State & Failure Rules | Mandated strings + graceful failures | "No food logged for [Meal]" + "Use AI search above to find and add foods."; `AI_UNCONFIGURED`/`AI_NOT_FOOD`/`AI_UNAVAILABLE` mapped to clear, retryable, non-fabricating UI. |
| Env / Dependencies / Surface | Additive only | No new env vars; no new backend deps (native fetch); no new frontend deps; no new models; existing endpoints/semantics unchanged. |
| Coding standards | JS-only / out-of-scope | New files `.js`/`.jsx`; pure recalculation helper; photo/barcode logging, food catalog, chat, auto-save, new meal types — out of scope. |

**Complexity Tracking**: No violations — zero new frontend deps, native-fetch Gemini (zero new backend deps), no new models, no schema math change. (Table intentionally empty.)

## Project Structure

### Documentation (this feature)

```text
specs/018-ai-nutrition-search/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── README.md
│   └── POST-nutrition-analyze.md
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── config/index.js            # UNCHANGED: GEMINI_API_KEY already optional-at-boot
    ├── utils/validators.js        # MODIFIED: nutritionAnalyzeResultSchema += optional fiber/sugar/sodium
    ├── models/Nutrition.js        # UNCHANGED: source field already present; fiber/sugar/sodium NOT persisted
    ├── services/
    │   ├── nutritionService.js    # UNCHANGED: create/serializer already map source
    │   └── aiFoodService.js       # MODIFIED: prompt += fiber/sugar/sodium + gram serving basis; zod-validate
    ├── controllers/nutrition.js   # UNCHANGED: analyzeNutritionHandler already present
    └── routes/nutrition.js        # UNCHANGED: POST /analyze already registered before /:id

frontend/
└── src/
    ├── services/api.js            # UNCHANGED/REUSED: analyzeNutrition({ query }) already present
    ├── utils/
    │   └── nutritionUtils.js      # NEW (pure .js): scaleServing(result, grams) → {calories, protein, carbs, fat}; formatServingLabel(grams)
    ├── components/nutrition/
    │   ├── AiAnalyzer.jsx         # REMOVED/SUPERSEDED by AiFoodSearch (embedded-analyzer approach replaced)
    │   ├── AiFoodSearch.jsx       # NEW (.jsx): single natural-language search bar + loading/error/empty states + result card (AI badge, Per Xg serving, macros, Fiber/Sugar/Sodium row, "+")
    │   └── AddToLogModal.jsx      # NEW (.jsx): Close X, food name + AI badge, nutrition breakdown, editable Quantity (g), live recalc, Add To dropdown, Cancel / "+ Add Food"
    └── pages/Nutrition.jsx        # MODIFIED: render AiFoodSearch above meal sections; per-meal empty states always shown; wire "+" → AddToLogModal → create + load/refresh
```

**Structure Decision**: Web app, full-stack additive + non-destructive, following existing monorepo conventions (`services/controllers/routes` under `backend/src`; `components/`/`utils/`/`pages` under `frontend/src`). Two new nutrition components mirror the existing `components/nutrition/` subfolder; the recalculation helper is a pure `.js` util in `utils/` (matching `filterUtils`/`units` pattern, P7-style testability). Backend surface is already implemented from 017 — this plan only extends prompt/schema and the frontend flow.

## Phase 0: Research

Full write-up in [research.md](./research.md). Key resolutions:

1. **Repo ground truth**: the auth-scoped proxy (`POST /api/nutrition/analyze`), optional-at-boot `GEMINI_API_KEY`, additive `source` field, `aiFoodService.js`, `AiAnalyzer.jsx`, and `analyzeNutrition()` already exist in the working tree (uncommitted 017 work). 018 **reuses** the full backend surface; no new endpoint, model, or env var.
2. **Backend delta is minimal**: extend the strict prompt to also return optional `fiber`, `sugar`, `sodium` and a **gram-denominated serving** (`quantity` in grams, unit `'g'`), and extend `nutritionAnalyzeResultSchema` with those three optional fields. Nothing persists the micronutrients (P26 transient display).
3. **Frontend flow replaces the embedded panel**: new `AiFoodSearch.jsx` (search bar + states + result card) and `AddToLogModal.jsx` implement the spec's exact UX. The uncommitted `AiAnalyzer.jsx` embedded-analyzer is superseded.
4. **Live recalculation is a pure function** (`utils/nutritionUtils.js`): `scaleServing(result, grams)` multiplies each real AI value by `grams / result.quantity` and rounds; rendered as "For [X]g: [Y] kcal | P | C | F". No independent/hardcoded ratios (FR-006/SC-004).
5. **Save reuses the existing create path**: scaled values + `{ mealType, date, source: 'ai' }` → `createNutritionEntry` → `setDate/load()/refreshDashboard()` (existing instant-consistency pattern).
6. **Per-meal empty states**: meal sections render unconditionally; empty sections show "No food logged for [Meal]" + hint (replaces the current blanket "No nutrition entries for this date." branch when there are entries to group — a P24-compatible copy/layout change within the sections).
7. **Server-cap guard**: scaled values must satisfy existing caps (calories ≤ 2000, macros ≤ 500, quantity 0.01–1000); the modal blocks "+ Add Food" with a friendly message when scaling at the chosen grams exceeds a cap — never clamps/fabricates (P26), and the create validation remains the source-of-truth gate (P30).
8. **Verification**: build + `node --check` + a manual DoD-12 matrix (search, live Gemini result, result card fields, modal open, live recalculation, save → correct meal/no refresh, totals + Dashboard, per-meal empty states, missing-key/unrecognized-food/Gemini-failure handling, two-user isolation, key-scan, responsive, regression). Optional live check only with a real local key (never committed).

### Best Practices Found

- **Reuse, don't re-extend the backend**: the entire proxy surface (route, controller, service, optional config, `source`) already exists; the smallest correct delta is prompt + result-schema extension. This keeps backend risk near zero and honors "additive only".
- **Gram-basis serving scales cleanly**: making the AI return a gram-denominated serving (`quantity` grams, `unit: 'g'`) turns live recalculation into a single pure ratio (`grams / servingGrams`), preserving "derived strictly from the AI's real data" (P25/SC-004).
- **Instant consistency is already plumbed**: `useDashboardRefresh().refreshDashboard()` + `load()` is the existing mutation-then-refetch pattern; the AI save slots into it with zero new state machinery (P29/P30).
- **Modal primitives already exist**: `components/ui/Modal.jsx` provides focus-trap, Esc-to-close, backdrop, and labelled dialog; the Add-to-Log modal reuses it (P24).
- **Server-side validation of AI output is mandated, not optional**: malformed/non-JSON/out-of-range model text must never reach the client (P27) — the extended result schema is the single gate.
- **Honesty over fabrication**: Fiber/Sugar/Sodium render only when present, and quantity scaling past a server cap produces a blockable, honest error instead of a clamped fake value (P26).

## Phase 1: Design & Contracts

### Data Model (data-model.md)

**No persistence changes.** The existing `Nutrition` model already carries the additive optional `source` (`'ai'|'manual'`, default `'manual'`, unindexed); Fiber/Sugar/Sodium exist only as **transient** fields on the AI analysis result (never stored — P30). Full field tables, validation rules, state transitions, and isolation rules in [data-model.md](./data-model.md).

### API Contracts (contracts/)

One existing endpoint is extended — `POST /api/nutrition/analyze` — request unchanged (`{ query }`, natural language only; optional quantity/unit remain schema-supported for backward compat), response gains optional `fiber`/`sugar`/`sodium` and a gram-basis `quantity`/`unit: 'g'`. Full contract in [contracts/POST-nutrition-analyze.md](./contracts/POST-nutrition-analyze.md); [contracts/README.md](./contracts/README.md) documents that all other Nutrition surface is unchanged.

### Backend Design

- `validators.js`: extend `nutritionAnalyzeResultSchema` with `fiber`, `sugar`, `sodium` — each `z.number().min(0).max(500).optional()` (grams/cap aligned with existing macro caps; optional = "not available" allowed). Request schema unchanged.
- `aiFoodService.js`: prompt gains explicit instructions — "respond with the serving **in grams** (`quantity`, `unit: 'g'`), a sensible default gram serving for the described food", plus "include fiber, sugar, and sodium in grams when known; omit them (or output null) when unknown — never invent values." Output zod-validated against the extended schema; `NOT_FOOD`/`UNAVAILABLE` taxonomy unchanged.

### Frontend Design

- `utils/nutritionUtils.js` (pure): `scaleServing(estimate, grams)` → rounded `{ calories, protein, carbs, fat }`; `servingGrams(estimate)` → `estimate.quantity` (grams basis); `mealOptions()` reuse; exported for unit-testability.
- `components/nutrition/AiFoodSearch.jsx`: single `Input` (natural language, aria-labelled, real `<form>` submit), disabled/`isLoading` guard while analyzing (duplicate-request guard FR-012), inline error for 422/502/503 (retryable, never values), and a **result card** — food name + `Badge` "AI", "Per {X}g serving" label, Calories | Protein | Carbs | Fat, second row Fiber | Sugar | Sodium (only when present, else muted "not available"), and a "+" `Button` that invokes the parent to open the Add-to-Log modal.
- `components/nutrition/AddToLogModal.jsx`: reuses `Modal`; shows food name + AI badge, breakdown, editable Quantity (g) `Input`, live `scaleServing` summary rendered as **"For [X]g: [Y] kcal | P | C | F"** (updates on every keystroke), "Add To" `Select` (Breakfast/Lunch/Dinner/Snack), Cancel (closes, discards) and "+ Add Food" (validates quantity present/positive and within caps; disabled until meal + valid quantity). Esc/backdrop close = Cancel (no persistence).
- `pages/Nutrition.jsx`: render `<AiFoodSearch>` in a card above the meal sections; on "+" store the estimate + open `AddToLogModal`; on "+ Add Food" build `{ foodName, quantity: grams, unit: 'g', calories, protein, carbs, fat, mealType, source: 'ai' }` → `createNutritionEntry` → `setDate/load()/refreshDashboard()`. Meal sections render unconditionally; an empty section shows the mandated "No food logged for [Meal]" + hint via `EmptyState`. Existing filters, summary, CRUD, manual Add-entry modal unchanged.

### Quickstart Verification

Full steps + result tables in [quickstart.md](./quickstart.md): `.env.example` check (key present as placeholder) → `npm run build` + backend `node --check` → P27 static audit (no key strings in frontend/repo, no client-side `/generateContent`) → 15-point manual DoD-12 matrix (search food → live result card; edit quantity → live recalc matches AI ratio; save to each meal → correct placement + totals/Dashboard no-refresh; per-meal empty state; invalid/empty search; missing key; unrecognized food; Gemini failure; two-user isolation; network-tab key check; responsive 360/768/1440; prior-day regression).

## Phase 2: Task Breakdown (for /sp.tasks)

Tasks will be ordered backend-first, then frontend flow, then QA — mirroring the user's requested phase order (Foundation → Secure Gemini → Search UI → Add-to-Log Modal → Persistence & Real-Time → Verification):

### Group 1 — Backend delta (extend existing proxy)
- T01: `validators.js` — extend `nutritionAnalyzeResultSchema` with optional `fiber`/`sugar`/`sodium`
- T02: `aiFoodService.js` — prompt: gram serving basis (`quantity`/`'g'`) + fiber/sugar/sodium when known; keep error taxonomy + timeout
- T03: Backend gate: `node --check` on changed modules

### Group 2 — Search UI
- T04: `utils/nutritionUtils.js` — pure `scaleServing`/`servingGrams` helpers
- T05: `components/nutrition/AiFoodSearch.jsx` — search bar + loading/error/empty states + result card (AI badge, Per Xg serving, macros, Fiber/Sugar/Sodium row, "+")
- T06: `services/api.js` — confirm/reuse `analyzeNutrition({ query })` (no change expected)

### Group 3 — Add-to-Log Modal + persistence + real-time
- T07: `components/nutrition/AddToLogModal.jsx` — Close X, AI badge, breakdown, Quantity (g), live "For [X]g: [Y] kcal | P | C | F", Add To dropdown, Cancel / "+ Add Food", server-cap guard
- T08: `pages/Nutrition.jsx` — wire AiFoodSearch + modal; save via existing create with `source:'ai'`; instant `load()`/`refreshDashboard()`; per-meal empty states; remove superseded `AiAnalyzer` usage

### Group 4 — QA & governance
- T09: Build/`node --check` gate + P27 static audit (quickstart step 3)
- T10: Manual DoD-12 browser matrix (quickstart step 4) + results recorded in quickstart.md
- T11: AGENTS.md refresh (update-agent-context) + final polish

## Risks & Unknowns

| Risk | Mitigation | Status |
|------|------------|--------|
| Gemini doesn't reliably emit Fiber/Sugar/Sodium | Optional schema fields; honest "not available" display; class-leading strict prompt; server zod gate (P27) | MITIGATED |
| Gram serving basis wrong (e.g. `1 cup` instead of `g`) | Explicit prompt instruction + result `quantity`/`unit` zod-validated; live-recalc test compares ratio at serving quantity | MITIGATED |
| Scaled values exceed server caps (calories 2000/macros 500) | Modal blocks save with honest message; create validation remains gate (P30); no clamping | MITIGATED |
| Embedded 017 `AiAnalyzer` removal regresses the Add-entry modal | Manual logging keeps the unmodified `MealForm`; 018's AI path is a separate surface; regression check in matrix | MITIGATED |
| Rapid duplicate searches | `analyzing` guard disables search + ignored duplicate-analyze requests; latest-wins state | MITIGATED |
| Two-user leak via analyze/save | `/analyze` authenticate-gated + all owner-scoped queries; manual two-user check | MITIGATED |
| Key exposure | Key already backend-only; static + network-tab audit; `.env.example` placeholder only | MITIGATED |
| Latency > 5s search or > 2s reflects | Fixed 10s server timeout; existing refetch + debounced refresh reused; p95 target surfaced in manual matrix | MITIGATED |

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` after plan creation to record the AI-Powered Nutrition Search (018) plan — reuses existing `POST /api/nutrition/analyze` + optional `GEMINI_API_KEY` + `source` field; adds Fiber/Sugar/Sodium + gram serving to the analyze response; new `AiFoodSearch.jsx`, `AddToLogModal.jsx`, `utils/nutritionUtils.js`; zero new deps.