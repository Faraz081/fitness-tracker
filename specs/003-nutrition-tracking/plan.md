# Implementation Plan: Nutrition Tracking (Day 3)

**Branch**: `003-nutrition-tracking` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-nutrition-tracking/spec.md`
**Research**: [research.md](./research.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/nutrition.openapi.yaml](./contracts/nutrition.openapi.yaml) | **Quickstart**: [quickstart.md](./quickstart.md)

## Summary

Extend the completed Day 1/Day 2 MERN app with nutrition logging. Add a
`Nutrition` model (one document per meal/food), full owner-scoped Nutrition CRUD
plus a server-computed daily summary (total calories/protein/carbs/fat), and a
Nutrition page that groups entries by meal type and shows daily totals for a
selected date. Reuse Day 1 auth unchanged (httpOnly-cookie JWT, `authenticate`,
ProtectedRoute) and Day 2 structure unchanged. Every entry is owned by
`req.userId`; no user can access another user's entries (404 for not-owned);
daily totals are server-computed across only the caller's own entries (Principle
VIII).

## Technical Context

**Language/Version**: TypeScript 7.0.2 (strict, both workspaces) on Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: client → React 19.2.8, Vite 8.2.2, React Router 7.18.2 ·
server → Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 · **NO new dependencies for Day 3** (constitution Principle II)
**Storage**: MongoDB Atlas (Mongoose 9) — adds `nutrition` collection (reuses `users`, `workouts`)
**Testing**: Manual end-to-end (Day 3 has no automated suite — deferred)
**Target Platform**: Local dev — client `http://localhost:5173`, server `http://localhost:5000`
**Project Type**: Web app (separate `client/` + `server/` workspaces, root orchestration)
**Performance Goals**: N/A Day 3 (single-user data; SC metrics are task-time based)
**Constraints**: Ownership isolation (Principle VII) + server-computed totals (Principle VIII), both non-negotiable; no new deps; reuse Day 1 auth + Day 2 structure
**Scale/Scope**: Single-user density; one `Nutrition` document per meal, no food DB/analytics/social

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Gate | Status |
|---|------|--------|
| I | Client/server monorepo `client/` + `server/`; new files placed in existing structure | ✅ plan matches |
| II | Same pinned stack; Day 3 adds NO new dependencies or env vars | ✅ research §0.1 |
| III | Auth reused unchanged; httpOnly cookie; security baseline kept | ✅ |
| IV | Envelope `{ success, data?, error? }`; explicit status codes; fetch only in `services/` | ✅ |
| V | TS strict, naming, thin controllers, one unit per file | ✅ |
| VI | End-to-end verification before Done (nutrition CRUD + summary + ownership) | ✅ (T12/T13) |
| VII | **Ownership (extended to nutrition)**: `owner=req.userId` on create; every query/aggregate `{ owner }`; not-owned → 404 | ✅ (service/query + aggregate) |
| VIII | **Server-computed totals**: daily calories + macros aggregated server-side across only the caller's own entries | ✅ (summary aggregate) |
| Env | `.env` unchanged (no new vars); no secrets in source; `.env.example` complete | ✅ |

**Complexity Tracking**: Filled only if gates violated. No violations. The only
deliberate choice worth recording is **one `Nutrition` document per logged meal
plus a server-computed daily aggregation** — simpler than a normalized food DB
and mandated by Principle VIII; it is NOT a complexity exception.

---

## 1. Overall Approach

**Work sequence: backend models → validators → Nutrition CRUD API + daily
summary → client API layer → Nutrition page → Add/Edit/Delete UI → grouping +
totals → navigation → end-to-end verification.**

1. **Backend, in dependency order**: extend `zod` validators (nutrition) → add
   the `Nutrition` model → nutrition service/controller/routes (`/api/nutrition`
   incl. `/summary/daily`). Mount the router in `app.ts` behind `authenticate`.
   Verify each endpoint with `curl` as it lands (contract-first).
2. **Frontend, in dependency order**: extend `services/api.ts` (nutrition
   wrappers) → Nutrition page (date selector + daily totals + grouped sections)
   → Add/Edit `MealForm` → delete-with-confirmation → Layout nav link →
   `App.tsx` route.
