# Implementation Plan: Project Setup & Authentication (Day 1)

**Branch**: `001-setup-auth` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-setup-auth/spec.md`
**Research**: [research.md](./research.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/auth.openapi.yaml](./contracts/auth.openapi.yaml) | **Quickstart**: [quickstart.md](./quickstart.md)

## Summary

Build a MERN monorepo (React+Vite client, Node+Express server) with email/password
authentication: hashed-password registration, JWT login issued as an **httpOnly
cookie**, a protected backend route + protected frontend route, and full
end-to-end manual verification. Day 1 delivers auth only — no business domain.

## Technical Context

**Language/Version**: TypeScript 7.0.2 (strict, both workspaces) on Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: client → React 19.2.8, Vite 8.2.2, React Router 7.18.2 ·
server → Express 5.2.1, Mongoose 9.9.4, jsonwebtoken 9.0.3, bcryptjs 3.0.3, zod 4.4.3, cors, dotenv, cookie-parser
**Storage**: MongoDB Atlas (Mongoose 9), `users` collection, unique email index
**Testing**: Manual end-to-end (Day 1 has no automated suite — deferred)
**Target Platform**: Local dev — client `http://localhost:5173`, server `http://localhost:5000`
**Project Type**: Web app (separate `client/` + `server/` workspaces, root orchestration)
**Performance Goals**: N/A Day 1 (auth flow measured by SC-001/SC-003, e.g. register→login < 1 min)
**Constraints**: Security-first auth per constitution Principle III (non-negotiable)
**Scale/Scope**: Single-user startup density; auth only, no business features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Gate | Status |
|---|------|--------|
| I | Client/server monorepo `client/` + `server/`, no shared package on Day 1 | ✅ Plan structure matches |
| II | Tech stack + pinned versions verified via `npm view`; constitution **amended to v2.0.0** (latest stable majors) | ✅ |
| III | bcrypt ≥10 rounds, JWT `sub` only, env secrets, centralized errors, CORS allowlist | ✅ |
| IV | Envelope `{ success, data?, error? }`, `/api/auth/...`, explicit status codes, fetch only in `services/` | ✅ |
| V | TS strict, naming, one unit per file, thin controllers | ✅ |
| VI | End-to-end register → login → protected → refused verified before Done | ✅ (T16) |
| Env | `.env` git-ignored, `.env.example` committed, fail-fast on missing vars | ✅ |
| UX | Single token strategy (**httpOnly cookie**), ProtectedRoute both layers | ✅ |

**Complexity Tracking**: Filled only if gates violated. No violations; downgrades
required none. Amendment to latest stable is the only substantive change and was
ratified as a constitution change (v2.0.0), not a tracking exception.

---

## 1. Overall Approach

**Work sequence: backend first, then frontend, then end-to-end verification.**

1. **Scaffold the shell once** (root + both workspaces) so every later task has
   a home (T1–T2, T10).
2. **Backend in dependency order**: config → DB connect → model → validation +
   error plumbing → register → login → auth middleware + protected endpoint.
   Each API is verified with `curl` as soon as it exists (contract-first).
3. **Frontend in dependency order**: API layer → auth context → protected route
   shell → pages. Pages only call `AuthContext` via `services/api.ts` (single
   `fetch` owner).
4. **End-to-end run** against real Atlas + both dev servers using the 12 manual
   test cases; only then is DoD signed.

**Why backend-first**: the client has nothing meaningful to render until the
contracts return real data; building the API first lets each frontend task be
verified against a live endpoint instead of mocks.

### Key decisions locked by the constitution/spec (do not re-open)

- Single monorepo, `client/` + `server/`, no npm-workspace hoisting; root
  `package.json` only orchestrates (`install-all`, `dev`).
- **Stack (amended v2.0.0)**: React 19 + Vite 8 + Router 7 · Express 5 +
  Mongoose 9 · TypeScript 7 strict. **Exact versions are pinned in `research.md`
  §0.2** — install those, not `^latest` ranges.
- **Auth strategy**: `jsonwebtoken` access token **only inside an httpOnly
  cookie** (`COOKIE_NAME`), `sameSite=lax`, `secure=production`,
  `credentials: 'include'` on every client fetch. No localStorage, no Bearer
  header, no mixing.
