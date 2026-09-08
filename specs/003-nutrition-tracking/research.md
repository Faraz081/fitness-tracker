# Research: Nutrition Tracking (Day 3)

**Branch**: `003-nutrition-tracking` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 0 output of `/sp.plan`. All "NEEDS CLARIFICATION" from the plan's
Technical Context are resolved here. Day 3 adds **no new runtime or dev
dependencies** and **no new environment variables** — every decision either
follows the Day 3 constitution (v2.2.0) or reuses the pinned Day 1/Day 2 set.

## 0.1 Dependency & Version Decision (No Change)

**Decision**: Keep the exact pinned versions (see `001-setup-auth`/`002-profile-workouts`
research). No `npm install` of new packages for nutrition. Version set: server →
TypeScript 7.0.2 / Node 24, Express 5.2.1, Mongoose 9.9.4, zod 4.4.3; client →
React 19.2.8, Vite 8.2.2, React Router 7.18.2.

**Rationale**: Nutrition CRUD + a daily aggregate are served by the existing
stock. Constitution Principle II requires NO new dependencies or env vars; a new
library (charts, date handling, state/cache) is a signal for a simpler design.

**Alternatives considered**:
- *Date-picker/date-fns library for the client date selector*: rejected — the
  native `<input type="date">` plus the `YYYY-MM-DD` string format matching the
  API's date handling is sufficient; no new dep.
- *Client state/cache library (React Query, Zustand)*: rejected — the Nutrition
  page owns its `useState` and refetches entries + summary after each mutation.
- *Separate `FoodItem`/`Unit` collections (a food database)*: rejected — deferred
  (spec §8 / constitution Deferred Scope: food DB search, barcode scanner).
  Day 3 is one `Nutrition` document per logged meal.

## 0.2 Data Modeling Decision (Single Document Per Meal + Server-Computed Totals)

**Decision**: One `Nutrition` collection; each document is a single logged
food/meal owned by a user for a date, with `owner`, `foodName`, `quantity`,
`unit`, `calories`, `protein`, `carbs`, `fat`, `mealType`, `date`. Daily
totals are **computed server-side** by aggregating only the caller's own entries
for a date (Principle VIII).

**Rationale**:
- "Log a meal" maps to one simple document; create/read/update/delete each touch
  exactly one owned row.
- A compound `{ owner, date, mealType }` index lets list filtering and the daily
  aggregate stay owner-scoped and indexed.
- Principle VIII (NON-NEGOTIABLE) mandates the server be the source of truth for
  totals; the client renders whatever the summary endpoint returns.

**Alternatives considered**:
- *Separate `FoodItem` + `NutritionLog` collections (normalized)*: adds joins and
  a data-management surface explicitly deferred (food DB). Rejected for Day 3.
- *Client-computed totals*: rejected — violates Principle VIII; totals must come
  from the summary endpoint.

## 0.3 Meal Type Handling Decision (Fixed Enum + Grouped Sections)

**Decision**: `mealType` is a fixed enum `breakfast | lunch | dinner | snack`
stored lowercase, validated with `zod.z.enum`. The UI renders entries in fixed
sections (Breakfast, Lunch, Dinner, Snack) and offers a `<select>` in the form.

**Rationale**: A closed enum gives deterministic grouping and validation; the
fixed order matches the constitution Frontend UX and keeps one source of truth
for the enum between server and client.

**Alternatives considered**: free-text meal labels, user-managed meal names, tags
— higher scope and deferred. Rejected.

## 0.4 Ownership & Authorization Decision (Owner-Scoped 404, Extended to Nutrition)

**Decision**: Every Nutrition entry stores `owner` from `req.userId` on create.
All queries (list, get one, update, delete, and the daily-summary aggregate) are
owner-scoped. A request for a missing OR not-owned entry returns **404
NOT_FOUND** (identical body). The daily summary aggregates only the caller's own
entries.

