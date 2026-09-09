# Tasks: Settings (7.1)

**Input**: Design documents from `/specs/010-settings-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Feature Branch**: `010-settings-page`

**Tests**: No automated test framework exists in this repo (no `npm test`/`lint` scripts at
root/backend/frontend; no jest/vitest installed). The feature spec and constitution Day 7.1
require build gates + a recorded manual browser pass instead — so NO test tasks are generated
(Tests are OPTIONAL per spec; verification appears as `node --check`/`npm run build` gates and
the DoD 10 manual pass in the Polish phase).

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

**Mapping to the /sp.tasks checklist**: Foundation → Phase 2; Profile Preferences + Units &
Theme → User Story 1; Notification Preferences + Account Security → User Story 2; Danger Zone
→ User Story 3; Final Polish → last phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the pre-change baseline and scaffold the new component homes. The repo
is already bootstrapped (Node 24, Express + Vite + React 19, Mongoose 9) — nothing to init.

- [x] T001 Verify baseline: run `node --check` on `backend/src/index.js` and a `vite build` in `frontend/` (`npm run build --prefix frontend`) and confirm they PASS before any changes are made
- [x] T002 [P] Create the new component directories `frontend/src/components/settings/` and `frontend/src/components/profile/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `/settings` page shell, sidebar navigation, and grouped-section layout that
EVERY user story renders inside. Completes the user's "1. Foundation" checklist.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add the Settings nav entry `{ key: 'settings', label: 'Settings', path: '/settings' }` to `SIDEBAR_MENU` in `frontend/src/data/constants.js` (append after the existing `profile` entry)
- [x] T004 [P] Add `settings: Settings` to the `menuIcons` map in `frontend/src/components/layout/Sidebar.jsx` (import `Settings` from `lucide-react`; the existing `SIDEBAR_MENU` render loop picks the entry up automatically)
- [x] T005 Add the `/settings` route in the standalone branch of `frontend/src/App.jsx` (depends on T006): `<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>` next to `/notifications`, importing `Settings` from `./pages/Settings`
- [x] T006 Create `frontend/src/pages/Settings.jsx` (depends on T007): page composes `SettingsSections` inside the existing DashboardLayout shell (fixed left sidebar + tight main content area — same panel/dash-card spacing as Dashboard, no large side gaps)
- [x] T007 [P] Create `frontend/src/components/settings/SettingsSections.jsx`: grouped-section wrapper (Account, Preferences, Notifications, Danger Zone cards with section headers) using the existing `--color-*` tokens + 4px spacing scale + dash-card surfaces
- [x] T008 Render all five section shells in `Settings.jsx` with placeholder content so the page opens cleanly from the sidebar

**Checkpoint**: Foundation ready — `/settings` opens from the sidebar with all section shells
and the active-state highlight; user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Profile, Units & Theme (Priority: P1) 🎯 MVP

**Goal**: Users edit profile details, choose weight units (kg/lb) and theme (dark/light)
from Settings; preferences persist per user and apply instantly across the app without
mutating canonical data.

**Independent Test**: Open `/settings` → edit name/weight/goal → save → success toast; same
values show on `/profile` (shared ProfileForm, one API source). Switch kg↔lb → every weight
display (Dashboard, Workout, Progress+Chart, History PRs, Analytics) re-renders and DB
`weightKg` stays unchanged. Switch dark↔light → tokens change, `<html data-theme>` set,
choice survives reload and re-login.

### Implementation for User Story 1 — Backend

- [x] T009 [P] [US1] Add embedded `preferences` subdocument to `backend/src/models/User.js`: `units` enum `['kg','lb']` default `'kg'`, `theme` enum `['dark','light']` default `'dark'` (defaults path `{ type: String, enum: [...], default: 'kg' }`)
- [x] T010 [P] [US1] Add `preferencesPatchSchema` to `backend/src/utils/validators.js` (depends on no other task): zod `.strict()` object with optional `units`/`theme` enums + `.refine` requiring ≥1 field (mirrors `profileUpdateSchema`)
- [x] T011 [US1] Add `getPreferences(userId)` and `updatePreferences(userId, patch)` to `backend/src/services/profileService.js` (depends on T009, T010): owner-scoped read + `$set` update on `user.preferences`, `401 UNAUTHORIZED` on missing user
- [x] T012 [US1] Add `getPreferencesHandler` / `updatePreferencesHandler` to `backend/src/controllers/profile.js` (depends on T011), returning `{ preferences }` via the `success` helper
- [x] T013 [US1] Add `router.get('/preferences', ...)` and `router.patch('/preferences', validate(preferencesPatchSchema), ...)` to `backend/src/routes/profile.js` (depends on T012; router already uses `router.use(authenticate)`)
- [x] T014 [US1] Backend gate: `node --check` every new/changed backend file (`backend/src/models/User.js`, `backend/src/utils/validators.js`, `backend/src/services/profileService.js`, `backend/src/controllers/profile.js`, `backend/src/routes/profile.js`) and import-smoke `backend/src/index.js`