3. **End-to-end run** against real Atlas + both dev servers using the manual
   test cases, including a two-user ownership check and totals accuracy. Only
   then sign DoD.

**Why backend-first**: the client has nothing to render until the contracts
return real entries + a server-computed summary; building the API first lets
each frontend task be verified against a live endpoint.

### Key decisions locked by the constitution/spec (do not re-open)

- Day 1 auth and Day 2 profile/workouts are complete; **reuse `authenticate`,
  `ProtectedRoute`, `AuthContext`, and the User/Workout models unchanged**. Do
  not rebuild any prior feature.
- **No new dependencies or env vars.** Keep exact pinned versions.
- **One `Nutrition` document per logged meal** (no food DB on Day 3); owned by
  `req.userId` on create.
- **Fixed meal-type enum**: `breakfast | lunch | dinner | snack`; UI grouped
  sections + `<select>`, stored lowercase, `zod.z.enum`.
- **Ownership (Principle VII)**: `owner` from `req.userId` on create; every
  query and the daily-summary aggregate filter `{ owner }`; not-owned OR missing
  → **404 NOT_FOUND** (identical body).
- **Server-computed totals (Principle VIII)**: daily calories/protein/carbs/fat
  from `GET /api/nutrition/summary/daily`; the client never computes them as the
  source of truth.
- **Updates use PATCH** (partial), consistent with Day 2.
- Response envelope everywhere; `services/api.ts` is the only module that calls
  `fetch`.

---

## 2. Ordered Task List

Sequential; each task's acceptance criteria must be verifiable before moving on.
**Dependencies** = tasks that must be complete first.

### T1 — Extend zod validators (nutrition)

**Files**: `server/src/utils/validators.ts` (modify)
**Implement**:
- Add `nutritionEntrySchema`: `foodName` 1–100 required; `calories` 0–2000
  required; `quantity` 0.01–1000 optional (default 1); `unit` 1–20 optional;
  `protein`/`carbs`/`fat` 0–500 optional (default 0); `mealType` enum required;
  `date` valid (default today).
- Add `nutritionUpdateSchema` (all of the above optional; partial PATCH).
- Add `nutritionQuerySchema` for list/summary query params: optional
  `mealType` enum, optional valid `date` (YYYY-MM-DD).
**Acceptance criteria**: `tsc --noEmit` passes; `zod.safeParse` of valid/invalid
samples yields expected results (invalid mealType/negative macro → fail).
**Dependencies**: none (validators are leaf).

### T2 — Create Nutrition model

**Files**: `server/src/models/Nutrition.ts` (new)
**Implement**:
- Mongoose `NutritionSchema`: `owner` (ObjectId ref User, required, indexed),
  `foodName` (required, trim), `quantity` (default 1), `unit`, `calories`
  (required), `protein`/`carbs`/`fat` (default 0), `mealType` (enum), `date`
  (default now), `timestamps: true`.
- Indexes: single `owner`; compound `{ owner, date, mealType }`.
- Export the `Nutrition` model + `Nutrition` TypeScript interface.
**Acceptance criteria**: `tsc --noEmit` passes; a document persists with owner
and macros; queries by `{ owner }` return only that owner's docs.
**Dependencies**: T1.

### T3 — Nutrition service + CRUD API

**Files**: `server/src/services/nutritionService.ts` (new),
`server/src/controllers/nutrition.ts` (new), `server/src/routes/nutrition.ts`
(new), `server/src/app.ts` (modify: mount nutritionRouter at `/api/nutrition`)
**Implement** (all behind `authenticate`; every query owner-scoped):
- `create(userId, body)` → validate `nutritionEntrySchema`; set `owner = userId`;
  `Nutrition.create(...)`; return sanitized entry (no `owner`).
- `list(userId, query)` → `Nutrition.find({ owner: userId, ...filters }).sort({
  date: -1, createdAt: -1 })` with optional `date` / `mealType` filters (validated
  via `nutritionQuerySchema`); return array.
- `getDailySummary(userId, date)` → Mongoose aggregate
  `[ { $match: { owner: userId, date: <day range> } }, { $group: { _id: null,
  calories: { $sum: "$calories" }, protein: { $sum: "$protein" }, carbs: {
  $sum: "$carbs" }, fat: { $sum: "$fat" } } } ]`; empty result → zeros.
