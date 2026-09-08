# Implementation Plan: User Profile & Workout Management (Day 2)

**Branch**: `002-profile-workouts` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-profile-workouts/spec.md`
**Research**: [research.md](./research.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/profile-workout.openapi.yaml](./contracts/profile-workout.openapi.yaml) | **Quickstart**: [quickstart.md](./quickstart.md)

## Summary

Extend the completed Day 1 MERN app (auth only) with user profile editing and
full owner-scoped Workout CRUD on top of embedded exercises. Add a Profile page
(view + edit), a Workout List page, and an Add/Edit Workout form with dynamic
exercise rows (sets, reps, weight, notes) and a fixed category dropdown. Reuse
Day 1 auth unchanged (httpOnly-cookie JWT, `authenticate` middleware,
ProtectedRoute, User model pre-save hashing). Every workout is owned by
`req.userId`; no user can access another user's workouts (404 for not-owned).

## Technical Context

**Language/Version**: TypeScript 7.0.2 (strict, both workspaces) on Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: client → React 19.2.8, Vite 8.2.2, React Router 7.18.2 ·
server → Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 · **NO new dependencies for Day 2** (per constitution Principle II)
**Storage**: MongoDB Atlas (Mongoose 9) — `users` (updated) + `workouts` collections
**Testing**: Manual end-to-end (Day 2 has no automated suite — deferred)
**Target Platform**: Local dev — client `http://localhost:5173`, server `http://localhost:5000`
**Project Type**: Web app (separate `client/` + `server/` workspaces, root orchestration)
**Performance Goals**: N/A Day 2 (single-user data; SC metrics are task-time based)
**Constraints**: Ownership isolation per constitution Principle VII (non-negotiable); no new deps; reuse auth
**Scale/Scope**: Single-user density; profile + workout CRUD only, no analytics/social/templates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Gate | Status |
|---|------|--------|
| I | Client/server monorepo `client/` + `server/`; new files placed in existing structure | ✅ plan matches |
| II | Same pinned stack; Day 2 adds NO new dependencies or env vars | ✅ research §0.1 |
| III | Auth reused unchanged (bcrypt/JWT/httpOnly cookie); profile never returns password | ✅ |
| IV | Envelope `{ success, data?, error? }`; explicit status codes; fetch only in `services/` | ✅ |
| V | TS strict, naming, thin controllers, one unit per file | ✅ |
| VI | End-to-end verification before Done (profile + workout CRUD + ownership) | ✅ (T13/T14) |
| VII | **Ownership**: `owner=req.userId` on create; every query `{ owner }`; not-owned → 404 | ✅ (Data-access layer, service/query) |
| Env | `.env` unchanged (no new vars); no secrets in source; `.env.example` complete | ✅ |

**Complexity Tracking**: Filled only if gates violated. No violations. The only
deliberate choice worth recording is **embedded exercises** (single-document
workout+exercises) — simpler than a separate collection and explicitly chosen in
research §0.2; it is NOT a complexity exception.

---

## 1. Overall Approach

**Work sequence: backend models → profile API → workout CRUD API → client API
layer → profile page → workout pages → navigation → end-to-end verification.**

1. **Backend, in dependency order**: extend the `zod` validators → extend the
   `User` model with profile fields → add the `Workout` model (embedded
   Exercise subdoc) → profile service/controller/routes (`/api/users/me`) →
   workout service/controller/routes (`/api/workouts`). Mount new routers in
   `app.ts` behind `authenticate`. Verify each endpoint with `curl` as it lands
   (contract-first).
2. **Frontend, in dependency order**: extend `services/api.ts` (profile +
   workout wrappers) → Profile page (view + edit) → Workout List page →
   Add/Edit WorkoutForm (dynamic exercise rows) → delete confirmation →
   Layout nav links → `App.tsx` routes.
3. **End-to-end run** against real Atlas + both dev servers using the manual
   test cases, including a two-user ownership check. Only then sign DoD.

**Why backend-first**: the client has nothing to render until the contracts
return real data; building the API first lets each frontend task be verified
against a live endpoint.

### Key decisions locked by the constitution/spec (do not re-open)

- Day 1 auth is complete; **reuse `authenticate`, `ProtectedRoute`,
  `AuthContext`, and the User model hashing/`select:false` password** unchanged.
  Do not rebuild any auth feature.
