# Filter Contract (frontend) — Search & Filtering (Day 5.1)

**Branch**: `008-search-filtering` | **Date**: 2026-09-09
Frontend-only feature ⇒ the "contracts" are the stable interfaces between the
shared layer (`utils/filterUtils.js`, `hooks/useDebouncedValue.js`,
`components/search/*`) and the four consumer pages. They are the compatibility
barrier that other features (e.g. a future TopNavbar global search) must not
break.

## 1. `utils/filterUtils.js` — pure module API

Every function is PURE (no date library, injected `today`, never mutates
inputs, always returns a new value/array). JS only, zero deps.

| Signature | Semantics |
|---|---|
| `todayISO(): string` | Local `YYYY-MM-DD`. |
| `matchesSearch(text: string, query: string): boolean` | `text.toLocaleLowerCase().includes(query.toLocaleLowerCase())`; `''` query → `true`. Literal (no regex). |
| `filterBySearch(items: T[], query: string, textFor: (item:T)=>string): T[]` | Keep item iff `matchesSearch(textFor(item), query)`. |
| `filterByDateRange(items: T[], { from?: string, to?: string }, dateKey?: string): T[]` | Inclusive ISO-string compare on `item[dateKey]` (default `'date'`); missing bound = unbounded. |
| `filterByCategory(items: T[], categories: string[]|[string], key?: string): T[]` | Pass when categories empty or `['all']`, else `categories.includes(item[key])` (default `'category'`). |
| `filterByMealType(items: T[], mealTypes: string[], key?: string): T[]` | Same semantics (default `'mealType'`). |
| `applyFilters(items, { search?, textFor, from?, to?, dateKey?, categories?, mealTypes? }): T[]` | AND-compose the four predicates in ONE pass. |
| `resolveDateRange(option: string, range?: { from?, to? }, today?: string): { from?: string, to?: string }` | Presets `all/week/month/last3/last6/lastYear/custom` (+ passthrough for any custom bounds). |
| `hasActiveFilters(f): boolean` | Truth table (see data-model §3) — drives chips + clear-all. |
| `filtersToSearchParams(f, include?): URLSearchParams` | Omits default/empty values; `mealTypes` comma-joined. |
| `parseSearchParams(params: URLSearchParams, defaults): Filters` | Validates enums/dates; unknowns → defaults; never throws on garbage input. |

## 2. `hooks/useDebouncedValue.js`

```
useDebouncedValue(value: T, delayMs?: number = 250): T
```
- Returns `value` immediately on mount; thereafter emits the latest `value`
  once `delayMs` elapses without change; cleans up its timer on unmount.
- S2 constraint: delay MUST stay in 200–300ms.

## 3. `components/search/*` — component contracts (all controlled + dumb)

### `SearchInput`
```
{ id: string, label: string, value: string, onChange: (value: string) => void,
  placeholder?: string, className?: string }
```
- Left `Search` (lucide) icon; right `<X>` clear button only when `value !== ''`
  (fires `onChange('')`); `label` → `<label htmlFor={id}>` + `aria-labelledby`;
  input styling locked to the HistoryFilters dark-token pattern. **No debounce
  inside.** Must not grow layout gaps (max-width governed by caller `className`).

### `FilterBar`
```
{ title?: string, children: ReactNode, collapsible?: boolean,
  open?: boolean, onToggle?: () => void, activeCount?: number }
```
- Desktop (`sm+`): responsive grid `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`.
- Mobile (< 768px) when `collapsible`: children hidden unless `open`; shows a
  "Filters" toggle (with `activeCount` badge) that calls `onToggle`.

### `FilterChip`
```
{ label: string, onRemove: () => void }
```
- Accent-tinted removable pill; remove button `aria-label="Remove {label}"`.

### `ActiveFilters`
```
{ chips: Array<{ id: string, label: string, onRemove: () => void }>,
  onClearAll: () => void }
```
- Wraps chips (`flex flex-wrap gap-2`); renders "Clear all filters" only when
  `chips.length > 0`; whole row wrapped in `aria-live="polite"`.

## 4. URL parameter contract (S5)

| Param | Values | Pages |
|---|---|---|
| `search` | any text (trimmed) | Workouts, Activities, Nutrition, Exercises |
| `category` | `all` (omitted) \| one of `WORKOUT_CATEGORIES` keys | Workouts, Activities |
| `dateOption` | `all` (omitted) \| `week` \| `month` \| `last3` \| `last6` \| `lastYear` \| `custom` | Workouts, Activities |
| `from`,`to` | `YYYY-MM-DD` (only present with `dateOption=custom` and set) | Workouts, Activities |
| `mealTypes` | comma-joined subset of `breakfast,lunch,dinner,snack` | Nutrition |

Rules:
- `setSearchParams(replace: false)` keeps history; back/forward restores state.
- On mount, page state initializes from `parseSearchParams` (never from
  defaults on a shared/shared-URL).
- "Clear all filters" resets state AND removes all filter params for the page.
- Exercising `deleteSearchParams` for the empty params isn't required (Router
  normalizes), but the contract mandates we do not leave default markers in
  the URL (e.g. `category=all`).

## 5. Data-shape assumptions (guarantee we do not break)

- API workouts expose `title`; mock workouts expose `name` ⇒ `textFor`
  accessors, never a shared hard-coded field.
- Nutrition `mealType` ∈ the four-value enum; unknown values simply never
  match an active chip (defensive, harmless).
- Ranges are inclusive; `from > to` is legal and yields an empty set (→
  designed empty state). Known and exercised, not special-cased away.

## 6. Explicit non-contracts

- No backend endpoint changes; no persisted/serialized filter model beyond the
  URL query string; no storage keys defined; nothing depends on
  analytics' `resolveRange` (separate module) — the two range resolvers are
  intentionally distinct (different preset keys) and must NOT be merged this
  phase.