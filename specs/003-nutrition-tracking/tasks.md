---

description: "Task list for Day 3: Nutrition Tracking"

---

# Tasks: Nutrition Tracking

**Input**: Design documents from `/specs/003-nutrition-tracking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Feature**: `003-nutrition-tracking`
**Day 3 scope**: Nutrition model, Add Meal, breakfast/lunch/dinner/snack entries,
food quantity, calories, protein/carbs/fat, Nutrition page, edit entries, delete
entries, daily calorie totals, macro totals, full Nutrition CRUD testing. Day 1
auth and Day 2 profile/workouts are reused unchanged — no auth/workout tasks.
No new dependencies or env vars (constitution Principle II).

**Legend**: `[P]` = parallelizable (different files, no dependencies).
`[US1]/[US2]/[US3]` = user story. Complexity: **S**=small, **M**=medium,
**L**=large.

> Tests: no automated test suite on Day 3 (deferred). All tasks are verified
> manually against a live server + by `tsc --noEmit` at the end of each step.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Nothing new to scaffold — the Day 1/2 monorepo is reused as-is.
Only shared leaf artifacts needed by all stories are added first (validators,
nutrition model).

- [x] T001 [US1] Extend zod validation schemas in `server/src/utils/validators.ts`
      - **Title**: Nutrition zod schemas
      - **Description**: Add `nutritionEntrySchema`, `nutritionUpdateSchema`
        (partial PATCH), and `nutritionQuerySchema` per data-model.md + plan T1.
        `foodName` 1–100 required; `calories` 0–2000 required; `quantity`
        0.01–1000 optional (default 1); `unit` 1–20 optional; `protein`/`carbs`/`fat`
        0–500 optional (default 0); `mealType` enum required; `date` coerce-valid
        optional (default today). Export inferred input types.
      - **Files**: `server/src/utils/validators.ts` (modify)
      - **Dependencies**: none
      - **Acceptance criteria**: `tsc --noEmit` clean; `zod.safeParse` of
        representative valid/invalid samples yields expected results (bad
        mealType / negative macro / negative quantity → fail).
      - **Complexity**: S

- [x] T002 [US1] Create Nutrition model in `server/src/models/Nutrition.ts`
      - **Title**: Nutrition model
      - **Description**: Define `nutritionSchema`: `owner` (ObjectId ref User,
        required, indexed), `foodName` (required, trim, maxlength 100),
        `quantity` (default 1, min 0.01, max 1000), `unit` (trim, maxlength 20),
        `calories` (required, min 0, max 2000), `protein`/`carbs`/`fat` (default
        0, min 0, max 500), `mealType` (enum breakfast/lunch/dinner/snack),
        `date` (required, default now), `timestamps: true`. Indexes: single
        `owner`; compound `{ owner: 1, date: 1, mealType: 1 }`. Export the
        `Nutrition` model + `Nutrition` TypeScript interface.
      - **Files**: `server/src/models/Nutrition.ts` (new)
      - **Dependencies**: T001
      - **Acceptance criteria**: `tsc --noEmit` clean; a doc persists with owner
        + macros; `Nutrition.find({ owner })` returns only that owner's docs.
      - **Complexity**: M

**Checkpoint**: Foundation ready — validators + Nutrition model exist; user
stories can be implemented.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend Nutrition API (with server-computed daily totals) +
client API layer that ALL user stories depend on.

- [x] T003 [US1] Implement nutrition service (owner-scoped CRUD + daily aggregate) in `server/src/services/nutritionService.ts`
      - **Title**: Nutrition service (ownership + daily summary enforced here)
      - **Description**: `create(userId, body)` → set `owner = userId`,
        `Nutrition.create(...)`, return sanitized entry (owner withheld).
        `list(userId, filters)` → `Nutrition.find({ owner: userId, ... })
        .sort({ date: -1, createdAt: -1 })`. `getOne`/`update`(`findOneAndUpdate`
        with `{ new, runValidators }`)/`remove`(`deleteOne`) all use
        `{ _id, owner: userId }` and throw `AppError(404, "Nutrition entry not
        found", "NOT_FOUND")` when null / deletedCount 0. `getDailySummary(userId,
        date)` → Mongoose aggregate `[ { $match: { owner: userId, date: { $gte, $lt }
        day-range } }, { $group: { _id: null, calories:{ $sum:"$calories" },
        protein:{ $sum:"$protein" }, carbs:{ $sum:"$carbs" }, fat:{ $sum:"$fat" } } } ]`;
        empty → zeros. Owner never from client input.
      - **Files**: `server/src/services/nutritionService.ts` (new)
      - **Dependencies**: T002
      - **Acceptance criteria**: `tsc --noEmit` clean; every query/aggregate
        filters by owner; not-owned/missing id → 404; summary sums only the
        owner's entries for the day.
      - **Complexity**: L

- [x] T004 [US1] Implement nutrition controller + routes + mount in `server/src/controllers/nutrition.ts`, `server/src/routes/nutrition.ts`, `server/src/app.ts`
      - **Title**: Nutrition CRUD + daily-summary API
      - **Description**: Thin `nutritionController` (create, list, summary,
        getOne, update, remove) calling the service; router mounts behind
        `authenticate` at `/api/nutrition`: `POST /` (201), `GET /` (200,
        optional `?date=`/`?mealType=`), `GET /summary/daily` (200, optional
        `?date=`), `GET /:id` (200/404), `PATCH /:id` (validate
        nutritionUpdateSchema; 200/400/404), `DELETE /:id` (204/404). Validate
        query with `nutritionQuerySchema` (invalid → 400, not silent empty).
        Mount `nutritionRouter` in `app.ts`.
      - **Files**: `server/src/controllers/nutrition.ts`, `server/src/routes/nutrition.ts` (new), `server/src/app.ts` (modify)
      - **Dependencies**: T003
      - **Acceptance criteria**: curl: create 201; list 200 (own only); summary
        daily 200 with sums; get/edit/delete for missing OR other-user id → 404;
        invalid body (bad mealType, negative macro) → 400; invalid query
        `mealType`/`date` → 400; no cookie → 401; DELETE → 204 no body.
      - **Complexity**: L

- [x] T005 [US1] Extend client API layer for nutrition in `client/src/services/api.ts`
      - **Title**: Client nutrition wrappers
      - **Description**: Add `Nutrition` interface, `NutritionSummary`, and
        `createNutritionEntry(body)`, `listNutrition({ date?, mealType? })`,
        `getNutritionSummary(date?)`, `getNutritionEntry(id)`,
        `updateNutritionEntry(id, patch)`, `deleteNutritionEntry(id)` (204).
        Same `credentials: 'include'` + envelope pattern; `fetch` stays confined
        to this module.
      - **Files**: `client/src/services/api.ts` (modify)
      - **Dependencies**: T004
      - **Acceptance criteria**: `tsc --noEmit` clean; wrappers return typed
        nutrition data or decoded server errors; delete handles 204.
      - **Complexity**: S

**Checkpoint**: Foundation ready — Nutrition API + client wrappers live.

---

## Phase 3: User Story 1 — Log a Meal/Food with Calories & Macros (Priority: P1) 🎯 MVP

**Goal**: A logged-in user records the food/meals they ate on a given day
(food name, optional quantity/unit, calories, macros, meal type) and sees each
entry grouped under its meal type.

**Independent Test**: A logged-in user opens the Nutrition page, adds a food
with calories/macros and a meal type, and sees it under that meal group for the
selected date — no totals or edit needed.

### Implementation for User Story 1

- [x] T006 [US1] Create Nutrition page (date selector + grouped meal sections + loading/empty/error states) in `client/src/pages/Nutrition.tsx`
      - **Title**: Nutrition page (base + grouping)
      - **Description**: Date `<input type="date">` state defaulting to today
        (`YYYY-MM-DD`). On mount and on date change, fetch
        `listNutrition({ date })` and hold in local `useState`. Render meal
        sections in fixed order Breakfast / Lunch / Dinner / Snack, grouping the
        fetched entries by `mealType`; each row shows `foodName`,
        `quantity`+`unit` (if present), `calories`, macros, plus **Edit** and
        **Delete** buttons. Loading spinner; explicit `"No entries for this
        date"` empty state; friendly error state (never a stack trace);
        transient success note. Day 3 only — no client-computed totals here.
      - **Files**: `client/src/pages/Nutrition.tsx` (new)
      - **Dependencies**: T005
      - **Acceptance criteria**: default date = today; entries group under the
        right meal section; empty vs populated dates render correctly; entries
        come from the API (own only).
      - **Complexity**: M