- Passwords: `bcryptjs`, `BCRYPT_ROUNDS >= 10`, pre-save hook, hash never
  returned/logged.
- Response envelope everywhere: `{ success: boolean, data?, error?: { message, code } }`.
- Client validation mirrors server rules; server `zod` validation runs before DB.
- `services/api.ts` is the only module that calls `fetch`.

---

## 2. Ordered Task List

Sequential; each task's acceptance criteria must be verifiable before moving on.
**Dependencies** = tasks that must be complete first.

### T1 — Root monorepo scaffolding

**Files**: `package.json` (root), `.gitignore`, `README.md` (replace bootstrap text with a 5-line pointer to the quickstart; no real docs content)
**Implement**:
- Root `package.json` — private, `type: "commonjs"`, scripts:
  `"install-all": "npm install --prefix client && npm install --prefix server"`,
  `"dev": "concurrently -n server,client -c blue,green \"npm run dev --prefix server\" \"npm run dev --prefix client\""`.
  Dev dependency: `concurrently@10.0.5` (exact).
- `.gitignore`: `node_modules/`, `.env`, `dist/`, `build/`, `.DS_Store`, `*.local`, logs.
- Confirm `server/` and `client/` folders will not be created here (T2/T10).
**Acceptance criteria**: `npm install` at root succeeds; `npm run install-all`
prints a "no such file" error only because workspaces don't exist yet (expected
until T2/T10); `.gitignore` excludes `.env`; no secrets anywhere.
**Dependencies**: none.

### T2 — Server workspace (Express + TypeScript scaffold)

**Files**: `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/.env` (local only, git-ignored)
**Implement**:
- `server/package.json` — `type: "module"`, scripts:
  `"dev": "tsx watch src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`
  (build output kept for completeness; Day 1 dev uses `dev`).
- Runtime deps pinned: `express@5.2.1`, `mongoose@9.9.4`, `jsonwebtoken@9.0.3`,
  `bcryptjs@3.0.3`, `zod@4.4.3`, `cors@2.8.6`, `dotenv@17.4.2`, `cookie-parser@1.4.7`.
- Dev deps pinned: `typescript@7.0.2`, `tsx@4.23.12`, `@types/node@24.13.3`,
  `@types/express@5.0.6`, `@types/jsonwebtoken@9.0.10`, `@types/cors@2.8.19`,
  `@types/cookie-parser@1.4.10`.
- `server/tsconfig.json` — `strict: true`, `target: "es2022"`, `module: "esnext"`,
  `moduleResolution: "bundler"`, `outDir: "./dist"`, `rootDir: "./src"`,
  `skipLibCheck: true`, `esModuleInterop: true`.
- `.env.example` (committed, placeholders): `NODE_ENV`, `PORT=5000`, `MONGO_URI`,
  `JWT_SECRET` (placeholder `replace-with-a-random-string-at-least-32-chars`),
  `JWT_EXPIRES=1h`, `CLIENT_ORIGIN=http://localhost:5173`, `BCRYPT_ROUNDS=10`,
  `COOKIE_NAME=access_token`. Copy to `.env` (git-ignored).
**Acceptance criteria**: `npm install` in `server/` succeeds; `npx tsc --noEmit`
passes on an empty project (may need a placeholder `src/index.ts` from T3);
`.env.example` committed, `.env` ignored.
**Dependencies**: T1.

### T3 — Server config module + app shell (fail-fast env)

**Files**: `server/src/config/index.ts`, `server/src/app.ts`, `server/src/index.ts`
**Implement**:
- `config/index.ts` — imports `dotenv` config; exports typed constants
  `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_ORIGIN`,
  `BCRYPT_ROUNDS`, `COOKIE_NAME`. Fail-fast: if `MONGO_URI`, `JWT_SECRET`,
  `PORT`, or `CLIENT_ORIGIN` are missing → throw with a clear message so the
  process exits non-zero; assert `JWT_SECRET.length >= 32`.
- `app.ts` — creates the Express app **without listening**: `cors({ origin: CLIENT_ORIGIN, credentials: true })`,
  `express.json()`, `cookieParser()`, mounts `routes/authRouter` (added T7), a
  JSON 404 fallback, and the error middleware (added T6). Exports `app`.