- **No new dependencies or env vars.** Keep exact Day 1 pins.
- **Embedded Exercise subdocuments** inside Workout (research §0.2); edited via
  the parent workout's full-array payload — no separate exercise endpoints.
- **Fixed category enum**: `strength | cardio | flexibility | hybrid | other`;
  UI dropdown, stored lowercase, `zod.z.enum`.
- **Ownership (Principle VII)**: `owner` from `req.userId` on create; every
  query `find...({ owner: req.userId })`; not-owned OR missing → **404
  NOT_FOUND** (identical body).
- **Profile updates**: `PATCH /api/users/me`, partial merge, `email` read-only.
- Response envelope everywhere; `services/api.ts` is the only module that calls
  `fetch`.

---

## 2. Ordered Task List

Sequential; each task's acceptance criteria must be verifiable before moving on.
**Dependencies** = tasks that must be complete first.

### T1 — Extend zod validators (profile, workout, exercise)

**Files**: `server/src/utils/validators.ts` (modify)
**Implement**:
- Add `profileUpdateSchema` (name 1–100; bio <= 500; age int 13–120; weightKg
  20–400; heightCm 60–280; goal/fitnessLevel enums; avatarUrl url-or-null).
- Add `exerciseSchema` (name 1–100; sets int 1–50; reps int 1–500; weightKg
  >= 0; notes <= 500; restTimeSec int 0–600) and `exercisesSchema`
  (`array(exerciseSchema)`, may be empty).
- Add `workoutCreateSchema` (title 1–100 required; category enum required; date
  default today; notes <= 2000; exercises optional) and `workoutUpdateSchema`
  (all optional, exercises optional full-array).
**Acceptance criteria**: `tsc --noEmit` passes; `zod.safeParse` of valid and
invalid samples yields expected results.
**Dependencies**: none (validators are leaf).

### T2 — Extend User model with profile fields

**Files**: `server/src/models/User.ts` (modify)
**Implement**:
- Add optional fields: `bio`, `age`, `weightKg`, `heightCm`, `goal`,
  `fitnessLevel`, `avatarUrl` per data-model.md, with Mongoose constraints
  mirroring zod (min/max via schema validation where practical; enum).
- Keep `password` pre-save hashing and `select:false` unchanged. Export a typed
  `toProfileJSON()`-style helper or rely on projection in the service.
**Acceptance criteria**: `tsc --noEmit` passes; existing auth still compiles;
a saved profile round-trips all new fields; `password` still excluded.
**Dependencies**: T1.

### T3 — Create Workout model (embedded Exercise subdocument)

**Files**: `server/src/models/Workout.ts` (new)
**Implement**:
- Mongoose `ExerciseSchema` (name, sets, reps, weightKg, notes, restTimeSec)
  and `WorkoutSchema`: `owner` (ObjectId ref User, required, indexed), `title`,
  `category` (enum), `date` (default now), `notes`, `exercises: [ExerciseSchema]`,
  `timestamps: true`.
- Export `Workout` model and TypeScript interfaces for `Exercise`/`Workout`.
- Single-field index on `owner`.
**Acceptance criteria**: `tsc --noEmit` passes; a document persists with owner
and embedded exercises; queries by `{ owner }` return only that owner's docs.
**Dependencies**: T1, T2.

### T4 — Profile service + API (GET + PATCH /api/users/me)

**Files**: `server/src/services/profileService.ts` (new),
`server/src/controllers/profile.ts` (new), `server/src/routes/profile.ts` (new),
`server/src/app.ts` (modify: mount profileRouter)
**Implement**:
- `profileService.getProfile(userId)` → `User.findById(userId)` projected
  without `password`, mapped to `{ id, name, email, bio, age, weightKg,
  heightCm, goal, fitnessLevel, avatarUrl }`.
- `profileService.updateProfile(userId, patch)` → validate via
  `profileUpdateSchema`, then `findByIdAndUpdate(userId, patch, { new: true,
  runValidators: true })`, return same shape. Reject/ignore `email` changes and
  never accept `password`.
- `profileController` thin handlers; `routes/profile.ts` mounts `GET /` and
  `PATCH /` behind `authenticate`; mount at `/api/users/me` in `app.ts`.
