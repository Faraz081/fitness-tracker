# Implementation Plan: Notifications & Reminders

**Branch**: `009-notifications-reminders` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-notifications-reminders/spec.md`

## Summary

Build an in-app notification center (US1-P1), event-driven notifications + per-type settings (US2-P2), and reminders with relevance guards + same-day dedup (US3-P3). Notifications and settings persist in MongoDB via a new auth-scoped `/api/notifications` API (mirroring the workout route/service/controller pattern): a `NotificationsProvider` (mounted in `main.jsx`) loads from the API, and reminders are derived server-side from the real `workouts`/`nutrition` collections (goal events from the existing `goalsData` module). The feature surfaces through a new `/notifications` route rendered inside the existing `DashboardLayout` (Pattern A), an additive `Notifications` sidebar entry with an unread-count badge, an inline settings panel on the page, and toasts for live events. Server-side dedup via unique `(owner, eventKey)`; settings respected at creation. No new dependencies or env vars.

## Technical Context

**Language/Version**: JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2 — JS-only per Day 6.1 override (no TypeScript).
**Primary Dependencies**: None new. Reuses lucide-react (`Bell`, `BellRing`, `BellOff`, `CheckCheck`, `Trash2`), framer-motion (already bundled), existing ui primitives (`EmptyState`, `Badge`, `ToastContainer`), `useToast`, `useAuth`.
**Storage**: MongoDB Atlas (Mongoose 9) — new `notifications` + `notificationsettings` collections (owner-scoped; unique `(owner, eventKey)`), read via auth-scoped `/api/notifications` endpoints. No localStorage for this feature (Amendment 2026-09-09 replaces N9's narrow localStorage exception).
**Testing**: No automated suite in repo. Verification = `npm run build` (vite build) zero errors, `node --check`/import smoke on backend, manual dev-server checklist, grep scans (no `.ts`, no `localStorage` usage for notifications).
**Target Platform**: Modern browsers (Chrome/Edge/Firefox/Safari, latest), desktop-first responsive.
**Project Type**: Web app (React SPA frontend + Express/Mongoose backend). Backend gains the notifications module; other modules untouched.
**Performance Goals**: ≤50 items rendered instantly from provider state; generators are pure and run once per session; unread badge derived by memo; no layout thrash.
**Constraints**: JS-only; zero new npm deps; no backend/API/env/model changes; additive-only edits to `App.jsx` (add route, remove nothing); single localStorage key; dark-theme tokens only; existing files not moved/renamed.
**Scale/Scope**: Single user, single device, mock data (consistent with every prior frontend-only phase 1.1–5.1).

## Constitution Check

*GATE: Passes before Phase 0 research. Re-checked after Phase 1 design.*

| # | Gate (from constitution, Day 6.1 N1–N10 + core) | Status | Evidence |
|---|--------------------------------------------------|--------|----------|
| 1 | Frontend render layer for notifications; reminders sourced from real backend data | PASS | No mock seed data; reminders derive server-side from `workouts`/`nutrition`; goal events from existing `goalsData` (goals have no backend by design) |
| 2 | JavaScript only (`.js`/`.jsx`), no TypeScript | PASS | All planned files `.js`/`.jsx` |
| 3 | No new npm dependencies | PASS | Only lucide-react icons; new files are our own hooks/components/utils |
| 4 | No new env vars | PASS | None referenced |
| 5 | Route renders inside existing `DashboardLayout` | PASS | Pattern A: `<ProtectedRoute><Notifications/></ProtectedRoute>`; page wraps `DashboardLayout` |
| 6 | Additive nav entry (`Notifications`), no removals of prior nav | PASS | One append to `SIDEBAR_MENU` |
| 7 | Persistence via MongoDB, auth-scoped; users never see others' data | PASS | `Notification`/`NotificationSettings` models filtered by `owner`; every route behind `authenticate` |
| 8 | Idempotent creation; same-day/dedup enforced server-side | PASS | Unique `(owner, eventKey)` index; duplicate-key handled silently |
| 9 | Reuse existing toast/banner pattern | PASS | Uses existing `useToast` + `ToastContainer` (one justified relocation, see Complexity Tracking) |
| 10 | Structure matches existing conventions | PASS | Backend mirrors workout service/controller/routes; utils/context/component files per prior phases |
| 11 | Reminder relevance guards (habit/meal-window/active-goal) + settings respected | PASS | Server-side guards at creation; sync derives only due reminders |
| 12 | Respect attention: no toast storms on load | PASS | Toasts only for items new since last fetch (known-ids diff); badge/page show the rest |
| 13 | Amendment 2026-09-09 (approved): backend persistence + notifications API | PASS | Constitution v3.5.1 supersedes the frontend-only persistence clauses explicitly |
| 14 | No permanent mock data; feature connected to real app data | PASS | No seed/mock data files; event + reminder sources are real API data |

## Project Structure

### Documentation (this feature)

```text
specs/009-notifications-reminders/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── notification-contract.md   # data + component contract (no HTTP — frontend-only)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── models/
    │   ├── Notification.js            # NEW — owner-scoped; unique (owner, eventKey); NOTIFICATION_TYPES export
    │   └── NotificationSettings.js    # NEW — one per owner: muted + 6 per-type booleans
    ├── services/
    │   └── notificationService.js     # NEW — CRUD, settings, ensureNotification (dedup), syncReminders (real workouts/nutrition/goals)
    ├── controllers/
    │   └── notification.js            # NEW — handlers mirroring workout.js
    ├── routes/
    │   └── notification.js            # NEW — /api/notifications (auth-scoped)
    ├── utils/
    │   └── validators.js              # EDIT — notificationSettingsPatchSchema + notificationSyncSchema
    ├── controllers/
    │   └── workout.js                 # EDIT — create workout → guarded workout-completion notification
    └── app.js                         # EDIT — mount /api/notifications