- [x] T007 [US1] Create Add/Edit Meal form (shared component) in `client/src/components/MealForm.tsx`
      - **Title**: MealForm (add/edit, one source of truth)
      - **Description**: Controlled component (plain `useState`) with fields:
        `mealType` (`<select>` of breakfast/lunch/dinner/snack), `foodName`
        (required), `quantity`, `unit`, `calories` (required), `protein`, `carbs`,
        `fat`, `date` (defaults to the current page date). Client validation
        mirrors server zod bounds; invalid → inline errors, no submit. Submit
        disabled while pending. Accepts an optional `initialEntry` for edit
        pre-fill and an `onSubmit` callback.
      - **Files**: `client/src/components/MealForm.tsx` (new)
      - **Dependencies**: T005
      - **Acceptance criteria**: add mode fields round-trip in state; validation
        blocks missing foodName/negative calories/negative macros; submit
        disabled while pending.
      - **Complexity**: M

- [x] T008 [US1] Wire create path + `/nutrition` route in `client/src/pages/Nutrition.tsx`, `client/src/App.tsx`
      - **Title**: Add Meal submit + route
      - **Description**: In the Nutrition page, "Add entry" opens `MealForm` in
        add mode; submit → `createNutritionEntry({ ...body, mealType, date })`
        → close form and refetch `listNutrition({ date })` + summary. Register
        `/nutrition` → `Nutrition` under `ProtectedRoute` in `App.tsx` (Day 1/2
        routes untouched).
      - **Files**: `client/src/pages/Nutrition.tsx` (modify), `client/src/App.tsx` (modify)
      - **Dependencies**: T006, T007
      - **Acceptance criteria**: an added food with a meal type appears under the
        correct meal group; invalid input → inline errors, no create;
        `/nutrition` logged out redirects to `/login`.
      - **Complexity**: M

