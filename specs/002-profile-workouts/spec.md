# Feature Specification: User Profile & Workout Management (Day 2)

**Feature Branch**: `002-profile-workouts`  
**Created**: 2026-08-28  
**Status**: Draft  
**Input**: User description: "Using the Day 2 constitution for User Profile &
Workout Management, create a detailed Specification (Spec) for Day 2 of the MERN
fitness/workout tracking project. Day 1 (Authentication) is already complete and
must be reused. Do not rebuild auth. Focus strictly on: Profile page (view +
update name/profile info); Workout model; Add Workout with exercises, sets,
reps, weight, notes; Workout List page; Edit workout; Delete workout; workout
categories; test complete Workout CRUD. Produce an implementation-ready spec."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View & Edit Profile (Priority: P1)

A logged-in user opens their Profile page and can see their name, email, and
profile information, then switch to an edit mode to update their name and
profile details (bio, age, weight, height, fitness goal, fitness level) and save
the changes.

**Why this priority**: Profile is the lightest Day 2 slice and grounds the
feature set on identity, which workouts depend on. It is independently
deliverable and testable before any workout feature exists.

**Independent Test**: A user who is already logged in (Day 1) can navigate to
their Profile, see their current details, edit their name and a couple of
profile fields, save, and see the updated values — without any workout feature.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they open the Profile page, **Then**
   they see their name, email, and profile information displayed in read mode.
2. **Given** the Profile view mode, **When** the user switches to edit mode,
   changes their name to a valid 1–100 char value and a profile field, and saves,
   **Then** the updated values are shown and are persisted for later visits.
3. **Given** the Profile edit mode, **When** the user submits an invalid value
   (e.g. age not a number, age < 13 or > 120), **Then** an inline validation
   error is shown and the update is not saved.

---

### User Story 2 - Create a Workout with Exercises (Priority: P1)

A logged-in user creates a workout with a name, category, date, notes, and one
or more exercises, each with a name, sets, reps, optional weight, and optional
notes.

**Why this priority**: Creating workouts is the core value of the Workout
domain and the prerequisite for listing/editing/deleting. It must be the first
workout slice built.

**Independent Test**: A logged-in user can open "Add Workout", fill in workout
details, add multiple exercises with sets/reps/weight/notes, save, and then see
the workout appear on the Workout List page — independently testable once
created.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Add Workout page, **When** they enter a
   valid name, category, date, notes, add at least one exercise (name, sets,
   reps, weight, notes) and submit, **Then** the workout is created and appears
   in the Workout List.
2. **Given** the Add Workout page, **When** the user attempts to submit without a
   workout name or without a full category, **Then** inline validation errors are
   shown and no workout is created.
3. **Given** the Add Workout page, **When** the user adds multiple exercises with
   valid sets (>= 1) and reps (>= 1) and optional weight, **Then** all exercises
   are saved with the workout and shown on the created workout.

---

### User Story 3 - List, Edit, and Delete Workouts (Priority: P2)

A logged-in user sees a list of their own workouts and can open one to edit it
(including its exercises) or delete it with confirmation.

**Why this priority**: Completes the CRUD lifecycle. It depends on Story 2
(workouts exist to list/edit/delete) and is the final Day 2 gate.

**Independent Test**: After creating one or more workouts, a user can view them
in the list, edit a workout's details and exercises, and delete a workout after
a confirmation prompt — all reflected in the list.

**Acceptance Scenarios**:

