# Contract — Notifications & Reminders Data (Phase 1)

**Feature**: `009-notifications-and-reminders` | **Branch**: `009-notifications-reminders` | **Date**: 2026-09-09 | **Rev**: backend persistence (Amendment 2026-09-09)

**Type**: REST API contract over `/api/notifications` (Express + Mongoose), owner-scoped via the `authenticate` middleware. The original frontend-only/localStorage contract was superseded by the approved Amendment (constitution v3.5.1).

## 1. API surface (all routes use `authenticate`; scoped to `req.userId`)

| Method | Path | Body/Query | Success | Notes |
|--------|------|------------|---------|-------|
| GET | `/api/notifications` | `?unread=1` optional | 200 `{ notifications: [...] }` | Newest-first; `unread=1` filters `read: false` |
| GET | `/api/notifications/settings` | – | 200 `{ settings: {...} }` | One doc per owner (upserted defaults) |
| PATCH | `/api/notifications/settings` | `{ muted?, types? }` (`notificationSettingsPatchSchema`) | 200 `{ settings: {...} }` | Partial update; `types` is a Map (deep key merge) |
| POST | `/api/notifications/sync` | `{ goals?: Goal[] }` (`notificationSyncSchema`) | 200 `{ created: [...], checked: 'workout|meal|goal' }` | Derives today's due reminders from real `workouts` + `nutrition` + posted goals; dedup'd |
| POST | `/api/notifications/read-all` | – | 200 `{ count }` | Marks every owner notification read |
| PATCH | `/api/notifications/:id` | – | 200 (notification) | Marks one read |
| DELETE | `/api/notifications/:id` | – | 200 `{ deleted: 1 }` | Idempotent |
| DELETE | `/api/notifications` | – | 200 `{ count }` | Clears all for owner (settings kept) |

Notification wire shape: `{ id, type, title, body, entityId, eventKey, read, createdAt }` (id + read returned via `virtuals: true` projection).

## 2. NotificationType enum

| key | label | created by |
|-----|-------|------------|
| `workout-completion` | Workout completion | workout create path (server, guarded) |
| `goal-progress` | Goal progress | `sync` from `goalsData` |
| `goal-completed` | Goal completed | `sync` from `goalsData` |
| `workout-reminder` | Workout reminder | `sync` (workout habit + local hour ≥ 17) |
| `meal-reminder` | Meal reminder | `sync` (window open + not logged today) |
| `goal-reminder` | Goal reminder | `sync` (active goal, targetDate within 3 days) |

## 3. Public API of `NotificationsProvider` (`useNotifications()`)

```js
{
  notifications, settings, loading, error,      // state (from API; no dismissal cache)
  unreadCount, badgeLabel,                      // derived
  refresh,                                      // () => void   // re-fetch list (non-silent)
  markRead,                                     // (id) => void
  markAllRead,                                  // () => void
  remove,                                       // (id) => void
  clearAll,                                     // () => void
  toggleType,                                   // (key) => void
  setMuted,                                     // (bool) => void
  getSettings,                                  // () => NotificationSettings (for WorkoutForm refresh)
}
```

Provider MUST render a single global `<ToastContainer/>` (owns `useToast`) so toasts are available on DashboardLayout pages. Toasts fire only for items whose ids were absent in the previous fetch (known-ids diff → no toast storm on load).

## 4. Component API contract

| Component | Props |
|-----------|-------|
| `NotificationsPage` | `{ notifications, settings, loading, error, markRead, markAllRead, remove, clearAll, toggleType, setMuted }` |
| `NotificationList` | `{ items, markRead, remove }` |
| `NotificationItem` | `{ notification, onRead, onDismiss }` |
| `NotificationSettings` | `{ settings, onChangeType, onToggleMute }` |

All new components follow existing conventions: named exports, `--color-*` tokens only, lucide-react icons, real labels/`aria-*`, framer-motion used sparingly if at all.

## 5. API helpers (`frontend/src/services/api.js`)

```js
listNotifications(unread?)   // GET /api/notifications
markNotificationRead(id)     // PATCH /:id
markAllNotificationsRead()   // POST /read-all
deleteNotification(id)       // DELETE /:id
clearNotifications()         // DELETE /
getNotificationSettings()    // GET /settings
updateNotificationSettings(v)// PATCH /settings  (v = { muted? | types? })
syncNotifications(goals)     // POST /sync     body { goals }
```

`utils/notificationsUtils.js` is reduced to pure view helpers: `sortNewestFirst`, `unreadCount`, `badgeLabel`, `formatRelativeTime` (server owns event generation and dedup).

## 6. Non-goals / out of contract
- No push / email / SMS / quiet hours / snooze / cross-device sync / websockets (spec Out of Scope).
- No localStorage for notifications; S5 filter persistence stays banned.
- No new npm dependencies or env vars; goals remain frontend `goalsData` only (no goals backend).