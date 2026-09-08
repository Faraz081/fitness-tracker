# Feature Specification: Nutrition Tracking (Day 3)

**Feature Branch**: `003-nutrition-tracking`  
**Created**: 2026-08-28  
**Status**: Draft  
**Input**: User description: "Day 3 nutrition tracking — log meals and foods with
calories and macros, view daily totals, group by meal type, test full Nutrition
CRUD. Day 1 (authentication) and Day 2 (profile + workouts) are complete and
must be reused unchanged."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log a Meal/Food with Calories & Macros (Priority: P1)

A logged-in user records the foods/meals they ate on a given day, entering the
food name, optional quantity/unit, calories, protein, carbs, fat, and a meal
type (breakfast, lunch, dinner, snack). The entry is saved and shown grouped
under its meal type.

**Why this priority**: Logging is the core value of the nutrition domain and the
foundation every other nutrition feature builds on. It is independently
deliverable and testable before any totals or grouping exist.

**Independent Test**: A user who is already logged in can open the Nutrition
page, add a food with calories/macros and a meal type, and see it appear on the
page for that day — without any other nutrition feature.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Nutrition page, **When** they create an
   entry with a food name, calories, macros, meal type, and a date, **Then** it
   is saved and displayed under the correct meal group for that date.
2. **Given** the Add-entry form, **When** the user submits without a food name or
   calories, or with macros/calories as negative numbers, **Then** inline
   validation errors are shown and no entry is created.
3. **Given** an authenticated user, **When** they log food with an optional
   quantity and unit (e.g. 150 g, 2 cups), **Then** the quantity/unit are shown
   alongside the entry; if omitted the entry still saves.

---

### User Story 2 - See Today's Calories & Macro Totals (Priority: P1)

A logged-in user sees the daily totals for a selected date: total calories,
protein, carbs, and fat, computed by the server from the logged entries for that
day.

**Why this priority**: The totals are the primary "so how did I do today?"
insight and validate the server-side aggregation rule (Principle VIII). It is
deliverable right after Story 1.

**Independent Test**: After logging one or more entries, a user can view the
summarized total calories/protein/carbs/fat for the selected date, updated as
entries are added/edited/deleted — without any workout interaction.

**Acceptance Scenarios**:

1. **Given** at least one logged entry for a date, **When** the user views that
   date's page, **Then** the daily summary shows the correct summed calories,
   protein, carbs, and fat.
2. **Given** the user changes the selected date, **When** it has different (or no)
   entries, **Then** the totals and entries refresh for that date.
3. **Given** a date with no entries, **When** the user views it, **Then** the
   summary shows zeros and the page shows an explicit empty state (no error).

---

### User Story 3 - Edit & Delete Nutrition Entries (Priority: P2)

A logged-in user can edit a logged entry (food, macros, meal type, date) or
delete it after confirmation, and both actions immediately refresh the daily
totals.

**Why this priority**: Completes the nutrition CRUD lifecycle and keeps totals
accurate. It depends on Stories 1 and 2 and is the final Day 3 gate.

**Independent Test**: After logging one or more entries, a user can edit an
entry's food/macros/meal type and delete an entry after a confirmation prompt,
with the page and totals updating accordingly.

**Acceptance Scenarios**:

1. **Given** an entry the user owns, **When** they edit its food name, calories,
   macros, or meal type and save, **Then** the updated entry is shown in its
   correct meal group and the daily totals are recalculated.
2. **Given** an entry in the list, **When** the user confirms deletion, **Then**
   the entry is removed and the totals adjust; cancelling the confirmation leaves
   it intact.
3. **Given** user B requests user A's nutrition entry id directly, **When** they
   try to read, edit, or delete it, **Then** it is treated as not found (an error
   that does not reveal the entry exists or belong to user A).

---

### Edge Cases

- Whitespace-only `foodName` / `unit` (trim before validation).
- `calories`, `protein`, `carbs`, `fat` as 0, negative, or non-numeric values.
- `quantity` omitted (defaults to 1) vs. quantity = 0 or negative.
- Duplicate food entries for the same meal/date (allowed; each retained and
  summed).
- Entry edited to change its `mealType` or `date` (moves to the new group/day).
- Deleting the same entry twice (second delete returns not-found).
- Requesting an entry id that is missing OR owned by another user (same error).
- Invalid `?mealType` or `?date` query strings (400, not a silent empty list).
- Network failure while saving/deleting (show friendly error, re-enable form).
- Unauthenticated user hitting `/nutrition` (redirected to Login).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reuse the Day 1 authentication (login, httpOnly-cookie
  JWT, ProtectedRoute, `authenticate` middleware) without rebuilding it.