frontend/
└── src/
    ├── pages/
    │   └── Notifications.jsx            # NEW — Pattern A page (DashboardLayout + <NotificationsPage/>)
    ├── components/
    │   ├── notifications/               # NEW folder (constitution-mandated)
    │   │   ├── NotificationsPage.jsx    # toolbar (tabs, mark-all, clear), settings toggle, states (loading/error/empty)
    │   │   ├── NotificationList.jsx     # renders items via NotificationItem
    │   │   ├── NotificationItem.jsx     # type icon/chip, time, unread accent, mark-read + dismiss
    │   │   └── NotificationSettings.jsx # inline panel — 6 toggles + mute-all (real labels/checks)
    │   ├── layout/
    │   │   ├── Sidebar.jsx              # EDIT — menuIcons + unread-count badge (99+ cap)
    │   │   └── DashboardLayout.jsx      # unchanged
    │   └── Layout.jsx                   # EDIT — toast container moves to provider (see Complexity Tracking)
    ├── context/
    │   └── NotificationsContext.jsx     # NEW — API-backed state, actions, toasts for new items
    ├── services/
    │   └── api.js                       # EDIT — listNotifications, markRead, readAll, delete, clear, settings, sync
    ├── data/
    │   └── constants.js                 # EDIT — SIDEBAR_MENU entry + NOTIFICATION_TYPES
    ├── utils/
    │   └── notificationsUtils.js        # NEW — sortNewestFirst, unreadCount, badgeLabel, formatRelativeTime
    ├── App.jsx                          # EDIT — additive /notifications route
    ├── main.jsx                         # EDIT — wrap <NotificationsProvider> inside <AuthProvider>
    └── pages/WorkoutForm.jsx            # EDIT — guarded notifications.refresh() after create success
```

**Structure Decision**: Web app (existing backend + frontend workspaces); the feature adds the backend notifications module (mirroring the workout module exactly) and the constitution-mandated frontend files above, touching existing files only where integration requires it. All other files unchanged.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Backend persistence + `/api/notifications` (vs. frontend-only localStorage) | Approved decision (Amendment 2026-09-09, constitution v3.5.1): notifications must be auth-scoped, persist server-side, and connect to the real database/API (spec requirements 6/7/11; "no permanent mock data") | The original localStorage approach cannot satisfy per-user auth scoping or real-data event sourcing |
| Goal events sourced from frontend `goalsData` via `/api/notifications/sync` | Goals have no backend by design (every goal UI uses `goalsData`); syncing it is the only way to create goal notifications from real goal state | Building a goals backend is outside Day 6.1 scope |
| Toast container rendered by `NotificationsProvider`, removed from `Layout.jsx` | DashboardLayout (Pattern A) pages have no toast container today, and all notification actions/toasts occur exactly there; a single provider-owned container keeps toasts global and non-duplicated | Keeping `Layout.jsx` unchanged duplicates toast containers (double rendering) and leaves Pattern A pages toast-less |
| Workout completion notification created server-side in `controllers/workout.js`, with `WorkoutForm.jsx` refreshing afterwards | Spec P2/FR24 requires a completion notification "at the correct moment"; server-side creation in the workout create path is deterministic and survives client refreshes | Client-only creation misses notifications created for other sessions and duplicates event sourcing |

## Overall Approach

High-level implementation sequence (mirrors the requested phase ordering; `/sp.tasks` decomposes into granular tasks):

1. **Backend module** — `Notification` + `NotificationSettings` models (unique `(owner, eventKey)`), validators additions, `notificationService` (list/unread/settings/ensureNotification+demo helpers), notifications controller + `/api/notifications` routes mounted in `app.js`, workout create path guarded completion hook.
2. **Foundation (frontend)** — `constants.js` additions (`SIDEBAR_MENU` entry, `NOTIFICATION_TYPES`); API methods in `api.js`; `NotificationsProvider` (fetch list + settings, sync, actions, toasts for new items) mounted in `main.jsx`; global toast consolidation; `App.jsx` additive `/notifications` route; `Notifications` page shell (Pattern A: `DashboardLayout`), placeholder via `EmptyState`, sidebar icon + badge.
3. **Creation logic** — Server-side event sourcing: workout-completion on workout create; reminder selection in `syncNotifications` (workouts/nutrition habit + meal-window guards, goal-reminder ≤ 3 days); goal-progress/goal-completed derived from synced `goalsData`; settings respected at creation; same-day dedup via `eventKey`.
4. **Notifications page** — `NotificationsPage` + `NotificationList` + `NotificationItem` (type icon/chip, relative time, unread dot, dismiss), filter tabs (All / Unread), Mark all as read, per-item Mark read; empty/unread-empty states.
5. **Settings** — `NotificationSettings` inline panel: 6 per-type toggles + mute all, real `<label>` + `<input type="checkbox">` styled with dark tokens; PATCHed to the API; respected on every surface (list, badge, toast).
6. **Integration & polish** — `WorkoutForm` guarded refresh after create; toast verification app-wide, badge overflow ("99+"), responsive/a11y pass (focus, aria labels, reduced motion), `npm run build`, `node --check`/import smoke on backend, regression pass on other pages, handoff notes.

**Definition of Done**: all 3 user stories demonstrable; all 26 FRs implemented; 10 success criteria met (incl. persistence across reload, empty pages, settings suppression); `npm run build` clean; notification data persists in MongoDB per user; Constitution Check (v3.5.1, incl. Amendment 2026-09-09) re-verified.