- `getOne(userId, id)` → `Nutrition.findOne({ _id: id, owner: userId })`; null →
  throw `AppError(404, "Nutrition entry not found", "NOT_FOUND")`.
- `update(userId, id, patch)` → validate `nutritionUpdateSchema`;
  `Nutrition.findOneAndUpdate({ _id: id, owner: userId }, patch, { new: true,
  runValidators: true })`; null → 404 NOT_FOUND.
- `remove(userId, id)` → `Nutrition.deleteOne({ _id: id, owner: userId })`;
  deletedCount 0 → 404 NOT_FOUND.
- Routes (`/api/nutrition`, all behind `authenticate`): `POST /` (201), `GET /`
  (200, optional `?date=`/`?mealType=`), `GET /summary/daily` (200, optional
  `?date=`), `GET /:id` (200/404), `PATCH /:id` (200/400/404), `DELETE /:id`
  (204/404). Mount in `app.ts`.
**Acceptance criteria** (curl with cookie): create → 201; list → 200 (own only);
summary → 200 with sums; get/edit/delete for missing OR other-user id → 404;
invalid body (bad mealType, negative macro) → 400; invalid query `mealType`/`date`
→ 400; no cookie → 401; DELETE returns 204 no body.
**Dependencies**: T2.

### T4 — Client API layer (nutrition wrappers)

**Files**: `client/src/services/api.ts` (modify)
**Implement**:
- Add typed `createNutritionEntry(body)`, `listNutrition({ date?, mealType? })`,
  `getNutritionSummary(date?)`, `getNutritionEntry(id)`, `updateNutritionEntry(
  id, patch)`, `deleteNutritionEntry(id)` (expect 204).
- Keep `credentials: 'include'`, envelope parsing, error propagation. No other
  module calls `fetch`.
**Acceptance criteria**: `tsc --noEmit` passes; pages receive typed data or
decoded server errors.
**Dependencies**: T3 (for live verification).

### T5 — Nutrition page layout (date selector + daily totals + meal sections)

**Files**: `client/src/pages/Nutrition.tsx` (new), `client/src/App.tsx` (modify:
route `/nutrition` under ProtectedRoute)
**Implement**:
- Date `<input type="date">` state, defaulting to today (`YYYY-MM-DD`).
- On mount and on date change: fetch `listNutrition({ date })` + `getNutritionSummary(
  date)` in parallel; hold in local `useState`.
- **Daily totals section** rendered from the summary endpoint (calories, protein,
  carbs, fat) — never client-computed (Principle VIII).
- **Meal sections** in fixed order Breakfast / Lunch / Dinner / Snack; group the
  fetched entries by `mealType`. Each row shows `foodName`, `quantity`+`unit` (if
  present), `calories`, macros; an **Edit** button and a **Delete** button.
- Loading spinner; explicit empty state ("No entries for this date"); friendly
  error state; transient success note after save/delete.
**Acceptance criteria**: default date = today; totals load from summary endpoint;
entries grouped correctly; `/nutrition` logged out redirects to `/login`.
**Dependencies**: T4.

### T6 — Add / Edit Meal/Food form

**Files**: `client/src/components/MealForm.tsx` (new), `client/src/pages/Nutrition.tsx`
(modify: open form for add and edit)
**Implement**:
- Fields: `mealType` (`<select>`), `foodName` (required), `quantity`, `unit`,
  `calories` (required), `protein`, `carbs`, `fat`, `date` (defaults to the page
  date).
- Client validation mirrors server; invalid → inline errors, no submit.
- **Add mode**: submit → `createNutritionEntry(body)` → refetch entries + summary.
- **Edit mode**: pre-filled from the entry; submit → `updateNutritionEntry(id,
  patch)` → refetch entries + summary.
- Disable submit while pending; loading for edit pre-fill; success note.
**Acceptance criteria**: add saves under the correct meal group and totals
update; edit changes food/macros/mealType and moves the row to the right group;
validation blocks missing foodName / negative macros.
**Dependencies**: T5.

### T7 — Delete entry (with confirmation)

**Files**: `client/src/pages/Nutrition.tsx` (modify)
**Implement**:
- Delete button opens a confirmation dialog ("Delete this entry?").
- On confirm → `deleteNutritionEntry(id)` → refetch entries + summary. On cancel
  → no change. Handle 404 (already gone) gracefully.
