# Fitness_Tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-09-13

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
- JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; only **Node native `fetch`** added for Gemini, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react; **zero new frontend dependencies** (A7/D6) (017-ai-nutrition)
- MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection; one **additive optional `source`** field (`'ai' | 'manual'`, default `'manual'`, unindexed) for provenance only — no new models, no math/query change (P30). (017-ai-nutrition)
- JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; Gemini via **Node native `fetch`**, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react + Tailwind v4 + existing ui primitives (`Button`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`); **zero new frontend dependencies** (A7/D6) (018-ai-nutrition-search)
- MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection and the **already-shipped additive optional `source`** field (`'ai' | 'manual'`, default `'manual'`, unindexed) for provenance only — no new models, no math/query change (P30). Fiber/Sugar/Sodium are **transient display values from the AI response**, never persisted (P26/P30). (018-ai-nutrition-search)
- JavaScript (ES2022, ESM `.js`; JSX `.jsx`) on Node.js 24 LTS (v24.18.0) — JS-only, no TypeScript (Day 6.1 override). + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (all reused; Gemini via Node native `fetch` in the already-shipped analyze proxy). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4, lucide-react (icons: `Utensils`, `Coffee`, `Sun`, `Moon`, `Clock`, `Search`, `Plus`, `X`), framer-motion (all already bundled). **Zero new frontend/backend dependencies.** (019-nutrition-page-rebuild)
- MongoDB Atlas (Mongoose 9). Reuses the existing `Nutrition` collection/model unchanged (fields `quantity`, `unit`, `mealType` enum `['breakfast','lunch','dinner','snack']`, additive `source: 'ai' | 'manual'` already present). No schema change, no new model, no new env vars (optional `GEMINI_API_KEY` exists). (019-nutrition-page-rebuild)

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
- 019-nutrition-page-rebuild: Added JavaScript (ES2022, ESM `.js`; JSX `.jsx`) on Node.js 24 LTS (v24.18.0) — JS-only, no TypeScript (Day 6.1 override). + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (all reused; Gemini via Node native `fetch` in the already-shipped analyze proxy). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4, lucide-react (icons: `Utensils`, `Coffee`, `Sun`, `Moon`, `Clock`, `Search`, `Plus`, `X`), framer-motion (all already bundled). **Zero new frontend/backend dependencies.**
- 018-ai-nutrition-search: Added JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; Gemini via **Node native `fetch`**, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react + Tailwind v4 + existing ui primitives (`Button`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`); **zero new frontend dependencies** (A7/D6)
- 018-ai-nutrition-search: Added JavaScript (ES2022, ESM `.js`; JSX `.jsx`) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0) + Backend — Express 5.2.1, Mongoose 9.9.4, zod 4.4.3 (reused; Gemini via **Node native `fetch`**, zero new backend deps). Frontend — React 19.2.8, Vite 8.2.2, React Router 7.18.2; reuses bundled framer-motion + lucide-react + Tailwind v4 + existing ui primitives (`Button`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`); **zero new frontend dependencies** (A7/D6)


<!-- MANUAL ADDITIONS START -->
- Day 13 (AI Food Search Page Rebuild, constitution v5.0.0) — JavaScript (ES2022, ESM `.js`; JSX `.jsx`; JS-only per Day 6.1 override). Node.js 24 LTS + React 19.2.8 / Vite 8.2.2 / React Router 7.18.2 + Express 5.2.1 / Mongoose 9.9.4 / zod 4.4.3. Reuses the existing auth-scoped `POST /api/nutrition/analyze` Gemini proxy (Node native fetch; optional backend-only `GEMINI_API_KEY`) and the owner-scoped `Nutrition` create path (additive `source: 'ai'` provenance marker). **Zero new frontend/backend dependencies.** Nutrition page rebuilt from scratch to the exact five-part structure (Header, Search Bar, Search Result, Meal Tabs, Meal Section); the old Nutrition implementation is deleted first (AF1). Supersedes Day 12 P24/P25 for the Nutrition page.
- Analytics live-data conversion — The Analytics feature (originally Day 4 frontend-only, `data/analyticsData.js` mock) is now fully real and owner-scoped: new backend `GET /api/analytics?from&to&category` (authenticated, `analyticsQuerySchema` validated) aggregates from the existing `Workout`, `Nutrition`, `BodyWeight`, `Goal` models in `backend/src/services/analyticsService.js` (UTC date keys, `estimateWorkoutCalories` for burned, latest weight `Goal` for `goalWeightKg`). `frontend/src/data/analyticsData.js` is DELETED; `pages/Analytics.jsx` fetches a union window (current + previous period) via `services/api.js` `getAnalytics` and re-fetches on `refreshKey` from `useDashboardRefresh` (real-time). `AnalyticsPage.jsx` is a tabbed layout (Overview / Workout Analytics / Nutrition Analytics / Body & Progress) preserving all seven original sections; `buildSummary` no longer takes `insightPool` and derives the top insight from real data via `buildTopInsight`. **No new collections; no new npm dependencies.**
<!-- MANUAL ADDITIONS END -->

<!-- MANUAL ADDITIONS START -->
- Notification/workout completion fix — Workout creation no longer emits a `workout-completion` notification. `Workout` gains persisted `completed: Boolean` (default false) + `completedAt: Date`. New owner-scoped `POST /api/workouts/:id/complete` (deduped: single `workout-completion` notification per workout, `eventKey` unique index) marks a workout complete ONLY on the explicit Complete action from the Workout page (`Complete` button on list rows, `Complete Workout` button on detail). Frontend `NotificationsContext` subscribes to `useDashboardRefresh().refreshKey` (DashboardProvider moved above NotificationsProvider in `main.jsx`) so the Notifications page + bell badge update automatically after a completion — no manual refresh. One-time startup backfill (`backfillWorkoutCompletionStatus`) marks legacy workouts `completed: true` where a `workout-completion` notification already exists.
<!-- MANUAL ADDITIONS END -->
