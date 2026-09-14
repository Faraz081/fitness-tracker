# Research: Nutrition Page Rebuild (AI Food Search)

**Feature**: `019-nutrition-page-rebuild` | **Date**: 2026-09-13
**Status**: Complete — all NEEDS CLARIFICATION / unknowns resolved via direct codebase inspection (no external systems to research; the feature is constrained entirely by constitution v5.0.0 Day 13 + the existing committed backend).

## Decision: Reuse the committed live-AI analyze proxy and the owner-scoped Nutrition create/list endpoints — backend is untouched

**Decision**: Do not build any new backend surface. The rebuilt page consumes exactly three existing endpoints: `POST /api/nutrition/analyze` (live Gemini lookup), `POST /api/nutrition` (persist a logged food), `GET /api/nutrition?date=...` (load the active day's entries). Zero backend files change.
**Rationale**: `backend/src/services/aiFoodService.js` already implements the mandated behavior (AF4/AF7): live Gemini via Node native `fetch`, server-side key, fixed 10 s timeout, prompt that demands standard-gram servings, zod-validated JSON, and the three required failure codes (503 `AI_UNCONFIGURED`, 422 `AI_NOT_FOOD`, 502 `AI_UNAVAILABLE`). `nutritionService.createNutritionEntry` already sets `owner` from `req.userId` (Principle VII) and the `Nutrition` model already carries the additive `source` field (AF5/P30). Frontend `services/api.js` already exports `analyzeNutrition`, `createNutritionEntry`, `listNutrition`.
**Alternatives considered**:
- New dedicated endpoints (e.g., `POST /api/nutrition/analyze-and-log`) — rejected: duplicates existing validated surface, adds backend churn, violates "prefer simple and maintainable" and "prefer existing APIs where possible".
- Static/cached nutrition fallback on Gemini failure — rejected: explicitly forbidden (AF4).
- Local component-level fake persistence — rejected: forbidden (AF5).

## Decision: Meal value key is `snack` (singular) while the tab label is "Snacks"

**Decision**: Use the model enum (`['breakfast','lunch','dinner','snack']`) as the internal `mealType` value; display label "Snacks".
**Rationale**: `backend/src/models/Nutrition.js` and `nutritionEntrySchema` enumerate `mealType` as `'snack'`. Label and value are decoupled via a small constant map in the page, exactly as the previous page did (`MEAL_ORDER`/`MEAL_META`).
**Alternatives considered**: Value `'snacks'` — rejected: breaks the persisted enum; entry creation would 422.

## Decision: The page shows "today's" meals only (server default date = now)

**Decision**: On mount the page fetches `GET /api/nutrition?date=today` and groups entries by `mealType`. Entries created via "+" omit `date`, so the server default (`Date.now`) places each new entry on today.
**Rationale**: There is no date picker (FR-015). Today-only is the only date scope the structure permits and keeps the Meal Section honest; it matches the old page's default. Day 12's `source` provenance and P30 (single source of truth in Mongo) remain intact — nothing is stored client-side.
**Alternatives considered**: All-history listing (no date window) — rejected: would render past weeks' foods under "today's" tabs with no way to reason about them and no navigation, which is misleading and grows unbounded.

## Decision: "+" adds directly to the active tab with no modal and persists the Analyze response as-is (no quantity editing/scaling)

**Decision**: Clicking "+" calls `createNutritionEntry({ foodName, quantity, unit, calories, protein, carbs, fat, mealType: activeTab, source: 'ai' })` using the exact values from the live Analyze response; the entry appears under the active tab and survives reload.
**Rationale**: AF2/AF3 replaced Day 12 P25's modal+quantity-editing flow; the "assistant not authority" safety (P26 carry-forward) is preserved by storing the AI's own estimate verbatim (frozen at add time) with `source: 'ai'` provenance. Caps are enforced server-side by `nutritionEntrySchema`; the fields match `nutritionAnalyzeResultSchema` (minus optional fiber/sugar/sodium, which are transient display-only per P26/P30 — never persisted).
**Alternatives considered**: Quantity-scaling client-side (`utils/nutritionUtils.js` helpers) — rejected: introduces the exact complexity being deleted and re-adds the modal concept; helper file is therefore deleted.

## Decision: Deletion set = 3 files removed; shared UI/search utilities kept

**Decision**: Delete `frontend/src/components/nutrition/AddToLogModal.jsx`, `frontend/src/components/nutrition/` old `AiFoodSearch.jsx` (then rewrite it), `frontend/src/utils/nutritionUtils.js`, and `frontend/src/components/MealForm.jsx`. Keep `components/search/*`, `components/ui/*`, `utils/filterUtils.js`, `hooks/useDebouncedValue.js`, `context/DashboardContext.js`, and every `api.js` nutrition helper.
**Rationale**: Grep-verified usage — `AddToLogModal`, `nutritionUtils`, and `MealForm` are imported only by the old page/components being deleted; `SearchInput/FilterBar/ActiveFilters/filterUtils/useDebouncedValue` are also used by `WorkoutList`, `WorkoutHistory`, and `ExerciseHistory` (shared, keep). `api.js` nutrition helpers map to real endpoints still used (analyze/list/create) or retained for backward compatibility (get/update/delete/summary stay valid; no dead code is introduced on the client).
**Alternatives considered**: Leave `MealForm`/`nutritionUtils` as dead files — rejected: violates AF1 (broken components removed) and AF6 (minimal repo); they exist only because of the old page.

## Decision: Verification is build/typecheck + recorded manual browser script (no test framework exists)

**Decision**: Use `node --check` on each changed backend file (none expected), `npm run typecheck --prefix frontend` (= `vite build`, catches JSX/import errors), and the manual verification script from the spec (SC-001..SC-010): search → result → add per meal → empty states → Clear → refresh persistence → failure paths → two-user isolation → 3 breakpoints → prior-day regression (Dashboard/Reports/Workout pages).
**Rationale**: Repo inspection shows no `tests/` files, no ESLint config, and no test/lint scripts in any `package.json`; AGENTS.md's "npm test; npm run lint" is stale. Introducing a test runner would violate the zero-new-dependencies rule for infrastructure that the project has never had.
**Alternatives considered**: Add Vitest unit tests — rejected (zero-new-deps + no existing harness); manual recorded verification is the constitution's own DoD item #9.

## Decision: Tab/result state lives in page-level React state; the five structure parts are 3 small components

**Decision**: `Nutrition.jsx` owns `activeTab`, `entries`, and the persisted-add handler; it renders `AiFoodSearch` (search bar + result row, self-contained search state), `MealTabs` (active tab + change callback), and `MealSection` (renders the active tab's foods or its empty state).
**Rationale**: AF2 stays legible per-part; in-flight/request-sequence, error mapping (503/422/502), and Clear are cohesive inside `AiFoodSearch` (mirrors prior working pattern); icon/aria responsibilities sit in `MealTabs`; empty-state vs foods lives in `MealSection`. Matches the constitution's "small, page-specific components for the structure parts" guidance and keeps each part independently reviewable.
**Alternatives considered**: Monolithic single-file page — rejected: harder to review against the five-part structure; a search-specific component also isolates the request-sequencing guard cleanly.