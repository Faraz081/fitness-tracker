---

description: "Task list for Day 1 — Project Setup & Authentication (001-setup-auth)"
---

# Tasks: Project Setup & Authentication (Day 1)

**Branch**: `001-setup-auth` | **Date**: 2026-08-28
**Input**: Design documents from `/specs/001-setup-auth/plan.md` (required), `spec.md` (required), `research.md` (`./research.md`), `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: NONE generated — the spec defines manual end-to-end verification only (12 manual cases in the final Day 1 Verification task). No automated unit/contract tests are in scope (deferred per constitution).

**Organization**: Tasks are grouped into Setup → Foundational → User Stories (US1 register, US2 login, US3 protected access) → Polish & Cross-Cutting, so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story?] [MANUAL?] Description with file path`

- **[P]**: Can run in parallel (different files, no open dependencies)
- **[Story]**: User story this task serves (`US1`, `US2`, `US3`)
- **[MANUAL]**: Human-performed step (no code); the agent must cue the human
- Every checklist line is followed by a detail block: **Files**, **Depends on**, **Acceptance**, **Complexity** (S/M/L)

## Path Conventions (per plan.md §Project Structure)

- **Root**: `./package.json`, `./.gitignore`, `./README.md`
- **Server**: `server/src/…`, `server/.env`, `server/.env.example`, `server/package.json`, `server/tsconfig.json`
- **Client**: `client/src/…`, `client/.env`, `client/.env.example`, `client/package.json`, `client/tsconfig.json`, `client/vite.config.ts`
- Pinned versions are **exact** from `research.md` §0.2 (verified 2026-08-28) — install those, not ranges.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo + workspace shells + real Mongo connection details

- [ ] T001 Create root monorepo scaffolding at `./package.json`, `./.gitignore`, `./README.md`
    - **Files**: `./package.json`, `./.gitignore`, `./README.md` (5-line pointer to quickstart.md)
    - **Depends on**: —
    - **Acceptance**: `npm install` at root succeeds; `package.json` defines `"install-all"` (`npm install --prefix client && npm install --prefix server`) and `"dev"` (`concurrently -n server,client "npm run dev --prefix server" "npm run dev --prefix client"`) with dev dep `concurrently@10.0.5` (exact); `.gitignore` covers `node_modules/`, `.env`, `dist/`, `build/`, logs.
    - **Complexity**: S

- [ ] T002 Create server workspace shell at `server/package.json`, `server/tsconfig.json`, `server/.env.example`
    - **Files**: `server/package.json`, `server/tsconfig.json`, `server/.env.example`
    - **Depends on**: T001
    - **Acceptance**: deps pinned per research.md §0.2 (`express@5.2.1`, `mongoose@9.9.4`, `jsonwebtoken@9.0.3`, `bcryptjs@3.0.3`, `zod@4.4.3`, `cors@2.8.6`, `dotenv@17.4.2`, `cookie-parser@1.4.7`; dev `typescript@7.0.2`, `tsx@4.23.12`, `@types/node@24.13.3`, `@types/express@5.0.6`, `@types/jsonwebtoken@9.0.10`, `@types/cors@2.8.19`, `@types/cookie-parser@1.4.10`); scripts `dev`/`build`/`start`; `tsconfig.json` `strict: true`; `.env.example` has all 8 vars with placeholders from plan.md §4 (no real secrets).
    - **Complexity**: M

- [ ] T003 [P] [MANUAL] Provision MongoDB Atlas cluster + database user; record connection string
    - **Files**: none (values go into `server/.env` at T005)
    - **Depends on**: —
    - **Acceptance**: free-tier cluster reachable; database user created; network access allowed; connection string of form `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fitness_tracker` captured for T005. Test with a quick `mongosh`/compass connect if available.
    - **Complexity**: S