- `index.ts` — loads config (fail-fast), then `mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })`,
  logs `Connected to MongoDB`, then `app.listen(PORT)`; on connect error prints a
  clear message and `process.exit(1)`.
**Acceptance criteria**: with required vars present, `npm run dev` boots and prints
`Connected to MongoDB` + `Server listening on http://localhost:5000`; with
`MONGO_URI` removed from `.env`, the process exits non-zero immediately with a
fail-fast message before any listen.
**Dependencies**: T2.

### T4 — User model + password hashing

**Files**: `server/src/models/User.ts`
**Implement**:
- Mongoose schema: `name` (String, required, trim, maxLength 100),
  `email` (String, required, unique, lowercase, trim), `password` (String, required).
- `password` field with `select: false`.
- Pre-save hook: if `!this.isModified('password')` skip; else
  `this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS)`.
- Export `User` model; type the plaintext write path so the hook operates on a
  doc whose password may be plaintext pre-hash.
**Acceptance criteria**: `npx tsc --noEmit` passes; a booted server that creates
a user via `mongoose` has a `$2...`-prefixed hash in the `password` field and
plaintext is never persisted.
**Dependencies**: T3.

### T5 — Response envelope + error middleware + zod validation middleware

**Files**: `server/src/utils/response.ts`, `server/src/middleware/errorHandler.ts`, `server/src/middleware/validate.ts`, `server/src/utils/apiError.ts`
**Implement**:
- `utils/response.ts` — `success(res, data, status = 200)` and `fail(res, status, message, code)`
  helpers producing the `{ success, data?/error? }` envelope.
- `utils/apiError.ts` — `AppError` class with `statusCode`, public `message`, `code`.
- `middleware/errorHandler.ts` — centralized 4-arg handler: `AppError` → its
  status + envelope; `mongoose DuplicateKeyError` (E11000) → `409 DUPLICATE_EMAIL`;
  everything else → `500` generic `{ message: "Internal server error", code: "INTERNAL_ERROR" }`,
  full details `console.error` only. Express 5 forwards async rejections here
  automatically (no wrapper needed).
- `middleware/validate.ts` — factory `validate(schema)` that runs `schema.safeParse(req.body)`;
  on failure → `400 { message: "Validation failed", code: "VALIDATION_ERROR" }`
  and call `next()`, never touch the DB.
**Acceptance criteria**: `tsc --noEmit` passes; errorHandler mounted in
`app.ts` (T3) returns the envelope for a thrown AppError and a 500 for unknown
errors; registered on `app.ts` 404 fallback.
**Dependencies**: T3.

### T6 — Register API

**Files**: `server/src/routes/auth.ts`, `server/src/controllers/auth.ts`, `server/src/services/authService.ts`, `server/src/routes/index.ts` (optional router assembler)
**Implement**:
- `zod` register schema: `name` trim 1–100; `email` trim + lowercase + email
  format; `password` min 6. Login schema too (T7).
- `authService.register(name, email, password)`: check existing email → if found
  throw `AppError(409, "Email already registered", "DUPLICATE_EMAIL")`; else
  `User.create(...)` and return the sanitized user `{ id, name, email }` **without
  the hash**. Wrap the unique-index race (E11000 via errorHandler) as well.
- `authController.register`: mount `validate(registerSchema)`, call service, reply
  `201 { success: true, data: { id, name, email } }`. No token on register.
- `routes/auth.ts`: `router.post('/register', ...)`, `router.post('/login', ...)`
  (T7), `router.get('/me', authenticate, ...)` (T9), `router.post('/logout', ...)` (T9);
  mounted at `/api/auth` in `app.ts`.
**Acceptance criteria** (curl against running server):
`201` + envelope user for valid body; `400 VALIDATION_ERROR` for short password /
bad email / missing name; `409 DUPLICATE_EMAIL` on second registration; the
response body contains no `password` key. Verify in Atlas that only a bcrypt hash
was stored.
**Dependencies**: T4, T5.

### T7 — Login API + JWT + httpOnly cookie