- **FR-002**: System MUST reuse the Day 2 profile/workout features unchanged.
- **FR-003**: System MUST provide a Nutrition model (one document per food/meal
  entry) owned by the authenticated user, with food name, quantity, unit,
  calories, protein, carbs, fat, meal type, and date.
- **FR-004**: System MUST allow the user to create a nutrition entry with
  calories and macro values (protein, carbs, fat) plus an optional quantity and
  unit.
- **FR-005**: System MUST assign a meal type to each entry from a fixed enum
  (`breakfast`, `lunch`, `dinner`, `snack`).
- **FR-006**: System MUST list the current user's entries, optionally filtered by
  `date` and/or `mealType`.
- **FR-007**: System MUST provide a server-computed daily summary (total
  calories, protein, carbs, fat) for a given date covering only the caller's own
  entries (Principle VIII — totals are never client-computed as the source of
  truth).
- **FR-008**: System MUST support editing an existing nutrition entry.
- **FR-009**: System MUST support deleting a nutrition entry after a confirmation
  step.
- **FR-010**: System MUST scope every nutrition read/update/delete/summary to the
  authenticated user so no user can access another user's entries.
- **FR-011**: System MUST validate and sanitize all nutrition inputs before
  persistence.
- **FR-012**: System MUST test the complete Nutrition CRUD flow (create, list,
  read, update, delete) and the daily-summary endpoint against a live server,
  including a two-user isolation check.

### Key Entities *(include if feature involves data)*

- **Nutrition entry**: A single logged food/meal for one user on one date.
  Attributes: owner (ref User), foodName, quantity, unit, calories, protein,
  carbs, fat, mealType, date. One User owns zero or more nutrition entries.
- **User** (reused): unchanged from Day 2; owns Nutrition entries in addition to
  Workouts.

## Implementation Specification (Day 3)

### 1. Project Structure Updates

Reuse the Day 1/Day 2 codebase as-is (no auth or workout changes). Add the
following files in place, following the existing conventions:

```text
# Server (server/src/)
├── models/
│   └── Nutrition.ts        # NEW: nutrition entry schema (owner-scoped)
├── controllers/
│   └── nutrition.ts        # NEW: create, list, summary, getOne, update, remove
├── routes/
│   └── nutrition.ts        # NEW: /api/nutrition (all behind authenticate)
├── services/
│   └── nutritionService.ts # NEW: owner-scoped nutrition logic + daily aggregate
└── utils/
    └── validators.ts       # MODIFIED: add nutritionEntry + nutritionUpdate zod schemas

# Client (client/src/)
├── services/
│   └── api.ts              # MODIFIED: add nutrition CRUD + summary wrappers
├── pages/
│   └── Nutrition.tsx       # NEW: date selector, daily totals, grouped entries, add/edit/delete
├── components/
│   ├── MealForm.tsx        # NEW: add/edit entry form (reused for both modes)
│   └── Layout.tsx          # MODIFIED: add Nutrition nav link
└── App.tsx                 # MODIFIED: add /nutrition route
```

Integration rules:
- Every new server route mounts behind the Day 1 `authenticate` middleware.
- The `Nutrition` page is wrapped in `ProtectedRoute`.
- `services/api.ts` remains the only module that calls `fetch`.
- No new dependencies, environment variables, or auth/workout code changes.

### 2. Data Models

#### Nutrition

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `_id` | ObjectId | auto | |
| `owner` | ObjectId (ref User) | required; indexed | set from `req.userId` ONLY; never client input |
| `foodName` | String | required; trim; 1–100 chars | e.g. "Chicken breast" |
| `quantity` | Number | optional; > 0 | defaults to 1 if omitted |
| `unit` | String | optional; trim; 1–20 chars | free text (g, ml, cups, oz, bowl…) |
| `calories` | Number | required; >= 0 | kcal |
| `protein` | Number | optional; >= 0 | grams; defaults to 0 |
| `carbs` | Number | optional; >= 0 | grams; defaults to 0 |
| `fat` | Number | optional; >= 0 | grams; defaults to 0 |
| `mealType` | String | required; enum `[breakfast, lunch, dinner, snack]` | stored lowercase |
| `date` | Date | required; default today | the day the entry belongs to |
| `createdAt`/`updatedAt` | Date | `timestamps: true` | |

