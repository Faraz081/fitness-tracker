# Data Model: Settings (7.1)

**Created**: 2026-09-09 | **Branch**: `010-settings-page`

## Entities

### User (extended) — `users` collection

Adds one embedded subdocument. All other fields (name, email, password `select:false`,
bio, age, weightKg, heightCm, goal, fitnessLevel, avatarUrl) are unchanged and remain as
documented in the constitution's "User (updated for profile)" table.

| Field path            | Type                       | Rules                                                    | Notes                                    |
|-----------------------|----------------------------|----------------------------------------------------------|------------------------------------------|
| `preferences.units`   | String                     | enum `['kg', 'lb']`; default `'kg'`                     | display unit for weights app-wide        |
| `preferences.theme`   | String                     | enum `['dark', 'light']`; default `'dark'`              | root `data-theme` value; exactly 2 (+ at most 1 light) |
| `preferences` (parent) | Mixed subdoc              | zod-enforced at API boundary; not separate collection   | one store per user; owner-scoped by document ownership |

Validation: sends obey `preferencesPatchSchema` (zod strict, `{ units?, theme? }`, ≥1 field,
enums `kg/lb` and `dark/light`). Mongoose schema enum validation acts as the last line of
defense. No uniqueness/index change; `email` unique index untouched.

### Profile (logical)

Existing profile fields (name, bio, age, weightKg, heightCm, goal, fitnessLevel, avatarUrl) —
read via `GET /api/users/me`, patched via `PATCH /api/users/me`. Settings' Profile section
renders the same fields through the shared `ProfileForm`; email is read-only. No schema change
beyond the preferences subdocument.

### Notification Preferences (existing, reused — `notificationsettings` collection)

`owner` (unique) + `muted` (bool) + `types` (per six notification keys). Settings section
reads/writes via `GET/PATCH /api/notifications/settings` and the existing
`NotificationsContext`. **Not modified by Day 7.1** (single source, ST8/G7).

### Session (logical)

Cookie-signed session via `access_token` (or `COOKIE_NAME`). Cleared by controller
`clearCookie` on: logout (existing), successful password change (new), account deletion (new).
No server-side session store.

## Validation rules

| Flow | Payload | Server validation | Failure codes |
|------|---------|-------------------|---------------|
| Update preferences | `{ units?, theme? }` | zod `.strict()`, enums, ≥1 field | `400 VALIDATION_ERROR` |
| Change password | `{ currentPassword, newPassword }` | `newPassword` ≥6 chars (auth rule); `currentPassword` non-empty; bcrypt compare current; new must differ from current | `401 INVALID_PASSWORD`, `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` |
| Delete account | `{ email }` | zod email; must exactly match the authenticated user's `email` | `400 VALIDATION_ERROR`, `403 CONFIRMATION_MISMATCH`, `401 UNAUTHORIZED` |

## State transitions

- **Password change success**: `Session {authenticated}` → service verifies current + updates
  hash → controller clears cookie → `Session {logged-out}` → next request requires re-login.
- **Delete account confirmed**: `{user, owned-data}` → owner-scoped `deleteMany` on
  `notifications`, `notificationsettings`, `workouts`, `nutrition` → `users` doc deleted →
  cookie cleared → `{terminated}`. Irreversible. No other user's rows are in any query set.
- **Preferences save**: `{user, preferences}` → PATCH applies new units/theme → client
  optimistic state applies immediately; on failure the client reverts to the last persisted
  value and shows an error (ST5). Stored `weightKg`/`heightCm` never change during this flow.
- **Theme/units application**: persisted value → `SettingsContext` (a) sets
  `document.documentElement.dataset.theme` and (b) exposes `units` so `utils/units.js`
  renders conversions at the display edge. No canonical mutation.

## Data ownership summary

| Collection | Owner field | Deleted on account deletion |
|------------|-------------|-----------------------------|
| `users`    | `_id` (self) | yes (last)                  |
| `workouts` | `owner`     | yes                         |
| `nutrition`| `owner`     | yes                         |
| `notifications` | `owner` | yes                    |
| `notificationsettings` | `owner` | yes                |

Every delete query filters on `owner: req.userId` — cross-user damage is structurally
impossible (Principle VII).