**Files**: `server/src/utils/jwt.ts` (sign/verify helpers), extension of `server/src/controllers/auth.ts` + `server/src/services/authService.ts`
**Implement**:
- `utils/jwt.ts` — `sign(userId)` → `jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES })`;
  `verify(token)` → payload or throws.
- `authService.login(email, password)`: find user **by email with password
  selected** (password has `select:false`, so query must `.select('+password')`);
  if no user or `!bcrypt.compare` → throw `AppError(401, "Invalid credentials", "INVALID_CREDENTIALS")`
  (same message for both — no enumeration).
- `authController.login`: validate → service → `jwtSign` → `res.cookie(COOKIE_NAME, token, {
  httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production', maxAge: ... })`.
  Respond `200 { success: true, data: { user: { id, name, email } } }`.
- `maxAge` matches `JWT_EXPIRES` (parse `1h` → 3600s or define `JWT_EXPIRES_MS`).
**Acceptance criteria**: correct credentials → `200` + `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax`
and a user object with no hash; wrong password → generic `401 INVALID_CREDENTIALS`;
unknown email → same `401`; cookie is `HttpOnly` (not readable by JS).
**Dependencies**: T6.

### T8 — Auth middleware + protected endpoint + logout

**Files**: `server/src/middleware/authenticate.ts`, add `GET /api/auth/me` + `POST /api/auth/logout` to controller/routes
**Implement**:
- `authenticate.ts` — `(req, res, next)`: token from `req.cookies[COOKIE_NAME]`;
  if absent → `fail(res, 401, "Unauthorized", "UNAUTHORIZED")`. Else `verify(token)`;
  on error (expired/tampered) → same `401`. Set `req.userId = payload.sub`; `next()`.
- declare request typing: extend Express `Request` with `userId?: string`.
- `GET /api/auth/me` (behind `authenticate`) → load user by `req.userId`, return
  `200 { success: true, data: { id, name, email } }`; missing user → `401`.
- `POST /api/auth/logout` (public) → `res.clearCookie(COOKIE_NAME, { sameSite: 'lax' })`,
  `200 { success: true, data: {} }`.
**Acceptance criteria**: no cookie → `401 UNAUTHORIZED`; valid cookie →
`200` with user; tampered/expired token → `401`; `/me` response omits password;
logout clears cookie and `/me` then returns `401`.
**Dependencies**: T7.

### T9 — Client workspace scaffold (Vite + React + TS strict)

**Files**: `client/package.json`, `client/tsconfig.json`, `client/vite.config.ts`,
`client/index.html`, `client/.env.example`, `client/.env`, `client/src/main.tsx`, `client/src/vite-env.d.ts`, `client/src/App.tsx` (placeholder)
**Implement**:
- Scaffold with `npm create vite@latest client -- --template react-ts` then **pin**
  exact versions in `client/package.json` per research §0.2 (`react@19.2.8`,
  `react-dom@19.2.8`, `vite@8.2.2`, `@vitejs/plugin-react@6.1.1`,
  `typescript@7.0.2`, `@types/react@19.2.18`, `@types/react-dom@19.2.5`) and add
  `react-router-dom@7.18.2`. Enable `strict: true` + `noUnusedLocals` in tsconfig.
- Delete demo boilerplate (`App.css` assets, `src/assets` demo svgs, default
  `App.tsx` content) — replace with a minimal `<Routes>` placeholder (T13 fills it).
- `vite.config.ts`: `@vitejs/plugin-react` only (no proxy needed; API base from env).
- `.env.example` → `VITE_API_URL=http://localhost:5000` (committed); copy to `.env`.
**Acceptance criteria**: `npm install` in `client/` and `npm run dev` boots Vite
on `http://localhost:5173` showing the placeholder; `npx tsc --noEmit` passes.
**Dependencies**: T1 (and T7 available for live verification in later tasks).

### T10 — Client API layer (single fetch owner)

**Files**: `client/src/services/api.ts`
**Implement**:
- Base URL from `import.meta.env.VITE_API_URL` (typed via a `client/src/vite-env.d.ts`
  `ImportMetaEnv` augmentation).
- `apiGet(path)` / `apiPost(path, body)` helpers: always
  `credentials: 'include'`, `Content-Type: application/json`, parse the envelope.
  On `!res.ok` throw an error carrying the server `error.message` + `code` (or a
  generic network message for `fetch` rejection).
