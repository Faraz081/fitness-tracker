# Research: Project Setup & Authentication (Day 1)

**Branch**: `001-setup-auth` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 0 output of `/sp.plan`. All "NEEDS CLARIFICATION" from the plan's
Technical Context are resolved here. Versions verified against the npm registry
on 2026-08-28 with `npm view <pkg> version`.

## 0.1 Constitution Amendment (Decision)

**Context**: Constitution v1.0.0 pinned older major families (React 18 + Vite 5
+ Router v6 + Express 4 + Mongoose 8). `npm view` on 2026-08-28 shows the
current stable registry majors have advanced (React 19, Vite 8, Router 7,
Express 5, Mongoose 9).

**Decision**: Amend constitution to latest stable (approved by user during
planning). Constitution bumped MAJOR to **2.0.0** per governance policy
(Pinned version families redefined = redefinition of Principle II). Spec
version families updated to match.

**Rationale**: The constitution's own rule requires checking `npm view` for the
current stable release, pinning exact versions, and justifying any deliberate
downgrade in Complexity Tracking. Choosing current stable avoids:
- Dead-end tooling (Vite 5 / React 18 are several majors behind and lose
  active fast-fix support in 2026).
- Risk of the plan scaffolding a stack the ecosystem already treats as legacy.
- Extra Complexity-Tracking entries for every downgraded package.

**Alternatives considered**:
- *Keep pinned majors* (React 18 / Vite 5 / Express 4 / Mongoose 8): would avoid
  an amendment but force ~12 downgrades to be justified and deliberately install
  18-month-old tooling. Rejected by user decision.
- *Upgrade only some packages*: mixing majors violates "pin critical choices"
  determinism. Rejected — pin the family once, wholesale.

## 0.2 Pinned Versions (verified 2026-08-28)

Pins below are the exact `npm view <pkg> version` `latest` values on the day of
planning. Both workspaces run TypeScript in `strict` mode.

| Package                | Workspace | Version  | Note |
|------------------------|-----------|----------|------|
| react                  | client    | 19.2.8   | React 19 stable line |
| react-dom              | client    | 19.2.8   | |
| react-router-dom       | client    | 7.18.2   | Router v7; keep to data-router-lite / JSX routes |
| vite                   | client    | 8.2.2    | Vite 8 (Rolldown bundler) |
| @vitejs/plugin-react   | client    | 6.1.1    | peer-compatible with Vite 8 |
| typescript             | both      | 7.0.2    | Native `tsc`; see 0.3 |
| @types/react           | client    | 19.2.18  | |
| @types/react-dom       | client    | 19.2.5   | |
| @types/node            | server    | 24.13.3  | matched to Node 24 LTS runtime |
| express                | server    | 5.2.1    | Express 5; wildcard route syntax changed |
| mongoose               | server    | 9.9.4    | Mongoose 9 |
| jsonwebtoken           | server    | 9.0.3    | JWT sign/verify |
| bcryptjs               | server    | 3.0.3    | pure-JS hashing (no native build on Windows) |
| zod                    | server    | 4.4.3    | request-body validation |
| cors                   | server    | 2.8.6    | allowlist origin |
| dotenv                 | server    | 17.4.2   | env loading |
| cookie-parser          | server    | 1.4.7    | httpOnly cookie parsing |
| @types/express         | server    | 5.0.6    | Express 5 types |
| @types/jsonwebtoken    | server    | 9.0.10   | |
| @types/cors            | server    | 2.8.19   | |
| @types/cookie-parser   | server    | 1.4.10   | |
| tsx                    | server    | 4.23.12  | dev runner (ESM + TS) |
| typescript             | both      | 7.0.2    | strict mode on both workspaces |
| concurrently           | root      | 10.0.5   | `npm run dev` orchestration |

Runtime: **Node.js v24.18.0** (installed; matching active LTS line).

## 0.3 TypeScript 7 Adopted — Compatibility Notes

**Decision**: Use TypeScript 7.0.2 (`tsc` native) for both workspaces.

**Rationale**: TS 7.0 (GA 2026-07-08) is a Go-native port with CLI `tsc`
behavior considered identical to TS 6 for code that compiles cleanly. Vite (8)
and plain Express type-check through `tsc` with no compiler API dependency, so
they work immediately. TS 7 makes `strict`/`esnext` the defaults — matching our
constitution's strict requirement.