- [ ] T004 Create client workspace shell at `client/` (Vite react-ts template, exact pinning, strict TS)
    - **Files**: `client/package.json`, `client/tsconfig.json`, `client/tsconfig.node.json`, `client/vite.config.ts`, `client/index.html`, `client/.env.example`, `client/.env`, `client/src/main.tsx`, `client/src/vite-env.d.ts`, `client/src/App.tsx` (placeholder)
    - **Depends on**: T001
    - **Acceptance**: scaffolded via `npm create vite@latest client -- --template react-ts`; exact pins per research.md §0.2 (`react@19.2.8`, `react-dom@19.2.8`, `react-router-dom@7.18.2`, `vite@8.2.2`, `@vitejs/plugin-react@6.1.1`, `typescript@7.0.2`, `@types/react@19.2.18`, `@types/react-dom@19.2.5`); `strict: true`; demo boilerplate + assets removed; `.env.example` = `VITE_API_URL=http://localhost:5000` (committed), `.env` local copy; `npm run dev` boots at `http://localhost:5173`; `npx tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T005 [MANUAL] Author `server/.env` from `.env.example` with real secrets
    - **Files**: `server/.env` (git-ignored, never committed)
    - **Depends on**: T002, T003
    - **Acceptance**: `MONGO_URI` = real Atlas string from T003; `JWT_SECRET` = random ≥ 32 chars (generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`); `NODE_ENV=development`, `PORT=5000`, `JWT_EXPIRES=1h`, `CLIENT_ORIGIN=http://localhost:5173`, `BCRYPT_ROUNDS=10`, `COOKIE_NAME=access_token` present. User confirmed values; agent confirms the file is git-ignored (`git check-ignore server/.env`).
    - **Complexity**: S

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server config, response/error plumbing, User model, and app shell — REQUIRED before any user story is implementable.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Create server config with fail-fast env validation at `server/src/config/index.ts`
    - **Files**: `server/src/config/index.ts`
    - **Depends on**: T002, T005
    - **Acceptance**: loads `dotenv`; exports typed constants `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_ORIGIN`, `BCRYPT_ROUNDS`, `COOKIE_NAME`; throws with a clear message if `MONGO_URI`, `JWT_SECRET`, `PORT`, or `CLIENT_ORIGIN` are missing (process exits non-zero); throws if `JWT_SECRET.length < 32`. Verify: remove a var from `.env`, start, expect fail-fast exit.
    - **Complexity**: S

- [ ] T007 Create response envelope + typed API error at `server/src/utils/response.ts`, `server/src/utils/apiError.ts`
    - **Files**: `server/src/utils/response.ts`, `server/src/utils/apiError.ts`
    - **Depends on**: T006
    - **Acceptance**: `success(res, data, status=200)` returns `{ success: true, data }`; `fail(res, status, message, code)` returns `{ success: false, error: { message, code } }`; `AppError` class carries `statusCode`, public `message`, `code`. `npx tsc --noEmit` passes.
    - **Complexity**: S

