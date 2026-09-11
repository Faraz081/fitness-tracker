# Fitness_Tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-09-10

## Active Technologies
- MongoDB Atlas (Mongoose 9) — `users` (updated) + `workouts` collections (002-profile-workouts)
- MongoDB Atlas (Mongoose 9) — adds `nutrition` collection (reuses `users`, `workouts`) (003-nutrition-tracking)
- JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2 — JS-only per Day 6.1 override (no TypeScript). + None new. Reuses lucide-react (`Bell`, `BellRing`, `BellOff`, `CheckCheck`, `Trash2`), framer-motion (already bundled), existing ui primitives (`EmptyState`, `Badge`, `ToastContainer`), `useToast`, `useAuth`. (009-notifications-reminders)
- MongoDB Atlas (Mongoose 9) — new `notifications` + `notificationsettings` collections (owner-scoped; unique `(owner, eventKey)`), read via auth-scoped `/api/notifications` endpoints. No localStorage for this feature (Amendment 2026-09-09 replaces N9's narrow localStorage exception). (009-notifications-reminders)
- JavaScript (ES2022, ESM) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. + None new; reuses Express, Mongoose 9, zod, bcryptjs, lucide-react (`Settings`), framer-motion, `useToast`, `useAuth`. JS-only per Day 6.1 override (no TypeScript). (010-settings-page)
- MongoDB Atlas (Mongoose 9). Preferences persist on the existing `users` collection as `user.preferences` (`units` kg/lb, `theme` dark/light), read via auth-scoped `GET/PATCH /api/users/me/preferences`; notification prefs reuse the `notificationsettings` store via `/api/notifications/settings` (single source). Auth-scoped `POST /api/auth/change-password` + `DELETE /api/auth/account` (confirmation payload). No new env vars. (010-settings-page)
- JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. Reuses bundled framer-motion, lucide-react, Tailwind CSS, existing ui primitives (`Button`, `Badge`, `Card`, `Counter`, `EmptyState`). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6) (012-landing-page)
- N/A — no persistence. Landing content lives in one frontend data module `frontend/src/data/landingContent.js` (012-landing-page)
- JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4 (CSS-first `@theme`). Reuses the **already-bundled** lucide-react (icons) and framer-motion (page/reveal polish). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6) (013-premium-ui-upgrade)
- N/A — no new persistence. The design system lives as CSS variables in `frontend/src/index.css` `@theme` (single source of truth). (013-premium-ui-upgrade)
- JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2 — existing codebase, no new code written (except bug fixes) + Express, Mongoose 9, React 19, React Router 7, Tailwind CSS v4, lucide-react, framer-motion — all existing, no new dependencies (014-final-qa)
- MongoDB Atlas (existing `users`, `workouts`, `nutrition`, `notifications`, `notificationsettings` collections) — no schema changes (014-final-qa)

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
- 014-final-qa: Added JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2 — existing codebase, no new code written (except bug fixes) + Express, Mongoose 9, React 19, React Router 7, Tailwind CSS v4, lucide-react, framer-motion — all existing, no new dependencies
- 013-premium-ui-upgrade: Added JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4 (CSS-first `@theme`). Reuses the **already-bundled** lucide-react (icons) and framer-motion (page/reveal polish). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6)
- 012-landing-page: Added JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2. Reuses bundled framer-motion, lucide-react, Tailwind CSS, existing ui primitives (`Button`, `Badge`, `Card`, `Counter`, `EmptyState`). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