**Meal type enum** (fixed, stored lowercase): `breakfast`, `lunch`, `dinner`,
`snack`. Validated with `zod.z.enum([...])`.

**Sanctioned numeric ranges** (enforced with `zod`, rational and configurable):
`calories` 0–2000, `protein`/`carbs`/`fat` 0–500, `quantity` 0.01–1000.

**Indexes**: single-field index on `owner`; compound `{ owner: 1, date: 1,
mealType: 1 }` to serve owner-scoped, date/meal-type-filtered listing and the
daily aggregate efficiently.

**Validation**: Define shared `zod` schemas (`nutritionEntrySchema`,
`nutritionUpdateSchema`) in `server/src/utils/validators.ts` and reuse them in
the `validate` middleware. Mirror the same constraints client-side.

**Ownership**: every Nutrition entry MUST carry `owner = req.userId`. All
queries use `{ owner: req.userId }` filters (see Security).

### 3. API Specification

Envelope: `{ success: boolean, data?: any, error?: { message, code } }`
`AUTH_ERR` (401) = `{ success:false, error:{ message:"Unauthorized", code:"UNAUTHORIZED" } }`
`NOT_FOUND` (404) = `{ success:false, error:{ message:"Nutrition entry not found", code:"NOT_FOUND" } }`

All endpoints below are **authenticated** (behind `authenticate` middleware).

#### POST /api/nutrition — create entry

Creates an entry owned by `req.userId` (owner set from `req.userId`, never the
body).

Request body:
```json
{
  "foodName":"Oatmeal","quantity":1,"unit":"bowl",
  "calories":300,"protein":10,"carbs":50,"fat":5,
  "mealType":"breakfast","date":"2026-08-28"
}
```

Validation: `foodName` required 1–100; `calories` required >= 0; `quantity`
optional > 0 (default 1); `unit` optional 1–20; `protein`/`carbs`/`fat`
optional >= 0 (default 0); `mealType` required enum; `date` valid (default
today).

Responses:
- `201 Created` (created entry, `owner` withheld)
  ```json
  { "success": true, "data": { "id":"…","foodName":"Oatmeal","quantity":1,"unit":"bowl","calories":300,"protein":10,"carbs":50,"fat":5,"mealType":"breakfast","date":"2026-08-28T00:00:00.000Z" } }
  ```
- `400` VALIDATION_ERROR; `401` AUTH_ERR

#### GET /api/nutrition — list current user's entries

Returns only the current user's entries, newest first (`date` desc, tie-break
`createdAt` desc). Optional query filters `?date=YYYY-MM-DD` and/or
`?mealType=breakfast|lunch|dinner|snack`.

Responses:
- `200 OK`
  ```json
  { "success": true, "data": [ { "id":"…","foodName":"Oatmeal","quantity":1,"unit":"bowl","calories":300,"protein":10,"carbs":50,"fat":5,"mealType":"breakfast","date":"…" } ] }
  ```
- `400` VALIDATION_ERROR (invalid `mealType`/`date`); `401` AUTH_ERR

#### GET /api/nutrition/summary/daily — daily totals (server-computed)

Returns the caller's total `calories`, `protein`, `carbs`, `fat` for
`?date=YYYY-MM-DD` (default today), aggregated server-side across the caller's
OWN entries for that date. Always owner-scoped (aggregate pipeline filters
`owner: req.userId`).

Responses:
- `200 OK`
  ```json
  { "success": true, "data": { "date":"2026-08-28","calories":1750,"protein":90,"carbs":200,"fat":60 } }
  ```
- `400` VALIDATION_ERROR (invalid date); `401` AUTH_ERR

#### GET /api/nutrition/:id — read one

MUST use `Nutrition.findOne({ _id: id, owner: req.userId })`.

Responses:
- `200 OK` (single entry object)
- `401` AUTH_ERR; `404` NOT_FOUND (missing OR not owned — identical body)

#### PATCH /api/nutrition/:id — edit entry

Partial body: any subset of `{ foodName, quantity, unit, calories, protein,
carbs, fat, mealType, date }`. Same zod validation as POST for provided fields.
MUST use `Nutrition.findOneAndUpdate({ _id: id, owner: req.userId }, …, {
new: true })`.

