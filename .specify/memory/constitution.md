<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version change      : (major) 2.2.0  ->  3.0.0  (Day 1.1: dark dashboard)
  Modified principles : Principle V "Type-Safe & Strict Coding Standards" -
                        for the FRONTEND DASHBOARD PHASE ONLY, the language
                        standard is overridden from TypeScript to JavaScript
                        (.js/.jsx only). The original TS mandate still governs
                        any backend work. No core Day 1-3 rule is deleted.
                        Principle I "Project Structure" - the Dashboard phase
                        is scoped to the existing `frontend/` workspace in
                        place; no new workspace is created by this phase.
  Added sections      : Day 1.1 Dashboard - Project Goal & Definition
                        Day 1.1 Dashboard - Core Principles (D1-D8)
                        Day 1.1 - Folder & Component Structure
                        Day 1.1 - Design System Decisions
                        Day 1.1 - State Management Approach
                        Day 1.1 - Empty State Behaviour
                        Day 1.1 - Responsive Behaviour Rules
                        Day 1.1 - Coding Standards
                        Day 1.1 - Definition of Done (Success Criteria)
                        Day 1.1 - Out of Scope (Deferred)
  Removed sections    : (none). All Day 1-3 sections retained as governed
                        history; Day 1.1 is the current active phase and
                        does not disturb completed work.
  Templates           : ✅ plan-template.md   - Constitution Check gate stays
                                                 generic; dashboard phase adds no
                                                 new gate type
                        ✅ spec-template.md   - acceptance scenarios / success
                                                 criteria align with the dashboard
                                                 DoD; user-story grouping reused
                        ✅ tasks-template.md  - [P] parallel labelling and
                                                 user-story grouping remain valid
                                                 for the component-by-component
                                                 dashboard build
                        ⚠ commands/           - NO commands/*.md directory exists
                                                 in this repo (PowerShell setup);
                                                 plan-template.md line 6 references
                                                 `.specify/templates/commands/plan.md`
                                                 as a note only — non-blocking,
                                                 left as-is (no edit needed)
  Deferred TODOs      : (none). Ratification date (2026-08-27) and amendment date
                        (2026-08-28) confirmed from footer + git history.
  NOTE                : The reference screenshot named in the Day 1.1 input is
                        NOT present in the repo. The constitution encodes the
                        dashboard requirements as written; the implementing
                        agent MUST treat the reference screenshot as the visual
                        authority if it is provided, and the written spec as
                        binding where the two diverge.
  ============================================================================
-->

# Fitness_Tracker Constitution

## Core Principles

### I. Project Structure: Clean Client/Server Monorepo

The project MUST use a single monorepo with two independent workspaces: a
`client/` (React + Vite) and a `server/` (Node + Express). No shared package is
required on Day 1. The layout MUST be:

```text
Fitness_Tracker/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Reusable UI (no pages)
│       ├── pages/           # Route-level views (Login, Register, Dashboard,
│       │                    #   Profile, WorkoutList, WorkoutForm)
│       ├── services/        # API layer (fetch wrappers)
│       ├── context/         # AuthContext provider
│       ├── routes/          # ProtectedRoute + public route definitions
│       ├── hooks/           # Custom logic (useAuth, useLocalStorage)
│       └── App.tsx          # Router setup
├── server/                  # Node + Express backend
│   └── src/
│       ├── config/          # env loading, CORS, token config
│       ├── models/          # Mongoose models (User, Workout)
│       ├── middleware/      # authenticate, error handler, validate
│       ├── routes/          # Express routers (/api/auth, /api/users, /api/workouts)
│       ├── controllers/     # Request/response handling
│       ├── services/        # Business logic (auth, profile, workout)
│       ├── utils/           # Constants, response helpers
│       └── app.ts           # Express app (no listen)
│       └── index.ts         # Entry: starts server
├── .env                     # server env (git-ignored)
├── .env.example             # committed reference (no secrets)
├── package.json             # root scripts (concurrently dev, install-all)
└── .gitignore               # node_modules, .env, dist, build
```

> **Day 1.1 amendment:** The actual implementation landed the two workspaces as
> `backend/` and `frontend/` in JavaScript. Day 1.1 (Dashboard) is built inside
> the existing `frontend/` workspace in place. No new workspace is created by
> the Dashboard phase. The tree above remains the canonical description of the
> separation of concerns; directory naming follows whatever the committed repo
> already uses.

Rationale: Separation of client/server keeps concerns isolated, enables
independent tooling (Vite vs. Express), and avoids cross-package coupling while
the app is small. Root-level orchestration scripts must NOT duplicate logic
that belongs in a workspace. Day 2 grows this structure in place (new pages,
models, routers) — it does not alter the two-workspace shape.

### II. Tech Stack & Versions (Pin Critical Choices)

The stack is fixed across the project; do not swap versions without amending
this constitution. Use recent stable LTS and lock dependency versions.

- **Frontend**: React 19 + Vite 8 (TypeScript template `react-ts`),
  React Router v7, no state library on Day 1 (Context is sufficient).
- **Backend**: Node.js LTS (24.x), Express 5, Mongoose 9.
- **Auth**: `jsonwebtoken` (JWT access token), `bcryptjs` for password hashing
  (pure JS, no native build issues on Windows).
- **Validation**: `zod` shared-style validation on the server for request
  bodies; lightweight client-side checks mirror the same rules.
- **Tooling**: `tsx` or `ts-node-dev` for server dev, `concurrently` at root,
  `dotenv` for env loading. TypeScript in `strict` mode on BOTH workspaces.
  TypeScript 7 (native `tsc`) is the default; editor/plugin tooling that needs
  the TypeScript compiler API uses the `@typescript/typescript6` compat package.
- **CORS**: `cors` middleware with an allowlist derived from env vars.

> **Day 1.1 amendment:** The Dashboard phase is FRONTEND-ONLY and JavaScript-only
> (`.js`/`.jsx`). No backend, no TypeScript, and no new runtime dependencies are
> added. The frontend already uses React 19 + Vite 8 + React Router 7 + Tailwind
> CSS v4. The Dashboard reuses these; do not add a charting or state library
> unless the plan cannot be built without it (see Day 1.1 Core Principle D6).

**Day 2 requires NO new runtime or dev dependencies.** Profile editing and
workout CRUD reuse the existing React, React Router, Express, Mongoose, Zod,
and JWT set. If a task appears to need a new library, that is a signal for a
simpler design — open a constitution amendment before adding it.

Version selection MUST first check `npm view <pkg> version` for the current
stable release, then pin exact versions in `package.json`. Any deliberate
downgrade must be justified in a plan's Complexity Tracking.

### III. Security-First Authentication (NON-NEGOTIABLE)

- Passwords MUST be hashed with `bcryptjs` (`bcrypt.hash`, salt rounds >= 10).
  Plaintext passwords MUST NEVER be logged, stored, or returned in responses.
- The access token is a JWT signed with a secret from `JWT_SECRET` (>= 32 chars).
  The token MUST include `sub` (user id) and expire after `JWT_EXPIRES` (Day 1
  default: 1h). Never put secrets, emails, or passwords inside the token payload
  beyond the user id.
- CORS MUST restrict origins to `CLIENT_ORIGIN`; never use `*` in production.
- Input validation MUST run before touching the database; reject
  malformed/missing bodies with 400 and never leak internal details.
- Error handling MUST centralize in an error-handling middleware: known
  client errors return their code, unexpected errors return 500 with a generic
  message, and full details go to the server log only.
- Environment secrets MUST live only in `.env` and MUST be loaded through
  `dotenv`; no hardcoded secrets anywhere in source.

Rationale: These are the non-negotiable minimums for shipping authentication.
Violating any of them creates a credential-exposure or account-takeover risk
that is unacceptable even in an MVP. Day 2 MUST reuse the Day 1 `authenticate`
middleware, hashing, and validation plumbing unchanged.

### IV. API Contract Discipline

Every endpoint MUST have a documented request/response contract (see
"API Contracts" section). Controllers MUST return a consistent JSON envelope
`{ success: boolean, data?, error? }`. Routes MUST be versioned (`/api/v1/...`
preferred; this project uses `/api/auth`, `/api/users`, `/api/workouts`).
Response status codes MUST be explicit and meaningful (200 success, 201 created,
204 no content, 400 validation, 401 unauthorized, 404 not found, 409 conflict,
500 server). The client `services/` layer MUST be the only place that calls
`fetch`, centralizing base URL and error parsing.

Day 2 additions follow the same discipline: every profile and workout endpoint
MUST specify request/response shapes, validation rules, and status codes in this
constitution and in the feature contracts before implementation.

### V. Type-Safe & Strict Coding Standards

- TypeScript MUST run in `strict` mode in both `client` and `server`.
- All code MUST be TypeScript; avoid `any` unless justified with a comment.
- Naming: `camelCase` for functions/variables, `PascalCase` for components,
  `SCREAMING_SNAKE` for configuration constants, `.tsx` for React files with JSX.
- One logical unit per file. Controllers thin, services hold logic, models own
  schema only. Keep files small and readable.
- No hardcoded secrets, URLs, or magic tokens in source — read from env/config.
- Prefer explicit return types on exported functions and clean, declarative
  control flow over nested branches.

> **Day 1.1 amendment — FRONTEND-ONLY OVERRIDE:** For the Day 1.1 Dashboard phase
> the language standard above is OVERRIDDEN. The Dashboard MUST be written in
> plain JavaScript only (`.js` for logic/util modules, `.jsx` for React
> components). TypeScript is STRICTLY FORBIDDEN for the Dashboard phase — no
> `.ts`/`.tsx`, no `@ts-check`, and no type annotations. The rest of this
> principle (naming, one-unit-per-file, no hardcoded secrets, clean declarative
> control flow) applies unchanged. This override is scoped to the frontend
> dashboard work; any backend code remains TypeScript-governed.

Rationale: Strict typing is the cheapest correctness tool in a MERN app and is
a precondition for reliable refactoring on later days. This becomes more
valuable on Day 2 as the domain grows (Workout, Exercise subdocuments). The
Day 1.1 dashboard is intentionally a plain-JavaScript, presentational frontend
phase; its override is explicit and narrow to avoid ambiguity.

### VI. Verify End-to-End Before Done

No feature day is complete until its flow is proven end-to-end against a live
server and database. Manual verification MUST be recorded alongside any
automated checks. The quickstart flow MUST be followed and pass before declaring
Definition of Done met.

Day 2 end-to-end scope: a user logs in, edits their profile, creates a workout
with exercises/sets/reps/weight/notes/category, sees it in the list, edits it,
and deletes it — while a second user cannot see, read, edit, or delete the first
user's workouts.

> **Day 1.1 amendment:** Day 1.1 is frontend-only and needs NO live backend to
> be verified. Its end-to-end verification is a browser run of the built
> dashboard rendering every required section, chart, and empty state correctly.
> If auth is still present from prior days, the dashboard may render behind the
> existing protected route; alternatively it MUST render as a standalone shell
> when no auth is wired. The plan/Spec MUST state which.

### VII. Resource Ownership & Authorization (NON-NEGOTIABLE)

Every domain resource (profile fields, workouts, nutrition entries) MUST belong
to the authenticated user identified by `req.userId` (the JWT `sub`).

- Every workout MUST store the owner as `owner` (or `user`) referencing
  `User._id`, set ONLY from `req.userId` on create — never from client input.
- All workout queries MUST be scoped by owner: `Workout.find({ owner: req.userId })`,
  `Workout.findOne({ _id, owner: req.userId })`, etc.
- No user MUST be able to read, edit, or delete another user's workout. A
  workout id that exists but is owned by someone else MUST return **404
  NOT_FOUND** (never 403 and never a different user's data), so resource
  existence is not leaked.
- Profile reads/updates MUST operate on the user from `req.userId` only.
- Ownership filtering MUST be applied in the service/query layer, and every
  `_id`-based fetch for a protected resource MUST include the owner filter —
  never a bare `Workout.findById(id)` inside an authenticated route.
- Nutrition entries follow the SAME rules as workouts (Day 3): every entry
  stores `owner` from `req.userId` on create; every query (list, single,
  summary, update, delete) MUST filter by `{ _id, owner: req.userId }` or
  `{ owner: req.userId, date }`; a not-owned or missing entry id MUST return
  **404 NOT_FOUND**. The daily summary MUST aggregate only the caller's entries
  for the requested date.

Rationale: Multi-user isolation is the core Day 2 requirement. Enforcing
ownership at the data-access layer (not only in controllers) prevents a single
forgotten check from exposing one user's workouts to another. 404 (not 403)
avoids confirming the existence of another user's record. Day 3 applies the
identical, already-proven rule to nutrition so one user's food/diet data is
never visible to another.

### VIII. Calorie & Macro Totals Are Server-Computed (NON-NEGOTIABLE)

Daily calorie and macro totals MUST be computed by the server from the stored
nutrition entries (per-entry `calories`, `protein`, `carbs`, `fat`) — never
trusted from the client. The client MUST only display totals returned by the
server's daily-summary endpoint.

- The server MUST sum calories, protein, carbs, and fat across all entries the
  caller owns for the requested date.
- No client-side aggregate MAY be used as the source of truth; client-side
  numeric formatting only.
- This keeps totals correct and owner-scoped in one place and prevents a client
  from misreporting its own totals.

Rationale: Totals drive the Nutrition page's headline numbers. Computing them
server-side guarantees consistency with the stored data and automatically honors
ownership isolation, avoiding drift if computed in two places.

---

## Day 1.1 — Dark Fitness Tracker Dashboard (CURRENT ACTIVE PHASE)

### Project Goal & Definition

Day 1.1 builds a modern, dark-themed Fitness Tracker **dashboard** in React,
using **only `.js` and `.jsx` files (strictly no TypeScript)**, matching the
reference screenshot as closely as possible. It is **frontend-only**; it does
not add, change, or remove any backend behaviour. The phase is scoped to the
existing `frontend/` workspace and reuses the committed React + Vite + React
Router + Tailwind setup.

The dashboard MUST contain ALL of the following fixed elements:

1. **Fixed left sidebar (dark)**: logo at top; main menu items Dashboard,
   Exercise, Nutrition; user profile section (avatar + name + email) at bottom.
2. **Top navbar**: logo + "Fitness Tracker" text; center navigation tabs —
   Dashboard, Workouts, Nutrition, Goals, BMI; user avatar + name on the right.
3. **Main content area** with **QUICK LOG** buttons: Water, Steps, Calories,
   Sleep, Weight, Workout.
4. **Dashboard content**: personalized greeting + current date; summary cards
   (Total Workouts, Total Exercises, Calories Burned, Calories Consumed, Current
   Weight, Workout Streak); daily goals/progress cards (Hydration, Calories,
   Steps, Sleep) with progress bars; activity/progress rings; weekly workout
   chart; calories chart; macro chart; recent workouts section; quick action
   buttons; proper empty states for all sections.

### Core Principles (Day 1.1)

#### D1. JavaScript-Only Frontend Phase (NON-NEGOTIABLE)

The Dashboard MUST be authored exclusively in `.js` and `.jsx`. TypeScript is
forbidden: no `.ts`, no `.tsx`, no type annotations, no `@ts-check`, no
`tsconfig` changes affecting the dashboard. This override is scoped to Day 1.1
frontend work only (see Principle V amendment).

Rationale: The reference build is plain React; keeping it JS-only guarantees the
dashboard stays simple, approachable, and free of type plumbing that would not
add value to a presentational phase.

#### D2. Exact, Fixed Layout (NON-NEGOTIABLE)

The three-region layout (left sidebar + top navbar + main content) MUST be
implemented exactly as specified, with the Quick Log row and every listed
dashboard section present. No layout region may be dropped, merged, or hidden at
the desktop breakpoint.

Rationale: "Match the reference screenshot as closely as possible" is the core
acceptance criterion; layout fidelity is the primary measure of success.

#### D3. Dark Modern Visual Language

Use deep black / charcoal backgrounds, subtle card elevation (borders +
shadow), clean typography, and restrained accent color (a single primary hue).
Cards render on a slightly raised surface against the page background.

Rationale: A consistent dark theme is what gives the screenshot its identity and
is the clearest way to "match" it.

#### D4. Reusable Components

Break the UI into small, reusable components (see folder structure). A component
used in two or more places MUST be extracted once rather than duplicated. No
copy-paste of markup across sections.

Rationale: Reuse keeps the dashboard maintainable and consistent; duplicating
markup across six summary cards or four progress cards is the anti-pattern this
principle forbids.

#### D5. Every Section Has a Proper Empty State

Each data-driven section MUST render a designed empty state when it has no data
(minimal icon + short message like "No workouts recorded yet"). Loading and
error states MUST also be handled (spinner/skeleton for loading; friendly
message, never a stack trace, for error).

Rationale: A dashboard is worthless when blank; empty states communicate "why"
and invite the next action instead of showing nothing.

#### D6. No New Runtime Dependencies Without Justification

The dashboard MUST be built with the already-committed stack (React 19, React
Router, Tailwind v4, and any existing UI primitives). No new charting or state
library may be added unless the plan demonstrates it is necessary and records it
in Complexity Tracking with reasoning. Hand-rolled SVGs and CSS progress bars are
preferred for rings, bars, and mini-charts.

Rationale: Adds headroom for production-ready simple code and avoids pulling in
libraries that duplicate a few dozen lines of CSS/SVG.

#### D7. State Management: Local State + Optional Context

Dashboard state MUST use local React state (`useState`) by default. Lift state
only when two or more components share it; only then add a Context. No external
state library (Redux, Zustand, etc.). Static/mock dashboard data lives in
clearly-named constants/modules so it can later be swapped for real API data.

Rationale: The dashboard is presentational; a global store is over-engineering.
Context is enough where sharing is genuinely needed.

#### D8. Fully Responsive, Desktop-First

The dashboard MUST be fully responsive. At the desktop width the three-region
layout renders in full. On tablet the sidebar MUST collapse to icons (or a
toggle), and on mobile the sidebar MUST become an overlay/sheet and the top
navbar tabs MUST collapse into a menu or scrollable strip.

Rationale: Responsiveness is an explicit requirement; desktop-first keeps the
reference fidelity while guaranteeing usable smaller-screen behaviour.

### Folder & Component Structure (Day 1.1)

All under the existing `frontend/src/` workspace:

```text
frontend/src/
├── App.jsx                     # Router + shell composition
├── main.jsx                    # Entry
├── index.css                   # Tailwind + design-token variables (dark theme)
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx         # Logo, menu (Dashboard/Exercise/Nutrition), profile block
│   │   ├── TopNavbar.jsx       # Logo+name, center tabs, user avatar+name
│   │   └── DashboardLayout.jsx # Composes Sidebar + TopNavbar + <Outlet/>
│   ├── dashboard/
│   │   ├── Greeting.jsx        # Personalized greeting + current date
│   │   ├── SummaryCard.jsx     # Reusable stat card (label, value, icon, delta)
│   │   ├── SummaryCards.jsx    # Grid of the six SummaryCards
│   │   ├── ProgressCard.jsx    # Reusable daily goal card with progress bar
│   │   ├── ProgressCards.jsx   # Grid of Hydration/Calories/Steps/Sleep
│   │   ├── ActivityRing.jsx    # Reusable SVG progress ring
│   │   ├── ActivityRings.jsx   # Row of ActivityRings
│   │   ├── WeeklyChart.jsx     # Weekly workout bar chart (hand-rolled)
│   │   ├── CaloriesChart.jsx   # Calories chart (hand-rolled)
│   │   ├── MacroChart.jsx      # Macro donut/bars (hand-rolled)
│   │   ├── RecentWorkouts.jsx  # Recent workouts list
│   │   ├── QuickLog.jsx        # QUICK LOG row (Water/Steps/Calories/Sleep/Weight/Workout)
│   │   └── QuickActions.jsx    # Quick action buttons
│   └── ui/
│       ├── Card.jsx            # Reusable elevated card surface
│       ├── ProgressBar.jsx     # Reusable progress bar
│       ├── EmptyState.jsx      # Reusable icon + message empty state
│       ├── Spinner.jsx         # Loading indicator
│       └── index.js            # Barrel export
├── pages/
│   └── Dashboard.jsx           # Composes the dashboard sections
├── data/
│   ├── dashboardData.js        # Mock/seed data (summary, goals, charts, recent)
│   └── constants.js            # Quick-log options, nav items, meal labels etc.
└── context/
    └── (only if a shared Context is required — e.g. DashboardDataContext)
```

Rules:
- Unit-per-file: each component above is its own file; no mixed concerns.
- `data/` holds mock data so the plan's later API swap is a single-file change.
- `.js` for non-JSX logic/util; `.jsx` for components that render JSX.

### Design System Decisions (Day 1.1)

- **Colors (dark theme)**: page background deep charcoal/near-black (e.g.
  `#0b0f14`); card surface slightly lighter (e.g. `#161b22`); borders subtle
  muted (`#232a33`); primary accent one hue (e.g. lime/green `#a3e635` or
  indigo — MUST match the reference); text primary near-white, secondary muted
  gray; danger/red and neutral states reserved for errors.
- **Spacing**: use a consistent 4px scale driven by Tailwind utilities
  (`space-y-*`, `gap-*`, `p-*`); cards share one padding standard (e.g. `p-4`/`p-5`).
- **Typography**: one primary font family (system or a single Google font already
  present in the stack); fixed type scale for h1/h2/labels/body/caption; numbers
  in stat cards share a strong numeric style.
- **Card style**: subtle `border`, small `border-radius` (e.g. `rounded-xl`),
  gentle shadow; no heavy gradients except where the reference uses them.
- **Theme source**: define palette + spacing as Tailwind theme/CSS variables in
  `index.css` once, then reference variables everywhere (no scattered hex codes).

### State Management Approach (Day 1.1)

- Default: `useState` inside the component that owns the slice of data.
- Lift to `useState` in `Dashboard.jsx` (or a small module) only when two or more
  components read/update the same value.
- If shared state grows, add a single `DashboardDataContext` in `context/`; do not
  add a state library.
- Mock data lives in `data/dashboardData.js` and is imported, never re-created in
  components.
- No backend calls in this phase unless the plan explicitly reuses prior-day API
  services; otherwise all data is mock/local.

### Empty State Behaviour (Day 1.1)

- Every data-driven section MUST define what "no data" looks like.
- A shared `EmptyState` component renders a centered icon + short message + an
  optional action label ("No workouts recorded yet"). Use it consistently.
- Progress cards/rings with zero/undefined targets show a 0% bar and a "No goal
  set" caption rather than a broken fraction.
- Charts with no points render the empty state instead of an ugly axe.
- Recent workouts with no entries render "No recent workouts" empty state.
- Loading: consistent `Spinner` (or skeleton). Error: friendly message, never a
  stack trace.

### Responsive Behaviour Rules (Day 1.1)

- **Desktop (>= 1024px)**: full fixed sidebar + top navbar + main grid; all six
  summary cards in a responsive grid; Quick Log row fully visible.
- **Tablet (640–1024px)**: sidebar collapses to an icon rail (or hamburger
  toggle); grid columns reduce; center navbar tabs still accessible (may scroll).
- **Mobile (< 640px)**: sidebar becomes an overlay/drawer opened from the top
  navbar; center tabs collapse to a menu or horizontally scrollable strip; stat
  cards stack 1–2 per row; Quick Log becomes a wrap grid.
- No horizontal page scroll at any breakpoint; charts and cards reflow, never
  overflow.

### Coding Standards (Day 1.1)

- **Language**: JavaScript only (`.js`/`.jsx`). No TypeScript (D1).
- **Naming**: `camelCase` functions/variables, `PascalCase` components,
  `SCREAMING_SNAKE` for constants.
- **File types**: `.jsx` only for files that render JSX; `.js` for everything else.
- **One logical unit per file**; default exports for components, named exports
  for utilities/constants.
- **Import style**: clean, grouped imports (react → libraries → local/relative).
- **No comments explaining the obvious**; comments only where a decision or
  non-obvious step needs justification. No "AI-looking" boilerplate comments.
- **No dead code**; remove unused imports/variables. Keep components small and
  readable.
- **No hardcoded secrets or URLs**; read from config/env modules if real API is
  used later.
- **Accessibility**: semantic elements where sensible (buttons as `<button>`),
  visible focus states, `aria-label` on icon-only controls, readable contrast
  on the dark theme.

### Definition of Done (Day 1.1 Success Criteria)

Day 1.1 is DONE only when ALL of the following hold:

1. The dashboard "Quick Log" + greeting render in a layout with a fixed left
   sidebar (logo, Dashboard/Exercise/Nutrition, profile block) and a top navbar
   (logo + "Fitness Tracker", center tabs Dashboard/Workouts/Nutrition/Goals/BMI,
   user avatar + name).
2. All six summary cards (Total Workouts, Total Exercises, Calories Burned,
   Calories Consumed, Current Weight, Workout Streak) render with correct values.
3. All four daily goal/progress cards (Hydration, Calories, Steps, Sleep) render
   with progress bars reflecting the data.
4. Activity/progress rings render and reflect their values.
5. Weekly workout chart, Calories chart, and Macro chart render (hand-rolled) and
   reflect the data; charts use the empty state when empty.
6. Recent workouts section renders the provided/mock list (or its empty state).
7. Every data-driven section shows a designed empty state, a loading state, and a
   friendly error state — no section can render a blank/broken region.
8. Design matches the dark reference as closely as possible: dark background,
   elevated cards, one accent hue, clean typography, consistent spacing.
9. Dashboard is fully responsive at desktop, tablet, and mobile breakpoints with
   no horizontal scroll.
10. Files are all `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime dependency was
    added without a recorded Complexity Tracking justification.
11. `npm run build` (vite build) succeeds cleanly; no lint errors under the
    project's lint script.
12. Manual browser verification is recorded (sections render, quick log buttons
    present, empty/loading/error states exercised).

### Out of Scope (Day 1.1 — Deferred)

Explicitly NOT part of Day 1.1; do not expand Day 1.1 work to include:

- TypeScript adoption or conversion of existing files.
- Any backend changes: no new/custom endpoints, no auth/service changes, no new
  data models, no database changes.
- Real user data / wiring the dashboard to live API data unless the plan
  explicitly reuses prior-day services (default is mock data).
- Full CRUD inside the Quick Log buttons (they MAY be static/disabled placeholders
  or increment local state only).
- Authentication flows, registration, login UI changes.
- Data persistence, offline cache, service workers, PWA.
- i18n/localization, dark/light theme toggle, user-selectable themes.
- Advanced animations beyond lightweight/transition polish.
- Automated test suite and CI (optional smoke check only).
- Deployment or production hosting.
- New chart/state libraries (bans noted in D6).

These MUST NOT be silently added to Day 1.1; open a new spec if one is required.

---

## Environment Variables & Secrets

`.env` is git-ignored; `.env.example` is committed with placeholder values only.
The server loads vars via `dotenv` at startup and MUST fail fast (exit non-zero)
if required vars are missing.

`.env.example` (server):

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

Day 2 adds **no new required environment variables**. Profile and workout
features reuse the existing config. Any future optional variable (e.g. avatar
upload bucket) MUST be documented here before use.

Day 3 (nutrition) also adds **no new required environment variables**; it reuses
the same `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, and cookie config. If a
nutrition feature appears to need a new variable or dependency, open a
constitution amendment first.

> **Day 1.1 amendment:** The dashboard is frontend-only. If it renders standalone
> with mock data it needs NO environment variables. If the plan reuses prior-day
> API services, it uses the existing `VITE_API_URL` from the frontend
> `.env.example`; Day 1.1 adds no new variables.

`.env.example` (client): no secrets on the client.

```env
VITE_API_URL=http://localhost:5000
```

Rules:
- NEVER commit `.env`, real connection strings, or real `JWT_SECRET`.
- Every new required variable MUST be added to both `.env` and `.env.example`.
- Rotate `JWT_SECRET` before any production deployment.
- A fresh clone MUST reach a running app using only `.env.example` values +
  a locally provided Mongo URI.

## Data Models

### User (updated for profile)

| Field        | Type                  | Rules                                                              | Notes                            |
|--------------|-----------------------|--------------------------------------------------------------------|----------------------------------|
| `_id`        | ObjectId              | auto (Mongo)                                                       | carried in JWT as `sub`          |
| `name`       | String                | required; `trim`; 1–100 chars                                      | profile display name             |
| `email`      | String                | required; `unique` index; `lowercase`; `trim`; valid email format  | immutable after registration     |
| `password`   | String                | required; bcrypt hash ONLY; `select: false`                        | never returned/logged            |
| `bio`        | String                | optional; `trim`; max 500 chars                                    | Day 2 profile field              |
| `age`        | Number                | optional; int 13–120                                               | Day 2 profile field              |
| `heightCm`   | Number                | optional; positive number (e.g. 60–280)                            | Day 2 profile field              |
| `weightKg`   | Number                | optional; positive number (e.g. 20–400)                            | Day 2 profile field              |
| `goal`       | String                | optional; enum `[lose, maintain, gain, other]` (or free text)      | Day 2 profile field              |
| `fitnessLevel` | String              | optional; enum `[beginner, intermediate, advanced]`                | Day 2 profile field              |

- All new profile fields are OPTIONAL; updates MUST accept partial bodies and
  only save provided fields. `name` and `email` remain validated as in Day 1;
  `email` cannot be changed to one already in use (409).
- Emails and names MUST be trimmed before validation.
- The password hash MUST remain `select: false`; profile endpoints MUST never
  return `password`.

### Workout

Workout stores **embedded** exercises (subdocuments) — no separate collection.

| Field       | Type            | Rules                                                     | Notes                                |
|-------------|-----------------|-----------------------------------------------------------|--------------------------------------|
| `_id`       | ObjectId        | auto                                                      |                                      |
| `owner`     | ObjectId (ref User) | required; indexed; set from `req.userId` only        | ownership isolation (Principle VII)  |
| `name`      | String          | required; `trim`; 1–100 chars                             |                                      |
| `category`  | String          | required; enum from a fixed set or free text (see below)  | e.g. Strength, Cardio, Flexibility  |
| `date`      | Date            | required; default `Date.now`                              | workout occurrence date              |
| `notes`     | String          | optional; `trim`; max 2000                                 | whole-workout note                   |
| `exercises` | [Exercise]      | embedded subdocs; optional, may be empty                  | see Exercise                         |
| `createdAt` / `updatedAt` | Date | `timestamps: true`                                  |                                      |

**Category**: a predictable set is preferred for filtering/summary.
Constitution suggestion: `['strength', 'cardio', 'flexibility', 'hybrid',
'other']` stored lowercase. The plan/spec MAY finalize the enum; once fixed it
MUST be validated with `zod` (`z.enum([...])`) server-side.

### Exercise (embedded in Workout)

| Field     | Type     | Rules                                 | Notes                              |
|-----------|----------|---------------------------------------|------------------------------------|
| `name`    | String   | required; `trim`; 1–100 chars         | e.g. Bench Press                   |
| `sets`    | Number   | required; int >= 1 (up to e.g. 50)    |                                    |
| `reps`    | Number   | required; int >= 1 (up to e.g. 500)   |                                    |
| `weightKg`| Number   | optional; >= 0 (0/unspecified = bodyweight) |                              |
| `notes`   | String   | optional; `trim`; max 500             | per-exercise note                  |

- Exercises are embedded, so a workout create/update payload carries its
  exercises inline (must be an array). Empty array is allowed when creating a
  workout; exercises can be added on update.
- TypeScript models/validators: define `Exercise` zod schema + Mongoose subdoc
  schema reused in controllers and models to keep rules in one place.

### Nutrition / Meal (Day 3)

A single `Nutrition` collection where one document = one food/meal entry for a
user on a date. No separate unit/food-database collections on Day 3.

| Field       | Type              | Rules                                                    | Notes                                  |
|-------------|-------------------|----------------------------------------------------------|----------------------------------------|
| `_id`       | ObjectId          | auto                                                     |                                        |
| `owner`     | ObjectId (ref User) | required; indexed                                     | set from `req.userId` only (Principle VII) |
| `foodName`  | String            | required; `trim`; 1–100 chars                            | e.g. "Chicken breast"                  |
| `quantity`  | Number            | optional; number > 0 (e.g. 150)                          | default 1 if omitted                   |
| `unit`      | String            | optional; `trim`; 1–20 chars; e.g. g, ml, cups, oz       | free text on Day 3                     |
| `calories`  | Number            | required; number >= 0                                     | kcal                                   |
| `protein`   | Number            | optional; number >= 0; default 0                          | grams                                  |
| `carbs`     | Number            | optional; number >= 0; default 0                          | grams                                  |
| `fat`       | Number            | optional; number >= 0; default 0                          | grams                                  |
| `mealType`  | String            | required; enum `[breakfast, lunch, dinner, snack]`        | stored lowercase                       |
| `date`      | Date              | required; default `Date.now`                              | the day the entry belongs to           |
| `createdAt` / `updatedAt` | Date | `timestamps: true`                                  |                                        |

- Composite index `{ owner: 1, date: 1, mealType: 1 }` to serve owner-scoped,
  date/meal-type filtered list + daily summary queries efficiently.
- All numeric macro fields validated with `zod` (`z.number().min(0)` etc.);
  `calories` up to e.g. 2000, macros up to e.g. 500 (plan may finalize caps).
- Ownership MUST mirror Principle VII exactly: every query filters by `owner`.

## API Contracts

Envelope: `{ success: boolean, data?: any, error?: { message, code } }`

### Profile

#### GET /api/users/me — Authenticated

Returns the current user's profile (no password hash).

Responses:
- `200 OK`
  ```json
  { "success": true, "data": { "id": "...", "name": "John Doe", "email": "john@example.com", "bio": "…", "age": 32, "heightCm": 178, "weightKg": 82, "goal": "gain", "fitnessLevel": "intermediate" } }
  ```
- `401` `{ "success": false, "error": { "message": "Unauthorized", "code": "UNAUTHORIZED" } }`

#### PATCH /api/users/me — Authenticated

Updates the current user's profile. Accepts a partial body of any subset of
`{ name, bio, age, heightCm, weightKg, goal, fitnessLevel }`. Optional `null`
or omitted fields are left unchanged. (Email changes are out of Day 2 scope —
see Deferred Scope.)

Request body (partial):
```json
{ "name": "John D.", "bio": "Lifting heavy.", "goal": "gain", "weightKg": 80 }
```

Validation: `name` 1–100 (if provided); `bio` <= 500; `age` int 13–120;
`heightCm`/`weightKg` positive; `goal`/`fitnessLevel` from enum. Invalid →
`400 VALIDATION_ERROR`.

Responses:
- `200 OK` (updated profile object, same shape as GET)
- `400` `{ "success": false, "error": { "message": "Validation failed", "code": "VALIDATION_ERROR" } }`
- `401` UNAUTHORIZED

### Workouts — Full CRUD (all Authenticated, owner-scoped per Principle VII)

For brevity `AUTH_ERR` = `{ "success": false, "error": { "message": "Unauthorized", "code": "UNAUTHORIZED" } }`
(401) and `NOT_FOUND` = `{ "success": false, "error": { "message": "Workout not found", "code": "NOT_FOUND" } }`
(404, also returned when the id exists but belongs to another user).

#### GET /api/workouts — Authenticated

Lists the current user's workouts (owner = `req.userId`), newest first.
Optional query: `category=<name>` to filter; `limit`/`offset` MAY be added later
(not required Day 2). Exercises included in each workout.

Responses:
- `200 OK`
  ```json
  { "success": true, "data": [ { "id": "...", "name": "Push Day", "category": "strength", "date": "2026-08-28T00:00:00Z", "notes": "…", "exercises": [ { "name": "Bench Press", "sets": 4, "reps": 8, "weightKg": 60, "notes": "…" } ] } ] }
  ```
- `401` AUTH_ERR

#### POST /api/workouts — Authenticated

Creates a workout owned by `req.userId`.

Request body:
```json
{
  "name": "Push Day",
  "category": "strength",
  "date": "2026-08-28",
  "notes": "Focus on chest",
  "exercises": [
    { "name": "Bench Press", "sets": 4, "reps": 8, "weightKg": 60, "notes": "" },
    { "name": "Overhead Press", "sets": 3, "reps": 10, "weightKg": 40 }
  ]
}
```

Validation (`zod`): `name` required 1–100; `category` from enum (required);
`date` valid date (default today); `notes` <= 2000; `exercises` optional array,
each with required `name` (1–100), `sets`/`reps` ints >= 1, optional
`weightKg` >= 0, optional `notes` <= 500.

Responses:
- `201 Created` (created workout object, with `owner` withheld from response)
- `400` VALIDATION_ERROR
- `401` AUTH_ERR

#### GET /api/workouts/:id — Authenticated

Returns ONE workout IF it belongs to `req.userId`. Query MUST be
`Workout.findOne({ _id: id, owner: req.userId })`.

Responses:
- `200 OK` (single workout object)
- `401` AUTH_ERR; `404` NOT_FOUND (missing OR not owned — same body)

#### PATCH /api/workouts/:id — Authenticated

Updates a workout owned by `req.userId`. Partial body: any subset of
`{ name, category, date, notes, exercises }`. Exercises MAY be replaced
wholesale (client sends the full new `exercises` array). Same zod validation as
POST for provided fields.

Responses:
- `200 OK` (updated workout)
- `400` VALIDATION_ERROR; `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

#### DELETE /api/workouts/:id — Authenticated

Deletes a workout owned by `req.userId` (`findOneAndDelete({ _id, owner })`).

Responses:
- `204 No Content` (or `200 { success: true, data: { id } }` — pick one and
  document in plan)
- `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

### Exercises inside a workout

Diagram: exercises are **not** a separate REST resource on Day 2. They are
created/edited/deleted by sending the full `exercises` array in
`POST /api/workouts` or `PATCH /api/workouts/:id`. This keeps the workout
atomic and ownership coercion simple. If dedicated exercise endpoints are later
needed they become a new spec.

### Nutrition — Full CRUD + Daily Summary (Day 3, all Authenticated)

All nutrition routes are protected (`authenticate`) and owner-scoped per
Principle VII. `AUTH_ERR` (401) and `NOT_FOUND`
(`{ "success": false, "error": { "message": "Nutrition entry not found", "code": "NOT_FOUND" } }`,
404 — also returned when the id exists but belongs to another user) are as in
Workouts.

#### POST /api/nutrition — Authenticated

Creates an entry owned by `req.userId` (owner set from `req.userId`, never the
body).

Request body:
```json
{
  "foodName": "Oatmeal",
  "quantity": 1,
  "unit": "bowl",
  "calories": 300,
  "protein": 10,
  "carbs": 50,
  "fat": 5,
  "mealType": "breakfast",
  "date": "2026-08-28"
}
```

Validation (`zod`): `foodName` required 1–100; `quantity` optional > 0;
`unit` optional 1–20; `calories` required >= 0; `protein`/`carbs`/`fat` optional
>= 0 (default 0); `mealType` required enum; `date` valid (default today).

Responses:
- `201 Created` (created entry object)
- `400` VALIDATION_ERROR; `401` AUTH_ERR

#### GET /api/nutrition — Authenticated

Lists the current user's entries. Optional query filters: `date=YYYY-MM-DD`
and/or `mealType=breakfast|lunch|dinner|snack`. Newest first
(`date` desc, `createdAt` desc). Always owner-scoped.

Responses:
- `200 OK` `{ "success": true, "data": [ ...entries... ] }`
- `400` VALIDATION_ERROR (invalid `mealType`/`date`); `401` AUTH_ERR

#### GET /api/nutrition/summary/daily — Authenticated

Returns the daily totals for the caller for a `?date=YYYY-MM-DD` (default
today): total `calories`, `protein`, `carbs`, `fat` computed server-side across
the caller's OWN entries for that date (Principle VIII). Always owner-scoped.

Responses:
- `200 OK`
  ```json
  { "success": true, "data": { "date": "2026-08-28", "calories": 1750, "protein": 90, "carbs": 200, "fat": 60 } }
  ```
- `400` VALIDATION_ERROR (invalid date); `401` AUTH_ERR

#### GET /api/nutrition/:id — Authenticated

Returns one entry IF it belongs to `req.userId`
(`Nutrition.findOne({ _id: id, owner: req.userId })`).

Responses:
- `200 OK` (single entry object); `401` AUTH_ERR; `404` NOT_FOUND

#### PUT (or PATCH) /api/nutrition/:id — Authenticated

Updates an entry owned by `req.userId`. Full replace (`PUT`) or partial merge
(`PATCH`) — pick ONE and document in plan; this constitution allows either so
long as ownership scoping and validation stay intact. Same zod validation for
provided fields as POST.

Responses:
- `200 OK` (updated entry); `400` VALIDATION_ERROR; `401` AUTH_ERR; `404`
  NOT_FOUND (missing or not owned)

#### DELETE /api/nutrition/:id — Authenticated

Deletes an entry owned by `req.userId`
(`Nutrition.deleteOne({ _id, owner: req.userId })`).

Responses:
- `204 No Content`; `401` AUTH_ERR; `404` NOT_FOUND (missing or not owned)

## Frontend UX & Auth State

### Auth State (Day 1, reused unchanged)

Use React **Context** (`AuthContext`) — no external state library. Token storage
is the selected single strategy: **httpOnly cookie** (`credentials: 'include'`).
`ProtectedRoute` and `services/api.ts` protect/centralize all authenticated
requests. Reuse exactly what Day 1 built — do not re-architect.

### Routes for Day 2 (+ Day 3)

| Path            | Component      | Protected |
|-----------------|----------------|-----------|
| `/login`        | Login          | Public (redirects if authed) |
| `/register`     | Register       | Public (redirects if authed) |
| `/`             | Dashboard / Workout List | **Protected** |
| `/profile`      | Profile        | **Protected** |
| `/workouts`     | WorkoutList    | **Protected** |
| `/workouts/new` | WorkoutForm (Add) | **Protected** |
| `/workouts/:id/edit` | WorkoutForm (Edit) | **Protected** |
| `/nutrition`    | Nutrition      | **Protected** |
| `*`             | Redirect to `/login` or `/` | Public |

- The Day 1 Dashboard remains as the home/landing or becomes a thin nav shell
  linking to Workout List, Profile, and Nutrition. Pick one in the plan and keep
  it simple.
- All new routes MUST be wrapped in `ProtectedRoute`.
- A shared `Layout` (Day 1 `Layout.tsx`) SHOULD carry nav links to
  Workout List, Profile, Nutrition, and Logout.

> **Day 1.1 amendment:** Day 1.1 replaces/upgrades the Dashboard surface (the
> `/` route) with the full dashboard shell (Sidebar + TopNavbar + Quick Log +
> all sections). The Dashboard MAY render behind the existing `ProtectedRoute`;
> if it renders standalone with mock data, the plan MUST state the route wiring
> explicitly. No other prior-day routes are removed.

### Profile page (`client/src/pages/Profile.tsx`)

- **View mode** by default: shows `name`, `email`, `bio`, `age`, `heightCm`,
  `weightKg`, `goal`, `fitnessLevel` from `GET /api/users/me`.
- **Edit mode** (toggle button or inline): form fields for the editable fields;
  `name` required, optional numeric/int fields with client-side validation
  mirroring server rules; enum fields rendered as `<select>`.
- Submit calls `PATCH /api/users/me`; on success update local state and return
  to view mode; on failure show inline errors. Disable submit while pending.
- `email` shown read-only (not editable on Day 2).

### Workout List page (`client/src/pages/WorkoutList.tsx`)

- Loads `GET /api/workouts` on mount; renders a list of the current user's
  workouts (name, category, date, exercise count, notes preview).
- Each row: **Edit** link (`/workouts/:id/edit`) and **Delete** button with
  confirmation; Delete calls `DELETE /api/workouts/:id` then refreshes the list
  (or removes the row optimistically).
- Empty state message ("No workouts yet — create one") with a link to
  `/workouts/new`.
- Optional category filter control is allowed but not required Day 2.
- Loading and error states (a friendly message, never a stack trace).

### Add / Edit Workout page (`client/src/pages/WorkoutForm.tsx`)

One page handles both add (`/workouts/new`) and edit (`/workouts/:id/edit`):

- **Top-level fields**: `name` (text), `category` (select from enum), `date`
  (date input), `notes` (textarea).
- **Exercises list**: dynamic rows; each row has `name`, `sets`, `reps`,
  `weightKg`, `notes` inputs plus a **remove** action. A **"Add exercise"**
  button appends a fresh row (defaults: sets=1, reps=1, weight optional).
- Client-side validation mirrors server (`name` required, `sets`/`reps` >= 1
  positive ints, `weightKg` >= 0, lengths).
- **Submit**: Add → `POST /api/workouts` → redirect to list. Edit → `PATCH
  /api/workouts/:id` (send the full current workout including exercises) →
  redirect to list. Disable submit while pending.
- Edit mode pre-fills from `GET /api/workouts/:id`.
- Empty exercise list is allowed for Add; for Edit, preserve existing exercises
  unless the user changes them.

### How exercises/sets/reps/weight/notes are handled in the UI

- Exercises live in an **array held in page state** (one state object per row
  keyed by an index). The UI is a repeatable `<div>` per exercise rendering
  `name`, `sets`, `reps`, `weightKg`, `notes` inputs bound to that row.
- Rows are validated per-field before submit; invalid rows block submit and show
  inline errors.
- On submit the whole `exercises` array is serialized exactly as defined in the
  API contract — no partial exercise updates on Day 2.

### Nutrition page (`client/src/pages/Nutrition.tsx`)

- **Date selector** at top, defaulting to today (`YYYY-MM-DD`). Changing the date
  refetches that day's entries and summary.
- **Daily totals section** displaying the server-computed summary for the
  selected date: total `calories`, `protein`, `carbs`, `fat` (Principle VIII —
  values come from the daily-summary endpoint, never computed client-side as the
  source of truth).
- **Entries grouped by meal type** in fixed order: Breakfast, Lunch, Dinner,
  Snack (grouplabels come from `mealType`).
- Each entry shows `foodName`, `quantity` + `unit` (if present), `calories`,
  and macros; each row has **Edit** and **Delete** (with confirmation).
- **Add Meal / Food entry form** (modal or inline): `mealType` selector
  (breakfast/lunch/dinner/snack), `foodName`, `quantity`, `unit`,
  `calories`, `protein`, `carbs`, `fat`, `date` (defaults to the selected
  page date). Client validation mirrors server rules; submit disabled while
  pending.
- **Edit entry** reuses the same form pre-filled from the entry; Save calls
  `PUT/PATCH /api/nutrition/:id` then refreshes the list + summary.
- **Delete** prompts for confirmation; on confirm calls `DELETE
  /api/nutrition/:id` and refreshes.
- **Loading, empty, success, and error states**: a friendly message on error
  (never a stack trace), an explicit "No entries for this date" empty state,
  spinner while loading, and a transient success note after save/delete.

### How meal types are handled in the UI

- `mealType` is a fixed enum rendered as a labeled group. The same enum drives
  the form's `<select>` and the page's grouping, keeping one source of truth:
  `breakfast | lunch | dinner | snack`.
- Totals are per selected date and aggregate across all four meal groups,
  reflecting the server's summary for that day.

## Definition of Done (Day 2 Success Criteria)

Day 2 is DONE only when ALL of the following hold, in addition to Day 1 still
passing:

1. Day 1 auth still works unchanged (register → login → protected → refused).
2. `User` model includes the new optional profile fields; old documents upgrade
   cleanly (fields optional — no migration data-loss).
3. `GET /api/users/me` and `PATCH /api/users/me` match the contracts and never
   return the password hash.
4. `Workout` model exists with embedded `exercises` and an `owner` reference to
   the user.
5. Full workout CRUD matches the contracts: create (201), list (200), read one
   (200), update (200), delete (204/200), with correct status codes and
   validation errors (400) and auth errors (401).
6. Ownership isolation proven end-to-end: **user A cannot list, read, edit, or
   delete user B's workout** — a cross-user request returns 404 NOT_FOUND and
   never leaks B's data.
7. Workout List page lists only the current user's workouts, and Add/Edit/Delete
   all work correctly against a live server.
8. Profile page views and edits profile fields correctly against a live server.
9. Exercises, sets, reps, weight, and notes round-trip correctly: created,
   displayed, edited, and deleted (via full-array update) without data loss or
   validation bypass.
10. `.env.example` unchanged/complete; no new secrets; `git status` shows no
    `.env` and no secrets.
11. End-to-end walkthrough passes with TWO users (isolation check) and ONE user
    (feature check) per the feature spec's test plan.

## Definition of Done (Day 3 Success Criteria)

Day 3 (Nutrition) is DONE only when ALL of the following hold, in addition to
Day 1 and Day 2 still passing:

1. Day 1 auth and Day 2 profile/workouts still work unchanged.
2. `Nutrition` model exists with `owner`, `foodName`, `quantity`, `unit`,
   `calories`, `protein`, `carbs`, `fat`, `mealType`, `date`, and the composite
   owner/date/mealType index.
3. Full nutrition CRUD matches the contracts: create (201), list (200, filter by
   date + mealType), read one (200), update (200), delete (204), with correct
   400/401/404 statuses.
4. `GET /api/nutrition/summary/daily` returns the caller's total calories +
   protein + carbs + fat for the requested date, computed server-side.
5. Ownership isolation proven end-to-end: **user A cannot list, read, edit, or
   delete user B's nutrition entry** — cross-user requests return 404 NOT_FOUND
   and never leak B's data; the daily summary includes only the caller's entries.
6. Nutrition page groups entries by meal type (Breakfast/Lunch/Dinner/Snack),
   shows the daily totals for the selected date, and supports Add/Edit/Delete
   with confirmation against a live server.
7. No `password` appears in any response; `email` unchanged; no new env vars.
8. All 14+ manual test cases from the Day 3 spec pass, including a two-user
   isolation check. `tsc --noEmit` clean in both workspaces.
9. `.env.example` unchanged/complete; no new dependencies; `git status` shows no
   `.env` or secrets.

## Deferred Scope (Later Days — NOT Day 2, and not Day 3)

Explicitly out of scope for Day 3; do not expand Day 3 work to include these:

- Refresh tokens / token rotation; email verification / password reset / OAuth.
- Roles & authorization (admin/user) beyond plain per-user ownership.
- Rate limiting, account lockout, CSP/helmet hardening beyond the Day 1 baseline.
- Changing email / deleting account / avatar upload / file storage.
- Workout templates, shared/public workouts, social/follow features, likes,
  comments.
- Progress charts/analytics, body-stat tracking over time, history timelines,
  calendar heat-maps.
- Dedicated per-exercise REST endpoints, exercise library/catalog with muscle
  groups, supersets, rest timers.
- Full automated test suite (unit/integration) and CI.
- Deployment, production hardening beyond baseline.
- **Nutrition out-of-scope (Day 3)**: food database / nutrition search API,
  barcode / label scanner, meal templates and bulk "copy meal", water tracking,
  weekly / monthly reports and historical charts, AI suggestions / meal plans,
  recipe import, photo food logging, custom/multi-unit conversion tables, macro
  goals / calorie targets, "add to My Foods" favorites.

These MUST NOT be silently added to Day 3; open a new spec if one is required.

> **Day 1.1 note:** The items listed above are the Day 1–3 deferred scope. The
> Day 1.1 dashboard has its OWN out-of-scope list (see the Day 1.1 Out of Scope
> section), which is separate from this one. Where an item appears in neither
> list, open a new spec rather than silently expanding either phase.

## Governance

This constitution supersedes all other practices. Amendments are required to
change any rule above:

- **Amendment procedure**: Propose the change in writing with rationale and a
  migration plan. Requires explicit approval before implementation.
- **Versioning policy**: Follow semver. MAJOR for removed/redefined principles;
  MINOR for added principles or materially expanded guidance; PATCH for
  clarifications and typo fixes. Day 2 added Principle VII + new domain sections
  → **2.1.0** (MINOR). Day 3 added Principle VIII + the Nutrition domain
  (models, contracts, frontend, DoD) → **2.2.0** (MINOR). Day 1.1 added the
  frontend-only Dashboard phase and redefined the frontend language standard
  (TypeScript → JavaScript-only for the Dashboard) → **3.0.0** (MAJOR).
- **Compliance review**: All plans, specs, and task lists MUST pass the
  "Constitution Check" gate before implementation. Pull requests/reviews MUST
  confirm no violation of the security, ownership, and coding standards. Any
  deliberate complexity beyond this constitution MUST be recorded in the plan's
  Complexity Tracking with justification.
- **Runtime guidance**: Use `.specify/memory/constitution.md` as the source of
  truth; append amendments here and propagate changes to dependent templates.
- **Day ownership**: This document governs the whole project. Day 1 scope is
  complete; Day 2 (profile + workouts) is complete; Day 3 (nutrition tracking)
  is complete; Day 1.1 (dark dashboard) is the current governed day. Later days
  append here via amendment, never by rewriting prior rules without a MAJOR bump
  and migration note.

**Version**: 3.0.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-09-08
