# Fitness_Tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-09-09

## Active Technologies
- MongoDB Atlas (Mongoose 9) — `users` (updated) + `workouts` collections (002-profile-workouts)
- MongoDB Atlas (Mongoose 9) — adds `nutrition` collection (reuses `users`, `workouts`) (003-nutrition-tracking)
- JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2 — JS-only per Day 6.1 override (no TypeScript). + None new. Reuses lucide-react (`Bell`, `BellRing`, `BellOff`, `CheckCheck`, `Trash2`), framer-motion (already bundled), existing ui primitives (`EmptyState`, `Badge`, `ToastContainer`), `useToast`, `useAuth`. (009-notifications-reminders)
- MongoDB Atlas (Mongoose 9) — new `notifications` + `notificationsettings` collections (owner-scoped; unique `(owner, eventKey)`), read via auth-scoped `/api/notifications` endpoints. No localStorage for this feature (Amendment 2026-09-09 replaces N9's narrow localStorage exception). (009-notifications-reminders)
- JavaScript (ES2022, ESM) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. + None new; reuses Express, Mongoose 9, zod, bcryptjs, lucide-react (`Settings`), framer-motion, `useToast`, `useAuth`. JS-only per Day 6.1 override (no TypeScript). (010-settings-page)
- MongoDB Atlas (Mongoose 9). Preferences persist on the existing `users` collection as `user.preferences` (`units` kg/lb, `theme` dark/light), read via auth-scoped `GET/PATCH /api/users/me/preferences`; notification prefs reuse the `notificationsettings` store via `/api/notifications/settings` (single source). Auth-scoped `POST /api/auth/change-password` + `DELETE /api/auth/account` (confirmation payload). No new env vars. (010-settings-page)
- JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. Reuses bundled framer-motion, lucide-react, Tailwind CSS, existing ui primitives (`Button`, `Badge`, `Card`, `Counter`, `EmptyState`). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6) (012-landing-page)
- N/A — no persistence. Landing content lives in one frontend data module `frontend/src/data/landingContent.js` (012-landing-page)

- TypeScript 7.0.2 (strict, both workspaces) on Node.js 24 LTS (v24.18.0) + client → React 19.2.8, Vite 8.2.2, React Router 7.18.2 · (001-setup-auth)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 7.0.2 (strict, both workspaces) on Node.js 24 LTS (v24.18.0): Follow standard conventions

## Recent Changes
- 012-landing-page: Added JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. Reuses bundled framer-motion, lucide-react, Tailwind CSS, existing ui primitives (`Button`, `Badge`, `Card`, `Counter`, `EmptyState`). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6)
- 011-reports-export: Added JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2 — JS-only per Day 6.1 override (no TypeScript). + jsPDF (client-side PDF generation). Reuses Express, Mongoose 9, zod, bcryptjs, lucide-react (`Download`, `FileText`, `FileSpreadsheet`), framer-motion, existing ui primitives (`Card`, `Button`, `Badge`, `EmptyState`, `Spinner`, `Skeleton`), `useToast`, `useAuth`. Server-side aggregation from owner-scoped `workouts` + `nutrition` collections via `GET /api/reports/:type` endpoints. Client-side CSV/PDF export from pre-aggregated data. Date range via URL params (`useSearchParams`). Gates: `node --check` PASS, `vite build` PASS, import smoke PASS (server boots).
- 010-settings-page: Added JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2 — JS-only per Day 6.1 override (no TypeScript). + None new; reuses Express, Mongoose 9, zod, bcryptjs, lucide-react (`Settings`, `KeyRound`, `LogOut`, `AlertTriangle`, `Trash2`), framer-motion, `useToast`, `useAuth`, `NotificationsContext`. Implemented end-to-end on `010-settings-page`: `user.preferences` (units kg/lb, theme dark/light) via `GET/PATCH /api/users/me/preferences`; `[data-theme="light"]` token overrides in `index.css`; display-only `formatWeight(kg, units)` threaded through history/progress/analytics/dashboard weight sites (`utils/units.js`); shared `ProfileForm` (Profile + Settings, one source); `POST /api/auth/change-password` (bcrypt, clears session) + `DELETE /api/auth/account` (owner-scoped cascade Notification → NotificationSettings → Workout → Nutrition → User, 403 CONFIRMATION_MISMATCH); Settings page sections (Profile/Preferences/Notifications/Account/Danger Zone) reusing `NotificationSettings` single source. Gates: `node --check` PASS, `vite build` PASS, import smoke PASS (server boots).


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