**Checkpoint**: US1 fully functional and testable independently (log a meal).

---

## Phase 4: User Story 2 — See Today's Calories & Macro Totals (Priority: P1)

**Goal**: A logged-in user sees the daily totals for a selected date — total
calories, protein, carbs, fat — computed by the server from the day's entries
(Principle VIII).

**Independent Test**: After logging one or more entries, a user views the
summarized total calories/protein/carbs/fat for the selected date, updated as
entries are added/edited/deleted.

### Implementation for User Story 2

- [x] T009 [US2] Render server-computed daily totals from the summary endpoint in `client/src/pages/Nutrition.tsx`
      - **Title**: Daily totals section (server-computed)
      - **Description**: Add a **Daily totals** section fed by
        `getNutritionSummary(date)` (calories, protein, carbs, fat). Fetch on
        mount and whenever the selected date changes — in parallel with the
        list fetch. Totals are displayed from the endpoint response only; never
        client-summed as the source of truth (Principle VIII). Refresh this
        summary after every add/edit/delete. A date with no entries shows zeros
        + the empty state (no error).
      - **Files**: `client/src/pages/Nutrition.tsx` (modify)
      - **Dependencies**: T006, T008
      - **Acceptance criteria**: totals equal the server-computed sum of the
        day's entries; changing dates refreshes totals; zero-summed empty date
        shows zeros + empty state; totals update after add/edit/delete.
      - **Complexity**: M

