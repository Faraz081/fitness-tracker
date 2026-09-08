# Data Model: User Profile & Workout Management (Day 2)

**Branch**: `002-profile-workouts` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 1 output of `/sp.plan`. Documents the Day 2 entities: the updated
**User** (profile fields) and the new **Workout** with embedded **Exercise**
subdocuments.

## Entities

### User (updated — Day 2 adds optional profile fields)

| Field          | Type     | Rules                                                                    | Notes                          |
|----------------|----------|--------------------------------------------------------------------------|--------------------------------|
| `_id`          | ObjectId | auto (Mongo)                                                             | carried in JWT as `sub`        |
| `name`         | String   | required; `trim`; 1–100 chars                                            | editable Day 2                 |
| `email`        | String   | required; `unique`; `lowercase`; `trim`; valid format                    | read-only Day 2 (no change)    |
| `password`     | String   | required; bcrypt hash ONLY; `select:false`                               | never returned/logged          |
| `bio`          | String   | optional; `trim`; max 500                                                | NEW                            |
| `age`          | Number   | optional; int 13–120                                                     | NEW                            |
| `weightKg`     | Number   | optional; 20–400                                                         | NEW                            |
| `heightCm`     | Number   | optional; 60–280                                                         | NEW                            |
| `goal`         | String   | optional; enum `['lose','maintain','gain','other']`                      | NEW                            |
| `fitnessLevel` | String   | optional; enum `['beginner','intermediate','advanced']`                  | NEW                            |
| `avatarUrl`    | String   | optional; `trim`; valid URL; max 500                                     | NEW (stored only; no upload)   |

**Validation** (`zod` in `server/src/utils/validators.ts`, `profileUpdateSchema`):
- `name`: `string().trim().min(1).max(100)` (if provided).
- `bio`: `string().trim().max(500)`.
- `age`: `number().int().min(13).max(120)`.
- `weightKg`: `number().min(20).max(400)`.
- `heightCm`: `number().min(60).max(280)`.
- `goal`: `z.enum(['lose','maintain','gain','other'])`.
- `fitnessLevel`: `z.enum(['beginner','intermediate','advanced'])`.
- `avatarUrl`: `string().trim().url().max(500)` (or accept null).

**Notes**:
- All new fields optional → no migration; old `User` docs load fine.
- Password hash preserved via existing pre-save hook; never returned.
- Response projection maps `_id → id` and MUST exclude `password`.

### Workout

| Field        | Type                  | Rules                                  | Notes                          |
|--------------|-----------------------|----------------------------------------|--------------------------------|
| `_id`        | ObjectId              | auto                                   |                                |
| `owner`      | ObjectId (ref User)   | required                               | set from `req.userId` ONLY     |
| `title`      | String                | required; `trim`; 1–100 chars          |                                |
| `category`   | String                | required; enum (below)                 | stored lowercase               |
| `date`       | Date                  | required; default `Date.now`           | workout occurrence date       |
| `notes`      | String                | optional; `trim`; max 2000             | whole-workout note            |
| `exercises`  | [Exercise]            | embedded subdocs; optional (may be []) |                                |
| `createdAt` / `updatedAt` | Date       | `timestamps: true`                     |                                |

**Category enum** (fixed): `strength | cardio | flexibility | hybrid | other`
(validated via `zod.z.enum([...])`).

**Indexes**:
- Single-field index on `owner` (for `Workout.find({ owner })`).
- Optional during planning: compound `{ owner: 1, date: -1 }` for list ordering;
  not required Day 2.

**Ownership rule**: every create MUST set `owner = req.userId`; every query
MUST filter by `owner`. Never trust an `owner` value from the request body.

### Exercise (embedded subdocument in Workout)

| Field        | Type     | Rules                                | Notes                        |
|--------------|----------|--------------------------------------|------------------------------|
| `name`       | String   | required; `trim`; 1–100 chars        | e.g. "Bench Press"           |
| `sets`       | Number   | required; int 1–50                   |                              |
| `reps`       | Number   | required; int 1–500                  |                              |
| `weightKg`   | Number   | optional; >= 0 (0/omitted = bodyweight) |                         |
| `notes`      | String   | optional; `trim`; max 500            | per-exercise note            |
| `restTimeSec`| Number   | optional; int 0–600                  | stored/validated; not required by UI |

**Validation** (`exerciseSchema`):
- `name`: `string().trim().min(1).max(100)`.
- `sets`: `number().int().min(1).max(50)`.
- `reps`: `number().int().min(1).max(500)`.
- `weightKg`: `number().min(0).max(1000)` optional.
- `notes`: `string().trim().max(500)`.
- `restTimeSec`: `number().int().min(0).max(600)` optional.

## Relationships

```
User 1 ──── owns ────> * Workout 1 ──── contains ────> * Exercise (embedded)
```

- A User owns zero or more Workouts (`owner` ref).
- A Workout contains zero or more Exercises as embedded subdocuments (no FK).
- Exercises have no identity/endpoint separate from their parent Workout in
  Day 2.

## State transitions

```
Profile:
  read mode ──(Edit)──► edit mode ──(Save: PATCH /api/users/me)──► saved (view mode)
                └──(Cancel)──────────────► view mode (no save)

Workout (created/updated/deleted via /api/workouts):
  None ──(POST)──► created ──(PATCH)──► updated ──(DELETE)──► deleted
  created/list ──(GET)──► shown to owner only
```

## Data flow

1. Client form → client-side validation (mirrors server rules).
2. `services/api.ts` wrapper POST/PATCHes → server `zod` validation (400 on
   invalid).
3. Controller → service → Mongoose model (owner-scoped).
4. Responses use the envelope `{ success, data?, error? }`; password hash and
   other users' data are never returned; cross-user workout requests → 404.
