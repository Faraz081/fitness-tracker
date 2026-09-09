# Data Model — Search & Filtering (Day 5.1)

**Branch**: `008-search-filtering` | **Date**: 2026-09-09
Frontend-only feature; NO backend/model/DB changes. This document describes the
existing entity shapes the filter layer reads, and the NEW client-side
filter-state/URL model introduced by this feature.

## 1. Existing Entities (read-only; verified against `backend/src/models` + `frontend/src/services/api.js`)

### Workout (API/DB) — `Workout` model, serialized by `/api/workouts`
```js
{
  id: string,                        // _id (serialized)
  title: string,                     // maxlength 100
  category: 'strength'|'cardio'|'flexibility'|'hybrid'|'other', // enum
  date: string,                      // ISO datetime (page normalizes via new Date)
  notes?: string,                    // maxlength 2000
  exercises: [
    { name: string, sets: number, reps: number,
      weightKg?: number, notes?: string, restTimeSec?: number }
  ],
  createdAt: string, updatedAt: string
}
```
Loaded by `api.listWorkouts()` (no category arg → ALL workouts). The list page
sorts date-desc once at load. **Searchable fields**: `title`, `notes`,
`exercises[].name`.

### Workout (mock) — `frontend/src/data/workoutHistoryData.js`
```js
{ ...same shape but FIELD IS `name` (e.g. "Push Day") NOT `title`; has `date`
  as 'YYYY-MM-DD' string, `category`, `notes`, `exercises[].name`, `iconLabel` }
```
Used by `WorkoutHistory` (`/workouts-history`) and `ExerciseHistory`
(`/exercises`). **Searchable fields**: `name`, `notes`, `exercises[].name`.

> ⚠️ `title` (API) vs `name` (mock) — the shared search helpers take a
> caller-supplied `textFor(item)` accessor so both shapes join correctly.

### Nutrition entry (API/DB) — `Nutrition` model, serialized by `/api/nutrition`
```js
{
  id: string,
  foodName: string,                  // maxlength 100
  quantity: number, unit?: string,
  calories: number, protein: number, carbs: number, fat: number,
  mealType: 'breakfast'|'lunch'|'dinner'|'snack', // enum
  date: string,                      // ISO datetime
  createdAt: string, updatedAt: string
}
```
Loaded per selected day by `api.listNutrition({ date })`. **Searchable field**:
`foodName` (primary; a searchable-text extension to notes is not in the schema).

### Nutrition summary — `api.getNutritionSummary(date)` → `/api/nutrition/summary/daily`
```js
{ date, calories, protein, carbs, fat }   // FULL-DAY totals; NOT an entry array
```
Filters never recompute these — summary cards stay full-day (documented).

### Meal-type vocab (page-local, NOT in constants.js)
`frontend/src/pages/Nutrition.jsx` hard-codes:
`MEAL_ORDER = ['breakfast','lunch','dinner','snack']` and
`MEAL_META = { breakfast: {label, icon}, … }`. The meal-type toggle chips build
from these (no constants change needed for meals).

### Constants (frontend/src/data/constants.js — extend APPEND-ONLY)
- `WORKOUT_CATEGORIES = [{strength},{cardio},{flexibility},{hybrid},{other}]`
- `DATE_FILTER_OPTIONS` TODAY = `all | week | month | last3 | custom`
  → THIS FEATURE appends `last6 ("Last 6 Months")` and `lastYear ("This Year")`
  so the shared set = `all | week | month | last3 | last6 | lastYear | custom`.

## 2. New: `Filters` State Shape (per-page local state, `frontend/src/utils/filterUtils.js`)

```js
// Defaults
const DEFAULT_FILTERS = {
  searchDraft: '',   // <input> text (immediate)
  search: '',        // debounced (250ms) value used for filtering — derived, never set
  category: 'all',   // workout pages only (single-select)
  dateOption: 'all', // all|week|month|last3|last6|lastYear|custom
  from: '',          // custom range start, 'YYYY-MM-DD' ('' = unbounded)
  to: '',            // custom range end,   'YYYY-MM-DD' ('' = unbounded)
  mealTypes: [],     // nutrition only: subset of ['breakfast','lunch','dinner','snack']
};
```

URL encoding (S5) — `filtersToSearchParams` / `parseSearchParams`:
```
?search=bench&category=strength&dateOption=last3
?search=chicken&mealTypes=lunch,dinner
?dateOption=custom&from=2026-06-01&to=2026-06-30
```
- Omitted when default/empty-equivalent (short URLs).
- `mealTypes` comma-joined; single tokens, no escaping needed.
- `parseSearchParams` validates every value against the known enums/dates;
  unknown values fall back to defaults (never crash on hand-edited URLs).

## 3. Derived/Read Models

- **Filtered slices** — pure outputs of `applyFilters`:
  - `WorkoutList.filtered` / `WorkoutHistory.filtered` → `Workout[]`
    (AND of search + category + date-range).
  - `Nutrition.filtered` → `NutritionEntry[]` (AND of search + mealTypes over
    the day's loaded entries); `grouped` meal sections derive from `filtered`.
  - `ExerciseHistory.names` → `string[]` (search-filtered exercise names).
- **Active-filters model** — `hasActiveFilters` truth table for chips + the
  "Clear all filters" row:
  | filter | active when |
  |---|---|
  | search | `search.trim() !== ''` |
  | category | `category !== 'all'` |
  | dateOption | `dateOption !== 'all'` (custom counts only when `from` or `to` set) |
  | mealTypes | `mealTypes.length > 0` |

## 4. Date Semantics

- All dates internally as `YYYY-MM-DD` local strings; inclusive string-compare
  ranges (ISO date strings sort lexicographically correctly).
- API workout `date` is an ISO datetime — the list page converts to a
  `YYYY-MM-DD` key via local helpers before range filtering (per
  `resolveDateRange` consumers; keep the day component local, same as the
  existing WorkoutHistory bounds logic).
- `resolveDateRange(option, {from,to}, today)` presets (injected `today`):
  - `all` → unbounded; `custom` → passthrough (missing bound = unbounded)
  - `week` → Monday of current week → today; `month` → 1st → today
  - `last3`/`last6` → first-of-month N months back → today
  - `lastYear` → Jan 1 → today
  - **No mutation** of the source arrays (`items.filter`, never `.splice`/sort
    in place — sort is done on a copy in `WorkoutList` already).

## 5. Non-Changes (explicit)

- `services/api.js`, all backend routes/controllers/models, `App.jsx` routes,
  env vars, `package.json` — untouched.
- No localStorage / cookies / backend persistence of filters.
- Day totals (`summary`) and the single-date picker on Nutrition unchanged.
- `WorkoutHistory`'s existing `filterWorkouts({ category, from, to })` signature
  preserved; new `query` param is additive (empty `query` = current behavior).