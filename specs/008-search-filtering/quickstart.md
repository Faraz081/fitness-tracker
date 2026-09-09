# Quickstart — Search & Filtering (Day 5.1)

**Branch**: `008-search-filtering` | **Date**: 2026-09-09
Frontend-only feature on top of the existing Fitness Tracker. Zero backend /
env / dependency changes.

## Prereqs

- Node.js 24 LTS, npm workspaces at repo root (`backend/`, `frontend/`).
- MongoDB Atlas reachable (existing) — only needed because WorkoutList/Nutrition
  pages load from the live API.

## Running the app

```bash
# from repo root
npm install        # already done on this branch; only needed first time
npm run dev        # workspace script — concurrent backend + frontend (verify name in root package.json)
```

Or per workspace: `npm run dev` inside `backend/` and `frontend/` (frontend
vite dev expects `VITE_API_URL` env — unchanged).

## What this feature adds (map)

| File | Role | New? |
|---|---|---|
| `frontend/src/utils/filterUtils.js` | pure filter/search/date/URL helpers | new |
| `frontend/src/hooks/useDebouncedValue.js` | 250 ms debounce hook (S2) | new |
| `frontend/src/components/search/SearchInput.jsx` | shared search box (dark tokens) | new |
| `frontend/src/components/search/FilterBar.jsx` | responsive/collapsible filter container | new |
| `frontend/src/components/search/FilterChip.jsx` | removable accent chip | new |
| `frontend/src/components/search/ActiveFilters.jsx` | chips row + "Clear all filters" | new |
| `frontend/src/pages/WorkoutList.jsx` | search + category + date-range (client-side) | edit |
| `frontend/src/pages/WorkoutHistory.jsx` | add text search; shared date presets (last6/lastYear) | edit |
| `frontend/src/utils/historyUtils.js` | `filterWorkouts` gains `query` (additive) | edit |
| `frontend/src/pages/Nutrition.jsx` | search + meal-type chips (totals unchanged) | edit |
| `frontend/src/pages/ExerciseHistory.jsx` | search filters exercise-name groups | edit |
| `frontend/src/data/constants.js` | append `last6` + `lastYear` to `DATE_FILTER_OPTIONS` | edit (append-only) |

## Manual verification checklist

1. `frontend`: `npm run build` → clean (Vite). No `.ts`/`.tsx` anywhere new.
2. `/workouts`: type "bench" → list narrows to workouts whose title/notes/
   exercise-name contain "bench" (case-insensitive); pick category + a date
   preset → AND-ed; custom range with `from > to` → zero results + empty state
   with "Clear all filters"; URL reflects `?search=…&category=…&dateOption=…`;
   refresh restores state; back/forward round-trips; exactly ONE
   `listWorkouts` network call on load (search never refetches).
3. `/workouts-history`: search narrows grouped history; "Last 6 Months" and
   "This Year" presets now resolve correctly; "Clear filters" also clears the
   search box.
4. `/nutrition`: type "chicken" → only matching foods; toggle Breakfast/Lunch/
   Dinner/Snack chips → only those meals; totals (calories/P/C/F) stay
   full-day; empty-filter → "No entries match your filters" + clear action.
5. `/exercises`: type "squat" → only Squat groups (with their Personal Records);
   clear → all groups back.
6. Responsive: 1280 / 768 / < 640 → filter bar collapses to the "Filters"
   toggle on small screens; chips wrap; zero horizontal scroll.
7. A11y: keyboard-only through search → selects → chips → clear-all; `aria-live`
   announcements on filtered region; remove buttons disclosed.
8. Regression: `/` (dashboard), `/progress`, `/goals`, `/analytics`,
   `/workouts/new`, `/workouts/:id/edit`, `/profile`, `/login` all render and
   behave as before.

## Artifacts

- `specs/008-search-filtering/spec.md` — ratified spec (21 FRs).
- `specs/008-search-filtering/plan.md` — implementation plan (tasks T001–T010).
- `specs/008-search-filtering/research.md` — Phase 0 record + decisions.
- `specs/008-search-filtering/data-model.md` — entity shapes + filter model.
- `specs/008-search-filtering/contracts/filter-contract.md` — shared-layer API
  + URL param contract.
- `specs/008-search-filtering/checklists/requirements.md` — 16/16 spec gates.
- `history/prompts/008-search-filtering/` — SPEC + PLAN prompt records.