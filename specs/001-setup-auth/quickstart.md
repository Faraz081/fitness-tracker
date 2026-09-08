# Quickstart: Fitness_Tracker — Day 1 (Project Setup & Authentication)

**Branch**: `001-setup-auth` | **Date**: 2026-08-28

A new developer should reach a running full stack in under 15 minutes using
only this file + a MongoDB Atlas URI. Matches the constitution's
"fresh clone boots from `.env.example`" rule.

## Prerequisites

- Node.js ≥ 24 LTS (verified: v24.18.0).
- npm ≥ 11.
- A MongoDB Atlas cluster (free tier) with network access allowed and a
  database user created. Your connection string looks like:

  `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/fitness_tracker`

## 1. Install dependencies

From repo root the root script installs both workspaces:

```bash
npm run install-all
```

## 2. Configure the server

Copy the reference env file and fill in your real values:

```bash
cp server/.env.example server/.env
```

Set, at minimum:

- `MONGO_URI` → your real Atlas connection string.
- `JWT_SECRET` → a random string ≥ 32 chars (one-time local value; rotate
  before any production deployment).

Remaining defaults (`PORT=5000`, `JWT_EXPIRES=1h`, `CLIENT_ORIGIN=http://localhost:5173`,
`BCRYPT_ROUNDS=10`, `COOKIE_NAME=access_token`) are fine for local dev.

## 3. Configure the client (optional)

The client default `VITE_API_URL=http://localhost:5000` matches local dev.
If you change it, create `client/.env`:

```bash
cp client/.env.example client/.env
```

## 4. Run

From repo root:

```bash
npm run dev
```

This starts the server (`tsx watch`, port 5000) and the Vite client (port 5173)
together via `concurrently`.

- Server up when logs show: `Connected to MongoDB` and
  `Server listening on http://localhost:5000`.
- Client at: http://localhost:5173

## 5. Try it end-to-end

1. Open http://localhost:5173/register — create an account
   (`name`, valid `email`, password ≥ 6 chars).
2. You are redirected to login. Log in with the same credentials.
3. You land on the Dashboard and see your name.
4. Open http://localhost:5173/ in a private window (no cookie) — you are
   redirected to `/login`.

## 6. Verifying the API directly

```bash
# session restore — expects 401 without a cookie
curl -i http://localhost:5000/api/auth/me

# register
curl -i -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"secretpass123\"}" \
  http://localhost:5000/api/auth/register

# login (sets a cookie; echo token optional dev-only)
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"secretpass123\"}" \
  http://localhost:5000/api/auth/login

# protected endpoint with cookie
curl -i -b cookies.txt http://localhost:5000/api/auth/me
```

## Troubleshooting

- **Server exits non-zero at startup** → a required env var is missing or
  `MONGO_URI` is unreachable; read the fail-fast message, fix `.env`.
- **Login works but client doesn't persist session across refresh** → ensure
  every `fetch` in `client/src/services/api.ts` uses `credentials: 'include'`
  and CORS allows `CLIENT_ORIGIN` with credentials.
- **Register returns 409** → email already exists (or you registered the same
  test email before); use a fresh email or clear the `users` collection.