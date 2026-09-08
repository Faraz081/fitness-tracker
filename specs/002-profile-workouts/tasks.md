---

description: "Task list for Day 2: User Profile & Workout Management"

---

# Tasks: User Profile & Workout Management

**Input**: Design documents from `/specs/002-profile-workouts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Feature**: `002-profile-workouts`
**Day 2 scope**: Profile page (view + update), Workout model, Add Workout with
exercises (sets/reps/weight/notes), Workout List, Edit, Delete, categories, full
CRUD testing. Day 1 auth is reused unchanged — no auth tasks.

**Legend**: `[P]` = parallelizable (different files, no dependencies).
`[US1]/[US2]/[US3]` = user story. Complexity: **S**=small, **M**=medium,
**L**=large.

> Tests: no automated test suite on Day 2 (deferred). All tasks are verified
> manually against a live server + by `tsc --noEmit` at the end of each step.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Nothing new to scaffold — Day 1 monorepo is reused as-is. Only
shared leaf artifacts needed by all stories are added first (validators,
models).

- [X] T001 Extend zod validation schemas in `server/src/utils/validators.ts`
      - **Title**: Shared zod schemas for profile, workout, and exercise
      - **Description**: Add `profileUpdateSchema`, `exerciseSchema`,
        `exercisesSchema`, `workoutCreateSchema`, `workoutUpdateSchema`
        (per data-model.md + plan T1). Trim strings, enforce enum + numeric
        bounds. Reuse for every backend route.
      - **Files**: `server/src/utils/validators.ts` (modify)
      - **Dependencies**: none
      - **Acceptance criteria**: `tsc --noEmit` clean; `zod.safeParse` of
        representative valid/invalid samples returns expected results.
      - **Complexity**: S

- [X] T002 Extend User model with optional profile fields in `server/src/models/User.ts`
      - **Title**: User profile fields
      - **Description**: Add optional `bio`, `age`, `weightKg`, `heightCm`,
        `goal`, `fitnessLevel`, `avatarUrl` with constraints matching zod. Keep
        `password` pre-save hashing and `select:false` unchanged.
      - **Files**: `server/src/models/User.ts` (modify)
      - **Dependencies**: T001
      - **Acceptance criteria**: `tsc --noEmit` clean; existing auth unaffected;
        a saved user round-trips all new fields; `password` stays excluded.
      - **Complexity**: S

- [X] T003 Create Workout model with embedded Exercise subdocument in `server/src/models/Workout.ts`
      - **Title**: Workout model
      - **Description**: Define `ExerciseSchema` (name, sets, reps, weightKg,
        notes, restTimeSec) and `WorkoutSchema` (`owner` ObjectId ref User
        required + indexed, `title`, `category` enum, `date` default now,
        `notes`, `exercises:[ExerciseSchema]`, `timestamps:true`). Export
        `Workout` and TypeScript interfaces.
      - **Files**: `server/src/models/Workout.ts` (new)
      - **Dependencies**: T001, T002
      - **Acceptance criteria**: `tsc --noEmit` clean; a doc persists with owner
        + embedded exercises; `Workout.find({owner})` scopes correctly.
      - **Complexity**: M

**Checkpoint**: Foundation ready — models and validators exist; user stories can
be implemented in parallel.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend API + client API layer that ALL user stories depend on.

- [X] T004 [P] Implement profile service in `server/src/services/profileService.ts`
      - **Title**: Profile service
      - **Description**: `getProfile(userId)` → `User.findById` projected
        without `password`, mapped to `{ id, name, email, bio, age, weightKg,
        heightCm, goal, fitnessLevel, avatarUrl }`. `updateProfile(userId,
        patch)` → merge via `profileUpdateSchema` then
        `findByIdAndUpdate(...,{new:true,runValidators:true})`; reject `email`/
        `password` keys.
      - **Files**: `server/src/services/profileService.ts` (new)
      - **Dependencies**: T002
      - **Acceptance criteria**: `tsc --noEmit` clean; service returns profile
        without password and merges only provided fields.
      - **Complexity**: M

- [X] T005 [P] Implement profile controller + routes + mount in `server/src/controllers/profile.ts`, `server/src/routes/profile.ts`, `server/src/app.ts`
      - **Title**: Profile API (GET + PATCH /api/users/me)
      - **Description**: Thin `profileController` handlers; router mounts `GET /`
        and `PATCH /` behind `authenticate` at `/api/users/me`; wire in
        `app.ts`. Use `validate(profileUpdateSchema)` on PATCH.
      - **Files**: `server/src/controllers/profile.ts`, `server/src/routes/profile.ts` (new), `server/src/app.ts` (modify)
      - **Dependencies**: T004
      - **Acceptance criteria**: curl: GET → 200 (no `password`); no cookie →
        401; PATCH partial → 200 merged; invalid age/enum → 400 VALIDATION_ERROR.
      - **Complexity**: M

- [X] T006 [P] Implement workout service with owner-scoped CRUD in `server/src/services/workoutService.ts`
      - **Title**: Workout service (ownership enforced here)
      - **Description**: `create(userId,body)` sets `owner=userId`;
        `list(userId,category?)` → `find({owner}).sort({date:-1,createdAt:-1})`;
        `getOne`/`update`/`remove` all use `{ _id, owner: userId }` and throw
        `AppError(404,"Workout not found","NOT_FOUND")` when null.
      - **Files**: `server/src/services/workoutService.ts` (new)
      - **Dependencies**: T003
      - **Acceptance criteria**: `tsc --noEmit` clean; every query filters by
        owner; not-owned id yields 404.
      - **Complexity**: L

- [X] T007 [P] Implement workout controller + routes + mount in `server/src/controllers/workout.ts`, `server/src/routes/workout.ts`, `server/src/app.ts`
      - **Title**: Workout CRUD API
      - **Description**: Mount at `/api/workouts` behind `authenticate`: `POST /`
        (201), `GET /` (200, optional `?category=`), `GET /:id` (200/404),
        `PATCH /:id` (200/400/404), `DELETE /:id` (204/404). Validate with
        workout schemas.
      - **Files**: `server/src/controllers/workout.ts`, `server/src/routes/workout.ts` (new), `server/src/app.ts` (modify)
      - **Dependencies**: T006
      - **Acceptance criteria**: curl: create 201; list 200 (own only); get/edit/
        delete for missing or other-user id → 404; invalid → 400; no cookie →
        401; DELETE → 204 no body.
      - **Complexity**: L

- [X] T008 [P] [US1] Extend client API layer for profile in `client/src/services/api.ts`
      - **Title**: Client profile wrappers
      - **Description**: Add `getProfile()` and `updateProfile(patch)` calling
        `/api/users/me` with `credentials:'include'`; parse envelope; propagate
        errors. Keep `fetch` confined to this module.
      - **Files**: `client/src/services/api.ts` (modify)
      - **Dependencies**: T005
      - **Acceptance criteria**: `tsc --noEmit` clean; wrappers return typed
        profile or decoded server errors.
      - **Complexity**: S

- [X] T009 [P] [US2] Extend client API layer for workouts in `client/src/services/api.ts`
      - **Title**: Client workout CRUD wrappers
      - **Description**: Add `createWorkout`, `listWorkouts(category?)`,
        `getWorkout(id)`, `updateWorkout(id,patch)`, `deleteWorkout(id)` (204).
        Same `credentials:'include'` + envelope pattern.
      - **Files**: `client/src/services/api.ts` (modify)
      - **Dependencies**: T007
      - **Acceptance criteria**: `tsc --noEmit` clean; wrappers typed; delete
        handles 204.
      - **Complexity**: S

**Checkpoint**: Foundation ready — profile + workout APIs live and client
wrappers exist; user story phases can begin.

---

## Phase 3: User Story 1 — View & Edit Profile (Priority: P1) 🎯 MVP

**Goal**: A logged-in user views and edits their own profile.
**Independent Test**: A logged-in user opens Profile, sees their details (email
read-only), edits name + a profile field, saves, and the change persists.

### Implementation for User Story 1

- [X] T010 [US1] Create Profile page (view + edit modes) in `client/src/pages/Profile.tsx`
      - **Title**: Profile page
      - **Description**: View mode renders name/email (read-only)/profile fields
        from `getProfile()`. Edit mode toggles a controlled form (`name`, `bio`,
        `age`, `weightKg`, `heightCm`, `goal`/`fitnessLevel` selects,
        `avatarUrl`) with client validation mirroring server; Save → `updateProfile()`
        then refresh local state + `AuthContext` name; Cancel discards. Loading,
        error, pending states; no stack traces.
      - **Files**: `client/src/pages/Profile.tsx` (new)
      - **Dependencies**: T008
      - **Acceptance criteria**: view shows own data; edit saves + persists on
        refresh; invalid input → inline errors, no request; submit disabled while
        pending.
      - **Complexity**: M

- [X] T011 [US1] Register `/profile` route in `client/src/App.tsx`
      - **Title**: Profile route wiring
      - **Description**: Add `/profile` under `ProtectedRoute` → `Profile`.
        Keep Day 1 routes untouched.
      - **Files**: `client/src/App.tsx` (modify)
      - **Dependencies**: T010
      - **Acceptance criteria**: `/profile` renders when authenticated; redirects
        to `/login` when not.
      - **Complexity**: S

**Checkpoint**: US1 fully functional and testable independently (profile doD).

---

## Phase 4: User Story 2 — Create a Workout with Exercises (Priority: P1) 🎯 MVP

**Goal**: A logged-in user creates a workout with a category and multiple
exercises (name, sets, reps, optional weight, optional notes).
**Independent Test**: A user creates a workout with ≥2 exercises and sees it
appear in the Workout List.

### Implementation for User Story 2

- [X] T012 [P] [US2] Create Workout List page (empty state) in `client/src/pages/WorkoutList.tsx`
      - **Title**: Workout List page (base)
      - **Description**: On mount `listWorkouts()`; render title, category,
        date, exercise count, notes preview. Loading / error / **empty state**
        ("No workouts yet" + link to `/workouts/new`). (Edit/delete actions
        added in US3.)
      - **Files**: `client/src/pages/WorkoutList.tsx` (new)
      - **Dependencies**: T009
      - **Acceptance criteria**: lists only current user's workouts; empty state
        for a fresh user; friendly error state.
      - **Complexity**: M

- [X] T013 [P] [US2] Create Add/Edit Workout form (dynamic exercise rows) in `client/src/pages/WorkoutForm.tsx`
      - **Title**: Workout form with dynamic exercises
      - **Description**: Top-level `title` (required), `category` (select
        dropdown), `date`, `notes`. Dynamic `exercises` array in `useState`;
        each row: `name`, `sets`, `reps`, `weightKg`, `notes` (+ optional
        `restTimeSec`) and a remove button; "Add exercise" appends (defaults
        sets=1, reps=1, weight empty). Client validation mirrors server; invalid
        rows block submit.
      - **Files**: `client/src/pages/WorkoutForm.tsx` (new)
      - **Dependencies**: T009
      - **Acceptance criteria**: can add/remove rows; sets/reps/weight/notes
        round-trip in state; validation blocks bad sets/reps; empty exercise
        array allowed.
      - **Complexity**: L

- [X] T014 [US2] Implement create path + `/workouts/new` + `/workouts` routes in `client/src/pages/WorkoutForm.tsx`, `client/src/App.tsx`
      - **Title**: Add Workout submit + routes
      - **Description**: In Add mode submit → `createWorkout({...full, exercises})`
        → navigate `/workouts`. Add `/workouts` → `WorkoutList` and
        `/workouts/new` → `WorkoutForm` under `ProtectedRoute` in `App.tsx`.
      - **Files**: `client/src/pages/WorkoutForm.tsx` (modify), `client/src/App.tsx` (modify)
      - **Dependencies**: T012, T013
      - **Acceptance criteria**: create with 2 exercises appears in the list;
        invalid → inline errors, no create; submit disabled while pending.
      - **Complexity**: M

**Checkpoint**: US1 + US2 work independently; created workouts appear in list.

---

## Phase 5: User Story 3 — List, Edit, and Delete Workouts (Priority: P2)

**Goal**: A user lists their own workouts, edits one (incl. exercises), and
deletes one after confirmation.
**Independent Test**: After creating workouts, a user edits details/exercises
and deletes one with a confirmation prompt; other users never see their data.

### Implementation for User Story 3

- [X] T015 [US3] Implement edit path in `client/src/pages/WorkoutForm.tsx`, `client/src/App.tsx`
      - **Title**: Edit Workout path
      - **Description**: In edit mode (`/workouts/:id/edit`) pre-fill from
        `getWorkout(id)`; submit → `updateWorkout(id, { ...full, exercises })` →
        navigate `/workouts`. Add `/workouts/:id/edit` route under
        `ProtectedRoute`.
      - **Files**: `client/src/pages/WorkoutForm.tsx` (modify), `client/src/App.tsx` (modify)
      - **Dependencies**: T013, T014
      - **Acceptance criteria**: edit changes title/notes and adds/removes
        exercises and persists; loading for pre-fill; 404 → friendly error.
      - **Complexity**: M

- [X] T016 [US3] Implement delete with confirmation in `client/src/pages/WorkoutList.tsx`
      - **Title**: Delete workout (confirm)
      - **Description**: Each list row gets Edit link (`/workouts/:id/edit`) +
      Delete button with a confirmation dialog; on confirm `deleteWorkout(id)` and
        remove from list (or refetch); on cancel keep.
      - **Files**: `client/src/pages/WorkoutList.tsx` (modify)
      - **Dependencies**: T012, T015
      - **Acceptance criteria**: delete confirm removes it from list; cancel
        keeps it; error state on failure.
      - **Complexity**: M

- [X] T017 [US3] Add navigation links (Workouts + Profile) in `client/src/components/Layout.tsx`
      - **Title**: Authenticated nav links
      - **Description**: Add **Workouts** (`/workouts`) and **Profile**
        (`/profile`) links to the authenticated header; keep Logout and
        auth-state-driven visibility.
      - **Files**: `client/src/components/Layout.tsx` (modify)
      - **Dependencies**: T011, T014, T015
      - **Acceptance criteria**: authenticated header shows both links;
        unauthenticated view unchanged; links navigate correctly.
      - **Complexity**: S

**Checkpoint**: US1, US2, US3 all independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type-safety, lint, and full end-to-end verification (incl.
ownership isolation).

- [X] T018 [P] Type-safety + lint pass in `server/src/**`, `client/src/**`
      - **Title**: TypeScript strict + lint clean
      - **Description**: `tsc --noEmit` passes in both workspaces (zero errors);
        run `npm run lint` if a lint step exists; fix any `any` without comment
        or naming/one-unit-per-file violations; no console errors.
      - **Files**: `server/src/**`, `client/src/**` (verify/fix)
      - **Dependencies**: T001–T017
      - **Acceptance criteria**: both workspaces typecheck clean; lint (if
        present) passes; no console errors.
      - **Complexity**: M

- [X] T019 ✱ Final Task — Day 2 Verification (full manual checklist incl. cross-user isolation)
      - **Title**: End-to-end verification + DoD
      - **Description**: Run both dev servers against real Atlas; execute the
        entire §Testing checklist from plan.md / spec.md (14 cases), including:
        profile view/edit; workout create/list/edit/delete; **two-user isolation**
        (user B cannot list/read/edit/delete user A's workouts — all 404); no
        `password` in responses; protected-route redirects. Verify `.env`
        untracked, `.env.example` unchanged, no new deps. Walk the DoD checklist
        ("Day 2 complete") from plan.md §6.
      - **Files**: none (verification only; fix files if a check fails)
      - **Dependencies**: T018
      - **Acceptance criteria**: all §Testing cases pass; DoD checklist fully
        checked; `git status` shows no `.env`/secrets. Only then Day 2 is DONE.
      - **Complexity**: L

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001→T002→T003 (sequential model/validator foundation).
- **Foundational (Phase 2)**: Profile API (T004→T005) and Workout API
  (T006→T007) each depend on Phase 1 and can proceed **in parallel** with each
  other; client wrappers T008 (dep T005) and T009 (dep T007) follow their API.
- **User Stories (Phase 3+)**: US1 (T010→T011) after T008; US2 (T012→T014)
  after T009; US3 (T015→T017) after US2's form + US1's route. US2's list/form
  can start once T009 lands.
- **Polish (Phase 6)**: depends on all stories.

### User Story Dependencies

- **US1 (P1)**: can start after Profile API (T004/T005) + client wrapper (T008).
- **US2 (P1)**: can start after Workout API (T006/T007) + client wrapper (T009).
- **US3 (P2)**: depends on US2 (workouts exist to edit/delete) + the form; add
  edit/delete once the form supports both modes.

### Within Each User Story

- Models → service → endpoints → client wrapper → page → route → verify.
- Story complete before moving to next priority.

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1 (foundation: validators + models).
2. Complete Phase 2 (both APIs + client wrappers).
3. Complete US1 (Profile) — independently testable.
4. Complete US2 (Add + List) — the core Day 2 MVP.
5. **STOP and VALIDATE** the MVP before building US3.

### Incremental Delivery

1. Foundation + APIs → verify with curl.
2. US1 (Profile) → test independently.
3. US2 (Add Workout + List) → test independently (MVP).
4. US3 (Edit + Delete + nav) → test independently.
5. Final verification (T019) including cross-user isolation.

### Parallel Opportunities

- Phase 1 is sequential (validators → User → Workout).
- Phase 2: Profile chain (T004/T005) and Workout chain (T006/T007) run in
  parallel; client wrappers T008/T009 follow their respective API in parallel.
- Within US2: WorkoutList (T012) and WorkoutForm (T013) are `[P]` parallel.
- All Polish/item types after phases are `[P]`.

## Notes

- Tasks follow the checklist format: `- [ ] [ID] [P] [Story] Description with path`.
- [P] tasks touch different files and have no cross-dependencies.
- Story labels ([US1]/[US2]/[US3]) map to spec.md user stories for traceability.
- Each story is independently completable and testable.
- Ownership/authorization is enforced in the service layer (T006) via
  `{ owner }` filters and 404 — no task may bypass it.
- Out-of-scope items (charts, templates, social, upload, per-exercise
  endpoints, user-managed categories, etc.) are intentionally absent.
- Commit after each task or logical group; stop at checkpoints to validate.