**Acceptance criteria**: delete removes the row and adjusts totals; cancel keeps
it; deleting a not-owned/already-deleted entry shows a friendly error.
**Dependencies**: T5.

### T8 — Navigation updates (authenticated layout)

**Files**: `client/src/components/Layout.tsx` (modify)
**Implement**:
- Add a nav link to **Nutrition** (`/nutrition`) alongside Workouts/Profile,
  keeping existing Links/Logout and auth-state-driven visibility.
**Acceptance criteria**: authenticated header shows Nutrition link; unauthenticated
view unchanged; link navigates correctly.
**Dependencies**: T5 (target route exists).

### T9 — Wire all routes and integrate

**Files**: `client/src/App.tsx` (modify), `server/src/app.ts` (modify if needed)
**Implement**:
- Ensure `/nutrition` is wrapped in ProtectedRoute; Day 1/Day 2 routes untouched.
- Confirm the nutrition router is mounted; no 404 fallback regressions.
**Acceptance criteria**: `tsc --noEmit` clean in both workspaces; navigating all
routes works; protected routes redirect when unauthenticated.
**Dependencies**: T5–T8.

### T10 — Server + client type safety & lint pass

**Files**: `server/src/**`, `client/src/**` (verify/fix)
**Implement**:
- `tsc --noEmit` in both workspaces passes with zero errors.
- `npm run lint` (if present) passes; follow naming/one-unit-per-file.
**Acceptance criteria**: both workspaces typecheck clean; no `any` without
comment; no console errors.
**Dependencies**: T1–T9.

### T11 — Daily totals accuracy (server-computed) verification

**Files**: none (verification)
**Implement**:
- Directly exercise `GET /api/nutrition/summary/daily` via curl for a date with
  known entries; confirm the result equals the sum of the caller's own entries.
- Confirm the same date never includes another user's entries (two users).
**Acceptance criteria**: summary math correct (e.g. 300+400 cal etc.); adding/
editing/deleting an entry changes the summary correctly; cross-user isolation.
**Dependencies**: T3 (implementation done), real server running.

### T12 — End-to-end verification + DoD sign-off

**Files**: none (verification only; fix files if a check fails)
**Implement**:
- Run both workspaces from root (`npm run dev`) against real Atlas.
- Execute every §5 test case, including the two-user ownership check and totals
  accuracy.
- Verify `.env` untracked, no secrets, `.env.example` complete.
- Walk the §6 DoD checklist; only then confirm Day 3 complete.
**Acceptance criteria**: all §5 manual tests pass; DoD checklist fully checked.
**Dependencies**: all of T1–T11.

---

## 3. File Creation / Modification Order

Create/modify strictly in this order (each file exists before the next):

```
# Server (T1 → T3)
server/src/utils/validators.ts            (T1 modify)
server/src/models/Nutrition.ts            (T2 new)
server/src/services/nutritionService.ts   (T3 new)
server/src/controllers/nutrition.ts       (T3 new)
server/src/routes/nutrition.ts            (T3 new)
server/src/app.ts                         (T3 modify: mount nutritionRouter)

# Client (T4 → T9)
client/src/services/api.ts                (T4 modify)
client/src/pages/Nutrition.tsx            (T5 new)
client/src/components/MealForm.tsx        (T6 new)
client/src/App.tsx                        (T5/T9 modify: /nutrition route)
client/src/components/Layout.tsx          (T8 modify: Nutrition nav link)

# Docs (already generated by this planning phase)
specs/003-nutrition-tracking/plan.md
specs/003-nutrition-tracking/research.md
specs/003-nutrition-tracking/data-model.md
specs/003-nutrition-tracking/quickstart.md
specs/003-nutrition-tracking/contracts/nutrition.openapi.yaml
specs/003-nutrition-tracking/checklists/requirements.md
```

Imports/exports to add in-place: register `Nutrition.ts` in the server models
barrel if one exists; mount `nutritionRouter` in `app.ts`; keep all new routes
behind `authenticate`.

## 4. Environment & Secrets Checklist (manual, developer-owned)

1. **No new secrets/env vars.** Reuse Day 1 `server/.env` and `client/.env`
   verbatim. `.env.example` files require no changes.