**Checkpoint**: US1 + US2 work independently; totals shown and server-computed.

---

## Phase 5: User Story 3 — Edit & Delete Nutrition Entries (Priority: P2)

**Goal**: A logged-in user edits a logged entry (food, macros, meal type, date)
or deletes it after confirmation; both actions immediately refresh the daily
totals.

**Independent Test**: After logging entries, a user edits an entry's
food/macros/meal type and deletes one after a confirmation prompt, with the
page and totals updating accordingly.

### Implementation for User Story 3

- [x] T010 [US3] Implement edit path in `client/src/pages/Nutrition.tsx`, `client/src/components/MealForm.tsx`
      - **Title**: Edit entry path
      - **Description**: "Edit" button on a row opens `MealForm` in edit mode
        pre-filled from the entry (optionally `getNutritionEntry(id)`); submit →
        `updateNutritionEntry(id, patch)` → refetch entries + summary. Changing
        `mealType`/`date` moves the row to the new group/day. Loading for
        pre-fill; 404 → friendly error; success note.
      - **Files**: `client/src/pages/Nutrition.tsx` (modify), `client/src/components/MealForm.tsx` (modify)
      - **Dependencies**: T007, T009
      - **Acceptance criteria**: edit changes food/macros/mealType/date and
        persists; row moves to the correct group; totals recalculate; 404 handled
        gracefully.
      - **Complexity**: M

