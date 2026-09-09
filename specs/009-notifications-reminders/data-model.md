# Data Model — Notifications & Reminders (Phase 1)

**Feature**: `009-notifications-and-reminders` | **Branch**: `009-notifications-reminders` | **Date**: 2026-09-09 | **Rev**: backend persistence (Amendment 2026-09-09)

Backend-persisted data model. Notifications and settings live in MongoDB (Mongoose 9, two new collections) and are owner-scoped to the authenticated user — no localStorage for this feature (N9's localStorage exception is superseded by the approved Amendment).

## Entities

### 1. Notification — `backend/src/models/Notification.js`

Mongoose schema, collection `notifications`.

| Field | Type | Mongoose constraint | Description |
|-------|------|---------------------|-------------|
| `owner` | ObjectId → `users` | ref `User`, required | The user this notification belongs to (auth-scoping; `req.userId`) |
| `type` | String | enum `NOTIFICATION_TYPES` keys, required | `workout-completion` · `goal-progress` · `goal-completed` · `workout-reminder` · `meal-reminder` · `goal-reminder` |
| `title` | String | trim, required, maxlength 80 | Short heading (1–80 chars) |
| `body` | String | trim, default `''`, maxlength 300 | Detail text |
| `entityId` | String | trim, default `''` | Source id (workout id, goal id, meal category, `reminder`); used in `eventKey` |
| `eventKey` | String | required, lowercase | Dedup key: `"${type}:${entityId}:${YYYY-MM-DD}"` |
| `read` | Boolean | default `false` | Read/unread |

Indexes: unique compound `{ owner: 1, eventKey: 1 }` (lightly populated `notification_eventKey_owner`), plus `{ owner: 1, read: 1, createdAt: -1 }` for list queries. `timestamps: true`. Query helpers `markRead(to, id)`, `deleteOne(id)`, `updateAllRead(owner)`, `deleteAll(owner)` after `virtuals: true` projection.

Dedup contract: same owner cannot hold two notifications with the same `eventKey`; the service catches duplicate-key (`E11000`) and treats it as "already exists" (`null`). `eventKey` is the client-visible idempotency token.

### 2. NotificationSettings — `backend/src/models/NotificationSettings.js`

Mongoose schema (minus default `_id`), collection `notificationsettings`.

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `owner` | ObjectId → `users` | ref `User`, required, **unique** | One settings doc per user |
| `muted` | Boolean | default `false` | Mute-all flag (list/badge still show; toasts suppressed is a client concern) |
| `types` | subdoc | `type: { type: Map, of: Boolean }, default: () => ({})` | Per-type toggles; missing key = enabled |

Contract: a type is **enabled** unless `types.get(type) === false` (default `true`). The service computes `isEnabled(type) = !muted && settings.types.get(type) !== false` and will not create a notification while disabled (settings respected at creation).

### 3. UnreadCount (derived, front-end)
`notifications.filter(n => !n.read).length`; `badgeLabel(count)` = `count > 99 ? '99+' : count`. Server list endpoint supports `?unread=1`.

### 4. Dedup (server-side, no client seenKeys/dismissedKeys)
Uniqueness enforced by the `(owner, eventKey)` index; reminder creation is computed for "today" so a second sync the same day returns `created: []` because the same `eventKey`s already exist.

## Constants

- `NOTIFICATION_TYPES` in `frontend/src/data/constants.js` (6 entries, labels + keys).
- Backend derives the enum from `NOTIFICATION_TYPES.map(t => t.key)` (imported from the Notification model re-export) — single source of truth, mirrors the `WORKOUT_CATEGORIES` pattern.
- Meal windows + goal-reminder horizon live in `backend/src/services/notificationService.js` as constants (`MEAL_WINDOWS` breakfast 07:00–11:00 / lunch 12:00–15:00 / dinner 18:00–23:00; `GOAL_REMINDER_DAYS = 3`; workout reminder local-hour threshold ≥ 17).

## Signal path (server-side creation)

```
createWorkoutCompletion(req.userId, workout)      → workout create route (guarded, never fails workout)
syncReminders(ownerId, now, { workouts, nutrition, goals })  → POST /api/notifications/sync
```

- **Workout completion**: created in `controllers/workout.js` after a successful workout create (guard: from the workout's date/moment; if duplicate → caught silently).
- **Workout reminder**: ≥1 workout in prior 7 days AND none today AND local hour ≥ 17 → `workout-reminder`.
- **Meal reminder**: local time within a window AND no nutrition entry of that meal type today → `meal-reminder` (per window; skip premium, auto-window actually now per-window `now getHours()` — windows are checked by local hour against `start/end` ranges).
- **Goal reminder**: goal `targetDate` within `GOAL_REMINDER_DAYS` of today, not completed → `goal-reminder`.
- **Goal progress / completed**: derived client-side from `goalsData` (goals have no backend) and posted via `sync` body `{ goals }`, then created server-side with `ensureNotification`.

All creation passes through `ensureNotification(owner, { type, title, body, entityId, createdAt })` which: applies settings gate → builds `eventKey = ${type}:${entityId}:${ymd(date)}` → inserts (E11000 → `null`) → returns the doc or `null`.

## Frontend data flow (NotificationsProvider)

- Mount (after auth): `listNotifications()` + `getNotificationSettings()`; then `syncNotifications(goalsData.goals)` (bulk `syncReminders` on the server) and `listNotifications()` again in one batched pass; toasts fire only for ids unseen in the previous fetch (no toast storm on load).
- Actions → API: `markRead(id)` PATCH, `markAllRead()` POST read-all, `dismiss(id)` DELETE, `clearAll()` DELETE all, `toggleType(key)` PATCH settings, `setMuted(bool)` PATCH settings. Every action updates local state from the server response.

## Persistence contract

- Collections `notifications` + `notificationsettings`, owner-scoped, no reference collisions across users (all queries filter `owner: req.userId`).
- No localStorage key is read or written for this feature. (The `notificationsState` key was never shipped.)
- Hydration = fetch from `/api/notifications`; there is no local cache layer.