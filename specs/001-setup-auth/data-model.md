# Data Model: Project Setup & Authentication (Day 1)

**Branch**: `001-setup-auth` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 1 output of `/sp.plan`. Single entity on Day 1: **User**.

## Entities

### User

| Field    | Type     | Rules                                                            | Notes                                  |
|----------|----------|------------------------------------------------------------------|----------------------------------------|
| `_id`    | ObjectId | auto (Mongo)                                                     | carried in JWT as `sub`                |
| `name`   | String   | required; `trim`; 1–100 chars                                    | normalized before validation           |
| `email`  | String   | required; `unique` index; `lowercase`; `trim`; valid email format | stored lowercased; duplicate → 409     |
| `password` | String | required; bcrypt hash ONLY                                        | `select: false`; never returned/logged |

**Validation rules** (applied via `zod` in the API layer before DB access):

- `name`: `string().trim().min(1).max(100)`.
- `email`: `string().trim().toLowerCase().email()`.
- `password`: `string().min(6)` (register); `string().min(1)` (login).
  Password is never stored or returned plaintext; `bcryptjs.compare` used at login.

**Transitions**:

- `create` → password hashed by pre-save hook if new/modified (`BCRYPT_ROUNDS`).
- At login: lookup by email → `compare(password, hash)` → sign JWT with
  `{ sub: user._id }`.

**Mongoose schema notes**:

- `email` unique index is single-field (no compound) per spec §4.
- Response projection strips `password` (or re-select explicitly when needed).
- `_id` mapped to `id` in API responses (`data.id`).

## State transitions (auth session)

```
Unauthenticated
  │  POST /api/auth/register (201) ──► Registered (still unauthenticated)
  │  POST /api/auth/login (200)    ──► Authenticated ──► (httpOnly cookie set)
  ▼
Authenticated
  │  GET /api/auth/me (200)        ──► still Authenticated (session restore)
  │  POST /api/auth/logout (200)   ──► Unauthenticated (cookie cleared)
  │  missing/expired/invalid JWT   ──► 401 → Unauthenticated
```

## Indexes

- `users` collection: unique index on `email`.

## Data flow

1. Client form → client-side validation (mirrors server rules).
2. `services/api.ts` POSTs → server `zod` middleware (400 on invalid).
3. Controller → service → Mongoose model.
4. Responses always use the envelope `{ success, data?, error? }`; password hash
   excluded from every response.