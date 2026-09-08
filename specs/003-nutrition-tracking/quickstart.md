# Quickstart: Fitness_Tracker — Day 3 (Nutrition Tracking)

**Branch**: `003-nutrition-tracking` | **Date**: 2026-08-28

Day 3 adds nutrition logging and a server-computed daily summary on top of the
completed Day 1 auth and Day 2 profile/workouts. Install/boot steps are
identical to Day 1/Day 2 — no new dependencies, no new environment variables.
Use this file to verify Day 3 from a clean state in under 15 minutes.

## Prerequisites

- Day 1/Day 2 stack already installed (root `npm run install-all`).
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

Register (`/register`) or log in (`/login`) with an existing account.

## 3. Nutrition

1. Open **Nutrition** (`/nutrition`) — the date defaults to today; totals are 0
   and the page shows an empty state ("No entries for this date").
2. Click **Add Meal/Food** and enter a food name, calories, protein, carbs, fat,
   and a meal type (breakfast/lunch/dinner/snack); optionally a quantity and unit.
3. Save — the entry appears under its meal group and the daily totals update.
4. Add entries for each meal type. The page groups them under **Breakfast**,
   **Lunch**, **Dinner**, **Snack**.
5. Change the date selector to review a different day.
6. **Edit** an entry — change a macro or meal type, save.
7. **Delete** an entry — confirm; it is removed and totals adjust.

## 4. Daily totals accuracy

Log a few entries with known values, e.g.:

```json
{ "foodName":"Oatmeal","calories":300,"protein":10,"carbs":50,"fat":5,"mealType":"breakfast" }
{ "foodName":"Chicken","calories":400,"protein":45,"carbs":0,"fat":10,"mealType":"lunch" }
```

Expected summary for that date: `calories = 700, protein = 55, carbs = 50, fat = 15`
(server-computed). The totals always come from `GET /api/nutrition/summary/daily`.

## 5. Ownership check (two users)

1. In a second profile/private window, register or log in as a different user.
2. Open **Nutrition** — you see **none** of the first user's entries and zeros
   for the daily summary (their entries are not counted).
3. `curl` an entry id from user A while logged in as user B:

```bash
curl -i -b cookiesB.txt http://localhost:5000/api/nutrition/<A_ENTRY_ID>
```

Expect `404` with `code: "NOT_FOUND"` — never user A's data.

## 6. Verifying the API directly

```bash
# login to get a cookie (use a real account)
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secretpass123"}' \
  http://localhost:5000/api/auth/login

# create a nutrition entry (expect 201)
curl -i -b cookies.txt -H "Content-Type: application/json" \
  -d '{"foodName":"Oatmeal","calories":300,"protein":10,"carbs":50,"fat":5,"mealType":"breakfast","date":"2026-08-28"}' \
  http://localhost:5000/api/nutrition

# list (expect 200, own entries only; option: ?date=YYYY-MM-DD&mealType=breakfast)
curl -i -b cookies.txt http://localhost:5000/api/nutrition

# daily summary (expect 200 with sums)
curl -i -b cookies.txt "http://localhost:5000/api/nutrition/summary/daily?date=2026-08-28"
```

## Troubleshooting

- **Nutrition fetch fails or 401** → confirm `credentials: 'include'` on every
  fetch in `client/src/services/api.ts` and CORS allows `CLIENT_ORIGIN` with
  credentials.
- **Delete returns 404** → the entry id may be owned by another user or already
  deleted; confirm the id belongs to the current session.
- **POST /api/nutrition returns 400** → check `foodName` (1–100), `calories`
  (0–2000), macros (0–500), `quantity` (> 0), and `mealType` (one of
  breakfast/lunch/dinner/snack).
- **Summary always zero for a date** → confirm entries exist for that date and
  are owned by the current user (Principle VIII: totals never include another
  user's entries).
