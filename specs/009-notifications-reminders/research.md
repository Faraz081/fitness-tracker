# Research — Notifications & Reminders (Phase 0)

**Feature**: `009-notifications-and-reminders` | **Branch**: `009-notifications-reminders` | **Date**: 2026-09-09 | **Rev**: backend persistence (Amendment 2026-09-09)
**Scope**: Research to fix Technical Context, identify integration points, and settle derivation/persistence/UX decisions *before* data modeling. Supersedes the earlier frontend-only research where noted.

## Questions Investigated

### 1. Navigation & routing
- `App.jsx` has two patterns. **Pattern A** (standalone pages): `/`, `/progress`, `/analytics`, `/goals` → `element={<ProtectedRoute><Page/></ProtectedRoute>}`, page wraps content in `DashboardLayout`. **Pattern B**: auth-adjacent + data pages (`/workouts*`, `/nutrition`, `/profile`, login/register) → `<Route element={<Layout/>}>` with `<Outlet/>`.
- **Decision**: Notifications follows Pattern A — top-level `element={<ProtectedRoute><Notifications /></ProtectedRoute>}`, page returns `<DashboardLayout><NotificationsPage/></DashboardLayout>`. Satisfies "renders inside the existing DashboardLayout" (N5).
- `Sidebar.jsx` (rendered by both `DashboardLayout` and `Layout` so the badge appears app-wide) is data-driven via `SIDEBAR_MENU` in `data/constants.js` (lines 10–19) + a `menuIcons` map (line 6).
- **Decision**: Append `{ key: 'notifications', label: 'Notifications', path: '/notifications' }` to `SIDEBAR_MENU`, add `notifications: Bell` to `menuIcons`. Badge: `Sidebar` reads `unreadCount` from `useNotifications()` and renders a `Badge` (cap at `99+`) next to the label when `> 0`. Additive only (N10).

### 2. State architecture
- `main.jsx` mounts `AuthProvider > App`. `AuthProvider` is the existing global-context pattern; pages consume via `hooks/useAuth`. Backend route pattern: `routes/workout.js` uses `Router().use(authenticate)`, controllers call services and `success(res, data, 201)`, services throw `AppError`.
- **Decision**: New `NotificationsProvider` mounted in `main.jsx` inside `AuthProvider` (wrap `<App/>`). Consumer hook: `useNotifications()` in `context/NotificationsContext.jsx`. Provider fetches list + settings from the API, syncs reminders, and pushes toasts for new items.
- **Decision (backend)**: Mirror the workout module — `models/Notification.js` + `NotificationSettings.js`, `services/notificationService.js`, `controllers/notification.js`, `routes/notification.js` mounted at `/api/notifications` in `app.js`. `authenticate` sets `req.userId` (JWT `sub`).

### 3. Persistence
- **Approved Amendment 2026-09-09 (constitution v3.5.1)**: persistence is MongoDB, not localStorage. Two new owner-scoped collections; user A can never read user B's notifications. The Day 6.1 frontend-only/N9 localStorage clauses are superseded for this feature explicitly.
- **Decision**: No `useLocalStorage`, no `notificationsState` key. Server persists `Notification` + `NotificationSettings`; the client holds only in-memory React state.
- Dedup: unique Mongo compound index `{ owner, eventKey }`; E11000 → treated as already-created (null). Idempotent syncs return `created: []` on the same day.

### 4. Toast pattern
- `useToast` (hooks) + `ToastContainer` (ui) exist; `ToastContainer` is mounted **only** in `Layout.jsx`. Pattern A pages (`Dashboard`, `Goals`, `Analytics`, `Progress`) and the new Notifications page have **no** toast container.
- **Decision**: `NotificationsProvider` owns a single `useToast` instance and renders `<ToastContainer/>` once, app-wide. Remove the duplicates from `Layout.jsx`. Justified in Complexity Tracking (plan.md) — prevents double containers and makes toasts available on all pages.

