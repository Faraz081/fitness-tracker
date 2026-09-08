# Data Model: Nutrition Tracking (Day 3)

**Branch**: `003-nutrition-tracking` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 1 output of `/sp.plan`. Documents the Day 3 entity: the new **Nutrition**
entry (single document per logged meal/food), owned by the reused **User**.

## Entities

### Nutrition

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `_id` | ObjectId | auto (Mongo) | |
| `owner` | ObjectId (ref User) | required | set from `req.userId` ONLY; never client input |
| `foodName` | String | required; `trim`; 1–100 chars | e.g. "Oatmeal" |
| `quantity` | Number | optional; > 0 (0.01–1000) | defaults to 1 if omitted |
| `unit` | String | optional; `trim`; 1–20 chars | free text (g, ml, cups, oz, bowl…) |
| `calories` | Number | required; >= 0 (max 2000) | kcal |
| `protein` | Number | optional; >= 0 (max 500) | grams; defaults to 0 |
| `carbs` | Number | optional; >= 0 (max 500) | grams; defaults to 0 |
| `fat` | Number | optional; >= 0 (max 500) | grams; defaults to 0 |
| `mealType` | String | required; enum (below) | stored lowercase |
| `date` | Date | required; default `Date.now` | the day the entry belongs to |
| `createdAt` / `updatedAt` | Date | `timestamps: true` | |

**Meal type enum** (fixed): `breakfast | lunch | dinner | snack`
(validated via `zod.z.enum([...])`).

**Indexes**:
- Single-field index on `owner`.
- Compound `{ owner: 1, date: 1, mealType: 1 }` for owner-scoped, date/
  meal-type-filtered listing and the owner-scoped daily aggregate.

**Ownership rule**: every create MUST set `owner = req.userId`; every query and
the daily-summary aggregation MUST filter by `owner`. Never trust an `owner`
value from the request body.

**Validation** (`zod` in `server/src/utils/validators.ts`):
- `nutritionEntrySchema`:
  - `foodName`: `string().trim().min(1).max(100)`.
  - `quantity`: `number().min(0.01).max(1000)` optional.
  - `unit`: `string().trim().min(1).max(20)` optional.
  - `calories`: `number().min(0).max(2000)`.
  - `protein`/`carbs`/`fat`: `number().min(0).max(500)` optional (default 0).
  - `mealType`: `z.enum(['breakfast','lunch','dinner','snack'])`.
  - `date`: valid date (default today).
- `nutritionUpdateSchema`: same rules, all fields optional (partial PATCH).

## Relationships

```
User 1 ──── owns ────> * Nutrition
```

- A User owns zero or more Nutrition entries (`owner` ref).
- Each Nutrition document is a standalone meal/food log for one user on one date.
- No separate FoodItem/Unit collections on Day 3 (food DB deferred).

## State transitions

```
Nutrition entry (created/updated/deleted via /api/nutrition):
  None ──(POST)──► created ──(PATCH)──► updated ──(DELETE)──► deleted
  created/list/summary ──(GET)──► shown to owner only

Daily summary (server-computed per Principle VIII):
  selected date ──(GET /api/nutrition/summary/daily)──► { calories, protein, carbs, fat }
  total changes whenever any owned entry for that date is added/edited/deleted
```

## Data flow

1. Client Nutrition page selects a date → fetches `GET /api/nutrition` (entries)
   and `GET /api/nutrition/summary/daily` (totals) for that date.
2. Add/Edit `MealForm` submits via `services/api.ts` → server `zod` validation
   (400 on invalid) → controller → service → Mongoose model (owner-scoped).
3. Delete confirms → `DELETE /api/nutrition/:id` → owner-scoped delete → page
   refetches entries + summary.
4. All responses use the envelope `{ success, data?, error? }`; cross-user entry
   requests → 404; the daily summary reflects ONLY the caller's own entries
   (server-computed).