- Typed wrappers: `register(name, email, password)`, `login(email, password)`,
  `getMe()`, `logout()`.
- No other module calls `fetch`.
**Acceptance criteria**: `tsc --noEmit` passes; page code can call `login()` and
receive typed `{ user }` or a decoded error with `Invalid credentials`.
**Dependencies**: T9.

### T11 — AuthContext + useAuth hook

**Files**: `client/src/context/AuthContext.tsx`, `client/src/hooks/useAuth.ts`
**Implement**:
- `AuthProvider`: state `{ user, loading }`; methods `login()`, `register()`,
  `logout()`, and `refreshUser()`. On mount call `refreshUser()` → `getMe()`;
  on success set user, on 401/user-not-found clear user; always set `loading=false`.
- `login(email, password)` → `api.login`, set `user`, resolve true.
  `register(...)` → `api.register`, returns resolved (spec: no auto-login;
  redirect to `/login`). `logout()` → `api.logout()`, clear user.
- `useAuth.ts` — re-export `useAuth()` reading the context with an error if used
  outside the provider.
- `main.tsx`: wrap `<App/>` in `<BrowserRouter><AuthProvider>`.
**Acceptance criteria**: `tsc --noEmit` passes; during `loading`, consumer sees
`{ user: null, loading: true }`; after `getMe()` resolves, `user` populated from
the cookie without manual token handling; login error surfaces as thrown message.
**Dependencies**: T10.

### T12 — ProtectedRoute + route definitions + Dashboard

**Files**: `client/src/components/ProtectedRoute.tsx`, `client/src/pages/Dashboard.tsx`, replace placeholder in `client/src/App.tsx`
**Implement**:
- `ProtectedRoute`: `const { user, loading } = useAuth()`; `loading` → spinner;
  `!user` → `<Navigate to="/login" replace />`; else `children` or `<Outlet>`.
- Also a reverse guard for public pages: if authenticated, `<Navigate to="/" />`.
- `App.tsx` routes: `/login` (public), `/register` (public), `/` wrapped in
  `<ProtectedRoute>` → `Dashboard`, `*` → `<Navigate to="/" />`.
- `Dashboard.tsx` minimal: "Welcome, {user.name}" + a `Logout` button calling
  `auth.logout()` then `navigate('/login')`; small nav placeholder (Links to
  Dashboard) to prove auth-state-driven UI.
**Acceptance criteria**: no cookie on `/` → redirected to `/login` (after
loading resolves); with cookie → Dashboard shows name; Logout returns to `/login`
and `/` redirects again; refresh on `/` keeps the session.
**Dependencies**: T11.

### T13 — Register page

**Files**: `client/src/pages/Register.tsx`
**Implement**:
- Fields: `name`, `email`, `password`, `confirmPassword`.
- Client validation (mirror server): name non-empty; email format; password ≥ 6;
  confirm === password. Show inline errors; **no request sent** when invalid.
- Submit: disable button while pending; call `auth.register`; on success show
  success message and `navigate('/login')`; on failure map errors inline
  (409 → "Email already registered", 400 → server message).
- If already authenticated → redirect `/`.
**Acceptance criteria**: valid submit creates account and redirects to login
(verified against live API); invalid email/short password/mismatch show inline
errors and never fire a request; duplicate email shows "Email already registered".
**Dependencies**: T11, T12.

### T14 — Login page

**Files**: `client/src/pages/Login.tsx`
**Implement**:
- Fields: `email`, `password`; validation mirrors server (email format, password
  non-empty).
- Submit: disable while pending; `auth.login`; on failure show inline
  "Invalid credentials" (from server message); on success `navigate('/')`.
- If already authenticated → redirect `/`.
**Acceptance criteria**: correct credentials → Dashboard with name; wrong
password → inline "Invalid credentials", stays on `/login`; unregistered email →
same generic error; form button shows disabled state while request in flight.
**Dependencies**: T13.

### T15 — Wire basic layout/navigation + polish

