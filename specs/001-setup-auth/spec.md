# Feature Specification: Project Setup & Authentication (Day 1)

**Feature Branch**: `001-setup-auth`  
**Created**: 2026-08-27  
**Status**: Draft  
**Input**: User description: "Using the Day 1 constitution for Project Setup &
Authentication, create a detailed Specification (Spec) for Day 1 of the MERN
project. Create the MERN project structure, setup React+Vite frontend, setup
Node+Express backend, connect MongoDB Atlas, create User model, create Register
API, create Login API, implement JWT authentication, create Login page, create
Register page, create protected routes, and test authentication."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Account Registration (Priority: P1)

A new user creates an account with name, email, and password. The system
validates the inputs, stores a hashed password, and confirms the account is
created without exposing the password.

**Why this priority**: Registration is the entry point for every user; no
authentication flow can begin without an account. It is independently deliverable
and testable first.

**Independent Test**: A fresh user can open the Register page, enter valid
details, submit, and see a confirmation that the account was created and be able
to proceed to log in — without any other feature built.

**Acceptance Scenarios**:

1. **Given** an empty account database, **When** a user submits register with a
   valid name, a well-formed new email, and a password of 6+ characters,
   **Then** the account is created, the user sees a success confirmation, and no
   entered password is revealed anywhere visibly.
2. **Given** an existing registered email, **When** a user submits register with
   that same email, **Then** registration is rejected with a clear "email already
   registered" message and no duplicate account is created.
3. **Given** the Register page, **When** a user submits with an invalid email or
   a password shorter than 6 characters, **Then** the form shows inline validation
   errors and no request is sent for the invalid submission.

---

### User Story 2 - User Login (Priority: P1)

A registered user logs in with email and password, receives an authenticated
session, and is taken to a protected dashboard area.

**Why this priority**: Login is the core value of Day 1. It depends on the account
existing (User Story 1) but should be independently testable once a user exists.

**Independent Test**: With an account already present, a user can log in with
correct credentials, land on the protected page, and see their name — verifiable
on its own.

**Acceptance Scenarios**:

1. **Given** a registered account with known credentials, **When** the user
   submits the correct email and password on the Login page, **Then** the user is
   authenticated, the protected page is shown, and the login form no longer
   appears.
2. **Given** a registered account, **When** the user submits an incorrect
   password, **Then** login fails with a generic "invalid credentials" message
   and the user stays on the Login page.
3. **Given** an unauthenticated user on a protected page URL, **When** they try
   to access it directly, **Then** they are redirected to the Login page instead
   of the protected content.

---

### User Story 3 - Protected Access & End-to-End Flow (Priority: P2)

Once authenticated, a user can access the protected page, and any request for
protected data without a valid session is refused. This ties the full flow
together (register → login → protected access → refused access).

**Why this priority**: Proves authentication works end-to-end and that protected
resources are safe. It depends on Stories 1 and 2 and is the final Day 1 gate.

**Independent Test**: After login, refreshing the protected page keeps the
session; logging out (or clearing the session) returns the user to Login and
blocks the protected page.

**Acceptance Scenarios**:

1. **Given** an authenticated session, **When** the user refreshes or re-opens
   the protected page, **Then** they remain authenticated and see the protected
   content.
2. **Given** a request to a protected server endpoint with no valid session,
   **When** the request is made, **Then** the server refuses it and returns an
   unauthorized error.
3. **Given** an authenticated session, **When** the user logs out, **Then** the
   session is cleared and the user is returned to the Login page.

---

### Edge Cases

- Whitespace-only name or email (trim before validation).
- Email with leading/trailing spaces (normalize to lowercase).
- Duplicate email race (two concurrent register requests with the same email).
- Password containing only spaces / shorter than the minimum.
- Expired or tampered session when accessing a protected endpoint.
- Login for an email that was never registered.
- Network failure while submitting the login/register form (show a friendly error,
  re-enable the form).