### Implementation for User Story 1 — Frontend

- [x] T015 [P] [US1] Add `getPreferences()` and `updatePreferences(patch)` to `frontend/src/services/api.js` (GET/PATCH `/api/users/me/preferences`, auth cookie pattern already in `request()`)
- [x] T016 [US1] Create `frontend/src/context/SettingsContext.jsx` (depends on T015): loads preferences at session start; exposes `preferences`, `updateUnits`, `updateTheme`; optimistic update with revert + toast on failure (ST5); effect sets `document.documentElement.dataset.theme`
- [x] T017 [US1] Mount `<SettingsProvider>` in `frontend/src/main.jsx` (depends on T016) inside `AuthProvider`, alongside the existing `NotificationsProvider`
- [x] T018 [P] [US1] Create `frontend/src/utils/units.js`: `formatWeight(weightKg, units)` — kg passthrough (1 dp), lb × 2.20462 (1 dp); display-only, never mutates stored values
- [x] T019 [US1] Create `frontend/src/components/settings/PreferencesForm.jsx` (depends on T016): units select + theme control bound to SettingsContext with inline feedback (real `<label>`, `<select>`, `<button>`)
- [x] T020 [P] [US1] Create shared `frontend/src/components/profile/ProfileForm.jsx` (depends on T015): fields name, bio, age, weightKg, heightCm, goal, fitnessLevel, avatarUrl; email read-only; units-aware `Weight (kg|lb)` label; loads via `api.getProfile()` and saves via `api.updateProfile()`
- [x] T021 [US1] Refactor `frontend/src/pages/Profile.jsx` (depends on T020) to render the shared `ProfileForm` — no behavior change; keeps a single profile source (ST8, no second store)
- [x] T022 [US1] Wire Profile + Preferences sections into `frontend/src/pages/Settings.jsx` (depends on T019, T020): ProfileForm + PreferencesForm inside SettingsSections with save success toasts
- [x] T023 [P] [US1] Apply `formatWeight` at workout/history weight sites (depends on T018): `frontend/src/components/history/ExerciseRow.jsx`, `frontend/src/components/history/PersonalRecords.jsx` (PR_FIELDS unit output), `frontend/src/components/progress/WeightTracker.jsx`, `frontend/src/components/progress/WeightChart.jsx`
- [x] T024 [P] [US1] Apply `formatWeight` to Dashboard and Analytics weight output (depends on T018): `frontend/src/pages/Dashboard.jsx` weight card (report from `frontend/src/data/dashboardData.js`) and the weight series/delta call sites in `frontend/src/utils/analyticsUtils.js`
- [x] T025 [P] [US1] Add `[data-theme="light"] { ... }` token overrides in `frontend/src/index.css` for the `--color-*` / `--color-text-*` / surface / dark-scale variables (same tokens, light values); audit + tokenize any raw color literals that would break light contrast (constitution Theme Rule)
- [x] T026 [US1] Make the workout weight input units-aware in `frontend/src/pages/WorkoutForm.jsx` (depends on T018): dynamic `Weight (kg|lb)` label, convert kg↔lb for display while storing canonical kg

**Checkpoint**: User Story 1 fully functional — profile, units, and theme persist and apply
across the app; independently testable.

---

## Phase 4: User Story 2 - Notification Preferences, Password & Logout (Priority: P2)

**Goal**: Users control which of the six notifications they receive (single Day 6.1 source),
change their password securely (current password required, re-login on success), and log out
cleanly from Settings.

**Independent Test**: Toggle all six types + mute-all in Settings → choices persist and are
respected by the notification system (mirrored on `/notifications`). Change password with
wrong current password → clear `401`-mapped inline error, nothing changes; with a valid new
password → session cleared → must sign in again. Logout → session cleared, redirected to
`/login`.

### Implementation for User Story 2

