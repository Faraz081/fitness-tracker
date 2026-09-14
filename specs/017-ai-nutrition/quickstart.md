# Quickstart: AI-Powered Nutrition Page (017-ai-nutrition)

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13
**Purpose**: Step-by-step setup + verification for the Day 12 Gemini-powered Nutrition logging flow, aligned to the constitution's Day 12 DoD-1..13.

## 0. Audit — preserved surface (P24) + reuse vs new

**Preserved UI (must remain byte-for-byte):** page header (gradient apple icon, "Nutrition" title, subtitle, "Add entry" button), `FilterBar` ("Filter foods" — "Search foods" `SearchInput` + Breakfast/Lunch/Dinner/Snack filter chips), `ActiveFilters` chips, date card (`Input type=date` + "Today" button), the four summary cards (Calories/Protein/Carbs/Fat), `ListSkeleton` loading, filter-empty `EmptyState`, meal-grouped entry list with Edit/Delete + inline Confirm/Cancel, and the Add-entry modal shell.

**Backend reuse (verified by direct reads):** `routes/nutrition.js` (`POST /`, `GET /`, `GET /summary/daily`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, all `authenticate` + zod) — new `POST /analyze` is additive; `nutritionService.js` (owner-scoped CRUD + `getNutritionSummary` server aggregate = P30 source of truth); `models/Nutrition.js` (caps + `{ owner, date, mealType }` index); `validators.js`; `config/index.js` optional-env pattern (like `COOKIE_NAME`, not `requireEnv`); `response.js` envelope + `AppError`.

**Reuse vs new:** REUSE `MealForm` unchanged (its `initialEntry` prefill already covers all FR-008 editable fields incl. meal type + date); REUSE `handleSubmit`/`handleDelete` → `setDate` + `refreshDashboard()` + `load()` (P29/P30, 100ms debounce); REUSE `Button`/`Input`/`Badge`/`EmptyState`/`ListSkeleton` primitives. NEW: one backend endpoint + `aiFoodService.js` + additive `source`; one presentational `components/nutrition/AiAnalyzer.jsx`; `api.js` `analyzeNutrition`; modal AI panel + `aiPreview`. Empty-state heading currently "No entries for this date" → align copy only.

## 1. Backend environment

`backend/.env.example` gains one optional placeholder (never a real key):

```
GEMINI_API_KEY=
```

- Real key lives ONLY in local `backend/.env` (git-ignored). Without a key the app boots and manual logging works; `POST /api/nutrition/analyze` → `503 AI_UNCONFIGURED`.

## 2. Verify build & syntax

```powershell
cd backend; node --check src/services/aiFoodService.js; node --check src/routes/nutrition.js; node --check src/utils/validators.js
cd frontend; npm run build   # vite build — MUST succeed clean (zero new errors)
```

## 3. Run the app

```powershell
cd backend; npm run dev      # Express on :5000
cd frontend; npm run dev     # Vite on :5173 -> CLIENT_ORIGIN
```

## 4. Frontend static audit (P27 — key isolation)

Run from repo root and record results:

```powershell
# No Gemini key / endpoint key leakage into frontend code (expect: none):
Get-ChildItem frontend\src -Recurse -Include *.jsx, *.js | Select-String -Pattern "GEMINI_API_KEY|generativelanguage"
# No hard-coded key anywhere in the repo (expect: none):
Get-ChildItem -Recurse -Include *.js, *.jsx, *.json, *.md -Path . -Exclude .git | Select-String -Pattern "AIza[0-9A-Za-z_\-]{20,}"
# .env stays ignored; only placeholder present (expect: unset value):
Get-Content backend\.env.example | Select-String "GEMINI_API_KEY"
```

**Pass criteria**: zero matches for the above (except the `.env.example` placeholder line itself).

## 5. Manual browser matrix (Day 12 DoD-13)

Open `/nutrition` logged in as user A and walk each row. Record PASS/FAIL per row:

| # | Check | Result |
|---|-------|--------|
| 1 | Natural-language "Analyze food" flow — type a description, click **Analyze with AI** | |
| 2 | Quantity-aware estimate (e.g. "200g grilled chicken with rice" scales to 200g) | |
| 3 | Editable preview — every field (food name, quantity, unit, calories, protein, carbs, fat, meal type, date) editable | |
| 4 | Verification note shown: "AI-generated nutrition values — please verify before saving." | |
| 5 | Save → entry appears in chosen meal section; summary cards + Dashboard nutrition values update **without refresh** (<2s) | |
| 6 | Save from a different meal/date than today lands in that meal/date | |
| 7 | Edit an entry → totals + Dashboard recalc; Delete (Confirm) → totals + Dashboard recalc; Cancel leaves intact | |
| 8 | Invalid food (e.g. "xyzq" nonsense) → "Food could not be identified. Please try another search." no values generated | |
| 9 | Duplicate request guard — while "Analyzing food..." is shown, Analyze button is disabled | |
| 10 | Gemini failure (block network / kill proxy) → retryable AI error banner; manual logging still works | |
| 11 | Missing key (`GEMINI_API_KEY` unset) → `AI_UNCONFIGURED` error; app boots; manual logging works | |
| 12 | Empty date → "No nutrition entries for this date." empty state with Add button (no fake data) | |
| 13 | **Two-user isolation** — user B directly requests user A's entry id → `404 NOT_FOUND`, no data leak; B never sees A's meals/totals | |
| 14 | Network tab — no Gemini key or `/generateContent` call originates from the browser; only `POST /api/nutrition/analyze` + `/api/nutrition` calls | |
| 15 | Responsive 360 / 768 / 1440 — modal, preview, save flow usable; no horizontal scroll | |
| 16 | Prior-day regression — register/login, add workout, log nutrition manually, notifications, settings, reports, export CSV/PDF still work | |