- [ ] T008 Create centralized error handler + zod validation middleware at `server/src/middleware/errorHandler.ts`, `server/src/middleware/validate.ts`
    - **Files**: `server/src/middleware/errorHandler.ts`, `server/src/middleware/validate.ts`
    - **Depends on**: T006, T007
    - **Acceptance**: `errorHandler` maps `AppError` → its status + envelope; Mongoose E11000 duplicate-key → `409 DUPLICATE_EMAIL`; anything else → `500 INTERNAL_ERROR` generic message with full details `console.error` only; `validate(schema)` runs `schema.safeParse(req.body)`, on failure calls `next(AppError 400 VALIDATION_ERROR "Validation failed")` and never touches DB. `tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T009 Create User model with bcrypt pre-save hook at `server/src/models/User.ts`
    - **Files**: `server/src/models/User.ts`
    - **Depends on**: T006
    - **Acceptance**: schema per data-model.md — `name` (String, required, trim, maxLength 100), `email` (String, required, unique, lowercase, trim), `password` (String, required, `select: false`); pre-save hook hashes with `bcrypt.hash(this.password, BCRYPT_ROUNDS)` only when `isModified('password')`. Verify: `tsc --noEmit` passes; a booted server storing a user persists a `$2…` bcrypt hash, never plaintext.
    - **Complexity**: S

- [ ] T010 Create Express app shell, server entry, and auth router skeleton
    - **Files**: `server/src/app.ts`, `server/src/index.ts`, `server/src/routes/auth.ts`
    - **Depends on**: T006, T007, T008, T009
    - **Acceptance**: `app.ts` wires `cors({ origin: CLIENT_ORIGIN, credentials: true })`, `express.json()`, `cookieParser()`, mounts `authRouter` at `/api/auth`, JSON 404 fallback, `errorHandler` last; `index.ts` connects Mongoose (`serverSelectionTimeoutMS: 10000`), logs `Connected to MongoDB`, then `app.listen(PORT)`; on connect error prints clear message + `process.exit(1)`; empty `authRouter` exported from `routes/auth.ts`. Verify: `npm run dev` boots with both log lines; bad `MONGO_URI` exits non-zero.
    - **Complexity**: M

**Checkpoint**: Foundation ready — server boots, requests flow through the error handler, User model exists. User story implementation can now begin.

---

## Phase 3: User Story 1 — Account Registration (Priority: P1) 🎯 MVP

**Goal**: A new user registers with name/email/password; the account is stored with a hashed password and the user is confirmed and routed toward login — without any other feature built.

**Independent Test**: A fresh user opens `/register`, submits valid details, and sees a success message then a redirect to a login placeholder — verifiable without Login or protected routes. API verified alone with curl: valid → `201`, invalid → `400`, duplicate → `409`.

### Implementation for User Story 1

- [ ] T011 [US1] Implement Register API — `POST /api/auth/register` in `server/src/controllers/auth.ts`, `server/src/services/authService.ts`, wire into `server/src/routes/auth.ts`
    - **Files**: `server/src/controllers/auth.ts`, `server/src/services/authService.ts`, `server/src/routes/auth.ts`
    - **Depends on**: T008, T009, T010
    - **Acceptance**: zod register schema (`name` trim 1–100, `email` trim+lowercase+email, `password` min 6); service checks existing email → `AppError 409 DUPLICATE_EMAIL "Email already registered"`, else `User.create` and returns `{ id, name, email }` with NO password/hash; controller responds `201 { success: true, data: { id, name, email } }`. curl: valid → 201 (no password key in body); short password/bad email → 400 `VALIDATION_ERROR`; second identical email → 409; Atlas shows bcrypt hash.
    - **Complexity**: M

- [ ] T012 [US1] Create client API layer `client/src/services/api.ts` (base + `register` only)
    - **Files**: `client/src/services/api.ts`, augment `client/src/vite-env.d.ts` (`ImportMetaEnv`)
    - **Depends on**: T004
    - **Acceptance**: base URL from `import.meta.env.VITE_API_URL`; every call uses `credentials: 'include'` + JSON headers; envelope parsed; non-2xx throws error carrying server `error.message` + `code`; fetch-network failure throws friendly message; exports typed `register(name, email, password)`. This module is the ONLY `fetch` caller. `tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T013 [US1] Create AuthContext shell with `register()` at `client/src/context/AuthContext.tsx` + `client/src/hooks/useAuth.ts`, bootstrap in `client/src/main.tsx`
    - **Files**: `client/src/context/AuthContext.tsx`, `client/src/hooks/useAuth.ts`, `client/src/main.tsx`
    - **Depends on**: T004, T012
    - **Acceptance**: `AuthProvider` holds `{ user, loading }`, exposes `register()` (calls api, sets nothing/no auto-login per spec) and `logout()`/`login()`/`refreshUser()` placeholders (implemented in US2/US3 — must not be called yet); `useAuth()` errors outside provider; `main.tsx` wraps app in `<BrowserRouter>` + `<AuthProvider>`. `tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T014 [US1] Create Register page `client/src/pages/Register.tsx` + routes in `client/src/App.tsx` (including a placeholder `/login`)
    - **Files**: `client/src/pages/Register.tsx`, `client/src/App.tsx`
    - **Depends on**: T013
    - **Acceptance**: fields `name`/`email`/`password`/`confirmPassword`; client validation mirrors server (name non-empty, email format, password ≥ 6, confirm matches) with inline errors and NO request when invalid; submit disabled while pending; success message then `navigate('/login')`; failure maps 409 → "Email already registered", 400 → server message. `App.tsx` routes: `/register` → Register, `/login` → inline "Login coming soon" placeholder (replaced in T018); fallback `*` → `/register` (until `/` exists). `tsc --noEmit` passes.
    - **Complexity**: M

**Checkpoint**: User Story 1 complete — registration works independently end-to-end (UI + API + persistence). RUN the Independent Test now before proceeding.

---

## Phase 4: User Story 2 — User Login (Priority: P1)

**Goal**: A registered user logs in with email/password, receives an authenticated session (httpOnly JWT cookie), and lands on a simple authenticated welcome view showing their name.

**Independent Test**: With an account already present (from US1), a user logs in with correct credentials and lands on a `Dashboard` placeholder showing their name; wrong password or unknown email yields a generic "Invalid credentials" and they stay on `/login`.

### Implementation for User Story 2

- [ ] T015 [US2] Implement Login API + JWT + httpOnly cookie — `POST /api/auth/login`
    - **Files**: `server/src/utils/jwt.ts`, extend `server/src/services/authService.ts`, `server/src/controllers/auth.ts`, `server/src/routes/auth.ts`
    - **Depends on**: T011
    - **Acceptance**: `utils/jwt.ts` — `sign(userId)` = `jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })` (payload `sub` ONLY), `verify(token)` throws on invalid/expired; service finds user by email (`.select('+password')`), `bcrypt.compare`, and throws `AppError 401 INVALID_CREDENTIALS "Invalid credentials"` for unknown email OR wrong password (same message); controller sets cookie `res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production', maxAge: <JWT_EXPIRES> })` and returns `200 { success: true, data: { user: { id, name, email } } }` (no token/hash in body). curl: correct → 200 + `Set-Cookie: access_token=…; HttpOnly; SameSite=Lax`; wrong password / unknown email → identical 401.
    - **Complexity**: M

