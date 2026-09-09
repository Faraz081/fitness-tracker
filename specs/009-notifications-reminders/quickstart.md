# Quickstart — Notifications & Reminders (Day 6.1)

**Branch**: `009-notifications-reminders` | **Date**: 2026-09-09 | **Rev**: backend persistence (Amendment 2026-09-09)
Feature on top of the existing Fitness Tracker MERN stack. Notifications persist
in MongoDB (owner-scoped); no env / new-dependency changes.

## Prereqs

- Node.js 24 LTS, workspaces at repo root (`backend/`, `frontend/`).
- MongoDB Atlas reachable (existing) — required, since notifications, workouts,
  and nutrition all read from the live API.

## Running the app

```bash
# from repo root
npm install        # already done on this branch; only needed first time
npm run dev        # workspace script — concurrent backend + frontend
```

## What this feature adds (map)

| File | Role | New? |
|---|---|---|
| `backend/src/models/Notification.js` | owner-scoped doc; unique `(owner, eventKey)` | new |
| `backend/src/models/NotificationSettings.js` | one per owner; muted + per-type booleans | new |
| `backend/src/services/notificationService.js` | CRUD, settings gate, `ensureNotification` (dedup), `syncReminders` (real data) | new |
| `backend/src/controllers/notification.js` | `/api/notifications` handlers | new |
| `backend/src/routes/notification.js` | router (auth-scoped; mounted in `app.js`) | new |
| `backend/src/utils/validators.js` | `notificationSettingsPatchSchema`, `notificationSyncSchema` | edit |
| `backend/src/controllers/workout.js` | guarded workout-completion creation | edit |
| `frontend/src/services/api.js` | list/read/readAll/delete/clear/settings/sync methods | edit |
| `frontend/src/context/NotificationsContext.jsx` | provider + `useNotifications()`; owns global `ToastContainer` | new |
| `frontend/src/utils/notificationsUtils.js` | view helpers: sort, unreadCount, badgeLabel, formatRelativeTime | new |
| `frontend/src/data/constants.js` | append `SIDEBAR_MENU` entry + `NOTIFICATION_TYPES` | edit (append-only) |
| `frontend/src/components/notifications/NotificationsPage.jsx` | page body: toolbar, filter tabs, settings toggle | new |
| `frontend/src/components/notifications/NotificationList.jsx` | list / empty state (`ui/EmptyState`) | new |
| `frontend/src/components/notifications/NotificationItem.jsx` | single item (icon, chip, time, unread dot, dismiss) | new |
| `frontend/src/components/notifications/NotificationSettings.jsx` | inline 6-type panel + mute-all (real labels/checks) | new |
| `frontend/src/pages/Notifications.jsx` | Pattern A page → `DashboardLayout` | new |
| `frontend/src/components/layout/Sidebar.jsx` | `menuIcons` + unread badge (99+ cap) | edit |
| `frontend/src/App.jsx` | additive `/notifications` route | edit (add-only) |
| `frontend/src/main.jsx` | wrap `AuthProvider > NotificationsProvider > App` | edit |
| `frontend/src/components/Layout.jsx` | remove its `ToastContainer` (moved to provider) | edit |
| `frontend/src/pages/WorkoutForm.jsx` | after create success → guarded `notifications.refresh()` | edit |

## Manual verification checklist

1. `backend`: `npm run boot-check`-style smoke (`node --check` on each new file;
   `import('./src/app.js')` resolves). `frontend`: `npm run build` clean.
   No `.ts`/`.tsx` anywhere new.
2. `/notifications` (logged in): list shows workout completions, goal events,
   and today's due reminders from real data; unread items have dots; an empty
   user sees one `EmptyState` "No notifications yet" + action.
3. Badge: sidebar shows `N` on `Bell`; Mark all as read → badge disappears;
   dismiss all → badge/empty list; reload keeps state (data survives in MongoDB,
   no `notificationsState` or any localStorage key is used).
4. Settings: toggle "Workout reminder" off → that type never appears (server
   stops creating it at sync) and no toast fires; Mute all → no toasts anywhere;
   reload persists (settings doc in MongoDB).
5. Live trigger: `/workouts/new`, fill minimal, submit → success navigation plus
   a workout-completion notification + toast; re-adding the same workout the same
   day does NOT duplicate (unique `(owner, eventKey)`).
6. Reminders respect relevance: meal reminder only inside the meal window and
   only when that category isn't logged today; workout reminder only after 17:00
   for an active user with no workout today; goal reminder only for an active
   goal within 3 days of its target; no toast storm on page load.
7. A11y/responsive: keyboard-only through list → filters → settings toggles;
   checks have real labels; unread dot has `aria-label`; 1280/768/<640 no
   horizontal scroll.
8. Auth scoping: a second user's `/notifications` shows only their data; the
   first user's notifications stay unread/unchanged.
9. Regression: `/`, `/progress`, `/analytics`, `/goals`, `/workouts`,
   `/nutrition`, `/profile`, `/login` all render with no double toasts.

## Artifacts

- `specs/009-notifications-reminders/spec.md` — ratified spec (26 FRs).
- `specs/009-notifications-reminders/plan.md` — implementation plan (+ gates).
- `specs/009-notifications-reminders/research.md` — phase decisions.
- `specs/009-notifications-reminders/data-model.md` — entities + persistence.
- `specs/009-notifications-reminders/contracts/notification-contract.md` —
  REST API + provider/util contract.
- `specs/009-notifications-reminders/checklists/requirements.md` — 16/16 spec gates.
- `history/prompts/009-notifications-reminders/` — SPEC + PLAN + TASKS + implementation prompt records.