### 5. Derivation model (real-data event sourcing)
- Workout history: **live API** (`api.createWorkout` … `api.listWorkouts`). Completed workouts exist in `workouts` collection.
- Nutrition: **live API** (`listNutrition`, `createNutrition` …) — `nutrition` collection with `category` (meal type). Works in `003-nutrition-tracking`.
- Goals: static mock (`data/goalsData.js`) — no goals backend; completed goals carry `completedAt`, active goals `targetDate`.
- **Decision**: event sourcing lives **server-side**. `workout-completion` is created in the workout create path (guarded; never fails the workout). `syncReminders` at `POST /api/notifications/sync` derives today's due *reminders* from real collections — workout-reminder (habit: ≥1 workout in prior 7 days AND none today, hour ≥ 17), meal-reminder (window open AND no nutrition entry of that category today). Goal events (progress/completed/reminder) derive from `goalsData` (posted as `{ goals }`) because goals have no backend — deliberate and consistent with every goal UI.
- All creation passes `ensureNotification` which enforces the settings gate and `(owner, eventKey)` dedup, so nothing is mocked or seeded.

### 6. Reminder relevance & time rules
- Workout reminder: ≥1 workout in the prior 7 days AND none today AND local hour ≥ 17 (end-of-day nudge).
- Meal reminder: now within a window (`breakfast 07:00–11:00`, `lunch 12:00–15:00`, `dinner 18:00–23:00`, local hours) AND no `nutrition` entry of that category today.
- Goal reminder: active goal with `targetDate` within `GOAL_REMINDER_DAYS` (3 days), not completed → reminder with `daysLeft`.
- Goal progress: any goal milestone with `reachedAt` in the last 7 days (not completed) → progress event; completed goal (`completedAt`) → completed event.
- Same-day dedup via `eventKey = type:entityId:YYYY-MM-DD` enforced by the unique index.

### 7. Settings & UX
- Spec Assumption: settings = inline panel on the Notifications page. **Decision**: toggleable section (gear button) containing 6 per-type switches + Mute all; real `<label>` + `<input type="checkbox">` styled with dark tokens (`--color-*`), respecting existing a11y. PATCHed to `/settings`; enforced server-side at creation (disabled types are never created) and reflected instantly in the UI.
- Sporty/dark: uses `glass-elevated`, `--color-accent`, `dash-num` heading tokens already present in the app.

### 8. Components & files (constitution-mandated structure)
- `components/notifications/`: `NotificationsPage.jsx`, `NotificationList.jsx`, `NotificationItem.jsx`, `NotificationSettings.jsx`; empty/unread-empty states reuse shared `ui/EmptyState` (icon/title/message/action props confirmed).
- `utils/notificationsUtils.js`: pure view helpers only — `sortNewestFirst`, `unreadCount`, `badgeLabel`, `formatRelativeTime` (event generation moved to the server).
- `context/NotificationsContext.jsx`: API-backed provider with `refresh`, optimistic-ish actions (server returns canonical doc), known-ids toast diffing.

### 9. Icons & motion
- lucide-react already installed: `Bell`, `BellRing`, `BellOff`, `CheckCheck`, `Trash2`. framer-motion available for list transitions (reuse existing animation conventions if used at all; keep minimal).

## Open Items
None requiring user clarification — persistence choice confirmed by the user (full backend persistence) as part of `/sp.implement`.

## Decisions Locked
| Decision | Choice |
|----------|--------|
| Route pattern | Pattern A — top-level route + `DashboardLayout` |
| Nav | Additive `SIDEBAR_MENU` entry + `Bell` map + unread badge (99+ cap) |
| State | `NotificationsProvider` in `main.jsx`; `useNotifications()` hook |
| Persistence | MongoDB (models + `/api/notifications`); **no** localStorage |
| Toasts | Provider-owned `useToast` + `ToastContainer`; removed from `Layout.jsx` |
| Derivation | Server event sourcing — workout create path + sync (workouts/nutrition/goals) |
| Reminders | Real data + relevance guards; `GOAL_REMINDER_DAYS = 3`, `MEAL_WINDOWS` |
| Dedup | Unique `(owner, eventKey)` index; E11000 → null |
| Settings | Inline panel; 6 toggles + mute-all; enforced at creation server-side |
| Icons | lucide-react only; no new deps/env |