**Acceptance criteria** (curl with cookie): `GET /api/users/me` → 200 with
profile, no `password`; no cookie → 401; `PATCH` partial body → 200 with merged
fields; invalid age/enum → 400 VALIDATION_ERROR.
**Dependencies**: T1, T2.

### T5 — Workout service + CRUD API

**Files**: `server/src/services/workoutService.ts` (new),
`server/src/controllers/workout.ts` (new), `server/src/routes/workout.ts` (new),
`server/src/app.ts` (modify: mount workoutRouter at `/api/workouts`)
**Implement**:
- `create(userId, body)` → validate `workoutCreateSchema`; set
  `owner = userId`; `Workout.create(...)`; return sanitized workout (no owner).
- `list(userId, category?)` → `Workout.find({ owner: userId }).sort({ date: -1,
  createdAt: -1 })`, optional `category` filter; return array.
- `getOne(userId, id)` → `Workout.findOne({ _id: id, owner: userId })`; if null
  throw `AppError(404, "Workout not found", "NOT_FOUND")`.
- `update(userId, id, patch)` → validate `workoutUpdateSchema`;
  `Workout.findOneAndUpdate({ _id: id, owner: userId }, patch, { new: true,
  runValidators: true })`; null → 404 NOT_FOUND.
- `remove(userId, id)` → `Workout.findOneAndDelete({ _id: id, owner: userId })`;
  null → 404 NOT_FOUND.
- Routes (`/api/workouts`, all behind `authenticate`): `POST /` (201),
  `GET /` (200, optional `?category=`), `GET /:id` (200/404),
  `PATCH /:id` (200/400/404), `DELETE /:id` (204/404).
**Acceptance criteria** (curl): create → 201; list → 200 (own only); get/edit/
delete for missing OR other-user id → 404; invalid input → 400; no cookie →
401; DELETE returns 204 no body.
**Dependencies**: T3, T4.

### T6 — Client API layer (profile + workout wrappers)

**Files**: `client/src/services/api.ts` (modify)
**Implement**:
- Add typed `getProfile()`, `updateProfile(patch)` (PATCH), `createWorkout(body)`,
  `listWorkouts(category?)`, `getWorkout(id)`, `updateWorkout(id, patch)`,
  `deleteWorkout(id)` (expect 204).
- Keep `credentials: 'include'`, envelope parsing, and error propagation. No
  other module calls `fetch`.
**Acceptance criteria**: `tsc --noEmit` passes; pages can call these and receive
typed data or decoded server errors.
**Dependencies**: T4, T5 (for live verification).

### T7 — Profile page (view + edit)

**Files**: `client/src/pages/Profile.tsx` (new), `client/src/App.tsx` (modify:
route `/profile` under ProtectedRoute)
**Implement**:
- View mode: render `name`, `email` (read-only), and profile fields from
  `getProfile()`; loading + error states.
- Edit mode (toggle): controlled form with `name`, `bio`, `age`, `weightKg`,
  `heightCm`, `goal`/`fitnessLevel` selects, `avatarUrl`; client validation
  mirrors server; Save → `updateProfile()` then update local state/AuthContext
  name and return to view; Cancel discards.
- Disable submit while pending; inline errors; no stack traces.
**Acceptance criteria**: view shows own data; edit saves and persists on
refresh; invalid input shows inline errors and no request; `/profile` logged out
redirects to `/login`.
**Dependencies**: T6.

### T8 — Workout List page

**Files**: `client/src/pages/WorkoutList.tsx` (new), `client/src/App.tsx`
(modify: route `/workouts` under ProtectedRoute)
**Implement**:
- On mount `listWorkouts()`; render each workout's title, category, date,
  exercise count, notes preview.
- Loading / error / **empty state** ("No workouts yet" + link to
  `/workouts/new`).
- Each row: Edit link → `/workouts/:id/edit`; Delete button → confirmation →
  `deleteWorkout(id)` → remove from list (or refetch).
- Optional category filter dropdown (allowed, not required).
**Acceptance criteria**: lists only the current user's workouts; empty state
shows for a fresh user; delete removes with confirmation; error state friendly.
**Dependencies**: T6.

### T9 — Add/Edit Workout form (dynamic exercise rows)