**Alternatives considered / caveats**:
- TS 7 ships no stable programmatic API yet (7.1). This only affects plugins
  that embed the compiler (typescript-eslint, Vue/Astro tooling) — none are in
  Day 1 scope (no lint step, no framework plugin tooling).
- If any editor/plugin requires the old API, the sanctioned bridge is
  `@typescript/typescript6` (ships a `tsc6` binary + re-exports TS 6 API).
  Fallback documented here; not installed on Day 1.
- `@types/node` pinned to **24.13.3**, not the registry's newer `26.x`, to match
  the runtime major and avoid type drift.

## 0.4 Versioned Behavior Changes That Affect Implementation

- **Express 5** (`5.2.1`):
  - Route wildcard syntax is now `/*splat` (e.g. `app.all('*', …)` replacement);
    the 404/anonymous fallback must use `app.use(...)` with a named param or
    `{/*splat}`. Simple named routes (`/api/auth/*`) are unaffected.
  - `req.body` is only parsed when a body-parsing middleware
    (`express.json()`) is mounted (same as before; keep mounted).
  - Async error propagation: rejected promises in route handlers are forwarded
    to error middleware automatically — no wrapper function needed (improves on
    Express 4).
- **Vite 8**: scaffold with `npm create vite@latest -- --template react-ts`
  produces a Rolldown-based build; plugin config is unchanged for our needs.
- **React Router v7**: Minimum viable usage for Day 1 is the declarative JSX
  `<Routes>/<Route>` API and `createBrowserRouter`. The spec's table (public
  vs protected) maps to `<Route element={...}>` under two container routes.
  `<Navigate>` / `useNavigate` / `Outlet` are unchanged.

## 0.5 Token Storage Strategy (Chosen: httpOnly Cookie)

**Decision**: Single strategy — **httpOnly cookie** (`COOKIE_NAME=access_token`),
constitution-preferred. No localStorage token. Client sends
`credentials: 'include'` on every fetch; the cookie travels automatically.

- `httpOnly: true` — JS cannot read the token (XSS-safe).
- `sameSite: 'lax'` — mitigates the dominant CSRF class for cross-site POSTs.
- `secure: NODE_ENV === 'production'` — plain HTTP in dev.
- `maxAge` mirrors token expiry (`JWT_EXPIRES`).
- CORS `origin: CLIENT_ORIGIN` (single origin, no `*`) with `credentials: true`.

**Rationale**: constitution Principle III + spec §6 prefer httpOnly; safest
against XSS token theft while dev-proxying cookie flow is a solved problem
(credentials include + cors allowlist).

## 0.6 MongoDB Atlas Connectivity Notes

- Connection string lives in `server/.env` → `MONGO_URI`; `dotenv` loads it.
- Mongoose 9 `mongoose.connect(uri, ...)` with server selection timeout so a bad
  URI fails fast at startup (not hangs). On failure server exits non-zero.
- The developer provides a real Atlas URI locally; `.env.example` keeps a
  placeholder (constitution rule: fresh clone boots from example + local URI).
- `User.email` gets a unique index; duplicate register inserts raise a Mongo
  `E11000` key error which the controller maps to `409 DUPLICATE_EMAIL`.

## 0.7 Security Decisions Recap (from constitution/spec, no new research)

- `bcryptjs` hash with `BCRYPT_ROUNDS >= 10`, pre-save hook; never log or return
  the hash.
- JWT payload only `{ sub: userId }`, signed with `JWT_SECRET >= 32 chars`,
  expiry `JWT_EXPIRES` (default `1h`).
- `zod` validation before any DB access; generic public error text
  (`Validation failed`, `Invalid credentials`, `Unauthorized`).
- Central error-handling middleware; 500 for unexpected with detail to server
  log only.
- Envelope `{ success, data?, error?: { message, code } }` on every endpoint.

## 0.8 Unresolved / Out of Scope (registered, not blockers)

- Rate limiting / lockout — deferred (constitution Deferred Scope).
- CSRF token — `sameSite=lax` chosen as Day 1 baseline per spec §3; hardening
  deferred.
- Refresh tokens / rotation — deferred.