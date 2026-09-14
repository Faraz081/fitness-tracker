# Quickstart: Nutrition Page Rebuild (AI Food Search)

**Feature**: `019-nutrition-page-rebuild` | **Branch**: `019-nutrition-page-rebuild` | **Date**: 2026-09-13

This feature is a **frontend-only rebuild** — the backend is reused unchanged. You need at least one authenticated account, the app running, and (optionally) `GEMINI_API_KEY` set to exercise live searches.

## 1. Run the app

```powershell
# from repo root
npm run install-all        # or the usual per-workspace install already in place
```

```powershell
# Backend (Express + MongoDB Atlas)
npm run dev --prefix backend
# in a second terminal — Frontend (Vite dev server)
npm run dev --prefix frontend
```

- Log in / register an account and open the **Nutrition** page (`/nutrition` — sidebar "Nutrition").
- Live Gemini search requires `GEMINI_API_KEY` in `backend/.env` (git-ignored; `.env.example` has the placeholder only). Without it, searches return the clear "not configured" message (503 `AI_UNCONFIGURED`) and the page still works otherwise — by design.

## 2. Verification gates (run before any commit/PR)

```powershell
# Backend untouched by this feature — sanity check only (no changed files expected)
npm run typecheck --prefix backend        # = node --check src/index.js

# Frontend — catches JSX/import errors
npm run typecheck --prefix frontend       # = vite build
```

(There is no test/lint framework in this repo — `npm test` / `npm run lint` do not exist despite the stale AGENTS.md line. Manual verification below is the project's convention per constitution v5.0.0 DoD #9.)

## 3. Manual verification script (record and confirm each line)

1. **Deletion-first** — confirm no remnants: old `Nutrition.jsx` body, `AddToLogModal.jsx`, `utils/nutritionUtils.js`, `components/MealForm.jsx` gone; no import of them anywhere.
2. **Header** — fork/utensil icon + title `AI Food Search`.
3. **Search bar** — one input (placeholder e.g. `banana`), one `Search` button, exact helper text `Supports natural language — try 'large chicken breast' or '100g of oats with milk'`.
4. **Live search** — type `banana` → Search → result section `1 RESULT — CLICK TO ADD` with `Clear` on the right; row shows food name, serving size (e.g. `per 118g`), CAL/P/C/F badges in four distinct colors, `+` icon.
5. **Clear** — removes the result; nothing saved.
6. **Duplicate guard** — starting a search blocks a second submit while in flight.
7. **Meal tabs** — exactly Breakfast / Lunch / Dinner / Snacks with coffee-cup / sun / moon / clock icons; one active at a time.
8. **Empty states** — for a meal with nothing: plate/utensils icon + `No food logged for [Meal Name]` + `Use AI search above to find and add foods.`
9. **Add + persist** — with Breakfast active, `+` on a banana result → appears under Breakfast instantly (no refresh) with its macros; reload the page → still there (real DB).
10. **Per-meal adds** — switch tabs (Lunch/Dinner/Snacks) and add from a fresh search → each lands under the right tab.
11. **Failure paths** — (a) no `GEMINI_API_KEY`: clear "not configured" message, nothing written; (b) nonsense query (e.g. `purple`): "could not be identified", nothing written; (c) stop the backend: network/retryable message, nothing written.
12. **Two-user isolation** — user B cannot see user A's entries (no leakage via list; direct `GET /api/nutrition/:id` of A's id from B → 404).
13. **No scope creep** — no date picker, no macro summary bar, no extra filters, no duplicate search bars, no sidebar widgets, no delete/edit/manual-add/modal UI.
14. **Responsive + regression** — no horizontal scroll at 3 breakpoints; Dashboard / Reports / Workouts pages still work (nutrition reports still render from saved data).

## 4. Expected file changes

| File | Action |
|------|--------|
| `frontend/src/pages/Nutrition.jsx` | Rewrite (five-part page) |
| `frontend/src/components/nutrition/AiFoodSearch.jsx` | Rewrite (search bar + result row) |
| `frontend/src/components/nutrition/MealTabs.jsx` | New (4 tabs + icons) |
| `frontend/src/components/nutrition/MealSection.jsx` | New (empty state / foods) |
| `frontend/src/components/nutrition/AddToLogModal.jsx` | Delete |
| `frontend/src/components/MealForm.jsx` | Delete |
| `frontend/src/utils/nutritionUtils.js` | Delete |
| `backend/**` | **Unchanged** |

## 5. Verification record (2026-09-13, feature 019 implementation pass)

Automated/static verification (completed — see tasks.md T001–T029, T031):

- **Deletion-first (SC-001)**: `AddToLogModal.jsx`, old `AiFoodSearch.jsx`, `nutritionUtils.js`, `MealForm.jsx` deleted; grep across `frontend/src` for `AddToLogModal|nutritionUtils|MealForm|servingGrams|scaleServing|NUTRITION_CAPS|AiFoodSearch` → **zero matches**; `/nutrition` route in `App.jsx` still resolves to `pages/Nutrition.jsx`.
- **Structure (SC-002/SC-006)**: `Nutrition.jsx` composes exactly the five parts — Header (`Utensils` icon + `AI Food Search`), Search Bar + Result Section (`AiFoodSearch.jsx`), Meal Tabs, Meal Section. Audit for `type="date"`, `Calendar`, `localStorage`/`sessionStorage`, `SearchInput`/`FilterBar`/`ActiveFilters`/`useDebouncedValue`/`filterUtils`, `fiber`/`sugar`/`sodium` rendering, `Trash2`/`Edit3`/`Modal`, and the four deleted-file names → **zero matches in the page or `components/nutrition/*`** (only matches are other pages: Workout/Profile/Reports/Notifications/analytics).
- **Required literals**: placeholder `banana`; helper text `Supports natural language — try 'large chicken breast' or '100g of oats with milk'`; `1 RESULT — CLICK TO ADD` + `Clear`; badges `CAL`/`P`/`C`/`F` in `primary`/`success`/`warning`/`error` (four distinct colors); serving `per {quantity}{unit}`; meal tabs `['breakfast','lunch','dinner','snack']` → Breakfast(Coffee)/Lunch(Sun)/Dinner(Moon)/Snacks(Clock); empty state `UtensilsCrossed` + `No food logged for {label}` + `Use AI search above to find and add foods.` — all present verbatim.
- **Persistence wiring (AF5/SC-004/SC-005)**: "+" → `createNutritionEntry({ ..., mealType: activeTab, source: 'ai' })` (owner set server-side); today-only list via `listNutrition({ date: today() })` grouped by `mealType`; `refreshDashboard()` after add; fiber/sugar/sodium never persisted or rendered.
- **Live-AI only (AF4/SC-003)**: every submit → `analyzeNutrition({ query })` → existing `POST /api/nutrition/analyze`; in-flight guard + `requestSeq` stale-response discard; 503/502/422 mapped to clear retryable messages; nothing written on failure.
- **Build gates (SC-010)**: `npm run typecheck --prefix backend` (node --check) PASS; `npm run typecheck --prefix frontend` (vite build) PASS (only the pre-existing >500 kB chunk-size warning).
- **Pending (manual browser sign-off — steps 1–14 above, run against a live app + `GEMINI_API_KEY`)**: live Gemini result rendering, Clear, per-meal add + reload persistence, empty states on screen, failure paths in the browser, two-user isolation, 3-breakpoint no-horizontal-scroll, Dashboard/Reports/Workouts regression.