- [x] T011 [US3] Implement delete with confirmation in `client/src/pages/Nutrition.tsx`
      - **Title**: Delete entry (confirm)
      - **Description**: "Delete" button opens a confirmation dialog ("Delete
        this entry?"); on confirm → `deleteNutritionEntry(id)` → refetch entries
        + summary; on cancel → no change. Treat a 404 (already gone / not
        owned) as a friendly error.
      - **Files**: `client/src/pages/Nutrition.tsx` (modify)
      - **Dependencies**: T009
      - **Acceptance criteria**: delete confirm removes the row and adjusts
        totals; cancel keeps it; error state on failure; not-owned/already-deleted
        id shows a friendly error.
      - **Complexity**: M

- [x] T012 [US3] Add Nutrition nav link in `client/src/components/Layout.tsx`
      - **Title**: Authenticated nav link
      - **Description**: Add a **Nutrition** (`/nutrition`) link to the
        authenticated header alongside Workouts/Profile; keep Logout and
        auth-state-driven visibility.
      - **Files**: `client/src/components/Layout.tsx` (modify)
      - **Dependencies**: T008
      - **Acceptance criteria**: authenticated header shows Nutrition link;
        unauthenticated view unchanged; link navigates correctly.
      - **Complexity**: S

**Checkpoint**: US1, US2, US3 all independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type-safety, lint, and full end-to-end verification (incl. two-user
isolation and totals accuracy).

- [x] T013 [P] Type-safety + lint pass in `server/src/**`, `client/src/**`
      - **Title**: TypeScript strict + lint clean
      - **Description**: `tsc --noEmit` passes in both workspaces (zero errors);
        run `npm run lint` if a lint step exists; fix any `any` without comment
        or naming/one-unit-per-file violations; no console errors.
      - **Files**: `server/src/**`, `client/src/**` (verify/fix)
      - **Dependencies**: T001–T012
      - **Acceptance criteria**: both workspaces typecheck clean; lint (if
        present) passes; no console errors.
      - **Complexity**: M

- [x] T014 ✱ Final Task — Day 3 Verification (full manual checklist incl. two-user isolation + totals accuracy)
      - **Title**: End-to-end verification + DoD
      - **Description**: Run both dev servers against real Atlas; execute the
        entire §Testing checklist from plan.md (§5, 14 cases) / spec.md (12
        cases), including: add breakfast/lunch/dinner/snack entries (some with
        quantity+unit); date switching; invalid-input validation; edit (incl.
        changing mealType/date); delete with confirmation + cancel; invalid
        `?mealType=`/`?date=` → 400; **two-user isolation** (user B cannot
        list/read/edit/delete user A's entries — all 404; B's daily summary
        excludes A's data); **totals accuracy** (known sums verified against the
        summary endpoint); `/nutrition` logged out → `/login`. Verify `.env`
        untracked, `.env.example` unchanged, no new deps. Walk the §6 DoD
        checklist ("Day 3 complete").
      - **Files**: none (verification only; fix files if a check fails)
      - **Dependencies**: T013
      - **Acceptance criteria**: all §Testing cases pass; DoD checklist fully
        checked; `git status` shows no `.env`/secrets. Only then Day 3 is DONE.
      - **Complexity**: L

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 → T002 (validators → model, sequential).
- **Foundational (Phase 2)**: T003 → T004 → T005 (service → controller/routes →
  client wrappers), sequential dependency chain.
- **User Stories (Phase 3+)**: US1 (T006→T007→T008) after T005; US2 (T009) after
  US1's list/summary wiring; US3 (T010→T011) after US1's page/form + T012 after
  route exists.
- **Polish (Phase 6)**: depends on all stories.

### User Story Dependencies

- **US1 (P1)**: can start after Nutrition API (T003/T004) + client wrapper (T005).
- **US2 (P1)**: depends on US1's page + list wiring (T006/T008); uses the summary
  endpoint built in T004.
- **US3 (P2)**: depends on US1 (entries exist to edit/delete) + the shared form.

### Within Each User Story

- Models → service → endpoints → client wrapper → page → form → route → verify.
- Story complete before moving to next priority.

### Parallel Opportunities

- Phase 1 is sequential (validators → model).
- Phase 2 is sequential (service → controller/routes → client wrapper) because
  each depends on the prior.
- Within US1: Nutrition page (T006) and MealForm (T007) both depend only on T005
  and can run `[P]`-style in parallel before T008 integrates them.
- All Polish tasks are `[P]`.

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1 (validators + model).
2. Complete Phase 2 (Nutrition API + daily summary + client wrappers) — verify
   with curl.
3. Complete US1 (log a meal) — independently testable.
4. Complete US2 (daily totals) — the Day 3 MVP pair.
5. **STOP and VALIDATE** the MVP before building US3.

### Incremental Delivery

1. Foundation + API → verify with curl (create/list/summary/404/400/401).
2. US1 (Log a Meal + Nutrition page grouping) → test independently.
3. US2 (Daily totals) → test independently (MVP).
4. US3 (Edit + Delete + nav) → test independently.
5. Final verification (T014) including two-user isolation + totals accuracy.

### Parallel Team Strategy (optional)

With multiple developers, Phase 1/2 stay sequential (dependency chain); once
T005 lands, one dev can build the Nutrition page (T006) and another the
MealForm (T007) in parallel, then T008 integrates.

## Notes

- Tasks follow the checklist format: `- [x] [ID] [P] [Story] Description with path`.
- [P] tasks touch different files and have no cross-dependencies.
- Story labels ([US1]/[US2]/[US3]) map to spec.md user stories for traceability.
- Each story is independently completable and testable.
- Ownership/authorization is enforced in the service layer (T003) via
  `{ owner }` filters and 404 — no task may bypass it.
- **Daily totals (US2) are server-computed (Principle VIII)** — the summary
  endpoint (T004/T009) is the source of truth; no client-side summation.
- Out-of-scope items (food DB, barcode, templates, water tracking, weekly
  reports, macro goals, AI suggestions, favorites) are intentionally absent.
- Commit after each task or logical group; stop at checkpoints to validate.
