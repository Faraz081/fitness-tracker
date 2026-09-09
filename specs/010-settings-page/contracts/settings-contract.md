# API Contract: Settings (7.1)

**Created**: 2026-09-09 | **Branch**: `010-settings-page`
**Base**: `VITE_API_URL` (default `http://localhost:5000`). All endpoints are
cookie-authenticated (`access_token` httpOnly cookie) via the existing `authenticate`
middleware (sets `req.userId` from JWT `sub`).

Response envelope (existing pattern): success → `{ success: true, data }`; error →
`{ success: false, error: { message, code } }`, handled by the global `errorHandler`.
The client (`services/api.js`) surfaces `ApiError(message, code, status)`.

## New endpoints

### GET /api/users/me/preferences

Auth: required. Returns the authenticated user's persisted preferences.

- **200** `{ success: true, data: { preferences: { units: 'kg'|'lb', theme: 'dark'|'light' } } }`
- **401** `UNAUTHORIZED` (no/invalid cookie or user missing)

### PATCH /api/users/me/preferences

Auth: required. Body (strict zod, at least one field):

```json
{ "units": "lb", "theme": "light" }
```

- **200** `{ success: true, data: { preferences: { units, theme } } }`
- **400** `VALIDATION_ERROR` — unknown keys, invalid enum, or empty body
- **401** `UNAUTHORIZED`

### POST /api/auth/change-password

Auth: required. Body:

```json
{ "currentPassword": "old-pass", "newPassword": "new-pass-6plus" }
```

Server verifies current via bcrypt, ensures new differs from current and meets the ≥6-char
auth rule, re-hashes and persists. On success the controller clears the session cookie —
the client MUST sign the user out and redirect to `/login`.

- **200** `{ success: true, data: {} }` (cookie cleared)
- **400** `VALIDATION_ERROR` — new password too short / same as current / malformed body
- **401** `INVALID_PASSWORD` — current password incorrect
- **401** `UNAUTHORIZED` — not authenticated

### DELETE /api/auth/account

Auth: required. JSON body (confirmation payload):

```json
{ "email": "user@example.com" }
```

Server rejects when `email` does not exactly match the authenticated user's email, then
cascade-deletes only the acting user's data (notifications → notificationsettings → workouts
→ nutrition → user) and clears the cookie. Irreversible.

- **200** `{ success: true, data: {} }` (cookie cleared)
- **400** `VALIDATION_ERROR` — missing/malformed email
- **403** `CONFIRMATION_MISMATCH` — email does not match the account
- **401** `UNAUTHORIZED` — not authenticated

## Reused endpoints (no change)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/logout` | Existing logout (cookie clear) — reused by Settings Account section |
| `GET /api/users/me`, `PATCH /api/users/me` | Existing profile read/update — reused by shared `ProfileForm` |
| `GET /api/notifications/settings`, `PATCH /api/notifications/settings` | Existing notification preferences — single source, reused via `NotificationsContext` |

## Security notes

- No password hash is ever returned by any endpoint (User `password` stays `select: false`).
- Both destructive endpoints are `authenticate`-gated; all queries are scoped to `req.userId`.
- Password change and account deletion clear the cookie server-side; the client nulls the
  auth context and redirects (no state leak into the next session).