**Rationale**: Constitution Principle VII (extended to nutrition in v2.2.0) and
Principle VIII. 404 avoids existence enumeration; owner-scoped aggregation
guarantees an attacker never contaminates or reads another user's totals.

**Alternatives considered**: 403 for cross-user — rejected (existence leak);
unscoped aggregate — rejected (data leak / Principle VIII violation).

## 0.5 Update Verb Decision (PATCH, Partial)

**Decision**: `PATCH /api/nutrition/:id` accepts a partial body of any subset of
`{ foodName, quantity, unit, calories, protein, carbs, fat, mealType, date }`;
omitted fields left unchanged. (Consistent with Day 2 workout/profile PATCH.)

**Rationale**: The spec assumes PATCH ("consistent with Day 2 workouts"); partial
merge avoids wiping fields the client did not send.

**Alternatives considered**: PUT full-replace — rejected (risks wiping unsubmitted
fields); constitution explicitly allowed either but plan locks PATCH.

## 0.6 Numeric Validation Bounds Decision

**Decision**: Enforce these `zod` bounds (sanction ranges from the spec):
`calories` 0–2000; `protein`/`carbs`/`fat` 0–500 (default 0); `quantity`
0.01–1000 (default 1); `foodName` 1–100 chars; `unit` 1–20 chars; `date` valid.

**Rationale**: Bounded numbers prevent nonsense macro/calorie data and mirror
client-side checks. Ranges are advisory-sanctioned and a plan MAY relax them via
Complexity Tracking; Day 3 keeps them.

## 0.7 Daily Summary Implementation Decision (Mongoose Aggregate, Owner-Scoped)

**Decision**: `GET /api/nutrition/summary/daily?date=YYYY-MM-DD` runs a Mongoose
aggregation `[ { $match: { owner, date } }, { $group: { _id: null, calories:
{ $sum: "$calories" }, protein: { $sum: "$protein" }, carbs: { $sum: "$carbs" },
fat: { $sum: "$fat" } } } ]`; empty result returns zeros. "Date" matching uses a
start-of-day/end-of-day (or date-isodate normalization) consistent with how
entries store `date`.

**Rationale**: A single aggregate is the simplest correct owner-scoped sum and
trivially satisfies Principle VIII. Zero-fill keeps the response stable.

**Alternatives considered**: summing all owner entries then filtering client-side
— rejected (must be server-computed); per-date document accumulation document —
rejected (extra write path, no benefit Day 3).

## 0.8 List Filtering Decision (Optional date + mealType Query)

**Decision**: `GET /api/nutrition` returns the caller's entries newest first
(`date` desc, tie-break `createdAt` desc), optionally filtered by
`?date=YYYY-MM-DD` and/or `?mealType=breakfast|lunch|dinner|snack`. Invalid
`mealType` or `date` → 400 VALIDATION_ERROR (not a silent empty list).

**Rationale**: Matches the spec and constitution contracts; explicit 400 on bad
query params avoids silently hiding data behind a malformed filter.

## 0.9 Security Recap (from constitution; no new research)

- `authenticate` middleware + httpOnly-cookie JWT reused unchanged (Principle
  III; spec §6).
- Ownership isolation at the data-access layer for all routes and the aggregate
  (Principles VII, VIII; see 0.4/0.7).
- `zod` validation before any DB access on every nutrition body and query param.
- No `dangerouslySetInnerHTML`; React escaping handles rendered user input.
- Error middleware reused: 400 validation, 401 unauthorized, 404 not-found /
  not-owned, 500 internal with detail to server log only.

## 0.10 Unresolved / Out of Scope (registered, not blockers)

- Food database/search, barcode/label scanner, meal templates, water tracking,
  weekly/monthly reports, macro goals, AI suggestions, favorites — deferred
  (spec §8 / constitution Deferred Scope).
- Automated test suite / CI — deferred to a later day.
- `update-agent-context.ps1` / `create-new-feature.ps1` run under a restricted
  PowerShell execution policy; agent context update relies on the plan.md being
  present and will be attempted; if blocked, AGENTS.md recent changes are updated
  manually.