- Unauthenticated user hitting a protected route URL directly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a public Register page that collects name,
  email, and password (with confirm) and validates them client-side before submit.
- **FR-002**: System MUST create a User record with name, a unique email, and a
  securely hashed password; it MUST never store or return the plaintext password.
- **FR-003**: System MUST reject registration when the email is already in use,
  returning a clear duplicate-email error.
- **FR-004**: System MUST provide a public Login page that accepts email and
  password and validates them client-side before submit.
- **FR-005**: System MUST authenticate a user with valid email/password and
  establish an authenticated session that persists across page refreshes.
- **FR-006**: System MUST reject login with invalid credentials using a generic
  "invalid credentials" error that does not reveal whether the email exists.
- **FR-007**: System MUST issue an access token (JWT) on successful login for
  inclusion on protected requests.
- **FR-008**: System MUST protect designated frontend routes so unauthenticated
  users are redirected to the Login page.
- **FR-009**: System MUST protect designated backend endpoints so requests
  without a valid session are rejected with an unauthorized error.
- **FR-010**: System MUST support logging out by clearing the client session and
  returning the user to the Login page.
- **FR-011**: System MUST persist user data in a connected MongoDB Atlas database.
- **FR-012**: System MUST run the full flow (register → login → protected access →
  refused access) successfully in a single local end-to-end test.

### Key Entities *(include if feature involves data)*

- **User**: Represents a registered account owner. Attributes: name (string,
  required), email (string, required, unique), password (hashed, required). A
  User registers, logs in, and is the subject of the session.

## Implementation Specification (Day 1)

### 1. Project Structure

Monorepo with two independent workspaces, per the constitution (Principle I).

```text
Fitness_Tracker/
├── client/                      # React + Vite + TypeScript frontend
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env                     # VITE_API_URL (git-ignored)
│   └── src/
│       ├── main.tsx             # App bootstrap + BrowserRouter
│       ├── App.tsx              # Route definitions (public vs protected)
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── Dashboard.tsx    # Sample protected page (shows user name)
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   └── AuthForm.tsx     # Shared field/validation UI (optional)
│       ├── services/
│       │   └── api.ts           # All fetch calls + base + credentials
│       ├── context/
│       │   └── AuthContext.tsx  # AuthProvider, useAuth
│       └── hooks/
│           └── useAuth.ts       # Re-export sugar over context
├── server/                      # Node + Express + TypeScript backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                     # Server secrets (git-ignored)
│   ├── .env.example             # Committed reference (no secrets)
│   └── src/
│       ├── index.ts             # Entry: loads env, connects DB, listens
│       ├── app.ts               # Express app wiring (middleware, routes, errors)
│       ├── config/
│       │   └── index.ts         # env validation, exports config constants
│       ├── models/
│       │   └── User.ts          # Mongoose schema + model
│       ├── middleware/
│       │   ├── authenticate.ts  # Verifies JWT on protected routes
│       │   ├── errorHandler.ts  # Centralized error responses
│       │   └── validate.ts      # zod validation middleware
│       ├── controllers/
│       │   └── auth.ts          # register, login handlers
│       ├── routes/
│       │   └── auth.ts          # /api/auth router
│       └── utils/
│           ├── jwt.ts           # sign/verify helpers
│           └── response.ts      # success envelope helpers
├── package.json                 # Root: concurrently dev + install-all scripts
├── .gitignore                   # node_modules, .env, dist, build
└── README.md                    # Quickstart
```

Decisions:
- Separate `client/` and `server/` folders in a single repo (no npm workspaces
  hoisting on Day 1; simpler). Root scripts orchestrate both.
- All source in TypeScript with `strict: true` on both workspaces.

### 2. Tech Stack & Versions

Pin exact versions as `latest` at `npm install` time; verify with
`npm view <pkg> version` and record chosen versions in the plan. Expected current
stable families (verify before installing):

- **Frontend (client)**:
  - `react`, `react-dom` (React 19)
  - `react-router-dom` (v7)
  - `vite`, `@vitejs/plugin-react` (Vite 8)
  - `typescript`, `@types/react`, `@types/react-dom`
