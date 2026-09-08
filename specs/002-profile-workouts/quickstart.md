# Quickstart: Fitness_Tracker — Day 2 (User Profile & Workout Management)

**Branch**: `002-profile-workouts` | **Date**: 2026-08-28

Day 2 adds profile editing and full workout CRUD on top of the completed Day 1
authentication. The install/boot steps are identical to Day 1 — no new
dependencies, no new environment variables. Use this file to verify Day 2 from
a clean state in under 15 minutes.

## Prerequisites

- Day 1 stack already installed (root `npm run install-all`).
- `server/.env` from Day 1 (has `MONGO_URI`, `JWT_SECRET`, etc.). No new vars.
- MongoDB Atlas still reachable.

## 1. Boot (same as Day 1)

From repo root:

```bash
npm run dev
```

- Server logs: `Connected to MongoDB`, `Server listening on http://localhost:5000`.
- Client: http://localhost:5173

## 2. Sign in

Register (`/register`) or log in (`/login`) with an existing Day 1 account.

## 3. Profile

1. Open **Profile** (`/profile`).
2. You see your name, email (read-only), and profile fields.
3. Click **Edit**, change your name and add `bio` / `age` / `weightKg` /
   `heightCm` / `goal` / `fitnessLevel`, then **Save**.
4. The values update and persist after refresh.

## 4. Workouts

1. Open **Workouts** (`/workouts`) — shows an empty state ("No workouts yet").
2. Click **Add Workout** (`/workouts/new`).
3. Enter a title, pick a `category` (dropdown), set a date and notes.
4. **Add exercise** — enter name, sets, reps, optional weight, optional notes.
   Add a second exercise. Save.
5. The new workout appears in the list with its category, date, and exercise
   count.
6. Click **Edit** on a workout — change details, add/remove an exercise, save.
7. Click **Delete** → confirm → the workout is removed.

## 5. Ownership check (two users)

1. In a second profile/private window, register or log in as a different user.
2. Open **Workouts** — you see **none** of the first user's workouts.
3. `curl` a workout id from user A while logged in as user B:

```bash
curl -i -b cookiesB.txt http://localhost:5000/api/workouts/<A_WORKOUT_ID>
```

Expect `404` with `code: "NOT_FOUND"` — never user A's data.

## 6. Verifying the API directly

```bash
# login to get a cookie (use a real account)
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secretpass123"}' \
  http://localhost:5000/api/auth/login

# profile (expect 401 without cookie, 200 with)
curl -i -b cookies.txt http://localhost:5000/api/users/me

# create workout
curl -i -b cookies.txt -H "Content-Type: application/json" \
  -d '{"title":"Push Day","category":"strength","date":"2026-08-28","exercises":[{"name":"Bench Press","sets":4,"reps":8,"weightKg":60}]}' \
  http://localhost:5000/api/workouts

# list
curl -i -b cookies.txt http://localhost:5000/api/workouts
```

## Troubleshooting

- **Profile/workout fetch fails or 401** → confirm `credentials: 'include'` on
  every fetch in `client/src/services/api.ts` and CORS allows `CLIENT_ORIGIN`
  with credentials.
- **Delete returns 404** → the workout id may be owned by another user or the
  record was already deleted; confirm the id belongs to the current session.
- **PATCH /api/users/me returns 400** → check that numeric fields satisfy the
  bounds (age 13–120, weightKg 20–400, heightCm 60–280) and enum fields match.