Responses:
- `200 OK` (updated entry)
- `400` VALIDATION_ERROR; `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

#### DELETE /api/nutrition/:id — delete entry

`Nutrition.deleteOne({ _id: id, owner: req.userId })`.

Responses:
- `204 No Content` (body empty)
- `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

**Authorization summary**: every nutrition route is behind `authenticate` and
every owner-scoped query returns 404 for other users' entries, so a user can
never list, read, edit, delete, or sum another user's entries.

### 4. Frontend Specification

#### Routes (add to `App.tsx`, wrapped in `ProtectedRoute`)

| Path | Component | Purpose |
|------|-----------|---------|
| `/nutrition` | Nutrition | Date selector, daily totals, grouped entries, add/edit/delete |

Day 1 and Day 2 routes (`/login`, `/register`, `/`, `/profile`, `/workouts*`)
remain untouched.

#### Navigation (modify `Layout.tsx`)

Authenticated header shows links to **Workouts** (`/workouts`), **Nutrition**
(`/nutrition`), **Profile** (`/profile`), and **Logout**.

#### Nutrition page (`Nutrition.tsx`)

- **Date selector** at top, defaulting to today (`YYYY-MM-DD`). Changing the
  date refetches that day's entries and summary.
- **Daily totals section** displays the server-computed summary for the selected
  date: total calories, protein, carbs, fat (Principle VIII — from the
  daily-summary endpoint, never client-computed as the source of truth).
- **Entries grouped by meal type** in fixed order: Breakfast, Lunch, Dinner,
  Snack. Each entry shows `foodName`, `quantity` + `unit` (if present),
  `calories`, and macros; each row has **Edit** and **Delete** (with
  confirmation).
- **Add / Edit form** (`MealForm.tsx`, reused for both modes): mealType selector,
  foodName, quantity, unit, calories, protein, carbs, fat, date (defaults to the
  selected page date). Client validation mirrors server; submit disabled while
  pending. Edit mode pre-fills from the entry being edited.
- On save/delete, refetch the entries + summary for the current date.
- **Loading, empty, success, and error states**: spinner while loading; explicit
  "No entries for this date" empty state; friendly error messages (never a stack
  trace); transient success note after save/delete; form/button re-enabled on
  failure.

#### Meal type handling

`mealType` is a fixed enum rendered as labeled groups (Breakfast/Lunch/Dinner/
Snack) and a `<select>` in the form — one source of truth:
`breakfast | lunch | dinner | snack`. Totals aggregate across all four groups for
the selected date.

### 5. State Management & Data Fetching

- **Auth**: reuse `AuthContext`/`useAuth` unchanged. No new global state library.
- **Nutrition fetching**: `Nutrition.tsx` fetches entries + summary on mount and
  whenever the selected date changes, via `services/api.ts` wrappers; data held
  in local `useState`. No client-side cache/refetch library — refetch after each
  mutation.
- **Form handling**: React controlled components (no form library). `MealForm.tsx`
  uses plain `useState` for the entry fields; a single component handles both add
  and edit.
- All fetch calls go through `services/api.ts` with `credentials: 'include'`.

### 6. Security & Authorization Rules

- **Nutrition isolation**: every entry stores `owner` from `req.userId` on
  create; every read/update/delete/summary filters by `owner: req.userId`. A
  request for another user's entry returns `404 NOT_FOUND` — never their data
  and never a status that reveals existence.
- **Server-computed totals**: the daily summary aggregates only the caller's own
  entries (Principle VIII); the client never owns the totals as the source of
  truth.
- **Input validation & sanitization**: `zod` on every nutrition body before
  touching the DB; trim strings; reject malformed bodies with 400 and never leak
  internals. No HTML rendered from user input (React escapes by default); no
  `dangerouslySetInnerHTML`.
- **Auth reuse**: `authenticate` middleware and httpOnly-cookie strategy are
  unchanged from Day 1. Do not lower these standards.
- **Passwords**: no auth change; nutrition endpoints touch no password data.
- **Error handling**: centralized error middleware reused; owner-not-found maps
  to 404; validation to 400; unauthenticated to 401; internal errors to 500.

### 7. Testing & Definition of Done

#### Manual test cases (ALL must pass)

1. Login (Day 1) then open `/nutrition` → default date is today, totals are 0,
   empty state shown.
2. Add a breakfast entry with foodName, calories, protein, carbs, fat → appears
   under Breakfast and totals update correctly.
3. Add entries for lunch/dinner/snack (some with quantity+unit, some without) →
   all grouped correctly; totals equal the sum of all entries for the date.
