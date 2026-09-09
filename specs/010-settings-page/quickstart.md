# Quickstart: Settings (7.1)

**Created**: 2026-09-09 | **Branch**: `010-settings-page`

Target-package root scripts are additive to the existing app — Settings adds no new npm
dependencies and no new environment variables.

## Prereqs

- Node.js 24 LTS (v24.18.0).
- MongoDB Atlas connection string in `backend/.env` (`MONGO_URI`, `JWT_SECRET`,
  `CLIENT_ORIGIN=http://localhost:5173`, `COOKIE_NAME=access_token`). No new vars.
- Frontend `.env`: `VITE_API_URL=http://localhost:5000` (existing).

## Run

```bash
# backend (port 5000)
cd backend && npm run dev          # node --watch src/index.js

# frontend (port 5173)
cd frontend && npm run dev         # vite dev server
```

Open http://localhost:5173, register/log in, open **Settings** in the left sidebar.

## Verify the new API surface (curl, cookie auth)

```bash
# login to get the httpOnly cookie
curl -c /tmp/cj -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret1"}'

# preferences
curl -b /tmp/cj http://localhost:5000/api/users/me/preferences
curl -b /tmp/cj -X PATCH http://localhost:5000/api/users/me/preferences \
  -H "Content-Type: application/json" -d '{"units":"lb","theme":"light"}'

# change password (cookie cleared on success)
curl -b /tmp/cj -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"secret1","newPassword":"newsecret6"}'

# delete account (email confirmation required; cookie cleared; cascade deletes)
curl -b /tmp/cj -X DELETE http://localhost:5000/api/auth/account \
  -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

Expected error probes: change-password with a wrong current password →
`401 INVALID_PASSWORD`; delete-account with a mismatched email → `403 CONFIRMATION_MISMATCH`;
PATCH preferences with an empty body → `400 VALIDATION_ERROR`.

## Verify the frontend flows

1. **Profile** — edit name/weight/etc in Settings → save → toast; same data shown on `/profile`
   (shared `ProfileForm`, one API source).
2. **Units** — switch kg↔lb; every weight display (Dashboard, Workouts, Progress, Chart,
   History PRs, Analytics) re-renders; DB `weightKg` unchanged (check via a direct fetch).
3. **Theme** — switch dark↔light; `<html data-theme="light">` changes tokens; survives reload.
4. **Notifications** — toggle all six types + mute-all; matches `/notifications` page (same
   store, single source).
5. **Password** — change password → auto sign-out → sign in with the new password; wrong
   current password shows an inline error.
6. **Logout** — clears session, redirects to `/login`.
7. **Delete account** — Danger Zone, type the email → confirm → data gone (workouts/
   nutrition/notifications), other accounts unaffected, redirected to `/login`.

## Quality gates

```bash
cd backend && npm run build        # node --check src/index.js (+ each new/changed module)
cd frontend && npm run build       # vite build
```

Record the manual browser pass (do.css DoD 10): reload persistence, password change, logout,
delete-account confirm flow, empty/error states, responsive at 3 breakpoints, prior-day
regression (workouts/nutrition/notifications still work).