**Files**: `client/src/pages/WorkoutForm.tsx` (new), `client/src/App.tsx`
(modify: routes `/workouts/new` and `/workouts/:id/edit`)
**Implement**:
- Top-level: `title` (required), `category` (select dropdown), `date`, `notes`.
- Exercises: dynamic array in `useState`; each row has `name`, `sets`, `reps`,
  `weightKg`, `notes` (+ optional `restTimeSec`) inputs and a remove button;
  "Add exercise" appends (defaults sets=1, reps=1, weight empty).
- Client validation mirrors server; invalid rows block submit with inline errors.
- **Add mode** (`/workouts/new`): submit → `createWorkout()` → navigate
  `/workouts`.
- **Edit mode** (`/workouts/:id/edit`): pre-fill from `getWorkout(id)`;
  submit → `updateWorkout(id, { ...full, exercises })` → navigate `/workouts`.
- Loading for edit pre-fill; error states; disable submit while pending.
**Acceptance criteria**: create with 2 exercises round-trips to list; edit
changes title + adds/removes exercises and persists; empty exercise list allowed
on create; validation blocks bad sets/reps.
**Dependencies**: T8.

### T10 — Navigation updates (authenticated layout)

**Files**: `client/src/components/Layout.tsx` (modify)
**Implement**:
- Add nav links to **Workouts** (`/workouts`) and **Profile** (`/profile`),
  keeping existing Links/Logout. Auth-state-driven visibility unchanged.
**Acceptance criteria**: authenticated header shows Workouts + Profile links;
unauthenticated view unchanged; links navigate correctly.
**Dependencies**: T7–T9 (for targets to exist).

### T11 — Wire all routes and integrate

**Files**: `client/src/App.tsx` (modify), `server/src/app.ts` (modify if needed)
**Implement**:
- Ensure `/profile`, `/workouts`, `/workouts/new`, `/workouts/:id/edit` all
  wrapped in ProtectedRoute; Day 1 routes untouched.
- Confirm server routers mounted; no 404 fallback regressions.
**Acceptance criteria**: `tsc --noEmit` clean in both workspaces; navigating all
routes works; protected routes redirect when unauthenticated.
**Dependencies**: T7–T10.

### T12 — Server + client type safety & lint pass

**Files**: `server/src/**`, `client/src/**` (verify/fix)
**Implement**:
- `tsc --noEmit` in both workspaces passes with zero errors.
- `npm run lint` (if a lint step exists) passes; follow naming/one-unit-per-file.
**Acceptance criteria**: both workspaces typecheck clean; no `any` without
comment; no console errors.
**Dependencies**: T1–T11.

### T13 — End-to-end verification + DoD sign-off

**Files**: none (verification only; fix files if a check fails)
**Implement**:
- Run both workspaces from root (`npm run dev`) against real Atlas.
- Execute every §5 test case, including the two-user ownership check.
- Verify `.env` untracked, no secrets, `.env.example` complete.
- Walk the §6 DoD checklist; only then confirm Day 2 complete.
**Acceptance criteria**: all §5 manual tests pass; DoD checklist fully checked.
**Dependencies**: all of T1–T12.

---

## 3. File Creation / Modification Order

Create/modify strictly in this order (each file exists before the next):

```
# Server (T1 → T5)
server/src/utils/validators.ts            (T1 modify)
server/src/models/User.ts                 (T2 modify)
server/src/models/Workout.ts              (T3 new)
server/src/services/profileService.ts     (T4 new)
server/src/controllers/profile.ts         (T4 new)
server/src/routes/profile.ts              (T4 new)
server/src/app.ts                         (T4/T5 modify: mount routers)
server/src/services/workoutService.ts     (T5 new)
server/src/controllers/workout.ts         (T5 new)
server/src/routes/workout.ts              (T5 new)

# Client (T6 → T11)
client/src/services/api.ts                (T6 modify)
client/src/pages/Profile.tsx              (T7 new)
client/src/pages/WorkoutList.tsx          (T8 new)
client/src/pages/WorkoutForm.tsx          (T9 new)
client/src/App.tsx                        (T7/T8/T9/T11 modify)
client/src/components/Layout.tsx          (T10 modify)

# Docs (already generated by this planning phase)
specs/002-profile-workouts/plan.md
specs/002-profile-workouts/research.md
specs/002-profile-workouts/data-model.md
specs/002-profile-workouts/quickstart.md
specs/002-profile-workouts/contracts/profile-workout.openapi.yaml
```