- [x] T027 [P] [US2] Render the existing `frontend/src/components/notifications/NotificationSettings.jsx` inside the Settings Notifications section (bound to `NotificationsContext` — mute-all + six type toggles, workspace-aware in `frontend/src/pages/Settings.jsx`; no new store/controls)
- [ ] T028 [US2] Confirm persisted + respected (depends on T027): toggling in Settings reflects in `/notifications` and the notification service emission — manual regression through the existing `GET/PATCH /api/notifications/settings` API (part of DoD manual pass, T049)
- [x] T029 [P] [US2] Add `changePassword({ currentPassword, newPassword })` to `frontend/src/services/api.js` (POST `/api/auth/change-password`)
- [x] T030 [P] [US2] Add `changePasswordSchema` to `backend/src/utils/validators.js`: `currentPassword` string min 1, `newPassword` string min 6 (matches the register strength rule), `.strict()`
- [x] T031 [US2] Add `changePassword(userId, input)` to `backend/src/services/authService.js` (depends on T030): findById `.select('+password')` (401 on missing), `bcrypt.compare(currentPassword)` else `401 INVALID_PASSWORD`, reject if new password equals current via `bcrypt.compare(newPassword, hash)` as `400 VALIDATION_ERROR`, set `password` + `save()` (existing pre-save hook hashes)
- [x] T032 [US2] Add `changePasswordHandler` to `backend/src/controllers/auth.js` (depends on T031): after success `res.clearCookie(COOKIE_NAME, { sameSite: 'lax' })` then `success(res, {})`
- [x] T033 [US2] Register `authRouter.post('/change-password', authenticate, validate(changePasswordSchema), changePasswordHandler)` in `backend/src/routes/auth.js` (depends on T032)
- [x] T034 [US2] Create `frontend/src/components/settings/PasswordForm.jsx` (depends on T029): current + new + confirmation fields with inline validation (≥6 chars, match, success/error feedback via useToast + `aria-live`); on success call `useAuth().logout()` and navigate to `/login`
- [x] T035 [P] [US2] Add a Logout button to the Settings Account section — reuse `useAuth().logout()` + `navigate('/login', { replace: true })` (identical to the sidebar flow; clears httpOnly cookie server-side)
- [x] T036 [US2] Wire PasswordForm + Logout into the Account section of `frontend/src/pages/Settings.jsx` (depends on T034, T035)
- [x] T037 [US2] Backend + frontend gates: `node --check` changed backend files and `npm run build --prefix frontend`

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Danger Zone: Delete Account (Priority: P3)

**Goal**: Permanent account deletion, only through explicit two-step confirmation
(type the account email), server-enforced, cascading the acting user's data only.

**Independent Test**: Delete control is red-flagged and only lives in the Danger Zone;
deletion blocked until the typed email exactly matches the account; after confirm, workouts,
nutrition, notifications and settings + user doc are gone, the session is cleared, redirect to
`/login`, and a second user's data is untouched.

### Implementation for User Story 3

- [x] T038 [P] [US3] Add `deleteAccountSchema` to `backend/src/utils/validators.js`: `{ email: z.string().trim().toLowerCase().email() }`, `.strict()`
- [x] T039 [US3] Add `deleteAccount(userId, email)` to `backend/src/services/authService.js` (depends on T038): load user, `401` if missing; reject with `403 CONFIRMATION_MISMATCH` when `email` ≠ user.email; then owner-scoped cascade `deleteMany({ owner: userId })` on `Notification`, `NotificationSettings`, `Workout`, `Nutrition` (db order), finally `User.findByIdAndDelete(userId)` (data-model.md ownership table)
- [x] T040 [US3] Add `deleteAccountHandler` to `backend/src/controllers/auth.js` (depends on T039): on success `res.clearCookie(COOKIE_NAME, { sameSite: 'lax' })` then `success(res, {})`
- [x] T041 [US3] Register `authRouter.delete('/account', authenticate, validate(deleteAccountSchema), deleteAccountHandler)` in `backend/src/routes/auth.js` (depends on T040)
- [x] T042 [P] [US3] Add `deleteAccount({ email })` to `frontend/src/services/api.js` (DELETE `/api/auth/account` with JSON body)
- [x] T043 [P] [US3] Create `frontend/src/components/settings/DeleteAccountModal.jsx`: two-step destructive modal (explain consequences → type email → final confirm), confirm disabled until exact match, error-token styling, focus trap, `aria-live` announcements, reduced-motion respected
- [x] T044 [US3] Add the Danger Zone section to `frontend/src/pages/Settings.jsx` (depends on T042, T043): red-flag control distinct from all others triggering DeleteAccountModal; on success clear auth context + redirect to `/login`
- [x] T045 [US3] Backend gate + cross-user check: `node --check` changed files, then verify deletion with a second logged-in user unaffected (owner-scoped queries per Principle VII; live two-user check recorded in the DoD manual pass, T049)

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual/UX consistency, cross-app preference correctness, and final verification.