**Files**: `client/src/components/Layout.tsx` (optional but recommended), touch `App.tsx`
**Implement**:
- Minimal shared `Layout` with a header showing a nav link (Dashboard) + either
  "Logout" (authenticated) or "Login/Register" links (unauthenticated), rendering
  `<Outlet/>`. Confirm protected vs public navigation is purely auth-state driven.
- Ensure no console errors and no flash of the login page when a session exists
  (loading gate in ProtectedRoute).
**Acceptance criteria**: navigation reflects auth state; refreshing any route
stays correct; no unhandled errors in the console; `tsc --noEmit` clean in `client/`.
**Dependencies**: T14.

### T16 — End-to-end verification + DoD sign-off

**Files**: none (verification only; fix files if a check fails)
**Implement**:
- Run both workspaces from root (`npm run dev`) against real Atlas + local vars.
- Execute every case in §5 Testing Plan below, including `curl` checks for the
  protected endpoint and cookie attributes.
- Verify no plaintext password in Mongo; confirm `.env` files untracked by git
  (`git status` clean of secrets).
- Walk the §6 Definition of Done checklist; only then confirm Day 1 complete.
**Acceptance criteria**: all 12 manual tests pass; DoD checklist fully checked.
**Dependencies**: all of T2–T15.

---

## 3. File Creation Order

Create strictly in this order (each file exists before the next):

```
# Root (T1)
package.json
.gitignore
README.md

# Server (T2 → T8)
server/package.json
server/tsconfig.json
server/.env.example
server/.env                      (manual copy, never committed)
server/src/config/index.ts       (T3)
server/src/app.ts                (T3)
server/src/index.ts              (T3)
server/src/models/User.ts        (T4)
server/src/utils/response.ts     (T5)
server/src/utils/apiError.ts     (T5)
server/src/utils/jwt.ts          (T7)
server/src/middleware/errorHandler.ts  (T5)
server/src/middleware/validate.ts      (T5)
server/src/middleware/authenticate.ts  (T8)
server/src/services/authService.ts     (T6, extended T7)
server/src/controllers/auth.ts         (T6, extended T7/T8)
server/src/routes/auth.ts              (T6, extended T7/T8)
server/src/routes/index.ts             (T6, optional assembler)

# Client (T9 → T15)
client/package.json              (or scaffold first, then pin)
client/tsconfig.json
client/tsconfig.node.json        (scaffold-provided overlay)
client/vite.config.ts
client/index.html
client/.env.example
client/.env                      (manual copy, never committed)
client/src/vite-env.d.ts          (+ ImportMetaEnv augmentation, T10)
client/src/main.tsx
client/src/services/api.ts       (T10)
client/src/context/AuthContext.tsx (T11)
client/src/hooks/useAuth.ts      (T11)
client/src/components/ProtectedRoute.tsx (T12)
client/src/components/Layout.tsx (T15)
client/src/pages/Dashboard.tsx   (T12)
client/src/pages/Register.tsx    (T13)
client/src/pages/Login.tsx       (T14)
client/src/App.tsx               (T12 routes, updated T15)

# Docs (already generated by this planning phase)
specs/001-setup-auth/plan.md
specs/001-setup-auth/research.md
specs/001-setup-auth/data-model.md
specs/001-setup-auth/quickstart.md
specs/001-setup-auth/contracts/auth.openapi.yaml
```

## 4. Environment & Secrets Checklist (manual, developer-owned)

1. **MongoDB Atlas**: create a free cluster + database user; allow network
   access from your IP (or `0.0.0.0/0` for local dev only). Copy connection
   string into `server/.env → MONGO_URI` with
   `.../fitness_tracker` as the DB name.
2. **Generate a JWT secret** (≥ 32 chars) — e.g.
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   → paste into `server/.env → JWT_SECRET`.
3. **Copy env templates**:
   - `cp server/.env.example server/.env` → fill `MONGO_URI`, `JWT_SECRET`;
     verify `PORT=5000`, `JWT_EXPIRES=1h`, `CLIENT_ORIGIN=http://localhost:5173`,
     `BCRYPT_ROUNDS=10`, `COOKIE_NAME=access_token` exist.
   - `cp client/.env.example client/.env` → `VITE_API_URL=http://localhost:5000`.