- [ ] T016 [US2] Add `login()` wrapper to `client/src/services/api.ts`
    - **Files**: `client/src/services/api.ts`
    - **Depends on**: T012
    - **Acceptance**: `login(email, password)` posts to `/api/auth/login`, returns typed `{ user }` (cookie handled automatically via `credentials: 'include'`); throws decoded server error otherwise. `tsc --noEmit` passes.
    - **Complexity**: S

- [ ] T017 [US2] Add `login()` to AuthContext at `client/src/context/AuthContext.tsx`
    - **Files**: `client/src/context/AuthContext.tsx`
    - **Depends on**: T013, T016
    - **Acceptance**: `login(email, password)` calls api.login, sets `user` on success, returns/thrown on failure. `tsc --noEmit` passes.
    - **Complexity**: S

- [ ] T018 [US2] Create Login page `client/src/pages/Login.tsx` + welcome placeholder view at `/` in `client/src/App.tsx`
    - **Files**: `client/src/pages/Login.tsx`, `client/src/pages/Dashboard.tsx` (placeholder), `client/src/App.tsx`
    - **Depends on**: T017
    - **Acceptance**: Login fields `email`/`password` with client validation (email format, password non-empty), submit disabled while pending, inline "Invalid credentials" on 401 (from server message), success → `navigate('/')`; replaces the login placeholder route. `/` renders a minimal `Dashboard.tsx` placeholder showing `user.name` (no protection yet — protected access is US3). `tsc --noEmit` passes.
    - **Complexity**: M

**Checkpoint**: User Story 2 complete — login flow works independently (UI + API + JWT + cookie). RUN the Independent Test now.

---

## Phase 5: User Story 3 — Protected Access & End-to-End Flow (Priority: P2)

**Goal**: Sessions restore across refresh, protected resources refuse unauthenticated access at BOTH layers, and logout returns the user to Login. This ties the full register → login → protected → refused flow together.

**Independent Test**: After login, refreshing the protected page keeps the session; opening it with no cookie redirects to `/login`; the backend returns `401` without a session cookie; logout clears the session and blocks `/`.

### Implementation for User Story 3

- [ ] T019 [US3] Create backend `authenticate` middleware at `server/src/middleware/authenticate.ts`
    - **Files**: `server/src/middleware/authenticate.ts` (extend `Request` typing)
    - **Depends on**: T015
    - **Acceptance**: reads token from `req.cookies[COOKIE_NAME]`; absent/invalid/expired → `fail(res, 401, "Unauthorized", "UNAUTHORIZED")` (via `next`); on success sets `req.userId = payload.sub` and calls `next()`. Declare `userId?: string` on Express `Request`.
    - **Complexity**: S