4. Change the date (previous/tomorrow) → list + totals update; date(s) with no
   entries show zeros + empty state (no error).
5. Add-entry validation: missing foodName or calories, negative calories/macros,
   invalid mealType/date → inline errors, no create, no crash.
6. Edit an entry → change foodName/macros/mealType/date, save → moves to the
   correct group and totals recalculate.
7. Delete an entry → confirmation; on confirm it is removed and totals adjust; on
   cancel it is kept.
8. Invalid `?mealType=` / `?date=` query → 400 VALIDATION_ERROR (no silent empty
   list).
9. With **two users** (A and B), user B's Nutrition list/summary shows none of
   A's entries; B cannot GET/PATCH/DELETE A's entry id (all return 404).
10. Directly visit `/nutrition` logged out → redirected to Login.
11. `git status` shows no secrets; `.env` unchanged/complete; no new
    dependencies.
12. `tsc --noEmit` runs clean in both server and client workspaces.

#### Definition of Done — "Day 3 complete" checklist

- [ ] Day 1 auth and Day 2 profile/workouts still work unchanged.
- [ ] Nutrition model exists with owner, foodName, quantity, unit, calories,
      protein, carbs, fat, mealType, date, and the owner/date/mealType index.
- [ ] Full nutrition CRUD matches contracts (201/200/200/204) with 400/401/404
      cases correct.
- [ ] `GET /api/nutrition/summary/daily` returns the caller's total calories +
      protein + carbs + fat for the requested date, computed server-side.
- [ ] Ownership isolation proven with two users (no cross-user access; 404);
      daily summary covers only the caller's entries.
- [ ] Nutrition page groups entries by meal type, shows daily totals for the
      selected date, and supports Add/Edit/Delete with confirmation against a
      live server.
- [ ] All 12 manual cases pass.
- [ ] No new dependencies, no new secrets; `git status` clean of `.env`;
      `tsc --noEmit` clean in both workspaces.

### 8. Out of Scope for Day 3

Explicitly NOT in Day 3; do not expand scope to include:

- Food database / nutrition search API, barcode or label scanner.
- Meal templates and bulk "copy meal" to another date.
- Water tracking, weekly/monthly reports and historical charts, calendar
  heat-maps.
- Macro goals / calorie targets and progress dashboards.
- AI suggestions / meal plans, recipe import, photo food logging.
- Custom/multi-unit conversion tables; "add to My Foods" favorites.
- Changing email, account deletion, avatar upload, social features.
- Refresh tokens, email verification, password reset, OAuth, roles/admin.
- Rate limiting, account lockout, CSP/helmet hardening beyond the Day 1 baseline.
- Full automated test suite (unit/integration) and CI.
- Deployment / production hardening.

These MUST NOT be silently added to Day 3; open a new spec if required.

### Assumptions

- Day 1 auth and Day 2 profile/workouts are complete and correct; Day 3 reuses
  both without modification.
- Local dev environment: client `http://localhost:5173`, server
  `http://localhost:5000`, MongoDB Atlas.
- The exact pinned versions from the Day 1 plan remain; no new packages for
  Day 3.
- `PATCH` is used for nutrition updates (consistent with Day 2 workouts).
- One Nutrition document = one logged food/meal; no separate food-database or
  unit collections on Day 3.
- Sanctioned numeric ranges (calories 0–2000, macros 0–500, quantity 0.01–1000)
  are enforced validation bounds a plan MAY relax if justified in Complexity
  Tracking.
- Meal type enum fixed at `breakfast, lunch, dinner, snack`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A logged-in user can log a food with calories and macros in under
  1 minute and see it grouped under its meal type on the Nutrition page.
- **SC-002**: A logged-in user can view today's (or any selected date's) total
  calories, protein, carbs, and fat with < 1 second refresh after any
  add/edit/delete.
- **SC-003**: 100% of nutrition reads, edits, deletes, and daily summaries are
  restricted to the owner; a direct cross-user request always fails without
  exposing data.
- **SC-004**: The full CRUD lifecycle (create → list → read → edit → delete) of a
  single nutrition entry completes in under 1 minute in a single local run.
- **SC-005**: The daily totals are always server-computed across only the
  caller's own entries — never a client-side approximation.
- **SC-006**: A new developer can get the full stack running and complete the
  Day 3 DoD checklist using the existing quickstart + `.env.example` without new
  configuration.