- [x] T046 Verify the Settings page has no large side gaps — same content max-width tightness as Dashboard; adjust spacing in `frontend/src/pages/Settings.jsx` (4px scale; no widened containers)
- [x] T047 Grep for any missed ` kg`/`kg` weight literals across `frontend/src/pages/`, `frontend/src/components/` and re-route through `formatWeight` (progress/analytics/history/dashboard weight sites per ST1)
- [x] T048 Theme + responsive pass: light theme contrast audit, mobile sidebar draw, no horizontal scroll at 3 breakpoints, reduced-motion respected (D8/A9, DoD 11) — code-level (token overrides, global reduced-motion, DashboardLayout draw); visual confirmation recorded in the DoD manual pass (T049)
- [ ] T049 Manual browser pass per Day 7.1 DoD 10: preference persistence across reload, theme switch, unit switch, password change, logout, delete-account confirm flow, empty/error states, prior-day regression (workouts/nutrition/notifications) — REQUIRES running app + real user session
- [x] T050 Full quality gates: `npm run build` (frontend `vite build`) + `node --check`/import smoke across all new/changed backend + frontend modules
- [ ] T051 If implementation diverged from plan: update `specs/010-settings-page/` design docs (plan.md/research.md/data-model.md/contracts/quickstart.md); write the implementation PHR; refresh AGENTS.md via `update-agent-context.ps1 -AgentType opencode`; propose a commit for `010-settings-page`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — runs first.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (no page without it).
- **User Stories (Phase 3+ / US1→US2→US3)**: Depends on Foundational completion.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. No dependencies on other stories.
- **User Story 2 (P2)**: Starts after Foundational. Uses Settings `SettingsSections` shell
  only; shares no US1 code (Notifications section uses `NotificationsContext`, not
  `SettingsContext`). Independently testable.
- **User Story 3 (P3)**: Starts after Foundational. Uses the Settings shell only.
  Independently testable.

### Within Each User Story

- Backend model → validator → service → controller → route → build gate
- Frontend API client → context/component → page wiring → build gate
- Story complete (build green + manual check) before moving to the next priority

### Parallel Opportunities

- Phase 1: T002 can run alongside T001.
- Phase 2: T004 runs parallel to T003/T007; T007 parallel to T003.
- US1 backend: T009 + T010 in parallel; frontend: T015 + T018 + T020 + T023 + T024 + T025
  all in parallel after the page shell exists.
- US2: T027 + T029 + T030 + T035 in parallel.
- US3: T038 + T042 + T043 in parallel.
- After Foundational completes, US1/US2/US3 can be worked by different people in parallel.

---

## Parallel Example: User Story 1

```text
# Launch the independent US1 backend tasks together:
Task: "T009 Add preferences subdocument to backend/src/models/User.js"
Task: "T010 Add preferencesPatchSchema to backend/src/utils/validators.js"

# Launch the independent US1 frontend tasks together:
Task: "T015 Add getPreferences/updatePreferences to frontend/src/services/api.js"
Task: "T018 Create frontend/src/utils/units.js (formatWeight)"
Task: "T020 Create shared frontend/src/components/profile/ProfileForm.jsx"
Task: "T023 Apply formatWeight in ExerciseRow/PersonalRecords/WeightTracker/WeightChart"
Task: "T024 Apply formatWeight in Dashboard + analyticsUtils"
Task: "T025 Add [data-theme=light] token overrides in frontend/src/index.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational).
2. Complete Phase 3 (US1): profile, units, theme persist/apply app-wide.
3. **STOP and VALIDATE**: US1 independently (see Independent Test above), run T014/T026 gates.
4. Demo/deploy if ready — Foundation + US1 is a viable increment.

### Incremental Delivery

1. Setup + Foundational → Settings page with section shells (nav highlight, tight layout).
2. Add US1 → profile/units/theme → validate → (MVP deliverable).
3. Add US2 → notifications/password/logout → validate independently.
4. Add US3 → delete account → validate independently.
5. Polish → full visual/UX/regression pass.

### Parallel Team Strategy

- Developer A: Foundational → US1 (theme + units + profile).
- Developer B (after Foundational): US2 (notifications + password + logout).
- Developer C (after Foundational): US3 (delete account).
- Shared shell (`Settings.jsx`, `SettingsSections.jsx`, Sidebar) owned by Phase 2 so the three
  stories never edit the same files concurrently.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to spec user story for traceability.
- Each user story is independently completable and testable (see Independent Test per phase).
- No automated test tasks: repo has no test framework; verification is `node --check` +
  `vite build` + the recorded manual pass (Day 7.1 DoD 9/10).
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.
- Commit after each task or logical group; propose a single feature commit at the end.