1. **Given** authenticated user B with no workouts and user A with workouts,
   **When** user B opens the Workout List, **Then** user B sees only their own
   workouts (none of user A's).
2. **Given** a workout the user owns, **When** they open it for edit, change its
   name/category/notes and add/remove/change exercises, and save, **Then** the
   updated workout (with its new exercises) is shown and listed.
3. **Given** a workout in the list, **When** the user confirms deletion, **Then**
   the workout is removed and no longer appears in the list; cancelling the
   confirmation leaves the workout intact.
4. **Given** user B requests user A's workout id directly, **When** they try to
   read, edit, or delete it, **Then** it is treated as not found (an error that
   does not reveal the workout exists or belong to user A).

---

### Edge Cases

- Whitespace-only name/category/notes (trim before validation).
- Workout with zero exercises (allowed on create; exercises added on edit).
- Exercise with sets/reps as 0, negative, or non-integer values.
- Weight omitted (bodyweight) vs. weight = 0 vs. negative weight.
- Duplicate exercise names within one workout (allowed, but each retained).
- Editing a workout with all exercises removed (leaves an empty exercises array).
- Deleting the same workout twice (second delete returns not-found).
- Requesting a workout id that is missing OR owned by another user (same error).
- Profile edit with only some fields updated (partial update; others unchanged).
- Network failure while saving profile or workout (show friendly error and
  re-enable the form).
- Unauthenticated user hitting `/profile` or `/workouts*` (redirected to Login).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reuse the Day 1 authentication (login, httpOnly-cookie
  JWT, ProtectedRoute, `authenticate` middleware) without rebuilding it.
- **FR-002**: System MUST provide a Profile page that shows the current user's
  name, email, and profile fields in read mode.
- **FR-003**: System MUST allow the user to update their name and profile
  information (bio, age, weight, height, fitness goal, fitness level) via an
  edit mode and persist the changes.
- **FR-004**: System MUST NOT allow editing the email on Day 2 (email shown
  read-only).
- **FR-005**: System MUST provide a Workout model owned by the authenticated
  user, with title, category, date, notes, and an embedded exercises array.
- **FR-006**: System MUST store each exercise's name, sets, reps, optional
  weight, and optional notes.
- **FR-007**: System MUST provide an Add Workout page/form that accepts multiple
  exercises per workout.
- **FR-008**: System MUST provide a Workout List page showing only the current
  user's workouts, with an empty state when there are none.
- **FR-009**: System MUST support editing an existing workout, including its
  exercises.
- **FR-010**: System MUST support deleting a workout after a confirmation step.
- **FR-011**: System MUST assign a category to each workout from a predefined
  set of categories.
- **FR-012**: System MUST scope every workout read/update/delete to the
  authenticated user so no user can access another user's workouts.
- **FR-013**: System MUST validate and sanitize all profile and workout inputs
  before persistence.
- **FR-014**: System MUST test the complete Workout CRUD flow (create, list,
  read, update, delete) against a live server.

### Key Entities *(include if feature involves data)*

- **User** (updated): Represents a registered account owner. Day 2 adds optional
  profile fields — bio, age, weight (kg), height (cm), fitness goal, fitness
  level — alongside the existing name, email (immutable this day), password
  (hashed). A User owns zero or more Workouts.
- **Workout**: A single logged training session owned by exactly one User.
  Attributes: title, category, date, notes, embedded exercises, and an `owner`
  reference to the User.
- **Exercise** (embedded in Workout): A single movement within a workout.
  Attributes: name, sets, reps, optional weight (kg), optional notes. Exercises
  have no independent identity outside their parent Workout.

## Implementation Specification (Day 2)

### 1. Project Structure Updates

Reuse the Day 1 monorepo as-is (no auth changes). Add the following files in
place, following the existing conventions:

```text
# Server (server/src/)
├── models/
│   ├── User.ts            # MODIFIED: add optional profile fields
│   └── Workout.ts         # NEW: workout + embedded Exercise subdocument schema
├── controllers/
│   ├── auth.ts            # unchanged (reuse)
│   ├── profile.ts         # NEW: getProfile, updateProfile
│   └── workout.ts         # NEW: create, list, getOne, update, remove
├── routes/
│   ├── auth.ts            # unchanged (reuse)
│   ├── profile.ts         # NEW: /api/users/me  (GET, PATCH) behind authenticate
│   └── workout.ts         # NEW: /api/workouts (all behind authenticate)
├── services/
│   ├── authService.ts     # unchanged (reuse)
│   ├── profileService.ts  # NEW: profile read/update logic
│   └── workoutService.ts  # NEW: owner-scoped workout CRUD logic
└── utils/
    └── validators.ts      # MODIFIED: add profile + workout + exercise zod schemas

# Client (client/src/)
├── services/
│   └── api.ts             # MODIFIED: add getProfile, updateProfile, workout CRUD wrappers
├── pages/
│   ├── Profile.tsx        # NEW: view + edit profile
│   ├── WorkoutList.tsx    # NEW: list own workouts
│   └── WorkoutForm.tsx    # NEW: add/edit workout + dynamic exercise rows
├── components/
│   ├── Layout.tsx         # MODIFIED: add Profile + Workouts nav links
│   └── ProtectedRoute.tsx # unchanged (reuse)
└── App.tsx                # MODIFIED: add Day 2 routes
```

Integration rules:
- Every new server route mounts behind the Day 1 `authenticate` middleware.
- All new client pages are wrapped in `ProtectedRoute`.
- `services/api.ts` remains the only module that calls `fetch`.
- No new dependencies, environment variables, or auth code changes.

### 2. Data Models

#### User (updated)

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `_id` | ObjectId | auto | carried in JWT as `sub` |
| `name` | String | required; trim; 1–100 chars | editable Day 2 |
| `email` | String | required; unique; lowercase; trim | read-only Day 2 |
| `password` | String | hashed; `select:false` | unchanged |
| `bio` | String | optional; trim; max 500 | NEW |
| `age` | Number | optional; int 13–120 | NEW |
| `weightKg` | Number | optional; >= 0 (20–400 sanction) | NEW |
| `heightCm` | Number | optional; >= 0 (60–280 sanction) | NEW |
| `goal` | String | optional; enum `['lose','maintain','gain','other']` | NEW |
| `fitnessLevel` | String | optional; enum `['beginner','intermediate','advanced']` | NEW |
| `avatarUrl` | String | optional; trim; valid URL up to 500 chars | NEW (accepted but not uploaded Day 2) |

All new fields optional → old documents upgrade without migration. Sanctioned
numeric ranges (age 13–120, weightKg 20–400, heightCm 60–280) are enforced
server-side with `zod`; rational boundaries are advisory and configurable.
`avatarUrl` is stored if provided but image upload is out of scope.

#### Workout

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `_id` | ObjectId | auto | |
| `owner` | ObjectId (ref User) | required; indexed | set from `req.userId` ONLY; never client input |
| `title` | String | required; trim; 1–100 chars | (the constitution's `name`; spec uses `title`) |
| `category` | String | required; enum (below) | |
| `date` | Date | required; default today | workout occurrence date |
| `notes` | String | optional; trim; max 2000 | whole-workout note |
| `exercises` | [Exercise] | embedded subdocs; optional | may be empty |
| `createdAt`/`updatedAt` | Date | `timestamps: true` | |

**Category enum** (fixed, stored lowercase): `strength`, `cardio`,
`flexibility`, `hybrid`, `other`. Validated with `zod.z.enum([...])`.

**Indexes**: single-field index on `owner` (for `Workout.find({ owner })`).
Compound `{ owner, date }` MAY be added during planning if list sorting benefits;
not required Day 2.

#### Exercise (embedded subdocument)

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | required; trim; 1–100 chars |
| `sets` | Number | required; int >= 1 (max 50) |
| `reps` | Number | required; int >= 1 (max 500) |
| `weightKg` | Number | optional; >= 0 (0 / omitted = bodyweight) |
| `notes` | String | optional; trim; max 500 |
| `restTimeSec` | Number | optional; int 0–600 | 

`restTimeSec` is included on the schema and validated, but is not required by
the UI on Day 2 (defaults to undefined/0 when omitted).

**Validation**: Define shared `zod` schemas (`profileUpdateSchema`,
`exerciseSchema`, `workoutCreateSchema`, `workoutUpdateSchema`) in
`server/src/utils/validators.ts` and reuse them in the `validate` middleware.
Mirror the same constraints client-side.

**Ownership**: every Workout MUST carry `owner` = `req.userId`. All queries use
`{ owner: req.userId }` filters (see Security).

### 3. API Specification

Envelope: `{ success: boolean, data?: any, error?: { message, code } }`
`AUTH_ERR` (401) = `{ success:false, error:{ message:"Unauthorized", code:"UNAUTHORIZED" } }`
`NOT_FOUND` (404) = `{ success:false, error:{ message:"Workout not found", code:"NOT_FOUND" } }`

All endpoints below are **authenticated** (behind `authenticate` middleware).

#### GET /api/users/me — get profile

Returns the current user's profile (no password hash).

Responses:
- `200 OK`
  ```json
  { "success": true, "data": { "id":"…","name":"John Doe","email":"john@example.com","bio":"…","age":32,"weightKg":80,"heightCm":178,"goal":"gain","fitnessLevel":"intermediate","avatarUrl":null } }
  ```
- `401` AUTH_ERR

#### PATCH /api/users/me — update profile

Partial body of any subset of `{ name, bio, age, weightKg, heightCm, goal,
fitnessLevel, avatarUrl }`. `null` or omitted → left unchanged. `email` not
accepted (ignore or reject with 400 — plan fixes one).

Request body (example):
```json
{ "name":"John D.","bio":"Lifting heavy.","goal":"gain","weightKg":78 }
```

Validation: per model rules above. `zod` rejects invalid types/values.

Responses:
- `200 OK` (updated profile object, same shape as GET)
- `400` `{ "success":false, "error":{ "message":"Validation failed", "code":"VALIDATION_ERROR" } }`
- `401` AUTH_ERR

#### POST /api/workouts — create workout (with exercises)

Request body:
```json
{
  "title":"Push Day","category":"strength","date":"2026-08-28","notes":"Chest focus",
  "exercises":[
    { "name":"Bench Press","sets":4,"reps":8,"weightKg":60,"notes":"Close grip" },
    { "name":"Overhead Press","sets":3,"reps":10,"weightKg":40 }
  ]
}
```

Validation: `title` required 1–100; `category` from enum required; `date` valid
date (default today); `notes` <= 2000; `exercises` optional array, each with
required `name` (1–100), `sets`/`reps` ints >= 1, optional `weightKg` >= 0,
optional `notes` <= 500, optional `restTimeSec` 0–600.

Responses:
- `201 Created` (created workout, `owner` withheld)
  ```json
  { "success": true, "data": { "id":"…","title":"Push Day","category":"strength","date":"2026-08-28T00:00:00.000Z","notes":"…","exercises":[ { "name":"Bench Press","sets":4,"reps":8,"weightKg":60,"notes":"…" } ] } }
  ```
- `400` VALIDATION_ERROR; `401` AUTH_ERR

#### GET /api/workouts — list current user's workouts

Returns only the current user's workouts, newest first (by `date` desc, tie-break
`createdAt` desc). Optional query `?category=<enum value>` filters by category.

Responses:
- `200 OK`
  ```json
  { "success": true, "data": [ { "id":"…","title":"Push Day","category":"strength","date":"…","notes":"…","exercises":[ … ] } ] }
  ```
- `401` AUTH_ERR

#### GET /api/workouts/:id — read one

MUST use `Workout.findOne({ _id: id, owner: req.userId })`.

Responses:
- `200 OK` (single workout object)
- `401` AUTH_ERR; `404` NOT_FOUND (missing OR not owned — identical body)

#### PATCH /api/workouts/:id — edit workout + exercises

Partial body: any subset of `{ title, category, date, notes, exercises }`.
Exercises replaced wholesale by the full new array (no partial exercise
updates). Same zod validation as POST for provided fields. MUST use
`Workout.findOneAndUpdate({ _id: id, owner: req.userId }, …, { new: true })`.

Responses:
- `200 OK` (updated workout)
- `400` VALIDATION_ERROR; `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

#### DELETE /api/workouts/:id — delete workout

`Workout.findOneAndDelete({ _id: id, owner: req.userId })`.

Responses:
- `204 No Content` (body empty; plan may use `200 { data: { id } }` — pick one
  and document)
- `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

**Authorization summary**: every workout route is behind `authenticate` and every
owner-scoped query returns 404 for other users' workouts, so a user can never
list, read, edit, or delete another user's workout.

### 4. Frontend Specification

#### Routes (add to `App.tsx`, all wrapped in `ProtectedRoute`)

| Path | Component | Purpose |
|------|-----------|---------|
| `/profile` | Profile | View + edit profile |
| `/workouts` | WorkoutList | List own workouts |
| `/workouts/new` | WorkoutForm | Add workout |
| `/workouts/:id/edit` | WorkoutForm | Edit workout |

Day 1 routes (`/login`, `/register`, `/`) remain untouched.

#### Navigation (modify `Layout.tsx`)

Authenticated header shows links to **Workouts** (`/workouts`), **Profile**
(`/profile`), and **Logout**. Keep the existing auth-state-driven nav.

#### Profile page (`Profile.tsx`)

- **View mode** (default): renders name, email, and profile fields (bio, age,
  weightKg, heightCm, goal, fitnessLevel, avatarUrl if set). Email shown
  read-only.
- **Edit mode** (toggle "Edit" button): form fields for `name` (required),
  `bio` (textarea), `age`/`weightKg`/`heightCm` (numeric inputs), `goal` and
  `fitnessLevel` (selects), `avatarUrl` (URL input). Client validation mirrors
  server.
- Save → `PATCH /api/users/me`; on success update local/context state and return
  to view mode; on failure show inline errors; disable submit while pending.
- "Cancel" discards edits and returns to view mode.

#### Workout List page (`WorkoutList.tsx`)

- On mount calls `GET /api/workouts`; renders each workout's title, category,
  date, exercise count, and notes preview.
- Each row: **Edit** link (`/workouts/:id/edit`) and **Delete** button that opens
  a confirmation dialog.
- Delete confirm → `DELETE /api/workouts/:id` → remove from list or refetch.
  Cancel → no change.
- **Empty state**: "No workouts yet" message + button to `/workouts/new`.
- Optional category filter dropdown (allowed, not required Day 2).
- Loading and error states (friendly message, never a stack trace).

#### Add / Edit Workout page (`WorkoutForm.tsx`)

One component for both modes:
- **Top-level fields**: `title` (text, required), `category` (select from the
  fixed enum), `date` (date input), `notes` (textarea).
- **Exercises list**: dynamic rows; each row has `name`, `sets`, `reps`,
  `weightKg`, `notes` (and optionally `restTimeSec`) inputs + a remove button.
  An **"Add exercise"** button appends a fresh row (defaults sets=1, reps=1,
  weight empty).
- Client validation mirrors server; invalid rows block submit with inline errors.
- **Submit**: Add → `POST /api/workouts` → navigate to `/workouts`. Edit →
  `PATCH /api/workouts/:id` (send full workbook incl. exercises) → navigate to
  `/workouts`. Disable submit while pending.
- Edit mode pre-fills from `GET /api/workouts/:id`.

#### Category handling

Categories use a **dropdown** populated from the fixed enum
(`strength`, `cardio`, `flexibility`, `hybrid`, `other`). No free-text or tags
on Day 2.

#### Loading, success, error states

Every data-loading page shows a loading state, a success/empty result, and a
friendly error state (with the form/button re-enabled). No stack traces shown.

### 5. State Management & Data Fetching

- **Auth**: reuse `AuthContext`/`useAuth` unchanged. No new global state library.
- **Workout fetching**: pages fetch their own data on mount via `services/api.ts`
  wrappers; data is held in local `useState`. No client-side cache/refetch
  library on Day 2 (refetch after each mutation).
- **Profile**: `Profile.tsx` reads the current user from `AuthContext` and
  fetches the latest profile with `GET /api/users/me`; after `PATCH`, update the
  local state (and optionally the auth context user name).
- **Form handling**: React controlled components (no form library; no
  react-hook-form unless a task justifies adding it — prefer plain state).
  Exercises managed as an array in `useState`, one object per row.
- All fetch calls go through `services/api.ts` with `credentials: 'include'`.

### 6. Security & Authorization Rules

- **Profile isolation**: `GET/PATCH /api/users/me` operate only on `req.userId`'s
  own document; a user can only view/edit their own profile.
- **Workout isolation**: every workout stores `owner` from `req.userId` on
  create; every read/update/delete filters by `{ _id, owner: req.userId }`. A
  request for another user's workout returns `404 NOT_FOUND` — never their data
  and never a different status that reveals existence.
- **Passwords**: profile endpoints MUST never return `password` (keep
  `select:false` and project it out).
- **Input validation & sanitization**: `zod` on every profile/workout body before
  touching the DB; trim strings; reject malformed bodies with 400 and never leak
  internals. No HTML is rendered from user input (React escapes by default);
  no `dangerouslySetInnerHTML`.
- **Auth reuse**: `authenticate` middleware and httpOnly-cookie strategy are
  unchanged from Day 1. Do not lower these standards.
- **Error handling**: centralized error middleware reused; owner-not-found maps
  to 404; validation to 400; unauthenticated to 401; internal errors to 500.

### 7. Testing & Definition of Done

#### Manual test cases (ALL must pass)

1. Login (Day 1) then open `/profile` → own details shown; email read-only.
2. Edit profile name + a profile field, save → updated values shown and persist
   after refresh.
3. Profile edit with invalid age/numeric input → inline error, no save.
4. Open `/workouts` with no workouts → empty state with a "create" button.
5. Add a workout with 2+ exercises (sets/reps/weight/notes) → appears in list
   with correct category/date/exercise count.
6. Add a workout with missing title or invalid category → inline errors, no
   create.
7. Edit a workout → change title/notes, add and remove an exercise, save →
   updated values shown and listed.
8. Delete a workout → confirmation; on confirm it is removed; on cancel it is
   kept.
9. With **two users** (A and B), user B's Workout List shows none of A's
   workouts; B cannot GET/PATCH/DELETE A's workout id (all return 404).
10. Directly visit `/profile` or `/workouts*` logged out → redirected to Login.
11. `PATCH /api/users/me` returns no `password`.
12. `.env` unchanged/complete; `git status` shows no secrets.

#### Definition of Done — "Day 2 complete" checklist

- [ ] Day 1 auth still works (register → login → protected → refused).
- [ ] User model has new optional profile fields; old docs upgrade cleanly.
- [ ] `GET/PATCH /api/users/me` match contracts and never return the password.
- [ ] Workout model exists with embedded exercises and `owner` reference.
- [ ] Full workout CRUD matches contracts (201/200/200/204) with 400/401/404
      cases correct.
- [ ] Ownership isolation proven with two users (no cross-user access; 404).
- [ ] Profile page views and edits profile fields against a live server.
- [ ] Workout List lists only the current user's workouts, with empty state.
- [ ] Add/Edit/Delete workouts work end-to-end; exercises, sets, reps, weight,
      notes round-trip with no data loss.
- [ ] All 12 manual cases pass.
- [ ] No new dependencies, no new secrets; `git status` clean of `.env`.

### 8. Out of Scope for Day 2

Explicitly NOT in Day 2; do not expand scope to include:

- Progress charts/analytics, body-stat tracking over time, history timelines,
  calendar heat-maps.
- Workout templates, shared/public workouts, social features, likes,
  followers/comments.
- Profile picture **upload** (only an optional URL field is stored); file
  storage/CDN.
- Changing email, account deletion.
- Dedicated per-exercise REST endpoints, exercise library/catalog, supersets,
  rest timers beyond the stored `restTimeSec` field.
- Category creation/management by the user (fixed enum only).
- Refresh tokens, email verification, password reset, OAuth, roles/admin.
- Rate limiting, account lockout, CSP/helmet hardening beyond Day 1 baseline.
- Full automated test suite (unit/integration) and CI.
- Deployment / production hardening.

These MUST NOT be silently added to Day 2; open a new spec if required.

### Assumptions

- Day 1 auth is complete and correct; Day 2 reuses it without modification.
- Local dev environment: client `http://localhost:5173`, server
  `http://localhost:5000`, MongoDB Atlas.
- The exact pinned versions from the Day 1 plan remain; no new packages for
  Day 2.
- Exercise `restTimeSec` is stored/validated but not required by the UI on
  Day 2.
- `avatarUrl` is an optional URL string if the user supplies one; no upload UI.
- Numerical sanction ranges (age 13–120, weightKg 20–400, heightCm 60–280) are
  enforced validation bounds that a plan MAY relax if justified in Complexity
  Tracking.
- Category enum fixed at `strength, cardio, flexibility, hybrid, other`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A logged-in user can view and update their name and profile
  information on the Profile page in under 1 minute, and the change persists.
- **SC-002**: A logged-in user can create a workout with at least 3 exercises
  (sets/reps/weight/notes) in under 2 minutes and see it in the list.
- **SC-003**: 100% of workout reads, edits, and deletes are restricted to the
  owner; a direct cross-user request always fails without exposing data.
- **SC-004**: The full CRUD lifecycle (create → list → read → edit → delete) of
  a single workout completes in under 1 minute in a single local run.
- **SC-005**: No plaintext password appears in any profile response.
- **SC-006**: A new developer cart get the full stack running and complete the
  Day 2 DoD checklist using the existing quickstart + `.env.example` without new
  configuration.