- **Backend (server)**:
  - `express` (v5)
  - `mongoose` (v9)
  - `jsonwebtoken` (JWT)
  - `bcryptjs` (pure-JS hashing; no native build on Windows)
  - `zod` (request validation)
  - `cors`, `dotenv`
  - `cookie-parser` (to read the httpOnly session cookie)
- **Dev/tooling**:
  - `typescript` (both)
  - `tsx` (server dev runner)
  - `concurrently` (root)
  - `@types/express`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`,
    `@types/cookie-parser`, `@types/node`

State library: **React Context only** (per constitution) — no Zustand/Redux on
Day 1.

### 3. Environment & Configuration

`server/.env` (git-ignored) and `server/.env.example` (committed):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/fitness_tracker
JWT_SECRET=replace-with-a-random-string-at-least-32-chars
JWT_EXPIRES=1h
CLIENT_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=10
COOKIE_NAME=access_token
```

`client/.env` (git-ignored):

```env
VITE_API_URL=http://localhost:5000
```

Configuration rules:
- Server reads env via `dotenv`; validates required vars at startup and exits
  non-zero if `MONGO_URI`, `JWT_SECRET`, `PORT`, or `CLIENT_ORIGIN` are missing.
- `JWT_SECRET` MUST be >= 32 chars.
- `.env` in `.gitignore`; `.env.example` committed. Never commit real secrets.

Middleware configuration:
- **CORS**: `cors({ origin: CLIENT_ORIGIN, credentials: true })`. No wildcard.
  `credentials: true` is required because the session cookie crosses origins in
  dev (client :5173 → server :5000).
- **Body parsing**: `express.json()` (and `express.urlencoded()` if form posts).
- **Cookies**: `cookieParser()` reads the httpOnly auth cookie.
- **Security**: Day 1 baseline — helmet is optional; if not used, keep responses
  free of sensitive info. Configure `sameSite='lax'`, `httpOnly=true`,
  `secure=(NODE_ENV==='production')`, `maxAge` matching token expiry.

### 4. Data Model — User

Mongoose schema:

```ts
{
  name:     { type: String,  required: true,  trim: true,  maxLength: 100 },
  email:    { type: String,  required: true,  unique: true, lowercase: true, trim: true },
  password: { type: String,  required: true },   // stores bcrypt hash ONLY
}
```

- `email` has a unique index (single-field unique index; no compound).
- Password: stored as a `bcryptjs` hash. A pre-save hook hashes the password
  when it is new or modified using `BCRYPT_ROUNDS` (>= 10). `select: false` on
  password is acceptable if queries re-select it explicitly; otherwise, always
  strip the hash from responses.
- The `_id` is the user identifier carried in the JWT `sub`.

### 5. API Specification

Envelope for every response:
`{ success: boolean, data?: any, error?: { message: string, code: string } }`

#### POST /api/auth/register — Public

Request body:

```json
{ "name": "John Doe", "email": "john@example.com", "password": "secretpass123" }
```

Validation rules (zod shoulds):
- `name`: required, trimmed, 1–100 chars.
- `email`: required, must match email format, lowercased.
- `password`: required, min 6 chars.

Responses:
- **201 Created**
  ```json
  { "success": true, "data": { "id": "...", "name": "John Doe", "email": "john@example.com" } }
  ```
  No token issued on register; user proceeds to Login. Password hash never
  included.
- **400** validation:
  ```json
  { "success": false, "error": { "message": "Validation failed", "code": "VALIDATION_ERROR" } }
  ```
- **409** duplicate email:
  ```json
  { "success": false, "error": { "message": "Email already registered", "code": "DUPLICATE_EMAIL" } }
  ```

#### POST /api/auth/login — Public

Request body:

```json
{ "email": "john@example.com", "password": "secretpass123" }
```

Validation rules: `email` required/format; `password` required (non-empty).

