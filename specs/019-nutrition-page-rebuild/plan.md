# Implementation Plan: Nutrition Page Rebuild (AI Food Search)

**Branch**: `019-nutrition-page-rebuild` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-nutrition-page-rebuild/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Completely remove the current broken Nutrition page and rebuild a clean, minimal "AI Food Search" page to the exact five-part structure mandated by constitution v5.0.0 (Day 13): Header ("AI Food Search" + fork/utensil icon), a single Search Bar (live Gemini lookup through the existing auth-scoped analyze proxy), one Search Result ("1 RESULT — CLICK TO ADD" row with CAL/P/C/F badges + "+"), four Meal Tabs (Breakfast/Lunch/Dinner/Snacks), and a Meal Section (designed empty state / persisted foods with macros). Added foods persist to the real owner-scoped `Nutrition` collection (additive `source: 'ai'`) and appear under the active meal immediately — no date picker, no macro summary bar, no extra features. The backend is untouched (all required endpoints already exist); the delivery is a frontend-only rebuild plus deletion of the broken page and its page-specific components/files.

## Technical Context

**Language/Version**: JavaScript (ES2022, ESM `.js`; JSX `.jsx`) on Node.js 24 LTS (v24.18.0) — JS-only, no TypeScript (Day 6.1 override).
**Primary Dependencies**: Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (all reused; Gemini via Node native `fetch` in the already-shipped analyze proxy). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4, lucide-react (icons: `Utensils`, `Coffee`, `Sun`, `Moon`, `Clock`, `Search`, `Plus`, `X`), framer-motion (all already bundled). **Zero new frontend/backend dependencies.**
**Storage**: MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection/model unchanged (fields `quantity`, `unit`, `mealType` enum `['breakfast','lunch','dinner','snack']`, additive `source: 'ai' | 'manual'` already present). No schema change, no new model, no new env vars (optional `GEMINI_API_KEY` exists).
**Testing**: No test/lint framework exists in the repo (no `tests/` files, no ESLint config). Verification = `node --check` on changed backend files + `npm run typecheck --prefix frontend` (vite build) + the recorded manual browser verification script (search → result → add per meal → empty states → Clear → refresh persistence → two-user isolation → 3 breakpoints → prior-day regression). The AGENTS.md line "npm test; npm run lint" is stale — no such scripts exist.
**Target Platform**: Web (Vite SPA in `frontend/`, Express REST API in `backend/`).
**Project Type**: Web full-stack workspace (`frontend/` + `backend/`); this feature is frontend-only.
**Performance Goals**: Search results appear without a page reload; a clear in-flight indicator shows while the live AI lookup runs (backend Gemini timeout is fixed at 10 s); today's meal entries load and group under tabs on mount (typical far under 1 s). No measurable throughput needs — single-person personal fitness tracker scale.
**Constraints**: `GEMINI_API_KEY` backend-only (never client-visible); every search hits Gemini live (no static/hardcoded source of truth anywhere); exact five-part page structure; no date picker, no separate macro summary bar, no extra filters, no duplicate search bars, no page-specific sidebar widgets, no delete/edit/manual-add/modal UI (FR-015/AF3/AF6); server-side caps (calories ≤ 2000, protein/carbs/fat ≤ 500 g each, quantity ≤ 1000, foodName ≤ 100 chars); user isolation (second-user ids → 404); responsive at 3 breakpoints with no horizontal scroll; dark shell with existing `--color-*` tokens and ui primitives (`Button`, `Input`, `Badge`, `EmptyState`).
**Scale/Scope**: ~5 frontend files changed or added (1 page rewrite, 3 page components — 2 new + 1 rewrite, 3 deletions: `AddToLogModal.jsx`, `MealForm.jsx`, `nutritionUtils.js`); 0 backend files changed; 0 new dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution: `.specify/memory/constitution.md` — Day 13 (AI Food Search Page Rebuild, ACTIVE, v5.0.0) + Core Principles I-VIII and prior day rules where not superseded.