4. **Never commit secrets**:
   - Confirm `git check-ignore server/.env client/.env` returns both paths.
   - `.env.example` files hold placeholders only (the constitution's
     `JWT_SECRET=replace-with-a-random-string-at-least-32-chars`).
5. **Rotate `JWT_SECRET`** before any future production deployment.
   - Sanity: `git status` shows no `server/.env` / `client/.env` untracked.

## 5. Testing Plan for Day 1 (exact cases — ALL must pass)

Run with both dev servers up (`npm run dev` at root) and a real Atlas URI.

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Register valid name/email/password (≥6) on `/register` | Success message; redirected to `/login` |
| 2 | Register again with the same email | Inline "Email already registered"; no duplicate row in Atlas |
| 3 | Register with invalid email, short password, mismatched confirm | Inline validation errors; **no request sent** (DevTools Network) |
| 4 | Login with those credentials | Redirected to `/` Dashboard; shows name |
| 5 | Login with wrong password | Generic "Invalid credentials"; stays on `/login` |
| 6 | Login with an unregistered email | Same generic "Invalid credentials" |
| 7 | Open `/` in a private window (no cookie) | Redirected to `/login` |
| 8 | After login, refresh `/` | Still authenticated (httpOnly cookie persists) |
| 9 | `curl http://localhost:5000/api/auth/me` with no cookie | `401 { error: { message: "Unauthorized", code: "UNAUTHORIZED" } }` |
| 10 | Click Logout | Cookie cleared; returned to `/login`; `/` redirects again |
| 11 | Remove any required var from `server/.env` and `npm run dev` | Server fails fast (non-zero exit) with clear message |
| 12 | Fresh clone: only `.env.example` + a local Mongo URI → `npm run dev` | Both client & server boot (< 15 min) |

API contract spot-checks via curl (beyond the table): register → `201` with
`data.id/name/email` and **no** `password`; login response header contains
`Set-Cookie: access_token=...; HttpOnly; SameSite=Lax`; second duplicate register
→ `409`; tampered cookie on `/api/auth/me` → `401`.

## 6. Definition of Done (Day 1)

- [ ] Monorepo `client/` + `server/` starts with one root `npm run dev`.
- [ ] MongoDB Atlas connected; `User` persists with **unique email** and a
      **bcrypt hash** (`$2...`), verified in Mongo.
- [ ] `POST /api/auth/register` and `POST /api/auth/login` match the API
      contracts (status codes + `{ success, data?/error? }`), verified with curl.
- [ ] `bcryptjs` hashing verified — no plaintext anywhere (DB, logs, responses).
- [ ] JWT issued on login **as an httpOnly cookie**; `authenticate` middleware
      rejects missing/expired/tampered tokens with `401`.
- [ ] Login and Register pages render, validate, redirect, and error correctly.
- [ ] Protected frontend route (`/`) redirects unauthenticated users to Login;
      loading gate prevents a login flash for real sessions.
- [ ] Single token strategy (httpOnly cookie) documented; `SameSite=Lax`;
      no localStorage token; no secrets in source or git.
- [ ] End-to-end flow passes: register → login → access `/` → refuse access
      when session missing/cleared.
- [ ] All 12 manual tests (§5) pass.
- [ ] `.env.example` complete for both workspaces; a fresh clone boots from it
      plus a local Mongo URI.
- [ ] `git status` shows no `.env`, no secrets, in working tree.

## 7. Out of Scope Reminder (must NOT be built today)

Do **not** expand Day 1 into any of the following (constitution Deferred Scope +
spec §9):

- Refresh tokens / token rotation — single short-lived access token only.
- Email verification, password reset, OAuth/social login.
- Roles & authorization (admin/user) beyond plain authentication.
- Rate limiting, account lockout, brute-force protection (revisit pre-production).
- Full automated test suite (unit/integration) and CI.
- Deployment, production CORS/CSRF hardening beyond the baseline below
  (`sameSite=lax`, allowlist origin, httpOnly/secure cookie).
- Profile editing or any fitness/business domain (workouts, metrics, etc.).
- `helmet`/CSP/strict CSRF tokens are NOT required on Day 1 (documented baseline
  is sufficient); do not add them unless a case in §5 fails without them.

If any of these becomes necessary, it belongs in a **new spec**, not a scope
creep into this plan.