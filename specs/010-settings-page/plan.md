# Implementation Plan: Settings (7.1)

**Branch**: `010-settings-page` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-settings-page/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a dedicated `/settings` page (inside the existing `DashboardLayout` shell) with
grouped sections for **Profile**, **Preferences** (units kg/lb + theme), **Notifications**
(reuses the Day 6.1 single source), **Account** (change password + logout), and
**Danger Zone** (delete account, type-to-confirm). Preferences persist per
authenticated user on the User document (`user.preferences.units|theme`), read/written via
a new auth-scoped `GET/PATCH /api/users/me/preferences` endpoint. Three new backend
capabilities: preferences read/write, `POST /api/auth/change-password` (bcrypt compare +
strength validation + session-cookie clear on success), and `DELETE /api/auth/account`
(email-confirmation payload + owner-scoped cascade delete of the acting user's data).
Frontend preference state lives in a global `SettingsContext` whose optimistic updates
revert on failure (ST5) and which applies units/theme app-wide without mutating canonical
data (ST8). No new npm dependencies, no new env vars, additive routes only (ST7).

## Technical Context

**Language/Version**: JavaScript (ES2022, ESM) — backend Node.js 24 LTS (v24.18.0);
frontend React 19.2.8 + Vite 8.2.2 + React Router 7.18.2. JS only (`.js`/`.jsx`), no
TypeScript (constitution V override).
**Primary Dependencies**: Express (existing), Mongoose 9, zod (existing validators),
bcryptjs (existing), react/cookie-parser/cors (existing). Reuses lucide-react for icons
(`Settings`), framer-motion, existing `useToast`, `useAuth`, `EmptyState`, `Badge`,
`NotificationSettings` component. **No new npm dependencies.**
**Storage**: MongoDB Atlas (Mongoose 9). New persisted preferences live on the existing
`users` collection as an embedded `preferences` subdocument (`units`, `theme`). No new
collection for settings; notification preferences already live in `notificationsettings`.
**Testing**: `npm run build` (frontend `vite build`; backend `node --check src/index.js`);
manual browser verification recorded per Day 7.1 DoD 10. No test framework exists in-repo
(no `npm test`/`lint` scripts at root/backend/frontend).
**Target Platform**: Web — browser client (localhost:5173) + Express API (localhost:5000).
**Project Type**: Web application (`frontend/` + `backend/` MERN split).
**Performance Goals**: Settings actions are single-user CRUD; instant apply/confirm for
preference changes; no measurable latency targets beyond existing app API (p95 within the
existing app envelope is sufficient).
**Constraints**: No new env vars (D6/A7 — `VITE_API_URL`, `MONGO_URI`, `JWT_SECRET`,
`COOKIE_NAME`, `BCRYPT_ROUNDS`, etc. unchanged). No new npm deps. Additive only — no
removal/hiding of existing nav entries or routes (ST7). Email stays read-only. Canonical
weight/height values stay in stored units; conversion is display-only (ST8). Destructive
actions server-enforced and confirmation-gated (ST2, ST4). Delete cascade must never touch
another user's data (Principle VII). JS-only files (V override). Single source of truth for
notification preferences (`/api/notifications/settings`), profile (`/api/users/me`).
**Scale/Scope**: ~10 registered exercises, per-user; single Settings page with 5 grouped
sections; 3 new auth-scoped backend endpoints + 1 preferences read endpoint; ~10 new/changed
frontend files; apply units conversion to ~8 display sites.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Result (post-design): **PASS** — no violations; Complexity Tracking not required.*

| # | Gate (from Day 7.1 / cross-cutting) | Status | Evidence in this plan |
|---|--------------------------------------|--------|------------------------|
| G1 | JS only (`.js`/`.jsx`), no TypeScript | PASS | All new files `.js`/`.jsx`; no TS additions. |
| G2 | Zero new npm dependencies | PASS | Reuses express/mongoose/zod/bcryptjs/lucide/framer-motion; `units.js` + theme are hand-rolled. |
| G3 | Zero new environment variables | PASS | No `.env`/`.env.example` edits; all config vars are existing (`COOKIE_NAME`, `BCRYPT_ROUNDS`, etc.). |
| G4 | Additive routes/nav only (ST7) | PASS | Adds `Settings` sidebar entry + `/settings` route; no route/nav removals or repurposing. |
| G5 | Preferences persist per user, owner-scoped (ST8) | PASS | `preferences` subdoc on User + auth-scoped `GET/PATCH /api/users/me/preferences` gated by `authenticate` middleware. |
| G6 | Display-unit + theme conversion never mutate canonical data (ST8) | PASS | `utils/units.js` formats at display edge only; `data-theme` attribute on `<html>` switches CSS tokens only. |
| G7 | Notification prefs = single Day 6.1 source (ST8) | PASS | Settings Notifications section reuses `components/notifications/NotificationSettings.jsx` + `/api/notifications/settings` via `NotificationsContext`; no new store/controls. |
| G8 | Password change: bcrypt compare + strength + session clear (ST4) | PASS | `POST /api/auth/change-password` uses `select('+password')` + `bcrypt.compare`; min-length matches register rule; controller `clearCookie` on success; no hash ever returned. |
| G9 | Logout reuses existing path + cookie clear + redirect (ST6) | PASS | Reuses `POST /api/auth/logout`, `useAuth().logout()`, sidebar logout unchanged; Settings Account section calls same path. |
| G10 | Delete account: Danger Zone + ≥2-step confirm + server-enforced + owner-scoped cascade (ST2/ST4) | PASS | `DELETE /api/auth/account` requires `{ email }` matching the user (server rejects mismatch); UI type-to-confirm modal; cascade `deleteMany` scoped to `owner: req.userId` on all four owned collections + user doc. |
| G11 | No mock data; data from API (Day 7.1 folder rules) | PASS | Profile/prefs/password/delete all call real endpoints; only existing mock-data pages (Progress/Analytics/Goals/History/Dashboard weight cards) are re-rendered via `formatWeight`. |
| G12 | Design system consistency (ST3): tokens, dark shell, 4px scale, tight spacing | PASS | All new components use existing `--color-*` tokens, dash-card/dash-num classes, sidebar shell; light theme built from same token overrides. |
| G13 | Accessibility (DoD 11): labels, keyboard nav, focus trap, aria-live | PASS | Real `<label>`/`<input>`/`<select>`/`<button>`; focus trap in delete modal; `aria-live` confirmations; reduced-motion respected. |
| G14 | Verification: `npm run build` + backend `node --check`/import smoke (DoD 9) | PASS | Phase gates 2.3/2.4 script `npm run build` (frontend dest) + `node --check` on backend src. |

## Project Structure

### Documentation (this feature)

```text
specs/010-settings-page/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app.js                       # route registration (no change needed for settings beyond existing routers)
│   ├── models/
│   │   └── User.js                  # + preferences: { units: 'kg'|'lb', theme: 'dark'|'light' }
│   ├── utils/
│   │   └── validators.js            # + preferencesPatchSchema, changePasswordSchema, deleteAccountSchema
│   ├── services/
│   │   ├── profileService.js        # + getPreferences(userId), updatePreferences(userId, patch)
│   │   └── authService.js           # + changePassword(userId, input), deleteAccount(userId, email)
│   ├── controllers/
│   │   ├── profile.js               # + getPreferencesHandler, updatePreferencesHandler
│   │   └── auth.js                  # + changePasswordHandler (clears cookie), deleteAccountHandler (clears cookie)
│   └── routes/
│       ├── profile.js               # + GET/PATCH /preferences (auth-scoped)
│       └── auth.js                  # + POST /change-password, DELETE /account (auth-scoped)

frontend/
├── src/
│   ├── App.jsx                      # + <Route path="/settings"> (DashboardLayout-style standalone branch, like /notifications)
│   ├── main.jsx                     # + <SettingsProvider> (inside AuthProvider, near NotificationsProvider)
│   ├── data/
│   │   └── constants.js             # + SIDEBAR_MENU 'settings' entry; UNIT_OPTIONS, THEME_OPTIONS; PASSWORD strength hint text
│   ├── utils/
│   │   └── units.js                 # NEW — formatWeight(weightKg, units), label helpers (display-only conversion)
│   ├── services/
│   │   └── api.js                   # + getPreferences, updatePreferences, changePassword, deleteAccount
│   ├── context/
│   │   └── SettingsContext.jsx      # NEW — loads prefs at session start; optimistic units/theme updates with revert; applies data-theme
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx          # + menuIcons.settings (lucide Settings); renders existing new SIDEBAR_MENU entry automatically
│   │   ├── profile/
│   │   │   └── ProfileForm.jsx      # NEW — extracted shared form (name, bio, age, weightKg, heightCm, goal, fitnessLevel, avatarUrl); single source for /profile and /settings
│   │   └── settings/                # NEW (mirrors components/notifications/)
│   │       ├── SettingsSections.jsx     # grouped-section shell (labels + cards, tight spacing)
│   │       ├── PreferencesForm.jsx      # units select + theme toggle (uses SettingsContext)
│   │       ├── PasswordForm.jsx         # current + new + confirm, inline errors
│   │       └── DeleteAccountModal.jsx   # two-step destructive confirmation (type email → confirm)
│   └── pages/
│       ├── Profile.jsx              # refactored to render shared ProfileForm (no behavior change)
│       └── Settings.jsx             # NEW — /settings page composing the 5 sections in DashboardLayout shell
```

**Structure Decision**: Selected the existing web split (`backend/` + `frontend/`). Settings
is additive: new endpoints extend existing routers (`/api/users/me`, `/api/auth`), and the
new page lives in the existing `DashboardLayout`-style standalone route branch exactly like
`/notifications`. Frontend state reuses the established context pattern
(`NotificationsContext` precedent) via a new `SettingsContext`. The shared `ProfileForm`
extraction avoids a second profile store (ST8) by making `/profile` and `/settings` render
the same component against the same API.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable — Constitution Check PASSES with zero violations (G1–G14). No simplified
alternative was rejected; the plan favors the constitution's required patterns throughout.