- [ ] T020 [US3] Add protected `GET /api/auth/me` + `POST /api/auth/logout`
    - **Files**: `server/src/controllers/auth.ts`, `server/src/routes/auth.ts`
    - **Depends on**: T019
    - **Acceptance**: `GET /api/auth/me` behind `authenticate` loads user by `req.userId`, returns `200 { success: true, data: { id, name, email } }` (no hash); missing user → 401. `POST /api/auth/logout` (public) → `res.clearCookie(COOKIE_NAME, { sameSite: 'lax' })`, `200 { success: true, data: {} }`. curl: no cookie → 401; valid cookie → 200; after logout `/me` → 401.
    - **Complexity**: M

- [ ] T021 [US3] Add `getMe()` + `logout()` wrappers to `client/src/services/api.ts`
    - **Files**: `client/src/services/api.ts`
    - **Depends on**: T016, T020
    - **Acceptance**: `getMe()` GETs `/api/auth/me`; `logout()` POSTs `/api/auth/logout`. Both return envelope data; non-2xx decoded. `tsc --noEmit` passes.
    - **Complexity**: S

- [ ] T022 [US3] Add `refreshUser()` + `logout()` to AuthContext with mount-time session restore at `client/src/context/AuthContext.tsx`
    - **Files**: `client/src/context/AuthContext.tsx`
    - **Depends on**: T017, T021
    - **Acceptance**: `refreshUser()` calls `getMe()`, sets `user` on success / clears on 401-or-not-found; called on provider mount; `loading` stays true until it resolves (prevents login-page flash); `logout()` calls api.logout, clears `user`. `tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T023 [US3] Create ProtectedRoute + wire protected/public routes at `client/src/components/ProtectedRoute.tsx`, `client/src/App.tsx`
    - **Files**: `client/src/components/ProtectedRoute.tsx`, `client/src/App.tsx`
    - **Depends on**: T022
    - **Acceptance**: `ProtectedRoute` — `loading` → spinner (no redirect); `!user` → `<Navigate to="/login" replace />`; else renders children/`<Outlet/>`. `App.tsx`: `/` wrapped in ProtectedRoute → Dashboard; `/login` + `/register` get a reverse public guard (if authed → `<Navigate to="/" replace />`); `*` → `<Navigate to="/" replace />`. `tsc --noEmit` passes.
    - **Complexity**: M

- [ ] T024 [US3] Complete Dashboard + auth-state navigation at `client/src/pages/Dashboard.tsx`, `client/src/components/Layout.tsx`, `client/src/App.tsx`
    - **Files**: `client/src/pages/Dashboard.tsx`, `client/src/components/Layout.tsx`, `client/src/App.tsx`
    - **Depends on**: T023
    - **Acceptance**: `Dashboard` shows "Welcome, {user.name}" + Logout button calling `auth.logout()` then `navigate('/login')`; `Layout` header shows Dashboard link + Logout when authed, Login/Register links when not, renders `<Outlet/>`; no console errors; refreshing any route stays correct. `tsc --noEmit` passes.
    - **Complexity**: M

**Checkpoint**: All user stories independently functional. Full end-to-end flow (register → login → protected → refused) now runnable in one session.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hygiene checks + the official Day 1 verification gate.

- [ ] T025 [P] Validate quickstart from a fresh clone at `specs/001-setup-auth/quickstart.md`
    - **Files**: none (verification only)
    - **Depends on**: T024
    - **Acceptance**: Following quickstart.md with only `.env.example` + a local Mongo URI, a fresh checkout boots client + server via one root `npm run dev` (manual test case 12) in under 15 minutes.
    - **Complexity**: M

- [ ] T026 [P] Secrets & hygiene audit in repo root
    - **Files**: `server/.env`, `client/.env`, `.gitignore` (verify only)
    - **Depends on**: T024
    - **Acceptance**: `git check-ignore server/.env client/.env` returns both; `git status` shows no `.env`/secrets; `.env.example` holds placeholders only; `JWT_SECRET` ≥ 32 chars; no plaintext password or hash in any committed file.
    - **Complexity**: S

- [ ] T027 Day 1 Verification — run the full manual test checklist from `specs/001-setup-auth/plan.md` §5 and sign the DoD
    - **Files**: none (verification only — fix any failing files discovered)
    - **Depends on**: T024, T025, T026
    - **Acceptance**: ALL 12 manual tests pass end-to-end against live Atlas + both dev servers:
      1. Register valid → success + redirect to login; 2. duplicate email → error, no dup row; 3. invalid email/short pw/mismatch → inline errors, no request; 4. login correct → Dashboard shows name; 5. wrong password → generic error, stays; 6. unknown email → same generic error; 7. `/` in private window → redirect to login; 8. refresh Dashboard → still authed; 9. `curl /api/auth/me` no cookie → 401; 10. logout → login, `/` blocked; 11. missing server var → fail-fast exit; 12. fresh clone boots from `.env.example`. Then verify plan.md §6 DoD checklist is fully satisfied and record results.
    - **Complexity**: L

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — starts immediately (T003 Atlas provisioning runs parallel).
- **Foundational (Phase 2)**: Depends on Phase 1 (`server/.env` from T005) — BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Phase 2. Sequential in priority order: US1 → US2 → US3 (US2 needs US1's registered account to test; US3 needs US2's session to test; code for a later story MAY start once the earlier story's API is live).
- **Polish (Phase 6)**: Depends on all stories + hygiene checks.

### User Story Dependencies

- **US1 (P1)**: after Foundational; no story deps — MVP.
- **US2 (P1)**: after Foundational; test-depends on US1 (needs an existing account).
- **US3 (P2)**: after Foundational; test-depends on US1 + US2 (needs a session).

### Within Each User Story

- Services before endpoints (register/login/me ordering in T011/T015/T020).
- Server endpoint first, then the client layer that consumes it (US1: T011→T012→T013→T014; US2: T015→T016→T017→T018; US3: T019→T020→T021→T022→T023→T024).
- Story complete before moving to the next priority.

### Parallel Opportunities

- **Phase 1**: T003 (Atlas provisioning) runs parallel with T002/T004; T005 needs T002+T003.
- **Client/server split**: After T004, client-side US1 tasks (T012, T013) can be drafted in parallel with server API work (T011) since contracts are fixed in `contracts/auth.openapi.yaml`; they only need the live API for final verification.
- **US3 backend + client**: T019/T020 (server) parallel with none intra-story, but T021/T022 depend on T020.
- **Phase 6**: T025 and T026 run in parallel; T027 gates on both.

---

## Parallel Example: User Story 1

```bash
# Contract + API + UI can be drafted in parallel once Foundational finishes:
Task: "T011 Implement Register API in server/src/"
Task: "T012 Client API layer in client/src/services/api.ts"
Task: "T013 AuthContext in client/src/context/AuthContext.tsx"
# T014 (Register page + routes) depends on T013.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (register).
4. **STOP and VALIDATE**: registration alone (API + UI + Atlas persistence).
5. Demo/pause point before building login.