2. Verify the required Day 1 vars remain present: `MONGO_URI`, `JWT_SECRET`
   (>= 32 chars), `PORT`, `CLIENT_ORIGIN`, `JWT_EXPIRES`, `COOKIE_NAME`.
3. Confirm `git check-ignore server/.env client/.env` returns both paths; no
   new `.env*` files introduced.
4. No hardcoded secrets/URLs in new source; read from config (`config/index.ts`).
5. Sanity: `git status` shows no `server/.env` / `client/.env` and no secrets.

## 5. Testing Plan for Day 3 (exact cases — ALL must pass)

Run with both dev servers up (`npm run dev`) and a real Atlas URI.

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Login (Day 1) → open `/nutrition` | Default date = today; totals 0; empty state shown |
| 2 | Add a breakfast entry (foodName, calories, protein, carbs, fat) | Appears under Breakfast; totals update correctly |
| 3 | Add entries for lunch/dinner/snack (some with quantity+unit) | All grouped correctly; totals = sum of the day's entries |
| 4 | Change the date (previous/tomorrow) | List + totals refresh; empty date shows zeros + empty state |
| 5 | Add-entry validation: missing foodName/calories, negative macros, bad mealType / bad date | Inline errors; no create |
| 6 | Edit an entry: change food/macros/mealType/date, save | Moves to correct group; totals recalculate |
| 7 | Delete an entry | Confirmation; on confirm removed + totals adjust; on cancel kept |
| 8 | Invalid `?mealType=` / `?date=` query | 400 VALIDATION_ERROR (no silent empty list) |
| 9 | **TWO USERS** — user B's Nutrition page shows none of user A's entries | B's list (and summary) exclude A's data |
| 10 | User B requests A's entry id via GET/PATCH/DELETE | All return 404 NOT_FOUND, no A's data leaked |
| 11 | **Totals accuracy** — log entries with known sums, verify summary | Summary equals server-computed sum of owner's entries only |
| 12 | Visit `/nutrition` logged out | Redirected to `/login` |
| 13 | `tsc --noEmit` in both workspaces | Clean (zero errors) |
| 14 | `git status` | No `.env`, no secrets in working tree |

## 6. Definition of Done (Day 3)

- [ ] Day 1 auth and Day 2 profile/workouts still work unchanged.
- [ ] `Nutrition` model exists with owner, foodName, quantity, unit, calories,
      protein, carbs, fat, mealType, date, and the owner/date/mealType index.
- [ ] Full nutrition CRUD matches contracts (201/200/200/204) with 400/401/404
      cases correct (verified with curl).
- [ ] `GET /api/nutrition/summary/daily` returns the caller's total calories +
      protein + carbs + fat for the requested date, computed server-side.
- [ ] **Ownership isolation proven with two users**: user B cannot list, read,
      edit, or delete user A's nutrition entry; cross-user requests return 404;
      the daily summary covers only the caller's own entries.
- [ ] Nutrition page groups entries by meal type (Breakfast/Lunch/Dinner/Snack),
      shows daily totals for the selected date, supports Add/Edit/Delete with
      confirmation against a live server.
- [ ] All 14 manual test cases (§5) pass, including totals accuracy.
- [ ] No new dependencies, no new secrets; `.env.example` unchanged/complete;
      `git status` clean of `.env`.
- [ ] `tsc --noEmit` clean in both workspaces.

## 7. Out of Scope Reminder (must NOT be built today)

Do **not** expand Day 3 into any of the following (constitution Deferred Scope +
spec §8):

- Food database / nutrition search API, barcode or label scanner.
- Meal templates and bulk "copy meal" to another date.
- Water tracking, weekly/monthly reports and historical charts, calendar
  heat-maps.
- Macro goals / calorie targets and progress dashboards.
- AI suggestions / meal plans, recipe import, photo food logging.
- Custom/multi-unit conversion tables; "add to My Foods" favorites.
- Changing email, account deletion, avatar upload, social features.
- Refresh tokens, email verification, password reset, OAuth, roles/admin.
- Rate limiting, account lockout, CSP/helmet hardening beyond Day 1 baseline.
- Full automated test suite (unit/integration) and CI.
- Deployment / production hardening.

If any of these becomes necessary, it belongs in a **new spec**, not scope
creep into this plan.