Flow: find user by email → compare bcrypt hash → on success sign JWT
(`{ sub: user._id }`, `expiresIn: JWT_EXPIRES`) → set httpOnly cookie
(`COOKIE_NAME`) → return user.

Responses:
- **200 OK**
  ```json
  { "success": true, "data": { "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } } }
  ```
  The token lives in the httpOnly cookie, not the body (optional `token` field
  may also be returned for debugging, per plan).
- **401**:
  ```json
  { "success": false, "error": { "message": "Invalid credentials", "code": "INVALID_CREDENTIALS" } }
  ```
  Same message whether the email is unknown or the password is wrong (no
  enumeration).

#### POST /api/auth/logout — Authenticated (or public)

Clears the session cookie and returns **200**
`{ "success": true, "data": {} }`. This is the only other auth endpoint needed
for Day 1.

#### Auth middleware behavior (protected routes)

- `authenticate` middleware reads `COOKIE_NAME` (and/or `Authorization: Bearer`
  fallback if the plan stored a token in the header) → verifies the JWT with
  `JWT_SECRET` → sets `req.userId` from `sub`.
- On missing, invalid, or expired token → **401**
  `{ "success": false, "error": { "message": "Unauthorized", "code": "UNAUTHORIZED" } }`.
- Any endpoint mounted after this middleware is protected. Example protected
  route for Day 1: `GET /api/auth/me` returns
  `{ "success": true, "data": { "id", "name", "email" } }` for the current user
  (used by the Dashboard to show the user's name).

### 6. Frontend Specification

#### Auth state management

- `AuthContext` (`AuthProvider`) holds `user`, `loading`, and exposes
  `login()`, `register()`, `logout()`, and `refreshUser()`.
- On mount, `AuthProvider` calls `GET /api/auth/me` (with `credentials: 'include'`)
  to restore the session; `loading` is true while this resolves so protected
  routes can avoid flashing the Login page.
- All API calls go through `services/api.ts` with `credentials: 'include'` and
  a base URL from `VITE_API_URL`. Only this module calls `fetch`.

#### Token storage strategy

- **httpOnly cookie (chosen, per constitution preferred strategy).** The JWT is
  set by the server in a cookie with `httpOnly`, `sameSite='lax'`,
  `secure=(production)`. The client never reads the token from JS — it relies on
  the cookie being sent automatically with `credentials: 'include'`.
- Trade-offs documented: safe against JS/XSS token theft (the client cannot read
  it), but requires `credentials: 'include'` and CSRF awareness. `sameSite='lax'`
  mitigates most CSRF for cross-site POSTs. This single strategy is used
  throughout — do not mix with localStorage.

#### Login page (`client/src/pages/Login.tsx`)

- Fields: `email`, `password`.
- Validation: email format; password non-empty (min length mirrors server).
- Submit: disable button while pending; call `auth.login()`; show inline error on
  failure ("Invalid credentials"); on success redirect to `Dashboard`.
- If already authenticated, redirect to Dashboard instead of showing the form.

#### Register page (`client/src/pages/Register.tsx`)

- Fields: `name`, `email`, `password`, `confirmPassword`.
- Validation: name non-empty; email format; password min 6 chars; confirm
  matches password.
- Submit: disable while pending; on success show success message and redirect to
  Login (or auto-login per plan). On failure, surface server errors (409 → "Email
  already registered"; 400 → validation message) inline.

#### Protected Route component (`client/src/components/ProtectedRoute.tsx`)

- If `loading`, render a loading indicator (no redirect).
- If not authenticated, `<Navigate to="/login">`.
- If authenticated, render the wrapped page (`<Outlet />` or children).

#### Route list for Day 1

| Path | Component | Protected |
|------|-----------|-----------|
| `/login` | Login | Public (redirects if authed) |
| `/register` | Register | Public (redirects if authed) |
| `/` | Dashboard (protected) | **Protected** |
| `*` | Redirect to `/login` or `/` | Public |

### 7. Security Rules

- **Password hashing**: `bcryptjs`, `BCRYPT_ROUNDS` >= 10. Never store or return
  plaintext; never log passwords.
- **JWT**: signed with `JWT_SECRET` (>= 32 chars); payload only `sub`
  (user id); expiry `JWT_EXPIRES`; never put password/email/secrets in payload.
- **Input sanitization/validation**: `zod` on every input body before DB access;
  trim emails/names; lowercase emails; reject malformed with 400.
- **Error messages**: generic public messages for auth failures
  ("Invalid credentials", "Unauthorized", "Validation failed"); no stack traces,
  no DB details, no whether-email-exists hints. Full details go to server logs
  only.
- **CORS**: allowlist from `CLIENT_ORIGIN`, `credentials: true`, no wildcard.
- **Secrets**: only in env; `.env` git-ignored; `.env.example` has placeholders.

### 8. Testing & Definition of Done

#### Manual test cases (all MUST pass)

1. Register with valid details → success confirmation; login with the same
   credentials succeeds.
2. Register with an existing email → clear "email already registered" error;
   no duplicate row.
3. Register with invalid email / short password → inline validation errors; no
   request sent.
4. Login with correct credentials → redirected to Dashboard; user name shown.
5. Login with wrong password → generic "invalid credentials"; stays on Login.
6. Login with an unregistered email → generic "invalid credentials".
7. Directly open `/` without a session → redirected to Login.
8. After login, refresh Dashboard → still authenticated (httpOnly cookie).
9. With no cookie, call a protected endpoint (e.g., `GET /api/auth/me`) → 401
   unauthorized JSON.
10. Logout → returned to Login; Dashboard no longer accessible.
11. `server/.env` absent of required vars → server fails fast with a clear error.
12. Fresh clone using `.env.example` values + a local Mongo URI boots both
    client and server via one root command.

#### Definition of Done — Day 1 checklist

- [ ] Monorepo `client/` + `server/` starts with one root `npm run dev`.
- [ ] MongoDB Atlas connected; User persists with unique email and hashed
      password.
- [ ] Register & login match API contracts (status codes + envelope).
- [ ] JWT issued on login; `authenticate` middleware rejects missing/expired
      tokens with 401.
- [ ] Login & Register pages render, validate, redirect correctly.
- [ ] Protected frontend route redirects unauthenticated users.
- [ ] Token stored via httpOnly cookie (single strategy) — no secrets in source
      or git.
- [ ] All 12 manual test cases above pass end-to-end.
- [ ] `.env.example` complete; fresh clone boots from it.

### 9. Out of Scope for Day 1

Explicitly NOT implemented on Day 1 (do not expand scope to include):

- Refresh tokens / token rotation.
- Email verification and password reset.
- Roles & authorization (admin/user) beyond plain authentication.
- OAuth / social login.
- Rate limiting and account lockout (add before production).
- Full automated test suite and CI.
- Deployment / production hardening beyond baseline.
- Profile editing or any business domain beyond auth.

### Assumptions

- Day 1 targets a local development environment (single dev machine); CORS and
  cookie settings assume `client` at `http://localhost:5173` and `server` at
  `http://localhost:5000`.
- The user has or can create a MongoDB Atlas cluster and provides a
  `MONGO_URI` locally; `.env.example` holds a placeholder, not a real cluster.
- Current stable package versions are chosen with `npm view <pkg> version` and
  pinned; family names above are the intended stack.
- httpOnly cookie is the single token storage strategy (constitution-preferred).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration in under 30 seconds from the
  Register page, then log in successfully with the same credentials.
- **SC-002**: 100% of protected frontend routes and protected backend endpoints
  refuse access when no valid session is present.
- **SC-003**: The complete flow (register → login → protected access → refused
  unauthorized access) completes in under 1 minute in a single local run.
- **SC-004**: No plaintext or recoverable password ever appears in responses,
  logs, or stored data (verified sample).
- **SC-005**: A new developer can get the full stack running locally in under
  15 minutes using the quickstart and `.env.example` with only a Mongo URI.