## 6. Record results

Update this file with results and commit, per Day 12 DoD-13 evidence. All checks must be PASS or explicitly documented with an action item before /sp.tasks.

---

## Results (recorded after implementation)

Manual browser rows require `npm run dev` in both workspaces + a real `GEMINI_API_KEY` in `backend/.env`; rows marked code-verified were confirmed statically during implementation.

| # | Check | Result |
|---|-------|--------|
| 1 | Natural-language "Analyze food" flow | PENDING — requires browser + key |
| 2 | Quantity-aware estimate ("200g grilled chicken with rice") | code-verified (server prompt embeds quantity/unit and instructs scaling; user-supplied quantity overrides model) — manual confirm pending |
| 3 | Editable preview — every field editable | code-verified (`MealForm` `initialEntry={editing ?? aiPreview}` prefill covers food name, quantity, unit, calories, protein, carbs, fat, meal type, date) — manual confirm pending |
| 4 | Verification note "AI-generated nutrition values — please verify before saving." | PASS (code) — rendered by `AiAnalyzer` whenever `hasPreview` is true |
| 5 | Save → meal section + summary cards + Dashboard update without refresh | code-verified (existing `handleSubmit` → create → `setDate` + `refreshDashboard()` + `load()`) — manual confirm pending |
| 6 | Save from a different meal/date lands there | code-verified (MealForm meal-type/date stored on entry; list/summary keyed by date) — manual confirm pending |
| 7 | Edit → recalc; Delete (Confirm) → recalc; Cancel intact | code-verified (`api.updateNutritionEntry`/`api.deleteNutritionEntry` → `refreshDashboard()` + `load()`; `source` preserved on edit since PATCH schema excludes it) — manual confirm pending |
| 8 | Invalid food "xyzq" → "Food could not be identified. Please try another search." | code-verified (`aiFoodService` 422 `AI_NOT_FOOD` path; message surfaces via `aiError`) — manual confirm pending (needs key) |
| 9 | Duplicate request guard while "Analyzing food..." | PASS (code) — analyze button disabled while `analyzing`; `handleAnalyze` no-ops when already running |
| 10 | Gemini failure → retryable banner, manual logging works | code-verified (502 `AI_UNAVAILABLE` → surfaced error; `analyzing` re-enabled in `finally`; manual MealForm unaffected) — manual confirm pending |
| 11 | Missing key → `AI_UNCONFIGURED`; app boots; manual works | PASS (verified live: `analyzeFood` with unset `GEMINI_API_KEY` returned `code=AI_UNCONFIGURED status=503`; config import safe, no `requireEnv`) |
| 12 | Empty date → "No nutrition entries for this date." with Add button | PASS (code) — empty-state heading aligned; structure/button preserved |
| 13 | **Two-user isolation** — user B GET/`PATCH`/`DELETE` user A's entry id → `404 NOT_FOUND` | code-verified (owner-filtered `findOne`/`findOneAndUpdate`/`deleteOne` in `nutritionService`) — live 2-account browser check pending |
| 14 | Network tab — no Gemini key or `/generateContent` from browser | PASS (static audit) — zero `generativelanguage`/`generateContent`/`GEMINI_API_KEY` in `frontend/src`; only `POST /api/nutrition/analyze` is client-facing — manual network-tab confirm pending |
| 15 | Responsive 360 / 768 / 1440 — modal, preview, save flow | PENDING — requires browser |
| 16 | Prior-day regression | PENDING — requires browser |

**Static audit (step 4)**: PASS — 0 matches for `GEMINI_API_KEY|generativelanguage` in `frontend/src`; 0 matches for `AIza[0-9A-Za-z_\-]{20,}` anywhere in repo (excl. `node_modules`/`.git`/`dist`); `backend/.env.example` contains only the `GEMINI_API_KEY=` placeholder.

**Build (step 2)**: PASS — `node --check` clean on all 7 new/changed backend modules (config, validators, model, nutritionService, aiFoodService, controllers, routes); `npm run build` (vite 8.2.2) clean in 4.67s, 2575 modules, zero errors (only pre-existing >500 kB chunk-size hint).

**DoD compliance** (Day 12 DoD-1..13): DoD-1 one auth-scoped endpoint `POST /api/nutrition/analyze` — code done; DoD-2 server-side key only, optional at boot — verified; DoD-3 structured JSON zod-validated server-side, never raw model text — code done; DoD-4 quantity-aware estimates — code done; DoD-5 mandated state strings exactly — code done; DoD-6 no auto-save, explicit user save (`source:'ai'`) — code done; DoD-7 real owner-scoped records only, no mock data — verified; DoD-8 additive `source` provenance-only, excluded from math — verified; DoD-9 existing UI/theme/sections preserved P24 — code done; DoD-10 zero new frontend deps / native-fetch backend — verified; DoD-11 P29/P30 instant consistency + single source of truth — verified (dashboardService reads same `Nutrition` records); DoD-12 two-user isolation + key not exposed — code-verified, live check pending; DoD-13 build/syntax/manual matrix evidence — build PASS, manual matrix rows listed above pending browser run.

**Follow-up (recorded)**: Rows 1-3, 5-8, 10, 13-16 in the manual matrix require running both servers with a real Gemini key; grep T040 remains the single open task item until that browser pass is completed.