## 4. Environment & Secrets Checklist (manual, developer-owned)

1. **No new secrets/env vars.** Reuse Day 1 `server/.env` and `client/.env`
   verbatim. `.env.example` files require no changes.
2. Verify the required Day 1 vars remain present: `MONGO_URI`, `JWT_SECRET`
   (>= 32 chars), `PORT`, `CLIENT_ORIGIN`, `JWT_EXPIRES`, `COOKIE_NAME`.
3. Confirm `git check-ignore server/.env client/.env` returns both paths; no
   new `.env*` files introduced.
4. No hardcoded secrets/URLs in new source; read from config (`config/index.ts`).
5. Sanity: `git status` shows no `server/.env` / `client/.env` and no secrets.

## 5. Testing Plan for Day 2 (exact cases — ALL must pass)

Run with both dev servers up (`npm run dev`) and a real Atlas URI.

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Login (Day 1) → open `/profile` | Own details shown; email read-only |
| 2 | Edit profile: change name + a profile field, save | Updated values shown and persist after refresh |
| 3 | Profile edit with invalid age / non-numeric weightKg | Inline error; no save |
| 4 | Open `/workouts` with no workouts | Empty state with a "create" button |
| 5 | Add workout with 2+ exercises (sets/reps/weight/notes), category, date | Appears in list with correct category/date/exercise count |
| 6 | Add workout with missing title or invalid category | Inline errors; no create |
| 7 | Edit a workout: change title/notes, add + remove an exercise, save | Updated values shown and listed |
| 8 | Delete a workout | Confirmation; on confirm removed; on cancel kept |
| 9 | **TWO USERS** — user B's Workout List shows none of user A's workouts | Empty (or B-only) list |
| 10 | User B requests A's workout id via GET/PATCH/DELETE | All return 404 NOT_FOUND, no A's data leaked |
| 11 | Visit `/profile`, `/workouts`, `/workouts/new` logged out | Redirected to `/login` |
| 12 | `GET /api/users/me` / `GET /api/workouts` responses | No `password`; workout list never cross-user |
| 13 | `tsc --noEmit` in both workspaces | Clean (zero errors) |
| 14 | `git status` | No `.env`, no secrets in working tree |

## 6. Definition of Done (Day 2)

- [ ] Day 1 auth still works unchanged (register → login → protected → refused).
- [ ] `User` model has the new optional profile fields; old documents upgrade
      cleanly (no migration).
- [ ] `GET /api/users/me` and `PATCH /api/users/me` match contracts and never
      return the password.
- [ ] `Workout` model exists with embedded `exercises` and an `owner` reference.
- [ ] Full workout CRUD matches contracts (201/200/200/204) with 400/401/404
      cases correct (verified with curl).
- [ ] **Ownership isolation proven with two users**: user B cannot list, read,
      edit, or delete user A's workout; cross-user requests return 404.
- [ ] Profile page views and edits profile fields against a live server.
- [ ] Workout List lists only the current user's workouts, with an empty state.
- [ ] Add/Edit/Delete workouts work end-to-end; exercises, sets, reps, weight,
      notes round-trip with no data loss.
- [ ] All 14 manual test cases (§5) pass.
- [ ] No new dependencies, no new secrets; `.env.example` unchanged/complete;
      `git status` clean of `.env`.
- [ ] `tsc --noEmit` clean in both workspaces.

## 7. Out of Scope Reminder (must NOT be built today)

Do **not** expand Day 2 into any of the following (constitution Deferred Scope +
spec §8):

- Progress charts/analytics, body-stat tracking over time, history timelines,
  calendar heat-maps.
- Workout templates, shared/public workouts, social features, likes,
  followers/comments.
- Profile-picture **upload** (only an optional `avatarUrl` string is stored);
  file storage/CDN.
- Changing email, account deletion.
- Dedicated per-exercise REST endpoints, exercise library/catalog, supersets,
  rest timers beyond the stored `restTimeSec` field.
- User-managed categories (fixed enum only).
- Refresh tokens, email verification, password reset, OAuth, roles/admin.
- Rate limiting, account lockout, CSP/helmet hardening beyond Day 1 baseline.
- Full automated test suite (unit/integration) and CI.
- Deployment / production hardening.

If any of these becomes necessary, it belongs in a **new spec**, not scope
creep into this plan.