### Incremental Delivery

1. Setup + Foundational → foundation running.
2. Add US1 → test independently → checkpoint.
3. Add US2 → test independently → checkpoint.
4. Add US3 → test independently → full register→login→protected→refused flow.
5. Phase 6 → Day 1 Verification (T027) sign-off.

### Execution Notes (from research.md)

- **npm**: use `npm.cmd` on Windows (PowerShell blocks the `npm.ps1` shim).
- **Express 5**: async handler rejections auto-forward to `errorHandler` (no wrapper needed); anonymous 404 must use `app.use(...)` with the final JSON fallback in T010.
- **TypeScript 7**: `tsc` is the native compiler; both workspaces `strict: true`. If an editor/plugin complains about the TS API, the sanctioned fallback is `@typescript/typescript6` (not installed by default).
- **Pins**: always the exact versions in `research.md` §0.2 — never `^latest`.

## Notes

- [P] tasks = different files, no open dependencies.
- [Story] label maps the task to its user story for traceability.
- [MANUAL] tasks require the human (Atlas + `.env`); cue them explicitly.
- Each user story is independently completable and testable per its Independent Test.
- Commit after each task or logical group (user's workflow; do not auto-commit unless asked).
- Stop at any checkpoint to validate the story independently.
- Avoid: vague tasks, same-file conflicts, out-of-scope features (constitution Deferred Scope / plan §7 — no refresh tokens, no roles, no rate limiting, no automated test suite, no business domain).