| Gate | Requirement | How the plan satisfies it |
|------|-------------|---------------------------|
| **AF1** | Delete First — the broken page and all components/state/files created specifically for it MUST be fully removed before any new build; no patching/reuse | Phase 1 deletes `frontend/src/pages/Nutrition.jsx` (old), `components/nutrition/AddToLogModal.jsx`, `components/nutrition/AiFoodSearch.jsx` (old), `utils/nutritionUtils.js`, and `components/MealForm.jsx` (now dead). Shared building blocks used by other pages (`SearchInput`, `FilterBar`, `ActiveFilters`, `filterUtils`, `useDebouncedValue`) are **kept** — they are not Nutrition-page-specific. The rebuild composes brand-new files; confirmed gone before build starts. |
| **AF2** | Exact Structure Only — exactly the five mandated parts, nothing more/nothing less | Plan artifacts constrain the page to: Header (fork/utensil icon + "AI Food Search"); Search Bar (one input, one Search button, exact helper text); Search Result (label "1 RESULT — CLICK TO ADD", Clear on right, one row: food name, serving size, CAL/P/C/F badges in four distinct colors, "+"); Meal Tabs (Breakfast/Lunch/Dinner/Snacks with coffee-cup/sun/moon/clock icons); Meal Section (empty state vs persisted foods with macros). |
| **AF3 / AF6** | Minimal by Design / No Scope Creep | No date picker, no macro summary bar, no extra filters, no duplicate search bars, no sidebar widgets, no delete/edit/manual-add/modal/quantity-editing, no Fiber/Sugar/Sodium rows, no localStorage fake persistence, no recommended-totals or history navigation. Any future capability requires a new spec. Deletion of `nutritionUtils.js` removes the old quantity-scaling machinery. |
| **AF4** | Live AI Only — every search is a live Gemini call through the backend | Each Search action calls the existing `POST /api/nutrition/analyze` (owner-free, auth-scoped) which runs `aiFoodService.analyzeFood` → real Gemini via Node `fetch` with zod-validated JSON response. No static/hardcoded/dummy/cached nutrition source appears anywhere. Rebuild's result row renders only that live response. |
| **AF5** | Real Persistence — save to the real DB, reflect immediately, never local-only/session-only | "+" adds via existing `POST /api/nutrition` with `source: 'ai'` (owner set from `req.userId` by the existing service). The returned entry is appended to state and the meal section updates in the same frame; a reload re-fetches today's entries from Mongo. No `localStorage`/session state stores food data. |
| **AF7** | Secure AI Integration — backend-only key, zod-validated response, graceful failure | No code change can expose `GEMINI_API_KEY` (remains in `backend/src/config`); the frontend only calls the analyze proxy. Rebuild reuses the standard three failure paths with clear retryable messages and writes nothing on failure: 503 `AI_UNCONFIGURED`, 422 `AI_NOT_FOOD`, 502 `AI_UNAVAILABLE`. |
| **Principle VII / P30** | User isolation + single source of truth | Entry ownership flows from the session (`req.userId`); the frontend never sends or surfaces another user's data. The `Nutrition` collection is the only store; AI values are estimates surfaced at add-time and frozen into the log entry (source `'ai'`). |
| **Global V / IV / zero-deps** | JS-only (`.js`/`.jsx`), one logical unit per file, `services/api.js` is the only client fetch boundary, zero new npm deps | All new/changed frontend files are `.jsx`/`.js`; network calls stay inside `frontend/src/services/api.js` (unchanged — it already exposes `analyzeNutrition`, `createNutritionEntry`, `listNutrition`); no `package.json` changes in either workspace. |
| **Day 13 DoD** | 9 criteria (delete, exact structure, live Gemini, real persistence, empty states, macros shown, no unlisted features, secure key + isolation, clean build + recorded manual verification) | Phase 8 verification maps 1:1 to the DoD and the spec's SC-001..SC-010. |

**Result**: PASSES all gates with no unjustified violations → **Complexity Tracking not required** (no violations).

**Post-design re-check (after Phase 1 — research.md, data-model.md, contracts/)**: Still PASSES. The design introduces no new dependency, no backend change, no new persisted entity (reuses the existing `Nutrition` model and API), and no client-side credential path. The only client deletion set added during design (`AddToLogModal.jsx`, `nutritionUtils.js`, `MealForm.jsx`) is a strict subset of AF1/AF6 obligations. Contracts pin exactly the three existing endpoints (analyze, create, list); the transient `fiber`/`sugar`/`sodium` values are display-only (P26/P30).

## Project Structure

### Documentation (this feature)

```text
specs/019-nutrition-page-rebuild/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── openapi.nutrition.yaml
├── checklists/
│   └── requirements.md  # /sp.specify quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/                                     # UNCHANGED by this feature (reused as-is)
├── src/
│   ├── services/aiFoodService.js            # existing live Gemini analyze (reused, 017)
│   ├── services/nutritionService.js         # existing owner-scoped create/list (reused)
│   ├── controllers/nutrition.js             # existing handlers (reused)
│   ├── routes/nutrition.js                  # existing routes incl. POST /analyze (reused)
│   ├── models/Nutrition.js                  # existing model incl. source field (reused)
│   └── utils/validators.js                  # existing schemas incl. caps (reused)

frontend/
└── src/
    ├── pages/
    │   └── Nutrition.jsx                    # REWRITE — composes the five required parts
    ├── components/
    │   ├── nutrition/
    │   │   ├── AiFoodSearch.jsx             # REWRITE — Search Bar + Search Result (live, Clear)
    │   │   ├── MealTabs.jsx                 # NEW — Breakfast/Lunch/Dinner/Snacks + icons
    │   │   ├── MealSection.jsx              # NEW — empty state / persisted foods w/ macros
    │   │   ├── AddToLogModal.jsx            # DELETE (old modal flow — replaced by "+")
    │   │   └── AiFoodSearch.jsx (old)       # DELETE (broken pre-rebuild version)
    │   ├── MealForm.jsx                     # DELETE (dead after rebuild — used only by old page)
    │   └── search/ + ui/                    # KEEP — shared, used by other pages
    ├── services/api.js                      # UNCHANGED — analyzeNutrition/create/persist/list exist
    ├── utils/
    │   ├── nutritionUtils.js                # DELETE (quantity-scaling, used only by deleted files)
    │   └── ... (shared utils)               # KEEP
    └── App.jsx / data/constants.js          # KEEP — /nutrition route + nav unchanged
```

**Structure Decision**: Standard full-stack web workspace (`frontend/` + `backend/`, Option 2). This feature is a **frontend-only rebuild**: the page component is rewritten and three small page-specific components are created under `frontend/src/components/nutrition/`, all broken page-specific files are deleted, and the backend + shared UI/search utilities are reused untouched. The result-section/search UI and meal display are deliberately split into two small components so each structure part stays independently reviewable against AF2 and FR-006/FR-010; the four tiny tab buttons are isolated in `MealTabs.jsx` for icon/aria clarity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check violations → no entries. (Deleting `MealForm.jsx` and `nutritionUtils.js` is not added complexity — it removes now-dead code and is required by AF1/AF6 so the repo ships clean and minimal. The backend is reused wholesale with zero changes, which keeps total complexity *lower* than the superseded Day 12 approach.)