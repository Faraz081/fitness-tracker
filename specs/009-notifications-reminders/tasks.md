# Tasks: Notifications & Reminders (Day 6.1)

**Input**: Design documents from `specs/009-notifications-reminders/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)

**Note**: Rev 2 — tasks rewritten for the approved backend-persistence architecture (Amendment 2026-09-09, constitution v3.5.1). The original frontend-only/localStorage task list (useLocalStorage, notificationsData seeds, `notificationsState` key, onWorkoutLogged) was superseded and is not tracked here.

**Organization**: Tasks are grouped by user story; all backend module tasks are the shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (center/list), US2 (events), US3 (reminders)
- Paths: web app → `backend/src/`, `frontend/src/`.

---

## Phase 1: Setup & Foundation — Backend Module (Shared)

**Purpose**: Auth-scoped notifications API + data model that every story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `backend/src/models/Notification.js` — owner-scoped schema (type enum from `NOTIFICATION_TYPES`, title/body/entityId/eventKey/read, `timestamps`), unique `{ owner, eventKey }` index + `{ owner, read, createdAt: -1 }` index, where-query helpers (`markRead`, `deleteOne`, `updateAllRead`, `deleteAll`), `toJSON` virtuals projection; re-export `NOTIFICATION_TYPES`.
- [X] T002 [P] Create `backend/src/models/NotificationSettings.js` — non-`_id` schema; `owner` unique ref; `muted` default false; `types` Map-of-Boolean default `() => ({})`; `toSettings` helper.
- [X] T003 [P] Extend `backend/src/utils/validators.js` with `notificationSettingsPatchSchema` (`.strict()`, `muted` boolean, `types` record of booleans) + `notificationSyncSchema` (`.strict()`, `goals` optional array of `goalSchema`), reusing `goalSchema`/`goalMilestoneSchema` shapes.
- [X] T004 Add migration/indices note: `Notification.init()` / `NotificationSettings.init()` auto-ensure indexes on boot; no separate migration framework exists.
- [X] T005 Create `backend/src/services/notificationService.js` — `ensureNotification` (settings gate + `eventKey` build + E11000 dedup → doc or null), `listNotifications` (newest-first, optional unread filter), `listSettings`, `updateSettings` (muted/type deep merge + owner upsert), `markRead`, `readAll`, `remove`, `clearAll`, `syncReminders(ownerId, now, { workouts, nutrition, goals })` (workout/meal/goal reminder guards + goal progress/completed events from posted goals).
- [X] T006 Pin `createdAt` for event drills: `ensureNotification` accepts explicit `createdAt` (used by sync for meal-reminder window simulation during verification).
- [X] T007 Create `backend/src/controllers/notification.js` — thin handlers calling the service (`success(res, data[, 201])`, AppError passthrough) wired to `notificationRouter` routes: GET list, GET/PATCH settings, POST sync, POST read-all, PATCH/:id, DELETE/:id, DELETE all.
- [X] T008 Create `backend/src/routes/notification.js` — `Router()` + `.use(authenticate)`; all handlers scoped to `req.userId`; default export `notificationRouter`.
- [X] T009 Mount `app.use('/api/notifications', notificationRouter)` in `backend/src/app.js` after the nutrition routes.
- [X] T010 Edit `backend/src/controllers/workout.js` — after successful workout create, guarded `notificationService.createWorkoutCompletion(req.userId, workout)` (try/catch; failure never fails the workout response).
- [X] T011 Smoke-test backend module: `node --check` each new file + `import('./src/app.js')` + `import('./src/services/notificationService.js')` resolve.

**Checkpoint**: All `/api/notifications` endpoints live, auth-scoped, and resolvable. User story work can begin.

---

## Phase 2: User Story 1 — Notification Center (P1) 🎯 MVP

**Goal**: View notifications with read/unread state, per-item and bulk actions, unread badge, living in `DashboardLayout` (Pattern A).

**Independent Test**: Logged-in → `/notifications` shows API-sourced list; sidebar `Bell` shows unread badge; mark-read / mark-all / dismiss / clear-all visibly update and persist.

- [X] T012 [US1] Append `SIDEBAR_MENU` entry `{ key: 'notifications', label: 'Notifications', path: '/notifications' }` + add `menuIcons.notifications = Bell`; add `NOTIFICATION_TYPES` (6 labels + keys) to `frontend/src/data/constants.js` (append-only, icon names only — imported inline in components).
- [X] T013 [US1] Add API methods to `frontend/src/services/api.js` — `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification`, `clearNotifications`, `getNotificationSettings`, `updateNotificationSettings`, `syncNotifications`.
- [X] T014 [US1] Create `frontend/src/utils/notificationsUtils.js` — pure view helpers `sortNewestFirst`, `unreadCount`, `badgeLabel` (99+ cap), `formatRelativeTime`.
- [X] T015 [US1] Create `frontend/src/context/NotificationsContext.jsx` — provider fetches list + settings on auth; `syncNotifications(goalsData.goals)`; actions (refresh, markRead, markAllRead, remove, clearAll, toggleType, setMuted, getSettings) update state from server responses; toasts fire only for ids unseen in the previous fetch; owns `useToast` + global `<ToastContainer/>`; `useNotifications()` hook (throws outside provider).
- [X] T016 [US1] Wrap in `frontend/src/main.jsx` — `AuthProvider > NotificationsProvider > App`.
- [X] T017 [US1] Edit `frontend/src/components/Layout.jsx` — remove its `useToast`/`ToastContainer` (provider-owned now; prevents double toasts).
- [X] T018 [US1] Edit `frontend/src/components/layout/Sidebar.jsx` — unread-count badge next to the `Notifications` label (accent pill, capped `99+`, aria-label, hidden at 0).
- [X] T019 [US1] Add Pattern A route in `frontend/src/App.jsx` — `element={<ProtectedRoute><Notifications /></ProtectedRoute>}`.
- [X] T020 [US1] Create `frontend/src/pages/Notifications.jsx` — returns `<DashboardLayout><NotificationsPage/></DashboardLayout>`.
- [X] T021 [US1] Create `frontend/src/components/notifications/NotificationItem.jsx` — type icon + chip, relative time, unread dot (aria-label), per-item Mark read + Dismiss (`Trash2`); dark `--color-*` tokens.
- [X] T022 [US1] Create `frontend/src/components/notifications/NotificationList.jsx` — renders items (newest-first) or shared `ui/EmptyState` ("No notifications yet" / "You're all caught up").
- [X] T023 [US1] Create `frontend/src/components/notifications/NotificationsPage.jsx` — loading (`Spinner`/`ListSkeleton`), error state with retry, All/Unread filter tabs, Mark all as read, Clear all, settings toggle gear; delegates to `NotificationSettings`.
- [X] T024 [US1] Create `frontend/src/components/notifications/NotificationSettings.jsx` — inline panel: 6 per-type label+checkbox rows (accent styling) + Mute-all switch with real `<label>`/`aria-label`, disabled rows while muted; calls `onChangeType` / `onToggleMute`.

**Checkpoint**: US1 demonstrable — center, badge, actions, settings panel all work against the API.

---

## Phase 3: User Story 2 — Event-Driven Notifications (P2)

**Goal**: Notifications created by real events — workout completion (server) and goal progress/completed (synced from `goalsData`).

**Independent Test**: Log a workout → completion notification + toast appears without reload; a completed goal yields a goal-completed (and progress) notification; settings-suppressed types never appear; reload persists.

- [X] T025 [US2] Server: `createWorkoutCompletion(owner, workout)` in `notificationService.js` (title/body from workout, `eventKey = workout-completion:<id>:<YYYY-MM-DD>`, respects settings, dedup'd) — implemented in T005.
- [X] T026 [US2] Server: workout-create hook in `controllers/workout.js` (guarded) — implemented in T010.
- [X] T027 [US2] Server: goal-progress / goal-completed creation from posted `goals` in `syncReminders` (progress for milestones `reachedAt` in last 7 days; completed for `completedAt` set) — implemented in T005.
- [X] T028 [US2] Frontend: provider on-mount sequence does `getSettings` + `listNotifications` + `syncNotifications(goalsData.goals)` + fresh `listNotifications` (batched), so goal events appear at load — implemented in T015.
- [X] T029 [US2] `frontend/src/pages/WorkoutForm.jsx` — after create success (not edit) call `notifications.refresh()` guarded in try/catch so notification failures never block navigation.

**Checkpoint**: US1 + US2 both work; events flow server-side and toast-newly-appeared items.

---

## Phase 4: User Story 3 — Reminders (P3)

**Goal**: Same-day reminders with relevance guards + dedup; settings respected at creation.

**Independent Test**: Active user with no workout today after 17:00 gets a workout reminder once; meal window open + category unlogged → meal reminder (once); active goal within 3 days of target → goal reminder; identical sync never duplicates; disabled types return `created: []`.

- [X] T030 [US3] Server: workout-reminder guard in `syncReminders` — ≥1 workout in prior 7 days AND none today AND local hour ≥ 17 → `workout-reminder` — in T005.
- [X] T031 [US3] Server: meal-reminder guard — `MEAL_WINDOWS` (07-11/12-15/18-23 local) + no `nutrition` entry of that category today → per-window `meal-reminder` — in T005.
- [X] T032 [US3] Server: goal-reminder guard — active goal, `targetDate` within `GOAL_REMINDER_DAYS` (3) → reminder with `daysLeft` in title — in T005.
- [X] T033 [US3] Verify dedup: unique `(owner, eventKey)` means second sync same day returns `created: []`; `unreadFilter` used by the client for the Unread tab.
- [X] T034 [US3] Frontend: `?unread=1` support in `listNotifications` used by the Unread tab filter (provider re-fetch per tab in NotificationsPage).

**Checkpoint**: All three stories independently functional; reminders are relevance-guarded and dedup'd.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T035 Run `npm run build` in `frontend/` (Vite) — zero errors.
- [X] T036 Run `node --check` on all new/changed backend files + import smoke — zero errors.
- [X] T037 Update design docs to backend architecture: plan.md, research.md, data-model.md, contracts/notification-contract.md, quickstart.md (Rev headers).
- [X] T038 Re-run `update-agent-context.ps1 -AgentType opencode` (AGENTS.md reflects MongoDB notifications + API; no localStorage).
- [X] T039 A11y/responsive pass: keyboard-only through list → filters → settings; real labels on checks; unread dot aria-label; no horizontal scroll at 1280/768/<640.
- [X] T040 Final regression: `/`, `/progress`, `/analytics`, `/goals`, `/workouts`, `/nutrition`, `/profile`, `/login` render with no double toasts.
- [X] T041 Write implementation prompt history record (PHR) for `/sp.implement`.

---

## Dependencies & Execution Order

- **Setup/Foundation (Phase 1)**: backend module — blocks every story.
- **US1 (P1)**: follows foundation; delivers the center + settings MVP.
- **US2 (P2)**: adds event sourcing on top of the foundation + US1 surfaces.
- **US3 (P3)**: reminder generation entirely in the foundation service; needs US1 to be seen.
- **Polish**: after all stories; build + smoke + docs + PHR.
- Parallel: T001/T002/T003 (independent files, same phase).

## Notes

- No tests in this repo; verification per T035–T036 and quickstart.md manual checklist.
- Commit after each logical group as the workflow requests.