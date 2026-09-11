<!--
  ============================================================================
  SYNC IMPACT REPORT (Day 9 Final Testing & Requirements Check amendment)
  ============================================================================
  Version change      : (minor) 4.0.0  ->  4.1.0 (Day 9: Final Testing &
                        Requirements Check — T1-T6 non-negotiable principles +
                        Required Testing Areas + domain sections)
  Modified principles : No Core Principle (I-VIII) removed or redefined.
                        Prior-day principle sets (D1-D2, P1-P9, H1-H10, A1-A10,
                        S1-S10, N1-N10, ST1-ST8, R1-R9, L1-L9, PU1-PU6)
                        UNCHANGED in substance. Day 8.3 heading marker ->
                        (COMPLETE); Day 9 becomes (ACTIVE).
  Added sections      : Day 9 - T1. Requirements Traceability (NON-NEGOTIABLE)
                        Day 9 - T2. End-to-End Coverage (NON-NEGOTIABLE)
                        Day 9 - T3. No Silent Failures (NON-NEGOTIABLE)
                        Day 9 - T4. Cross-Device Quality
                        Day 9 - T5. Fix Before Finish
                        Day 9 - T6. Evidence-Based Sign-off
                        Day 9 Required Testing Areas (9 non-negotiable areas:
                          CRUD, auth, dashboard, charts, search, notifications,
                          settings, reports, responsive)
                        Day 9 Out of Scope
                        Day 9 Process Rules (5 rules)
                        Day 9 Definition of Done (7 criteria)
  Removed sections    : (none). All prior-day sections retained.
  Templates           : ✅ plan-template.md   - Constitution Check gate stays
                                                     generic; no new gate type
                         ✅ spec-template.md   - DoD / success criteria align
                                                     with T6 evidence-based
                                                     sign-off; reused as-is
                         ✅ tasks-template.md  - parallel labelling and
                                                     user-story grouping
                                                     remain valid
                         ⚠ commands/           - NO commands/*.md directory exists
                                                     in this repo (PowerShell
                                                     setup); non-blocking
                         ✅ AGENTS.md           - already up to date (013 plan
                                                     landed); Day 9 testing
                                                     is verification-only, no
                                                     new technologies added
  Deferred TODOs      : (none). Ratification date (2026-08-27) and amendment
                        date (2026-09-10) confirmed from footer + prior PHRs.
  NOTE                : MINOR bump (per semver Governance policy, MINOR = added
                        principles or materially expanded guidance): Day 9 adds
                        6 new non-negotiable QA principles (T1-T6) that govern
                        how the project is verified, not how it is built. This
                        is the first "process governance" phase — all prior days
                        governed BUILD rules (what to build, how to build it);
                        Day 9 governs VERIFICATION rules (how to prove it works).
                        The testing phase touches no source code except bug fixes;
                        it is pure audit + evidence + targeted fixes. All
                        Day 1-8.3 build rules remain binding; Day 9 rules apply
                        ON TOP of them during the final QA gate.
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
>
> **Day 2.1 amendment:** The override above EXTENDS to the Day 2.1 Progress &
> Goals phase (frontend-only, same dark dashboard shell). All Day 2.1 work is
> `.js`/`.jsx` only. Any backend/TypeScript task beyond Day 2.1 scope requires a
> new amendment.
>
> **Day 3.1 amendment:** The override above EXTENDS to the Day 3.1 Activities &
> Workout History phase (frontend-only, same dark dashboard shell). All Day 3.1
> work is `.js`/`.jsx` only. Any backend/TypeScript task beyond Day 3.1 scope
> requires a new amendment.
>
> **Day 4.1 amendment:** The override above EXTENDS to the Day 4.1 Analytics
> Module phase (frontend-only, same dark dashboard shell). All Day 4.1 work is
> `.js`/`.jsx` only. Any backend/TypeScript task beyond Day 4.1 scope requires
> a new amendment.
>
> **Day 5.1 amendment:** The override above EXTENDS to the Day 5.1 Search &
> Filtering phase (frontend-only, same dark dashboard shell). All Day 5.1 work
> is `.js`/`.jsx` only. Any backend/TypeScript task beyond Day 5.1 scope
> requires a new amendment.
>
> **Day 6.1 amendment:** The override above EXTENDS to the Day 6.1 Notifications
> & Reminders phase (frontend-only, same dark dashboard shell). All Day 6.1 work
> is `.js`/`.jsx` only. Any backend/TypeScript task beyond Day 6.1 scope
> requires a new amendment.

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

## Day 1.1 — Dark Fitness Tracker Dashboard (COMPLETE)

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
  muted (`#232a33`); primary accent ONE hue — vibrant orange from v4.0.0
  onward (see the v4.0.0 redefinition below); text primary near-white,
  secondary muted gray; danger/red and neutral states reserved for errors.
- > **v4.0.0 amendment (Day 8.3):** The brand accent is REDEFINED from lime
  > (`--color-accent: #A3E635`) to **vibrant orange** (canonical target
  > `--color-accent: #F97316`, Tailwind orange-500; exact hex finalized in the
  > Day 8.3 plan within the vibrant-orange family). This SUPERSEDES every
  > earlier lime/green accent reference in this constitution (Day 1.1 Design
  > System Decisions, Day 2.1/3.1/4.1/6.1/7.1/8.1 UI/UX rules, Day 8.2 L3).
  > Semantic status colors (success/warning/error) remain ONLY for their
  > semantic meaning, never as decorative brand accents (PU2).
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

## Day 2.1 — Progress & Goals (COMPLETE)

### Project Goal & Definition

Day 2.1 builds the **Progress & Goals** section of the Fitness Tracker,
continuing the Day 1.1 modern dark dashboard. It is **frontend-only** using
**only `.js` and `.jsx` files (strictly no TypeScript)**, scoped to the existing
`frontend/` workspace, and reuses the committed React + Vite + React Router +
Tailwind setup plus the Day 1.1 layout shell (`DashboardLayout` = `Sidebar` +
`TopNavbar`) and design tokens. It MUST NOT break, modify, or regress any Day 1.1
dashboard behaviour (the dark shell, tokens, `ui/` primitives, existing routes).

The phase delivers TWO new pages plus the features they surface, matching the
existing visual language (deep charcoal background, `dash-card` surfaces, orange
accent, consistent type scale):

1. **Progress page** (`/progress`): weight tracking (log + list + graph), body
   measurements, weight progress graph, workout performance graph, strength /
   progression history.
2. **Goals page** (`/goals`): personal goals with progress bars, goal completion
   status, milestones, and the streak system.

Both pages MUST render inside the existing `DashboardLayout` shell. The top-nav
tabs and sidebar menu may activate real routes (`Dashboard`, `Workouts`,
`Nutrition`, **`Progress`**, **`Goals`**) while any tab without an implemented
page stays an inert placeholder exactly as Day 1.1 did. Inert tabs DO NOT
warrant new routes.

### Core Principles (Day 2.1)

#### P1. Frontend-Only, Mock-Data Phase (NON-NEGOTIABLE)

Day 2.1 MUST NOT touch the backend, add API calls, require authentication, or
change any data model or environment variable. All data is mock/local, imported
from clearly-named modules under `frontend/src/data/` so it can later be swapped
for real API responses. Existing `services/` API code is out of scope.

Rationale: Matches the Day 1.1 delivery model; keeps the phase shippable and
reviewable without server, DB, or auth dependencies.

#### P2. JavaScript-Only (NON-NEGOTIABLE)

Same rule as Day 1.1 D1: `.js` for logic/util/constants/data modules, `.jsx` for
components and pages. No `.ts`/`.tsx`, no type annotations, no `@ts-check`, no
`tsconfig` changes governing the frontend.

#### P3. Reuse the Day 1.1 Shell and Primitives (NON-NEGOTIABLE)

The Progress and Goals pages MUST reuse `DashboardLayout` (Sidebar + TopNavbar),
the `dash-card`, `dash-num`, `accent-text`, `ring-track` utilities/tokens from
`index.css`, and the existing `ui/` primitives (`Card`, `ProgressBar`,
`EmptyState`, `Spinner`). Do not fork or restyle copies of Day 1.1 markup. New
shared primitives ONLY when needed and non-colliding with existing exports.

Rationale: "Match the overall visual language of the existing dashboard" is an
explicit requirement; duplication is the anti-pattern D4 forbids.

#### P4. Every Section Has Proper Empty, Loading, and Error States

Each data-driven section MUST render a designed `EmptyState` when its data is
absent, a `Spinner`/loading branch while loading, and a friendly error message
(never a stack trace) on error. Charts with zero/one points, empty goal lists,
and empty streak data MUST show designed empty states, never broken axes or NaN.

#### P5. No New Runtime Dependencies

Reuse the committed stack; hand-rolled SVG for all graphs. No charting library,
no date library, no state library. If a task appears to need one, open a
constitution amendment first and record it in Complexity Tracking.

#### P6. Charts Must Be Interpretable

Every chart MUST have: a clear label/title (from its section), readable axis
labels or captions, explicit point values on hover/title where sensible, and a
legend or inline key for multi-series. Charts MUST reflow with the card width
(`viewBox` + `w-full`), never overflow, and never render blank.

#### P7. Derived Values Are Pure Functions

Progress percentage, goal completion status, milestone reached/not-reached, and
streak counts MUST be computed by small, exported, **pure JavaScript
functions** in `frontend/src/utils/` (e.g. `progressUtils.js`, `streakUtils.js`)
that take data and return values. Components render results; they do not embed
calculations inline. This makes the rules testable and ready for a future API
swap.

Rationale: Goal/streak math is finicky; isolating it in pure functions keeps UI
components dumb and the rules single-sourced.

#### P8. Local State Only; Same Discipline as Day 1.1

Page/section state uses `useState` locally. Lift only when two or more
components share it. No external state library. Optional user interactions
(e.g. logging a weight entry) may append to local state for the session; nothing
persists, and refresh resets to mock data.

#### P9. Fully Responsive, Desktop-First (Same as D8)

Progress & Goals MUST be fully responsive: full side-by-side layout at desktop,
stacking/reflow at tablet, single-column with no horizontal scroll at mobile.
All grids (goal cards, measurement cards, streak row) reflow like the Day 1.1
summary/progress grids.

### Folder & Component Structure (Day 2.1)

All under the existing `frontend/src/` workspace. Additions are additive — no
Day 1.1 file is moved or renamed, except `App.jsx` gaining two routes and
`index.css` MAY gain strictly-additive token/utility classes.

```text
frontend/src/
├── App.jsx                     # + <Route path="/progress"> and <Route path="/goals">
│                               #   (standalone like "/", inside DashboardLayout)
├── components/
│   ├── progress/
│   │   ├── ProgressPageLayout? # NOT needed — reuse components/layout/DashboardLayout
│   │   ├── WeightTracker.jsx   # Latest weight + quick-add + entry list
│   │   ├── Measurements.jsx    # Body measurement cards (chest/waist/arms/hips/thighs)
│   │   ├── WeightChart.jsx     # Weight-progress line/area chart (hand-rolled SVG)
│   │   ├── PerformanceChart.jsx# Workout performance graph (volume/load over time)
│   │   ├── StrengthHistory.jsx # Strength / progression history (best lifts, PRs)
│   │   ├── GoalsList.jsx       # Goals page: grid of GoalCards
│   │   ├── GoalCard.jsx        # Reusable goal card (title, ProgressBar, status, milestones)
│   │   ├── Milestones.jsx      # Milestone checklist within a goal card
│   │   ├── StreakRow.jsx       # Row of streak stats
│   │   ├── StreakStat.jsx      # Reusable streak display (icon + count + unit + best)
│   │   └── StatusBadge.jsx     # status pill (on track / completed / missed / no goal)
│   └── ui/                     # existing; add non-colliding primitives ONLY if needed
├── pages/
│   ├── Progress.jsx            # /progress — composes Progress-page sections
│   └── Goals.jsx               # /goals — composes Goals-page sections
├── data/
│   ├── progressData.js         # weightEntries, measurements, performance, strengthHistory
│   ├── goalsData.js            # goals (+ milestones), streaks; EMPTY variants
│   └── constants.js            # + MEASUREMENT_FIELDS, GOAL_CATEGORIES, STREAK_TYPES
└── utils/
    ├── progressUtils.js        # progressPct, goalStatus, milestonesReached (pure)
    └── streakUtils.js          # computeStreak, streakLabel (pure)
```

Rules:
- One logical unit per file; components that render JSX are `.jsx`; pure logic
  and data are `.js`.
- Sections are composed in `pages/Progress.jsx` and `pages/Goals.jsx` exactly as
  Day 1.1 composes sections in `pages/Dashboard.jsx`.
- `data/` and `utils/` are the ONLY places mock data and calculations live.

### Data Shape Decisions (Day 2.1)

All mock data is plain JS objects/arrays in `data/progressData.js` and
`data/goalsData.js`, each with a populated and an EMPTY variant (mirroring Day
1.1 `dashboardData.js` / `emptyDashboardData`).

**Weight entries** — one object per day logged:

```js
{ id, date: "2026-09-01", weightKg: 78.5 }
```

**Body measurements** — one object per measuring session (all values optional,
cm):

```js
{ id, date: "2026-09-01", chestCm, waistCm, armsCm, hipsCm, thighsCm }
```

**Workout performance** — per-week aggregate to feed the performance graph:

```js
{ id, week: "2026-08-31", totalVolumeKg: 12400, sessions: 4, bestLiftKg: 95 }
```

**Strength / progression history** — best-effort records (PRs):

```js
{ id, exercise: "Bench Press", date: "2026-09-05", prKg: 95, sets: 4, reps: 8, note }
```

**Goals** — each goal has a current vs target value plus completion info and
nested milestones:

```js
{ id, title: "Squat 120kg", category: "strength",
  targetValue: 120, currentValue: 110, unit: "kg",
  startDate, targetDate, completedAt: null,
  milestones: [{ id, title: "50% — 60kg", threshold: 50, reachedAt }] }
```

**Streaks** — display-level records (count + best):

```js
{ key: "workout", label: "Workout Streak", current: 12, best: 21, unit: "days" }
```

Constants in `constants.js`: `MEASUREMENT_FIELDS` (key + label + unit per
measurement), `GOAL_CATEGORIES` (e.g. `strength`, `weight`, `habit`,
`endurance`), `STREAK_TYPES` (workout, hydration, check-in).

### Chart & Graph Behaviour (Day 2.1)

- **WeightChart**: line/area chart, x = date, y = weightKg. One point renders as
  a marker + value; two point-ish renders a flat line; a single point is NOT an
  empty state but shows the recorded value. Zero entries → `EmptyState`
  ("No weight entries yet").
- **PerformanceChart**: bar or line of weekly `totalVolumeKg` (or sessions);
  empty → `EmptyState`. Show per-bar/week value via `title`/caption.
- Both charts: hand-rolled SVG with `viewBox` scaling, `w-full`, `role="img"`,
  `aria-label`, no external library (P5).
- Every section follows P4: loading (Spinner), error (friendly message), empty
  (EmptyState).

### Goal System Rules (Day 2.1)

1. **Progress percentage** — `progressPct(current, target)` returns an integer
   clamped to 0–100. `target <= 0` (or missing) → returns `null` and the card
   shows a "No goal set" state (0-width bar + caption, per Day 1.1 empty
   behaviour).
2. **Completion status** — `goalStatus(goal)` derives from data, never stored
   as a free-for-all string:
   - `completed` if `currentValue >= targetValue` OR `completedAt` is set.
   - `missed` if not completed AND `targetDate` is in the past.
   - `on-track` otherwise.
3. **Milestones** — each milestone has a numeric `threshold` (0–100). A
   milestone is `reached` when `progressPct >= threshold` (or its `reachedAt` is
   set). Reached milestones render as checked/`accent`; unreached render muted.
   Milestones display within their goal card, never as a separate top-level
   section without a goal.
4. **Status display** — a `StatusBadge` pill uses semantic colors from the
   theme: `on-track` = success green, `completed` = accent (orange),
   `missed` = warning amber, `no-goal` = muted gray.

### Streak System Rules (Day 2.1)

1. Streaks count **consecutive occurrences** of a behaviour (days with logged
   workouts, exercise, or check-in) up to today.
2. A pure helper `computeStreak(dates, { cadenceDays = 1 })` in
   `streakUtils.js`:
   - sorts unique dates ascending,
   - walks backwards from the most recent date,
   - increments while the previous date is within `cadenceDays` of the prior
     (gap > cadenceDays breaks the streak),
   - returns `{ current, best, active }` where `active=false` when the most
     recent occurrence is older than `cadenceDays` (streak counts as broken).
3. Day 2.1 mock: `goalsData.js`/`progressData.js` MAY ship static `current`/
   `best` values, but the displayed values MUST still flow through the same
   formatting helpers so behavior matches real computation. When workout dates
   are available, `computeStreak` SHOULD be used to derive the workout streak.
4. **Display** — `StreakStat` shows icon + prominent current count + unit and a
   secondary "Best: N" line. The streak row (Hydration/Workout/Check-in or
   similar) renders on the Goals page (and MAY on Progress). Empty → "No streak
   data yet" EmptyState; `current: 0` is valid and renders "0 days — start
   today", never a blank.
5. Streaks are per-user and derived; they are NOT editable mock numbers stored
   in components.

### State Management Approach (Day 2.1)

- `useState` in the page owning each slice (weight entries, measurements,
  goals, streaks). Import mock data; never re-create it in components.
- Section components receive data + optional handlers as props (same pattern as
  Day 1.1 `SummaryCards`, `ProgressCards`).
- Lift state only if two or more components share it (e.g. a quick-add that must
  update both the latest-weight card and the weight list → lift to the page).
- No Context required for Day 2.1 unless the plan demonstrates shared state that
  local `useState` cannot cleanly handle; if added, a single `ProgressDataContext`
  in `context/`.

### UI/UX Rules (Day 2.1)

- Same dark theme, tokens, `dash-card` sections, `dash-num` headline numbers,
  orange accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1.
- Progress bars reuse `ui/ProgressBar` with the same `ring-track`/status color
  conventions established in Day 1.1.
- Status indicators are the `StatusBadge` pill only; never invent new color
  meanings beyond success/accent/warning/muted.
- Numeric formatting: weights/measurements with one decimal (e.g. `78.5 kg`),
  volumes with thousands separators (e.g. `12,400 kg`), streak counts as whole
  numbers + unit.
- Accessibility: measurement inputs as real `<input>`s, icon-only controls get
  `aria-label`, semantic `<section>`/`<ul>` markup, focus-visible rings use the
  accent color, contrast readable on dark.
- Long exercise/goal names truncate (`truncate`), never wrap awkwardly.

### Coding Standards (Day 2.1)

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (P2).
- **Naming**: `camelCase` functions/variables, `PascalCase` components,
  `SCREAMING_SNAKE` constants. Default export for pages/components, named
  exports for utils/constants.
- **Imports**: clean and grouped (react → libraries → local relative).
- **Comments**: none explaining the obvious; only decision/non-obvious
  justifications. No AI-looking boilerplate.
- **Dead code**: none; remove unused imports/variables.
- **Purity**: calculations live in `utils/` pure functions (P7), not in render.
- All other Day 1.1 coding standards apply unchanged.

### Definition of Done (Day 2.1 Success Criteria)

Day 2.1 is DONE only when ALL of the following hold, in addition to Day 1.1
still passing:

1. Day 1.1 dashboard at `/` renders unchanged (shell, sections, charts, empty
   states, responsive behaviour) — no regression.
2. `/progress` renders inside the existing `DashboardLayout` and shows: weight
   tracking (latest + list), body measurements, weight progress graph, workout
   performance graph, and strength / progression history.
3. `/goals` renders inside the existing `DashboardLayout` and shows: personal
   goals with progress bars, completion status badges, and milestones.
4. The streak system renders correctly: current count + best display, derived
   via `streakUtils`, with a valid "0 / broken" state and an empty state.
5. Progress percentages clamp at 0–100; `target <= 0` shows "No goal set";
   statuses are exactly `on-track | completed | missed` derived from data.
6. Every chart and section has designed empty, loading, and error states — none
   render blank/broken/NaN (P4).
7. Design matches the existing dark dashboard: same tokens, cards, accent,
   type; fully responsive with no horizontal scroll at any breakpoint.
8. All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime dependency;
   no backend, API, env, or model changes.
9. `npm run build` (vite build) succeeds cleanly.
10. Manual browser verification is recorded (both pages, all sections, empty/
    loading/error exercised, responsive at 3 breakpoints, Day 1.1 `/` regression
    check).
11. Navigation: implemented tabs (Dashboard, Workouts, Nutrition, Progress,
    Goals) navigate correctly; any inert tabs remain inert placeholders.

### Out of Scope (Day 2.1 — Deferred)

Explicitly NOT part of Day 2.1; do not expand Day 2.1 work to include:

- Any backend, API, or database change (no models, routes, controllers, or
  services); server-side computation of stats.
- Authentication/registration/login changes or protecting `/progress`/`/goals`
  behind auth (they render as standalone mock pages like Day 1.1 `/`).
- TypeScript adoption or conversion of existing files.
- Real persistence, storage, sync, import/export (CSV/Fitbit/Apple Health),
  or device integrations.
- Notifications, reminders, push, email, social sharing, and public/community
  leaderboards.
- Advanced analytics: one-rep-max estimation algorithms beyond recorded lifts,
  machine-learning coaching, trend-line forecasting, body-composition estimation.
- Editing/deleting weight or measurement historical entries beyond a mock quick-
  add in local state; goal creation/editing UI beyond the mock goal list.
- Automated test suite and CI for the frontend.
- New runtime dependencies (charts/date/state libraries).
- Deployment or production hosting.

These MUST NOT be silently added to Day 2.1; open a new spec if one is required.

---

## Day 3.1 — Activities & Workout History (COMPLETE)

### Project Goal & Definition

Day 3.1 builds the **Activities & Workout History** section of the Fitness
Tracker, continuing the Day 1.1 dark dashboard and the Day 2.1 Progress & Goals
phase. It is **frontend-only** using **only `.js` and `.jsx` files (strictly no
TypeScript)**, scoped to the existing `frontend/` workspace, and reuses the
committed React + Vite + React Router + Tailwind setup, the `DashboardLayout`
shell (`Sidebar` + `TopNavbar`), the `ui/` primitives, and the dark design
tokens. It MUST NOT break, modify, or regress any Day 1.1 dashboard or Day 2.1
Progress & Goals behaviour.

The phase delivers the training-history pages and their features, matching the
existing visual language (deep charcoal background, `dash-card` surfaces, orange
accent, consistent type scale):

1. **Workout History page** (`/workouts-history`): complete, filterable workout
   history list with category and date-based filtering and improved workout
   cards.
2. **Workout Detail view** (`/workouts/:id`): a single workout's full detail —
   header, meta, and its exercises with per-exercise sets/reps/weight.
3. **Exercise History page** (`/exercises`): per-exercise history across all
   workouts (sets/reps/weight progression over time).
4. **Personal Records / Best Performance** surfaced within the Exercise History
   and Detail views (computed best lifts and best efforts).

These pages MUST render inside the existing `DashboardLayout` shell and follow
the nav pattern established in Day 2.1: implemented tabs (`Workouts`,
`Nutrition`, `Progress`, `Goals`, and a new `History`/`Activities` link) activate
real routes while any tab without an implemented page stays an inert placeholder.
Day 3.1 navigates to existing `/workouts` routes only where they already exist; it
does not rework the existing auth-phase Workout List/Form CRUD.

### Core Principles (Day 3.1)

#### H1. Frontend-Only, Mock-Data Phase (NON-NEGOTIABLE)

Day 3.1 MUST NOT touch the backend, add API calls, require authentication, or
change any data model or environment variable. All data is mock/local, imported
from clearly-named modules under `frontend/src/data/` so it can later be swapped
for real API responses. Existing `services/` API code is out of scope and MUST
NOT be called by these pages.

Rationale: Matches the Day 1.1 and Day 2.1 delivery model; keeps the phase
shippable and reviewable without server, DB, or auth dependencies.

#### H2. JavaScript-Only (NON-NEGOTIABLE)

Same rule as Day 1.1 D1 and Day 2.1 P2: `.js` for logic/util/constants/data
modules, `.jsx` for components and pages. No `.ts`/`.tsx`, no type annotations,
no `@ts-check`, no `tsconfig` changes governing the frontend.

#### H3. Reuse the Existing Shell and Primitives (NON-NEGOTIABLE)

The new pages MUST reuse `DashboardLayout`, the `dash-card`, `dash-num`,
`accent-text`, `ring-track` utilities/tokens from `index.css`, and the existing
`ui/` primitives (`Card`, `Badge`, `EmptyState`, `Spinner`, `Skeleton`,
`ProgressBar`, `Select`, `Input`). Do not fork or restyle copies of Day 1.1/2.1
markup. New shared primitives ONLY when needed and non-colliding with existing
exports.

Rationale: "Match the overall visual language of the existing dashboard" is an
explicit requirement; duplication is the anti-pattern D4 forbids.

#### H4. Every Section Has Proper Empty, Loading, and Error States

Each data-driven section MUST render a designed `EmptyState` when its data is
absent, a `Spinner`/`Skeleton` loading branch while loading, and a friendly error
message (never a stack trace) on error. Empty workout lists, empty exercise
histories, and empty personal records MUST show designed empty states, never
broken layouts or `NaN`.

#### H5. No New Runtime Dependencies

Reuse the committed stack; hand-rolled SVG for any mini-charts. No charting
library, no date library, no state library. If a task appears to need one, open a
constitution amendment first and record it in Complexity Tracking.

#### H6. Filtering Is Pure and Derivable

Category and date-based filtering MUST be computed by small, exported, **pure
JavaScript functions** in `frontend/src/utils/` (e.g. `historyUtils.js`) that
take the full workout array plus filter inputs and return the filtered array
(and, where needed, grouped results). Components render results; they do not
embed filter calculations inline. Filter state (selected category, date range)
lives in page `useState` and is applied via these pure functions.

Rationale: Filtering logic is central and must be single-sourced, testable, and
ready for a future API swap where filtering may move server-side.

#### H7. Personal Records Are Derived, Never Stored

Personal records / best performance MUST be computed on the fly by pure
functions over the workout/exercise data (`bestLift(exercise, workouts)`,
`bestSet`, `bestVolume`, etc.) — never persisted as editable mock numbers.
Components render the derived result.

Rationale: PRs are a projection of logged history; deriving them keeps one source
of truth and guarantees correctness as the history grows.

#### H8. Local State Only; Same Discipline as Day 1.1/2.1

Page/section state uses `useState` locally. Lift only when two or more components
share it. No external state library. Filter selections and any quick interactions
may use local state for the session; nothing persists, and refresh resets to mock
data.

#### H9. Fully Responsive, Desktop-First (Same as D8)

Activities & Workout History MUST be fully responsive: full side-by-side layout
at desktop, stacking/reflow at tablet, single-column with no horizontal scroll at
mobile. Workout card grids, the detail layout, and exercise tables reflow like
the Day 1.1/2.1 grids.

#### H10. Navigation Is Additive and Non-Destructive

Day 3.1 MAY add nav entries (a `History`/`Activities` link in sidebar/tabs) and
new routes, but MUST NOT remove or repurpose existing nav entries. Inert tabs
remain inert placeholders exactly as prior days. Workbook/history routes use
distinct paths that do not collide with existing auth-phase routes.

### Folder & Component Structure (Day 3.1)

All under the existing `frontend/src/` workspace. Additions are additive — no
Day 1.1, Day 2.1, or Day 2 file is moved or renamed, except `App.jsx` gaining
new routes and `index.css` MAY gain strictly-additive token/utility classes.

```text
frontend/src/
├── App.jsx                     # + <Route path="/workouts-history">,
│                               #   /workouts/:id (detail), /exercises
│                               #   (all inside DashboardLayout, like /progress)
├── components/
│   ├── history/                # (new; mirrors components/progress/)
│   │   ├── WorkoutHistoryList.jsx # workout list / grid of WorkoutCards
│   │   ├── WorkoutCard.jsx     # improved workout card (name, category, date, sets)
│   │   ├── WorkoutDetail.jsx   # single workout full detail view
│   │   ├── ExerciseHistory.jsx # per-exercise progression list
│   │   ├── PersonalRecords.jsx # best lifts / best performance list
│   │   ├── HistoryFilters.jsx  # category + date filter controls
│   │   ├── CategoryBadge.jsx   # category pill (semantic color)
│   │   └── ExerciseRow.jsx     # one exercise row (sets/reps/weight)
│   └── ui/                     # existing; add non-colliding primitives ONLY if needed
├── pages/
│   ├── WorkoutHistory.jsx      # /workouts-history — composes list + filters
│   ├── WorkoutDetail.jsx       # /workouts/:id — composes detail view
│   └── ExerciseHistory.jsx     # /exercises — composes exercise + PRs
├── data/
│   ├── workoutHistoryData.js   # workouts[] (full history, categories/dates/exercises),
│   │                           #   EMPTY variant; exercises for Exercise History
│   └── constants.js            # + WORKOUT_CATEGORIES, PR_FIELDS, DATE_FILTER_OPTIONS
└── utils/
    ├── historyUtils.js         # filterWorkouts, groupByDate, bestLift, bestSet,
    │                           #   bestVolume, formatVolume (pure)
    └── (existing progressUtils.js / streakUtils.js reused where relevant)
```

Rules:
- One logical unit per file; components that render JSX are `.jsx`; pure logic
  and data are `.js`.
- Sections are composed in the pages exactly as Day 1.1 `Dashboard.jsx` and Day
  2.1 `Progress.jsx`/`Goals.jsx`.
- `data/` and `utils/` are the ONLY places mock data and calculations live.

### Data Shape Decisions (Day 3.1)

All mock data is plain JS objects/arrays in `data/workoutHistoryData.js`, with a
populated and an EMPTY variant (mirroring `dashboardData.js` /
`emptyDashboardData` and the Day 2.1 data modules).

**Workout** — the canonical shape the history pages render:

```js
{ id, name: "Push Day", category: "strength", date: "2026-09-05", notes,
  exercises: [ { id, name: "Bench Press", sets: 4, reps: 8, weightKg: 60 } ] }
```

- `category` comes from `WORKOUT_CATEGORIES` (e.g. `strength`, `cardio`,
  `flexibility`, `hybrid`, `other`), stored lowercase.
- `date` is a `YYYY-MM-DD` string (matches Day 2.1 date convention) so filtering
  is a straightforward string compare.

**Exercise** — embedded per-workout, each with sets/reps/weight:

```js
{ id, name: "Bench Press", sets: 4, reps: 8, weightKg: 60 }
```

- `weightKg` is optional; `0`/`undefined` = bodyweight (matches the Day 2 model).

**Category structure** — a fixed array in `constants.js`:

```js
export const WORKOUT_CATEGORIES = [
  { key: 'strength',  label: 'Strength' },
  { key: 'cardio',    label: 'Cardio' },
  { key: 'flexibility', label: 'Flexibility' },
  { key: 'hybrid',    label: 'Hybrid' },
  { key: 'other',     label: 'Other' },
];
```

**Personal records structure** — derived, described by a field list:

```js
export const PR_FIELDS = [
  { key: 'bestLiftKg',  label: 'Best Lift',  unit: 'kg' },
  { key: 'bestSet',     label: 'Best Set',   unit: 'kg' },
  { key: 'bestVolumeKg',label: 'Best Volume',unit: 'kg' },
];
```

Date filter options (`DATE_FILTER_OPTIONS`) support quick ranges (e.g. All,
This Week, This Month, Last 3 Months) plus a custom `from`/`to` date pair.

### Workout History Page Layout & Behaviour (Day 3.1)

- **Layout**: a filters row (category `<select>` + date range incl. quick
  ranges) above a grid of `WorkoutCard`s, grouped newest-first by date (a date
  heading per group when useful).
- **Default state**: shows ALL workouts newest-first with no filter applied.
- **Filter controls** must read/write page `useState` and re-render the list via
  the pure `filterWorkouts` helper — never mutate the source array.
- **Card actions**: each card links to its `/workouts/:id` detail view. Cards
  show name, `CategoryBadge`, date, exercise count, and a summary (e.g. total
  sets or a headline metric). No edit/delete in this phase (see Out of Scope).
- **Listed count** ("N workouts") should be shown so filtering is observable.

### Workout Detail View Rules (Day 3.1)

- Route `/workouts/:id` loads the matching workout from mock data by `id`
  (a pure `findWorkout(workouts, id)`); a missing/unknown id MUST render a
  friendly "Workout not found" `EmptyState` with a back link, never a crash.
- Header: workout name, `CategoryBadge`, full date, optional notes.
- Body: a table/list of exercises — name, sets, reps, weightKg (or "Bodyweight"),
  and a derived per-exercise volume (`sets × reps × weightKg`) when weight exists.
- A "Back to history" link returns to `/workouts-history`.
- Detail uses the same `dash-card` and type conventions; the total workout volume
  (sum of exercise volumes) MAY be shown as a headline metric.

### Filtering System (Category + Date) (Day 3.1)

1. **Category filter**: single-select from `WORKOUT_CATEGORIES` (plus "All").
   `filterWorkouts(workouts, { category })` returns workouts whose `category`
   matches (empty/`all` = no category filter).
2. **Date filter**: supports quick ranges and/or explicit `from`/`to`
   `YYYY-MM-DD` bounds. A workout matches when its `date` string is within the
   inclusive range. `filterWorkouts` treats absent bounds as unbounded.
3. **Composition**: both filters MUST compose (AND). `filterWorkouts` accepts one
   options object `{ category, from, to }` and returns a NEW array (never mutates
   input).
4. **Empty result**: when filters match nothing, the list renders the
   `EmptyState` ("No workouts match your filters") — distinct from the
   no-workouts-at-all state — with an action to clear filters.
5. **Sort**: results stay newest-first by `date` after filtering.

### Personal Records / Best Performance Logic (Day 3.1)

Pure functions in `historyUtils.js` aggregate over exercise history:

1. **bestLift(exerciseName, workouts)** → highest `weightKg` recorded across all
   workouts for that exercise (ignores bodyweight `0`/`undefined` records).
2. **bestSet(exerciseName, workouts)** → the single set with the highest
   volume (`sets × reps × weightKg`) for that exercise.
3. **bestVolumeKg(workout)** → `sum(exercises: sets × reps × weightKg)` for one
   workout; `bestVolumeHg(history)` → the max across a set of workouts.
4. **PR display**: On the Exercise History page show a `PersonalRecords` panel
   with the best lift + best set for the selected exercise, and on the Detail
   view show total volume. Derived each render from current data (H7) — no
   stored PR numbers.
5. **Empty**: when an exercise has no weighted history, show "No personal records
   yet" `EmptyState`, never `0 kg`/`NaN`.

### Improved Workout Card Design Rules (Day 3.1)

- Build on the Day 1.1 `dash-card` surface; a `WorkoutCard` is a reusable
  component (D4 reuse, not duplication).
- **Content**: workout name (prominent), `CategoryBadge`, date, a compact
  summary line (e.g. "4 exercises · 32 sets" or headline metric + total volume),
  and an explicit hover/active state signalling it links to the detail view.
- **Visual rules**: same rounded corners, border, shadow, and 4px spacing as
  existing cards; the category is a `Badge` with a semantic color mapped from
  `WORKOUT_CATEGORIES`; text truncates (`truncate`) for long names; numeric
  values use the `dash-num` style.
- Cards MUST be keyboard-focusable with visible focus rings when they are links.

### Empty State Behaviour (Day 3.1)

- Shared `EmptyState` (icon + short message + optional action) is used for:
  - no workouts at all ("No workouts recorded yet"),
  - no workouts matching filters ("No workouts match your filters" + clear
    action),
  - workout not found by id ("Workout not found" + back link),
  - no exercise history ("No exercise history yet"),
  - no personal records ("No personal records yet").
- Loading (`Spinner`/`Skeleton`) and error (friendly message, never a stack
  trace) branches MUST be present on every data-driven section (H4).

### State Management Approach (Day 3.1)

- `useState` in each page for its slice: the mock workouts array, the selected
  category filter, and the date filter.
- `filterWorkouts` and the PR helpers are called in render (or a memo) from that
  state; they return new arrays/values.
- Lift state only when two or more components share it (e.g. filter state
  shared between the filter row and the list may live in the page).
- No Context required for Day 3.1 unless the plan demonstrates shared state that
  local `useState` cannot cleanly handle; if added, one `HistoryDataContext` in
  `context/`.

### UI/UX Rules (Day 3.1)

- Same dark theme, tokens, `dash-card` sections, `dash-num` headline numbers,
  orange accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1/2.1.
- Category indicators are a `CategoryBadge` pill using semantic colors; never
  invent new color meanings beyond success/accent/warning/muted.
- Numeric formatting: weights/volume with one decimal or whole numbers as
  appropriate (e.g. `60 kg`, `1,440 kg` volume with thousands separators); dates
  formatted consistently.
- Accessibility: filter controls are real `<select>`/`<input>`s, link cards are
  real `<a>`/`<button>`s with `aria-label` where icon-only, semantic
  `<section>`/`<ul>` markup, focus-visible rings use the accent color, contrast
  readable on dark.

### Coding Standards (Day 3.1)

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (H2).
- **Naming**: `camelCase` functions/variables, `PascalCase` components,
  `SCREAMING_SNAKE` constants. Default export for pages/components, named
  exports for utils/constants.
- **Imports**: clean and grouped (react → libraries → local relative).
- **Comments**: none explaining the obvious; only decision/non-obvious
  justifications. No AI-looking boilerplate.
- **Dead code**: none; remove unused imports/variables.
- **Purity**: filtering and PR math live in `historyUtils.js` pure functions
  (H6/H7), not in render.
- All other Day 1.1/2.1 coding standards apply unchanged.

### Definition of Done (Day 3.1 Success Criteria)

Day 3.1 is DONE only when ALL of the following hold, in addition to Day 1.1 and
Day 2.1 still passing:

1. Day 1.1 dashboard at `/` and the Day 2.1 `/progress` + `/goals` pages render
   unchanged — no regression.
2. `/workouts-history` renders inside `DashboardLayout` and shows the complete
   workout history as improved `WorkoutCard`s, newest-first, with category and
   date filters that work and compose.
3. `/workouts/:id` renders the workout detail view (name, category, date, notes,
   exercises with sets/reps/weight, derived volume); an unknown id shows the
   "Workout not found" empty state.
4. `/exercises` renders per-exercise history across workouts with sets/reps/
   weight progression over time and a `PersonalRecords` panel (best lift, best
   set) derived via pure functions.
5. Category + date filtering returns correctly ordered, non-mutated results and
   shows a distinct "no matches" empty state with a clear-filters action.
6. Every section has designed empty, loading, and error states — none render
   blank/broken/`NaN` (H4).
7. Design matches the existing dark dashboard: same tokens, cards, badges,
   accent, type; fully responsive with no horizontal scroll at any breakpoint.
8. All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime dependency;
   no backend, API, env, or model changes.
9. `npm run build` (vite build) succeeds cleanly.
10. Manual browser verification is recorded (all three pages, filters, PRs,
    empty/loading/error exercised, responsive at 3 breakpoints, Day 1.1 + Day
    2.1 regression check).
11. Navigation: implemented tabs navigate correctly; any inert tabs remain inert
    placeholders; existing routes are not removed or repurposed (H10).

### Out of Scope (Day 3.1 — Deferred)

Explicitly NOT part of Day 3.1; do not expand Day 3.1 work to include:

- Any backend, API, or database change (no models, routes, controllers, or
  services); server-side filtering or statistics.
- Authentication/registration/login changes or protecting the new pages behind
  additional auth beyond the existing shell (they render like Day 1.1 `/` and
  Day 2.1 `/progress`/`/goals`).
- TypeScript adoption or conversion of existing files.
- Real persistence, storage, sync, import/export, or device integrations.
- Editing/deleting workouts from these pages, or creating new workouts here
  (the existing auth-phase Workout List/Form CRUD is separate and untouched).
- Exercise library/catalog with muscle groups, supersets, rest timers, or
  dedicated per-exercise REST endpoints.
- Advanced analytics: one-rep-max estimation algorithms beyond recorded lifts,
  trend forecasting, form/technique analysis.
- Notifications, reminders, push, email, social sharing, and public/community
  leaderboards.
- Automated test suite and CI for the frontend.
- New runtime dependencies (charts/date/state libraries).
- Deployment or production hosting.

These MUST NOT be silently added to Day 3.1; open a new spec if one is required.

---

## Day 4.1 — Analytics Module (COMPLETE)

### Project Goal & Definition

Day 4.1 builds the **Analytics Module** for the Fitness Tracker, continuing the
Day 1.1 dark dashboard, the Day 2.1 Progress & Goals phase, and the Day 3.1
Activities & Workout History phase. It is **frontend-only** using **only `.js`
and `.jsx` files (strictly no TypeScript)**, scoped to the existing `frontend/`
workspace, and reuses the committed React + Vite + React Router + Tailwind setup,
the `DashboardLayout` shell (`Sidebar` + `TopNavbar`), the `ui/` primitives, and
the dark design tokens. It MUST NOT break, modify, or regress any prior-day
behaviour.

The phase delivers a dedicated **Analytics page** and all related analytics
features, matching the existing visual language (deep charcoal background,
`dash-card` surfaces, orange accent, consistent type scale):

1. **Analytics page** (`/analytics`): a dedicated, comprehensive fitness
   analytics dashboard accessible from the main navigation.
2. **Workout frequency analytics**: daily/weekly/monthly workout frequency
   charts.
3. **Exercise performance analytics**: strength progression, volume, estimated
   1RM trends.
4. **Weight trend analytics**: body weight over time with optional goal line.
5. **Calories analytics**: consumed vs burned, deficit/surplus trends.
6. **Macronutrient analytics**: Protein / Carbs / Fat breakdown and trends.
7. **Weekly and monthly comparison views**: period-over-period comparisons.
8. **Interactive charts**: hover, zoom, filter by date range.
9. **Overall fitness summary card**: key insights + progress score.

The Analytics page MUST render inside the existing `DashboardLayout` shell and
follow the nav pattern established in Day 2.1/3.1: implemented tabs activate
real routes while any tab without an implemented page stays an inert placeholder.

### Core Principles (Day 4.1)

#### A1. Frontend-Only, Mock-Data Phase (NON-NEGOTIABLE)

Day 4.1 MUST NOT touch the backend, add API calls, require authentication, or
change any data model or environment variable. All data is mock/local, imported
from clearly-named modules under `frontend/src/data/` so it can later be swapped
for real API responses. Existing `services/` API code is out of scope and MUST
NOT be called by these pages.

Rationale: Matches the Day 1.1, Day 2.1, and Day 3.1 delivery model; keeps the
phase shippable and reviewable without server, DB, or auth dependencies.

#### A2. JavaScript-Only (NON-NEGOTIABLE)

Same rule as Day 1.1 D1, Day 2.1 P2, and Day 3.1 H2: `.js` for
logic/util/constants/data modules, `.jsx` for components and pages. No
`.ts`/`.tsx`, no type annotations, no `@ts-check`, no `tsconfig` changes
governing the frontend.

#### A3. Reuse the Existing Shell and Primitives (NON-NEGOTIABLE)

The Analytics page MUST reuse `DashboardLayout`, the `dash-card`, `dash-num`,
`accent-text`, `ring-track` utilities/tokens from `index.css`, and the existing
`ui/` primitives (`Card`, `Badge`, `EmptyState`, `Spinner`, `Skeleton`,
`ProgressBar`, `Select`, `Input`). Do not fork or restyle copies of prior-day
markup. New shared primitives ONLY when needed and non-colliding with existing
exports.

Rationale: "Match the overall visual language of the existing dashboard" is an
explicit requirement; duplication is the anti-pattern D4 forbids.

#### A4. Data-Driven Clarity (NON-NEGOTIABLE)

Every chart, metric, and summary MUST provide clear, actionable insight. No
vanity metrics. Prefer trends, comparisons, and progress over raw numbers. Each
analytics section MUST answer a specific user question (e.g. "Am I getting
stronger?", "How many calories am I consuming vs burning?") rather than
displaying raw data dumps.

Rationale: Analytics without insight is just decoration. The page must help users
understand their fitness journey at a glance and act on it.

#### A5. Progressive Disclosure

Show high-level summaries first (summary cards, aggregate stats). Allow users to
drill down into detailed charts (volume, reps, weight, macros) without
overwhelming the initial view. The fitness summary card and top-level metrics
MUST be visible without scrolling; detailed charts follow below.

Rationale: Users need quick answers first; deep analysis is opt-in. Prevents
information overload.

#### A6. Every Section Has Proper Empty, Loading, and Error States

Each data-driven section MUST render a designed `EmptyState` when its data is
absent, a `Spinner`/`Skeleton` loading branch while loading, and a friendly error
message (never a stack trace) on error. Empty analytics sections (e.g. no
workouts logged, no weight entries) MUST show helpful empty states that guide the
user to log more data. The page MUST remain usable even with sparse data.

Rationale: An analytics page with broken charts or blank regions is worse than no
analytics at all. Sparse-data states are the most common real-world scenario.

#### A7. No New Runtime Dependencies

Reuse the committed stack; hand-rolled SVG for all charts. No charting library,
no date library, no state library. If a task appears to need one, open a
constitution amendment first and record it in Complexity Tracking.

Rationale: Consistent with all prior frontend phases. Charts are the primary new
UI element; hand-rolled SVGs match the existing dashboard pattern (Day 1.1 D6,
Day 2.1 P5, Day 3.1 H5).

#### A8. Charts MUST Be Interactive and Performant

All charts MUST be interactive: hover to see values, and support date range
filtering. Charts MUST remain smooth even with large historical datasets. Heavy
calculations MUST be pure functions that can be memoized. Data MUST be aggregated
efficiently — no N+1 patterns in the aggregation logic.

Rationale: Static charts provide limited value; interactivity is what makes
analytics actionable. Performance ensures the page feels responsive even with
months of data.

#### A9. Fully Responsive, Desktop-First (Same as D8)

Analytics MUST be fully responsive: full side-by-side layout at desktop,
stacking/reflow at tablet, single-column with no horizontal scroll at mobile.
Charts MUST reflow with card width (`viewBox` + `w-full`), never overflow, and
remain readable at all breakpoints.

#### A10. Navigation Is Additive and Non-Destructive

Day 4.1 MAY add nav entries (an `Analytics` link in sidebar/tabs) and a new
`/analytics` route, but MUST NOT remove or repurpose existing nav entries. Inert
tabs remain inert placeholders exactly as prior days.

### Folder & Component Structure (Day 4.1)

All under the existing `frontend/src/` workspace. Additions are additive — no
Day 1.1, Day 2.1, Day 3.1, or Day 1-3 file is moved or renamed, except
`App.jsx` gaining new routes and `index.css` MAY gain strictly-additive
token/utility classes.

```text
frontend/src/
├── App.jsx                     # + <Route path="/analytics">
│                               #   (inside DashboardLayout, like /progress)
├── components/
│   ├── analytics/               # (new; mirrors components/progress/, history/)
│   │   ├── AnalyticsPage.jsx   # top-level page composer
│   │   ├── FitnessSummary.jsx  # overall fitness summary card (key insights + score)
│   │   ├── WorkoutFrequency.jsx# workout frequency chart (daily/weekly/monthly)
│   │   ├── ExercisePerformance.jsx # strength progression, volume, estimated 1RM
│   │   ├── WeightTrend.jsx     # body weight over time + optional goal line
│   │   ├── CaloriesTrend.jsx   # consumed vs burned, deficit/surplus
│   │   ├── MacroTrends.jsx     # protein/carbs/fat breakdown and trends
│   │   ├── PeriodComparison.jsx# weekly and monthly comparison views
│   │   ├── DateRangeFilter.jsx # reusable date range + quick-range selector
│   │   ├── ChartCard.jsx       # reusable card wrapper for any chart
│   │   ├── MetricCard.jsx      # reusable stat/metric card for analytics
│   │   └── TrendIndicator.jsx  # reusable up/down/flat trend arrow
│   └── ui/                     # existing; add non-colliding primitives ONLY if needed
├── pages/
│   └── Analytics.jsx           # /analytics — composes all analytics sections
├── data/
│   ├── analyticsData.js        # all analytics mock data (frequency, performance,
│   │                           #   weight, calories, macros, comparisons)
│   │                           #   EMPTY variant
│   └── constants.js            # + ANALYTICS_PERIODS, CHART_COLORS,
│                               #   MACRO_TYPES, COMPARISON_PERIODS
└── utils/
    ├── analyticsUtils.js       # computeFrequency, computeVolume, estimate1RM,
    │                           #   computeTrend, aggregateMacros, comparePeriods,
    │                           #   computeDeficit, computeProgressScore (pure)
    └── (existing utils reused where relevant)
```

Rules:
- One logical unit per file; components that render JSX are `.jsx`; pure logic
  and data are `.js`.
- Sections are composed in `pages/Analytics.jsx` exactly as Day 1.1
  `Dashboard.jsx` and Day 2.1 `Progress.jsx`/`Goals.jsx`.
- `data/` and `utils/` are the ONLY places mock data and calculations live.
- Chart components are in `analytics/`; they receive data as props and render
  SVG. No chart component fetches or owns data.

### Data Shape Decisions (Day 4.1)

All mock data is plain JS objects/arrays in `data/analyticsData.js`, with a
populated and an EMPTY variant (mirroring `dashboardData.js` /
`emptyDashboardData` and the Day 2.1/3.1 data modules).

**Workout frequency** — per-period aggregates:

```js
{ period: "2026-W35", count: 4, workouts: [{ id, name, date, category }] }
```

**Exercise performance** — per-exercise progression over time:

```js
{ exercise: "Bench Press",
  history: [
    { date: "2026-09-01", weightKg: 60, reps: 8, sets: 4,
      volumeKg: 1920, estimated1RM: 75 },
    { date: "2026-09-08", weightKg: 62.5, reps: 8, sets: 4,
      volumeKg: 2000, estimated1RM: 78.1 }
  ] }
```

**Weight trend** — body weight entries over time:

```js
{ entries: [
  { date: "2026-09-01", weightKg: 82.5 },
  { date: "2026-09-08", weightKg: 82.0 }
],
goalWeightKg: 78 }  // optional goal line
```

**Calories trend** — daily consumed vs burned:

```js
{ days: [
  { date: "2026-09-01", consumed: 2200, burned: 2500, deficit: -300 },
  { date: "2026-09-02", consumed: 2400, burned: 2300, deficit: 100 }
] }
```

**Macronutrient trends** — daily macro breakdown:

```js
{ days: [
  { date: "2026-09-01", protein: 150, carbs: 250, fat: 70, calories: 2200 },
  { date: "2026-09-02", protein: 140, carbs: 280, fat: 65, calories: 2400 }
] }
```

**Period comparison** — week-over-week or month-over-month:

```js
{ current: { label: "This Week", workouts: 4, volume: 8000,
             caloriesAvg: 2300, weightChange: -0.5 },
  previous: { label: "Last Week", workouts: 3, volume: 6500,
              caloriesAvg: 2500, weightChange: -0.3 } }
```

**Fitness summary** — high-level insights:

```js
{ progressScore: 72,            // 0-100 composite score
  streakDays: 12,
  totalWorkouts: 48,
  avgCalories: 2250,
  weightChange: -2.5,           // kg over selected period
  topInsight: "You're consistently hitting your protein goal",
  trends: [
    { label: "Strength", direction: "up", delta: "+8%" },
    { label: "Weight", direction: "down", delta: "-2.5 kg" },
    { label: "Calories", direction: "flat", delta: "0%" }
  ] }
```

Constants in `constants.js`: `ANALYTICS_PERIODS` (week, month, 3 months, 6
months, year), `CHART_COLORS` (accent, secondary, muted for multi-series),
`MACRO_TYPES` (protein, carbs, fat with labels and colors),
`COMPARISON_PERIODS` (this week vs last week, this month vs last month).

### Analytics Page Layout & Behaviour (Day 4.1)

- **Layout**: top row = fitness summary card (full width or spanning columns);
  second row = date range filter + period selector; below = a responsive grid of
  analytics chart cards, each in a `ChartCard` wrapper.
- **Default state**: shows analytics for the last 30 days. Period selector
  defaults to "Last 30 Days" with quick options: This Week, This Month, Last 3
  Months, Last 6 Months, Last Year, Custom Range.
- **Date range filter** MUST control all charts simultaneously — changing the
  range re-renders every chart with data for that range.
- **Chart grid**: responsive grid (2 columns at desktop, 1 at mobile) with
  `ChartCard` wrappers. Charts: Workout Frequency, Exercise Performance, Weight
  Trend, Calories Trend, Macro Trends, Period Comparison.
- **Scroll behaviour**: summary + filter at top; charts scroll below. No
  horizontal scroll at any breakpoint.

### Workout Frequency Analytics Rules (Day 4.1)

- Shows a bar chart of workout sessions per day/week/month depending on the
  selected period.
- Data derived from workout history: `computeFrequency(workouts, period)` in
  `analyticsUtils.js` groups workouts by the selected time bucket and returns
  `[{ label, count }]`.
- Empty state: "No workouts recorded for this period" with a prompt to log
  workouts.
- The chart MUST show the count per bar/point on hover.

### Exercise Performance Analytics Rules (Day 4.1)

- Shows strength progression for selected exercises (default: show all or most
  recently used).
- Three sub-metrics: **volume over time** (line/bar), **reps and weight
  progression per exercise** (line), **estimated 1RM trend** (line).
- Estimated 1RM formula (Epley): `weightKg * (1 + reps / 30)` — applied when
  `reps >= 1` and `weightKg > 0`. Bodyweight exercises (`weightKg = 0` or
  `undefined`) do NOT show estimated 1RM; show volume only.
- Data derived via pure functions: `computeVolume(workouts, exerciseName)`,
  `computeWeightProgress(workouts, exerciseName)`, `estimate1RM(weightKg, reps)`.
- Empty state: "No exercise data for this period" when no matching exercises
  exist.
- Exercise selector (dropdown or tab row) allows switching between exercises.
  Default: first exercise alphabetically or most frequently performed.

### Weight Trend Analytics Rules (Day 4.1)

- Line/area chart of body weight over time.
- Optional goal line: a horizontal dashed line at `goalWeightKg` when provided.
- Data comes from weight entries (reusing the Day 2.1 weight entry shape).
- `computeWeightTrend(entries)` in `analyticsUtils.js` returns the trend data
  points plus the weight change over the period.
- One point: show as a marker with value, not an empty state. Zero entries:
  `EmptyState` ("No weight entries for this period").
- Weight change delta displayed below the chart (e.g. "-2.5 kg").

### Calories Analytics Rules (Day 4.1)

- Dual-series line chart: consumed (one color) vs burned (another color).
- The area between lines MAY be shaded to show deficit (green) or surplus (red).
- `computeDeficiency(days)` in `analyticsUtils.js` returns the daily
  consumed/burned/deficit values.
- Net deficit/surplus summary displayed below the chart (e.g. "Avg deficit:
  200 kcal/day").
- Data comes from the calories trend mock data (which in production would merge
  nutrition + workout calorie data).
- Empty state: "No calorie data for this period".

### Macronutrient Analytics Rules (Day 4.1)

- **Breakdown view**: stacked bar or pie chart showing protein/carbs/fat
  proportions for the selected period.
- **Trend view**: line chart showing each macro over time (three lines).
- `aggregateMacros(days)` in `analyticsUtils.js` returns the totals and
  per-day values.
- Average daily values displayed as summary stats (e.g. "Avg Protein: 150g").
- Empty state: "No nutrition data for this period".

### Weekly & Monthly Comparison Rules (Day 4.1)

- Side-by-side or overlaid comparison of the current period vs the previous
  period (this week vs last week, this month vs last month).
- Metrics compared: workout count, total volume, average calories, weight change.
- Each metric shows the delta (e.g. "+1 workout", "-200 kcal avg").
- `comparePeriods(currentData, previousData)` in `analyticsUtils.js` computes
  the deltas and determines trend direction (up/down/flat).
- Empty state: "Not enough data for comparison" when either period is empty.

### Fitness Summary Card Rules (Day 4.1)

- A prominent top-level card spanning the full width (or a key column).
- Contains: **progress score** (0-100, a composite metric derived from workout
  consistency, calorie adherence, weight trend), **key metrics** (total workouts,
  average calories, weight change), and **top insight** (a single sentence
  summary).
- **Progress score** is computed by `computeProgressScore(workouts, nutrition,
  weight)` in `analyticsUtils.js` — a pure function. Score factors: workout
  frequency (0-40 pts), calorie target adherence (0-30 pts), weight trend
  alignment (0-30 pts).
- **Trend indicators** (up/down/flat arrows with delta) for each metric line.
- Empty state: "Log more data to see your fitness summary" when insufficient
  data exists (< 1 week of data).
- Uses the `dash-card` surface, `dash-num` for headline numbers, and
  `TrendIndicator` for direction arrows.

### Chart Behaviour & Interactivity Rules (Day 4.1)

- All charts are hand-rolled SVG with `viewBox` scaling, `w-full`, `role="img"`,
  `aria-label`, no external library (A7/A8).
- **Hover**: each data point shows a tooltip/card with the exact values (date,
  metric value). Implemented via SVG `title` elements or a lightweight positioned
  `div` triggered by `onMouseEnter`/`onMouseLeave`.
- **Date range filtering**: the `DateRangeFilter` component writes to page
  `useState`; all charts receive the filtered data via props. Quick ranges
  (This Week, This Month, Last 3 Months, Last 6 Months, Last Year) plus a
  Custom Range with two date inputs (`from`/`to`).
- **Empty charts**: show the section `EmptyState`, never a broken/blank SVG
  axes area.
- **Responsive**: charts use `viewBox` + `w-full` so they scale with card width.
  At mobile, charts render full-width single-column.
- **Labels**: every chart has a clear title, readable axis labels or captions,
  and a legend or inline key for multi-series charts.

### Empty State Behaviour (Day 4.1)

- Shared `EmptyState` (icon + short message + optional action) used for:
  - No workout data for the period ("No workouts recorded for this period"),
  - No exercise data ("No exercise data for this period"),
  - No weight entries ("No weight entries for this period"),
  - No calorie data ("No calorie data for this period"),
  - No nutrition data ("No nutrition data for this period"),
  - Insufficient data for comparison ("Not enough data for comparison"),
  - Insufficient data for summary ("Log more data to see your fitness summary"),
  - No personal records yet ("No personal records yet").
- Empty states MUST guide the user to the action that populates data (e.g.
  "Start logging workouts to see your analytics").
- Loading (`Spinner`/`Skeleton`) and error (friendly message, never a stack
  trace) branches MUST be present on every data-driven section (A6).

### State Management Approach (Day 4.1)

- `useState` in `Analytics.jsx` for the selected date range (from/to), the
  selected period preset, and the selected exercise (for exercise performance).
- All chart components receive their data as props (computed from the selected
  range by calling pure functions in `analyticsUtils.js` on the mock data).
- Lift state only when two or more components share it (e.g. the date range
  filter affects all charts → date range state lives in the page).
- No Context required for Day 4.1 unless the plan demonstrates shared state
  that local `useState` cannot cleanly handle; if added, one
  `AnalyticsDataContext` in `context/`.

### UI/UX Rules (Day 4.1)

- Same dark theme, tokens, `dash-card` sections, `dash-num` headline numbers,
  orange accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1/2.1/3.1.
- Analytics chart cards use the same `dash-card` surface with `ChartCard`
  wrapper for consistent padding and border treatment.
- Trend indicators use semantic colors: up = green (positive for strength,
  negative for weight loss context), down = red/amber (or inverted for weight
  loss which is positive), flat = muted gray. Direction MUST be contextual
  (e.g. weight going down = positive trend for weight loss goals).
- Numeric formatting: weights with one decimal (e.g. `82.5 kg`), volume with
  thousands separators (e.g. `12,400 kg`), calories as whole numbers (e.g.
  `2,200 kcal`), macros with one decimal or whole grams (e.g. `150 g`),
  percentages as whole numbers (e.g. `72%`).
- Date formatting: consistent `YYYY-MM-DD` in data, human-readable in UI
  (e.g. "Sep 1, 2026").
- Accessibility: chart SVGs get `role="img"` and `aria-label`, interactive
  controls are real `<select>`/`<button>`s with `aria-label` where icon-only,
  semantic `<section>`/`<h2>`/`<h3>` markup, focus-visible rings use the
  accent color, contrast readable on dark.
- Long exercise names truncate (`truncate`), never wrap awkwardly.

### Coding Standards (Day 4.1)

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (A2).
- **Naming**: `camelCase` functions/variables, `PascalCase` components,
  `SCREAMING_SNAKE` constants. Default export for pages/components, named
  exports for utils/constants.
- **Imports**: clean and grouped (react → libraries → local relative).
- **Comments**: none explaining the obvious; only decision/non-obvious
  justifications. No AI-looking boilerplate.
- **Dead code**: none; remove unused imports/variables.
- **Purity**: all analytics calculations live in `analyticsUtils.js` pure
  functions (A8), not in render. Charts receive computed data as props.
- All other Day 1.1/2.1/3.1 coding standards apply unchanged.

### Definition of Done (Day 4.1 Success Criteria)

Day 4.1 is DONE only when ALL of the following hold, in addition to Day 1.1,
Day 2.1, and Day 3.1 still passing:

1. Day 1.1 dashboard at `/`, Day 2.1 `/progress` + `/goals`, and Day 3.1
   `/workouts-history` + `/workouts/:id` + `/exercises` pages render unchanged
   — no regression.
2. `/analytics` renders inside `DashboardLayout` and shows: workout frequency
   analytics, exercise performance analytics, weight trend analytics, calories
   analytics, macronutrient analytics, weekly/monthly comparison views, and an
   overall fitness summary card.
3. All charts are interactive: hover shows values, date range filter controls all
   charts simultaneously.
4. Quick range presets (This Week, This Month, Last 3 Months, Last 6 Months,
   Last Year) and custom date range work correctly and filter all charts.
5. Exercise performance shows volume progression, weight/reps progression, and
   estimated 1RM trend (Epley formula) for the selected exercise.
6. Weight trend shows a line chart with optional goal line; calories shows
   consumed vs burned; macros show breakdown and trend views.
7. Period comparison shows correct deltas between current and previous periods.
8. Fitness summary card shows progress score, key metrics, and trend indicators
   computed via pure functions.
9. Every section has designed empty, loading, and error states — none render
   blank/broken/`NaN` (A6). Empty states guide users to log more data.
10. Design matches the existing dark dashboard: same tokens, cards, accent,
    type; fully responsive with no horizontal scroll at any breakpoint.
11. All new files are `.js`/`.jsx` (no `.ts`/`.tsx`); no new runtime
    dependency; no backend, API, env, or model changes.
12. `npm run build` (vite build) succeeds cleanly.
13. Manual browser verification is recorded (analytics page, all charts, hover
    tooltips, date range filter, empty/loading/error exercised, responsive at 3
    breakpoints, prior-day regression check).
14. Navigation: `Analytics` tab/link navigates correctly; any inert tabs remain
    inert placeholders; existing routes are not removed or repurposed (A10).

### Out of Scope (Day 4.1 — Deferred)

Explicitly NOT part of Day 4.1; do not expand Day 4.1 work to include:

- Any backend, API, or database change (no models, routes, controllers, or
  services); server-side analytics computation or aggregation.
- Authentication/registration/login changes or protecting `/analytics` behind
  additional auth beyond the existing shell.
- TypeScript adoption or conversion of existing files.
- Real persistence, storage, sync, import/export, or device integrations.
- Social sharing of analytics.
- Comparison with other users or community leaderboards.
- AI-generated coaching advice or recommendations.
- Export to PDF/CSV.
- Advanced ML-based analytics: predictive modeling, anomaly detection,
  body-composition estimation beyond recorded data.
- Notifications, reminders, push, email, or alerts based on analytics thresholds.
- Automated test suite and CI for the frontend.
- New runtime dependencies (charting/date/state libraries).
- Deployment or production hosting.

These MUST NOT be silently added to Day 4.1; open a new spec if one is required.

---

## Day 5.1 — Search & Filtering (COMPLETE)

### Goal

Add global search and multi-dimension filtering (date range, category, meal
type) across Dashboard, Nutrition, Activities, and Analytics pages — all
client-side, local state, no new routes or backend changes.

### Core Principles (S1-S10)

**S1. Case-insensitive fuzzy matching** — Global search MUST perform
case-insensitive substring matching against item names, notes, exercises, and
tags. Matching MUST be locale-aware (`toLowerCase()` with Unicode handling).

**S2. Debounced search input** — Search input MUST debounce user keystrokes at
200-300ms before triggering filter logic. Typing MUST NOT cause jank or
layout thrashing.

**S3. Composable filters** — Multiple active filters MUST compose as logical
AND. A user filtering by date range AND category sees only items matching
BOTH criteria. Clearing one filter does NOT clear others unless explicitly
requested.

**S4. Empty result handling** — When filters produce zero matches, display an
empty state component with a clear message ("No results match your filters")
and a "Clear all filters" action. MUST NOT show a broken/blank card.

**S5. Filter persistence in URL** — Active filters SHOULD be reflected in URL
query parameters (e.g. `?search=bench&category=strength`) so that filter
state survives page refresh and is shareable. Filters are NOT persisted to
localStorage or any backend.

**S6. Clear-all affordance** — A "Clear all" button MUST be visible when any
filter is active. It resets all filters to default (no search, full date
range, all categories). The button MUST be keyboard-accessible.

**S7. Progressive disclosure** — Advanced filters (date range, meal type) are
collapsed by default on mobile (< 768px). A "Filters" toggle button
expands them. Desktop shows filters inline.

**S8. No data mutation** — Search and filtering MUST be read-only operations.
Filter state MUST NOT modify source data, cause re-renders beyond the
filtered list, or trigger any side effects.

**S9. Responsive filter layout** — Filter controls MUST stack vertically on
mobile and lay out horizontally on desktop. Filter chips/tags for active
filters MUST wrap and be individually removable.

**S10. Accessibility** — Search input MUST have an associated `<label>` or
`aria-label`. Filter controls MUST be keyboard-navigable. Active filters
MUST be announced to screen readers via `aria-live="polite"`.

### Search Implementation Rules

- Global search input at the top of each page (Dashboard, Nutrition,
  Activities, Analytics) within the existing layout.
- Search matches against: item names, exercise names, notes, tags, category
  labels, meal names.
- Matching is client-side: filter the existing in-memory data array using
  `Array.filter()` with a predicate that lowercases both query and target.
- No external search library (no Fuse.js, no lunr). Pure JS string matching.
- Empty search string shows all items (no filter applied).

### Date Range Filtering Rules

- Default range: "All time" (shows all data).
- Preset ranges: "This week", "This month", "Last 3 months", "Last 6 months",
  "This year", "Custom".
- Custom range: two date inputs (start, end) with HTML `type="date"`.
- Date filtering compares against the item's `date` field using ISO string
  comparison or `Date` object comparison.
- Date range filter composes with search and category filters (AND logic).

### Category & Meal-Type Filtering Rules

- **Activities page**: filter by workout category (Cardio, Strength,
  Flexibility, Other) — multi-select checkboxes or toggle chips.
- **Nutrition page**: filter by meal type (Breakfast, Lunch, Dinner, Snack) —
  multi-select checkboxes or toggle chips.
- **Dashboard**: inherits category filter from Activities data and meal-type
  filter from Nutrition data for summary cards.
- **Analytics**: date range + category filters apply to frequency, volume,
  and exercise performance sections.
- Active filters shown as removable chips/tags below the filter bar.

### Filter State Management Rules

- Filter state is LOCAL to each page component (no Context, no Redux).
- State shape per page:
  ```js
  { search: "", dateRange: "all", category: [], mealType: [] }
  ```
- Derived data via `useMemo`: filtered results are computed from source data
  + filter state; no separate "filtered data" store.
- URL sync (S5): `useSearchParams` from React Router to read/write filter
  params. On mount, initialize filter state from URL params.
- Filter resets: "Clear all" sets state back to defaults AND clears URL params.

### UI/UX Rules

- Search input: full-width, rounded, with a magnifying glass icon (lucide
  `Search`) on the left and a clear button (X icon) on the right when
  non-empty.
- Filter bar: horizontal row on desktop, collapsible on mobile.
- Active filter chips: small, colored (accent bg, white text), with an X
  button to remove individual chips.
- Loading: no loading state needed (all data is local/mock). If a future
  backend integration adds latency, show a subtle skeleton.
- Transitions: filter result list changes should have a brief
  `opacity` transition (150ms) for smooth visual feedback.

### Coding Standards

- All new files: `.jsx` for components, `.js` for utility functions.
- Follow existing naming conventions: `camelCase` for functions/variables,
  `PascalCase` for components.
- One component per file. Filter bar is a reusable `FilterBar` component;
  search input is a reusable `SearchInput` component.
- Utility functions in `utils/filterUtils.js`: `filterBySearch(items, query)`,
  `filterByDateRange(items, range)`, `filterByCategory(items, categories)`,
  `filterByMealType(items, types)`, `applyFilters(items, filters)`.
- No new npm dependencies. Pure JS/React only.

### Definition of Done (Success Criteria)

1. Global search input present on Dashboard, Nutrition, Activities, Analytics.
2. Case-insensitive substring matching works for all searchable fields.
3. Search debounces at 200-300ms (no jank on rapid typing).
4. Date range filter with presets + custom range works on Nutrition and
   Activities pages.
5. Category filter works on Activities, Dashboard, Analytics.
6. Meal-type filter works on Nutrition, Dashboard.
7. Filters compose as AND (search + date + category + meal-type).
8. "Clear all" button visible when any filter active, resets everything.
9. Empty results show helpful message + clear action.
10. Filter state reflected in URL query params; survives page refresh.
11. Responsive: filters stack on mobile, inline on desktop.
12. Accessible: labels, keyboard nav, aria-live announcements.
13. `vite build` passes with zero errors. Zero new npm dependencies.
14. No TypeScript files created (`.js`/`.jsx` only per Principle V override).

### Out of Scope (Day 5.1 — Deferred)

Explicitly NOT part of Day 5.1; do not expand Day 5.1 work to include:

- Backend search API, database text indexes, or server-side filtering.
- Full-text search engines (Elasticsearch, Algolia, Meilisearch).
- Search result ranking/relevance scoring beyond substring match.
- Saved search queries or search history.
- Auto-complete / type-ahead suggestions.
- Fuzzy matching with typo tolerance (Levenshtein, Soundex).
- Search analytics or tracking what users search for.
- Filter persistence to localStorage, cookies, or backend.
- Server-side pagination or infinite scroll for search results.
- Export of filtered results.
- Typeahead dropdown with result previews.
- Advanced filter operators (NOT, OR across dimensions).

These MUST NOT be silently added to Day 5.1; open a new spec if one is required.

---

## Day 6.1 — Notifications & Reminders (COMPLETE)

### Goal

Add an in-app Notifications & Reminders system: a dedicated Notifications page,
transient in-app toast alerts, a sidebar unread badge, and a per-type
notification Settings panel. Notifications cover workout completions, goal
progress, completed goals, and workout/meal/goal reminders. Everything is
client-side, derived from existing workout/goal/nutrition data, uses only the
existing dashboard shell, and requires NO backend changes.

### Core Principles (N1-N10)

**N1. Relevance First** — Every notification MUST be tied to a meaningful event
(workout logged, goal progress/completion, an upcoming workout/meal/goal). No
notification noise: no generic status pings, no welcome spam, no repeated
pestering. If an event is not genuinely useful, it MUST NOT produce a
notification.

**N2. User Control** — The user MUST be able to enable/disable each
notification type (workout completion, goal progress, completed goal, workout
reminder, meal reminder, goal reminder) via a Settings panel that is easy to
find. Changes MUST apply immediately and be respected by every surface (toast,
badge, page). A simple global "Mute all" toggle is allowed; granular per-type
on/off is required.

**N3. Design Consistency** — Notifications MUST use the same dark shell, tokens,
`dash-card` surfaces, orange accent (`var(--color-accent)`), 4px spacing scale,
and typography as the Dashboard (Day 1.1). Unread items are visually distinct
(accent-tinted left border/fill), but stay on-theme — no new color system.

**N4. Clarity** — Each notification carries a short, concrete title and a brief
body that states WHAT happened and (for reminders) WHAT the user can do next, in
plain language. No jargon and no vague phrasing (e.g. "You have an update").

**N5. Respect Attention** — Notifications MUST never disrupt the flow: no
auto-opening modals, no blocking banners. Alerts surface as small toasts and a
badge; full history lives on the Notifications page. Users MUST be able to mark
items read (individually and all), dismiss, and clear. The unread count shows on
the nav badge.

**N6. Reliability & Timeliness** — Notifications MUST reference the correct
entity (the right workout, the right goal, the right meal window) and appear at
the right time (reminder before the event; completion/progress immediately
after). No false positives; if data is missing or inconsistent, nothing fires
(N8).

**N7. Deduplication** — Every notification is keyed by a stable event key; the
same event MUST NOT produce duplicates no matter how often the system
regenerates. Generation MUST be idempotent: re-deriving today's notifications
from the same data yields the same set.

**N8. Graceful Absence Handling** — When the user has no goals, no scheduled
workouts, or no logged meals, the system MUST NOT emit broken reminders. The
Notifications page and surfaces show designed empty states ("No notifications
yet" with guidance), exactly like prior-day empty states (H6/A6).

**N9. Client-Side Persistence (narrow, explicit exception)** — Read/unread state
and notification settings MUST persist across reloads. This is a DELIBERATE
exception to the real-persistence de-scope of prior phases and to the Day 5.1
no-filter-persistence rule (S5): persistence is limited to ONE localStorage key
(e.g. `notificationsState`) holding read/unread flags, settings, and the event
keys needed to honor N7. Filter/search state remains non-persistent per S5.

**N10. Navigation Is Additive and Non-Destructive** — Day 6.1 MAY add a
`Notifications` nav entry and a new `/notifications` route (inside the existing
`DashboardLayout`, mirroring `/analytics`), but MUST NOT remove or repurpose any
existing nav entry or route. Inert tabs remain inert placeholders as prior days.

### Notification Type Rules

Six notification types MUST be supported (each individually toggleable in
settings, N2):

1. **Workout completion** — fires when a workout is logged (Quick Log or any
   create path). Body: workout name, category, date.
2. **Goal progress** — fires when an active goal's progress advances (e.g. a new
   workout moves a workouts-per-week goal). Body: goal name + new progress.
3. **Completed goal** — fires when a goal reaches its target. Body: goal name +
   the goal's reached date. Encouraging but NOT AI-generated text.
4. **Workout reminder** — fires when the user has a workout scheduled today
   (`date === today`) that has not yet been logged. Body: scheduled workout name
   + a "Log it" action.
5. **Meal reminder** — fires when a meal window is open (per `MEAL_WINDOWS`
   constants) and no entry for that meal type exists today. Body: meal type +
   "Log your <meal>" action.
6. **Goal reminder** — fires when an active goal's target date is approaching
   (within `GOAL_REMINDER_DAYS`, default 3) and the goal is not yet
   completed/missed. Body: goal name + days remaining.

Meal windows (constants in `data/constants.js`): `breakfast <= 10:00`,
`lunch 11:00–14:00`, `dinner 17:00–20:00`. `snack` has no reminder window.
Reminders are derived at session/page load from current data — no background
timers, no push (out of scope).

### Notification Data & Dedup Rules

```js
// data/notificationsData.js — mock descriptors (seed) + EMPTY variant
{ id: "n-1",
  type: "workout-completion" | "goal-progress" | "goal-completed" |
        "workout-reminder" | "meal-reminder" | "goal-reminder",
  title: "Workout logged",
  body: "Push Day · Strength · Logged 2026-09-09",
  entityId: "w-42",            // workout/goal/meal entity this refers to
  createdAt: "2026-09-09T09:30:00Z",
  read: false }
```

- `eventKey` = `${type}:${entityId}:${YYYY-MM-DD}` (computed, not stored
  per-item). Persisted seen/dismissed keys prevent re-issue (N7).
- Generator functions live in `utils/notificationsUtils.js` and are pure:
  `generateWorkoutCompletion(workout)`, `generateGoalProgress(goal, delta)`,
  `generateCompletedGoal(goal)`, `generateWorkoutReminder(scheduled, logged)`,
  `generateMealReminder(mealWindows, entriesByType)`,
  `generateGoalReminder(goals)`, and `generateNotifications({ workouts, goals,
  nutrition, date })` as the single entry point that applies settings + dedup.
- Reminders are generated at page load and on relevant data changes (workout
  logged, goal updated, meal added) — pure, memoizable, and swappable for a
  future API.

### Settings Rules

- Per-type on/off toggles (six types) in a Settings panel on the Notifications
  page. An inline section is acceptable; a `/notifications-settings` sub-route
  is allowed but NOT required — pick ONE and state it in the plan.
- Settings persist to the `notificationsState` localStorage key (N9) and apply
  instantly; disabled types stop appearing in toasts, badges, and the page.
- Quiet hours are OUT of scope (see below). A global "Mute all" toggle is the
  maximum time-based control this phase offers.

### Notifications Page Rules

- Route `/notifications` inside `DashboardLayout`, mirroring the `/analytics`
  wiring.
- Latest first; unread on top with the unread style (N3). Each row shows a type
  icon, title, body, and relative time; unread rows get an accent-tinted left
  border/fill, a bold title, and a dot indicator.
- Controls: **Mark all as read**, per-item **Mark read/unread**, **Dismiss**
  (hides the item), **Clear all** (clears the list after confirmation). All
  keyboard-accessible.
- The sidebar nav shows an unread count badge on the `Notifications` entry; the
  badge clears when items are marked read.
- Empty state: "No notifications yet" with guidance (e.g. log a workout, set a
  goal) — the designed `EmptyState`, never a blank card (N8).
- Toasts on the dashboard reuse the existing toast/banner pattern (Quick Log
  style) if present. If none exists, ONE lightweight, component-only
  `NotificationsContext` providing `pushToast` is allowed — no toast library.

### State Management Approach

- Local `useState` for the page's active view; read/unread + settings live in
  the `notificationsState` localStorage key via the existing `useLocalStorage`
  hook pattern (Day 1 hooks).
- Today's notifications are computed by `generateNotifications` at page load and
  on relevant data changes — pure, deterministic (N7), swappable for a future
  API.
- Cross-component shared state (toast push, unread badge count) goes through ONE
  `NotificationsContext` in `context/`; otherwise keep state local per surface.

### Folder & Component Structure (Day 6.1)

```text
frontend/src/
├── App.jsx                     # + <Route path="/notifications">
│                               #   (inside DashboardLayout, like /analytics)
├── components/
│   ├── notifications/          # (new; mirrors components/analytics/)
│   │   ├── NotificationList.jsx    # ordered list, read/unread grouping
│   │   ├── NotificationItem.jsx    # single row (icon, title, body, actions)
│   │   ├── NotificationSettings.jsx# per-type toggle panel
│   │   ├── EmptyNotifications.jsx  # friendly empty state (or shared EmptyState)
│   │   └── NotificationToast.jsx   # transient in-app alert banner
│   └── ui/                     # existing; add non-colliding primitives ONLY
│                               #   if needed
├── pages/
│   └── Notifications.jsx       # /notifications — composes list + settings
├── context/
│   └── NotificationsContext.jsx# optional shared toast/unread state (one only)
├── data/
│   ├── notificationsData.js    # mock descriptors + EMPTY variant
│   └── constants.js            # + MEAL_WINDOWS, NOTIFICATION_TYPES,
│                               #   GOAL_REMINDER_DAYS
└── utils/
    └── notificationsUtils.js   # pure generators + dedup + settings merge
```

Rules: components are `.jsx`, logic/data are `.js` (V override). One logical
unit per file. `data/` and `utils/` are the ONLY places mock data and generation
logic live.

### UI/UX Rules

- Same dark theme: `--color-accent` orange, `dash-card`, 4px scale, existing type
  scale (Day 1.1 D6 / Day 3.1 H3 apply).
- Unread distinction: accent-tinted left border + slightly brighter surface.
  NEVER rely on color alone — unread rows also show a dot and a bold title.
- Toasts: top-right, auto-dismiss ~4s, dismissible, accent icon, respect
  reduced-motion, and never cover primary actions for long.
- Badge: small pill on the nav entry with the unread count; hidden at 0.
- Accessibility: toggles are real `<button>`s / `<label>` + `<input
  type="checkbox">` with `aria-label`s; list uses semantic `<ul>/<li>`;
  "Mark all as read" announces via `aria-live`; focus-visible rings in accent.
- No horizontal scroll at any breakpoint (D8/A9).

### Coding Standards

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (V override).
- Naming, imports, comments, dead-code, and purity rules identical to the Day
  4.1/5.1 coding standards.
- Generators are pure and deterministic (N7); utils MUST NOT touch the DOM or
  run timers.
- No new npm dependencies (A7 applies). No backend, API, env, or model changes.

### Definition of Done (Day 6.1 Success Criteria)

1. Dedicated `/notifications` page renders inside `DashboardLayout` with a
   Notification List + Settings panel; a `Notifications` nav entry with an
   unread badge is present.
2. All six notification types generate correctly from mock data: workout
   completion, goal progress, completed goal, workout reminder, meal reminder,
   goal reminder.
3. Reminders fire only when relevant and at the right time; types disabled in
   settings produce no toast, badge, or page items.
4. Read/unread state works: per-item toggle, mark all as read, dismiss, and
   clear all.
5. Read/unread state and settings persist across reload (single localStorage
   key); filter/search state is NOT persisted (S5 intact).
6. No duplicate notifications for the same event (idempotent generation, N7).
7. Empty/edge states are designed: no goals, no scheduled workouts, or no logged
   meals → friendly empty states and no broken reminders (N8).
8. Toasts, badge, and page match the dark dashboard: same tokens, card style,
   accent, and typography; unread styled distinctly but on-theme (N3).
9. All new files are `.js`/`.jsx`; zero new npm dependencies; no backend, API,
   env, or model changes.
10. `npm run build` (vite build) succeeds cleanly.
11. Manual browser verification is recorded (all six types, toggles,
    read/unread persistence across reload, empty/edge states, responsive at 3
    breakpoints, prior-day regression check).
12. Accessibility pass: labelled toggles, keyboard nav, `aria-live`/`aria-label`
    announcements, contrast readable on dark.

### Out of Scope (Day 6.1 — Deferred)

Explicitly NOT part of Day 6.1; do not expand Day 6.1 work to include:

- Push notifications (web push / service workers), email, or SMS delivery.
- Any backend notification collection/model/routes or server-side scheduling.
- Social notifications or notifications about other users.
- AI-generated motivational messages or coaching text.
- Complex quiet hours / time-based scheduling rules beyond a global mute toggle.
- Notification preferences beyond per-type on/off (channels, per-entity rules,
  snooze, repeat intervals, delivery-time customization).
- Notification history beyond the session's derivable set; importing/exporting
  notifications.
- Real-time/live updates via websockets or server events (CSR polls on action
  only; reminders are derived at session load).
### Amendment 2026-09-09 (persistence & data sourcing — approved via /sp.implement)

Changes the persistence and sourcing model of Day 6.1 ONLY; all N1–N10, type
rules, dedup, and out-of-scope lists otherwise unchanged and binding.

1. **Persistence moved server-side.** N9's localStorage narrow exception is
   replaced for this feature: notifications and per-type settings are stored in
   MongoDB. Two new Mongoose models: `Notification` (owner-scoped; unique
   `(owner, eventKey)` to enforce N7) and `NotificationSettings` (one per owner).
   Read/unread, dismiss, and settings survive reload via the API. No
   `notificationsState` localStorage key; S5 (filter persistence ban) is still
   untouched.
2. **New auth-scoped API surface** (mirrors existing routes/controllers/services
   exactly): `GET /api/notifications` (+ `?unread=1`), `POST
   /api/notifications/read-all`, `PATCH /api/notifications/:id`, `DELETE
   /api/notifications/:id`, `DELETE /api/notifications`, `GET|PATCH
   /api/notifications/settings`, `POST /api/notifications/sync`. All routes go
   through `authenticate`; every query is filtered by `owner` (requirement:
   users never see another user's notifications or settings).
3. **Real-data event sourcing.** Workout completion notifications are created in
   the existing workout create path (guarded, N6/N7: eventKey
   `workout-completion:<workoutId>:<YYYY-MM-DD>`; a killed notification never
   fails the workout). Workout + meal reminders are derived server-side in the
   `sync` endpoint from REAL `workouts` and `nutrition` collections (habit-based
   workout reminder: ≥1 workout in the prior 7 days and none today; meal
   reminder: window open and no entry of that meal type today). Goal events
   (progress/completed/reminder) derive from the existing `goalsData` module
   (goals have no backend by design) and are written to the API by the client
   on sync — same source the Goals feature itself uses.
4. **Settings respected at creation.** No notification of a disabled type is
   created (server-side guard in service + sync); client UI additionally hides
   disabled types.
5. **"No backend changes" clauses no longer apply to persistence:** lines about
   "requires NO backend changes", "any backend notification collection/model/
   routes" being out of scope, and DoD item 9's "no backend/API/model changes"
   are REPLACED by the above. The S5 filter-persistence ban and the
   no-new-npm-dependency rule remain in force.
- TypeScript adoption or conversion of existing files.
- Automated test suite and CI for the frontend.
- New runtime dependencies (toast/notification libraries).
- Deployment or production hosting; cross-device sync.

These MUST NOT be silently added to Day 6.1; open a new spec if one is required.

---

## Day 7.1 — Settings (COMPLETE)

### Project Goal & Definition

Add a dedicated Settings area that gives the user clear, secure control over
their account, preferences, and data — account/profile, units, theme,
notification preferences, change password, logout, and delete account — while
remaining simple and fully consistent with the rest of the product. Settings is
an **additive** phase on the shipped MERN app (per the DB/API pattern established
by Amendment 2026-09-09 for notifications): preferences persist per authenticated
user via auth-scoped endpoints; destructive/sensitive actions (password change,
account deletion) are confirmation-gated and server-enforced.

### Core Principles (ST1-ST8)

**ST1. User Control** — Users MUST be able to manage their account, preferences,
and data without friction. Every preference the system exposes MUST be editable
from the Settings area and MUST reflect the user's persisted choices on every
surface that consumes it (dashboard, progress, history, analytics).

**ST2. Clarity & Safety** — Destructive actions MUST be clearly labeled and
MUST require explicit confirmation. **Delete Account** MUST live in a
visually distinct Danger Zone, require a minimum two-step confirmation (explain +
type-to-confirm + final confirm), and MUST NEVER be a single click.

**ST3. Consistency** — The Settings page MUST use the exact same design system
as the Dashboard: fixed left sidebar, dark theme, `--color-*` tokens, 4px
spacing scale, type scale, and orange accent (Day 1.1 D2/D3). Content MUST keep
tight side spacing (no large empty gaps). Related settings MUST be grouped
clearly (Account, Preferences, Notifications, Danger Zone, etc.).

**ST4. Security First** — Password changes and account deletion MUST follow
secure practices. Changing the password MUST require the current password and a
validated new password (bcrypt compare + hash, strength rules matching auth), and
MUST clear the session cookie so the user re-authenticates. Account deletion MUST
be owner-scoped and server-executed (Principle VII), and MUST cascade only the
acting user's owned data.

**ST5. Immediate Feedback** — Preference changes (units, theme, notification
preferences) MUST apply instantly or show clear confirmation. On a persistence
failure, the UI MUST surface a clear error and revert any optimistic state.

**ST6. Minimal Friction** — Common actions (logout, change units, update
profile) MUST be easy and fast (1-2 clicks, instant apply where sensible).
Logout MUST reuse the existing auth logout path and clear the session cleanly.

**ST7. Additive & Non-Destructive** — Day 7.1 MAY add a `Settings` nav entry and
a `/settings` route inside `DashboardLayout`, but MUST NOT remove, hide, or
repurpose the existing `/profile`, `/notifications`, or any existing nav entry or
route. Settings MAY reuse existing surfaces/components (profile form, notification
settings) rather than duplicate them; where reused, there is exactly ONE source
of truth (ST8).

**ST8. Persistence & Ownership** — All preferences (units, theme) MUST persist
per authenticated user, load correctly at session start, and be owner-scoped
(never another user's preferences). Display-unit conversion and theme application
MUST NOT mutate stored canonical data — the preference changes rendering only.

### Required Capabilities (non-negotiable)

The Settings system MUST support, and ship with:

- Account settings
- Notification preferences
- Units preference (kg / lb)
- Theme settings
- Profile preferences
- Change password
- Logout
- Delete account option (with proper confirmation)

### Account & Profile Rules

- Profile edits reuse the existing profile contract/endpoints (PATCH `/api/
  profile` on the shipped app). Settings MAY host the profile form as a section,
  but MUST NOT introduce a second profile store — the existing page and the
  Settings section must stay in sync from the same API response.
- Email remains read-only (Day 2 deferred scope unchanged).

### Units Rule

- `units` preference: `kg` | `lb` (default `kg`), persisted per user.
- Applied to displayed weights, measurements, and PRs across Dashboard, Progress,
  Workout History, and Analytics.
- Canonical stored values MUST stay unchanged in the database; conversion is a
  display-only, edge-layer concern with explicit, consistent rounding.

### Theme Rule

- Supported themes: **dark** (the product identity, default) plus **at most ONE**
  additional scheme (light). Keep it simple.
- The additional scheme MUST be built from the SAME `--color-*` token system,
  switched via a root `data-theme` attribute. Any component using a raw color
  literal MUST be tokenized before theming lands. No third theme, no custom
  theme builder, no per-control palette overrides.

### Notification Preference Rules

- Notification preferences ARE the Day 6.1 per-type settings, persisted in the
  `notificationsettings` collection and read/written via `/api/notifications/
  settings` (Amendment 2026-09-09). The Settings area MUST reuse that single
  source of truth — no second storage key, no duplicated controls, no divergent
  read/unread state.

### Password Change Rules

- Endpoint: auth-scoped change-password (e.g. `POST /api/auth/change-password`)
  with `{ currentPassword, newPassword }` (final path decided in the plan).
- Validation: current password verified via bcrypt compare; new password meets
  auth strength rules and differs from the current one; errors returned with the
  standard codes (`400 VALIDATION_ERROR`, `401 INVALID_PASSWORD`).
- On success: hash + persist the new password, clear the session cookie, and
  require re-login. No password hash may ever be returned by any endpoint.

### Logout Rules

- Reuse the existing `POST /api/auth/logout` path; clear the httpOnly cookie;
  navigate to `/login`; the UI MUST null the user context so no protected data
  leaks into the next session.

### Delete Account Rules (Danger Zone)

- Endpoint: auth-scoped account deletion (e.g. `DELETE /api/auth/account`) that
  REQUIRES a confirmation payload (minimum: the account's email; the plan MAY add
  current password) — the server MUST reject missing/mismatched confirmation.
- UI: red-flagged control inside the Danger Zone; a two-step modal (explain
  consequences → type the email → final confirm). Never enabled by a single
  click, and never hidden in a menu.
- Consequences: cascade-delete the acting user's owned data (profile, workouts,
  nutrition, `notifications`, `notificationsettings`) then the user document;
  clear the session; redirect to `/login`. MUST be irreversible and MUST NOT
  touch any other user's data (Principle VII).

### Backend Surface & Persistence

- New owner-scoped, `authenticate`-gated endpoints only (mirror the existing
  route/controller/service pattern): preferences read/write, change-password,
  delete-account — paths finalized in the plan.
- `units` + `theme` preferences live on the user's own preference store (e.g. a
  `preferences` field on the User/profile document — plan decides, one store).
- Notification preferences reuse `/api/notifications/settings` (no new store).
- No new env vars (D6/A7/known env budget unchanged).

### Folder & Component Structure (Day 7.1)

```text
frontend/src/
├── App.jsx                     # + <Route path="/settings">
│                               #   (inside DashboardLayout, like /notifications)
├── components/
│   └── settings/               # (new; mirrors components/notifications/)
│       ├── SettingsSections.jsx    # grouped-section wrapper (tabs or stacked cards)
│       ├── PreferencesForm.jsx     # units + theme controls (labels/checks/selects)
│       ├── PasswordForm.jsx        # current + new password, inline errors
│       └── DeleteAccountModal.jsx  # two-step destructive confirmation
├── pages/
│   └── Settings.jsx            # /settings — composes grouped sections
├── context/
│   └── SettingsContext.jsx     # preferences load/update + optimistic revert
```

Rules: components are `.jsx`, logic/data are `.js` (V override). One logical unit
per file. Preferences and reuse data come from the API — no mock data files for
Day 7.1.

### UI/UX Rules

- Same dark shell, `--color-*` tokens, accent, dash-card surfaces, 4px scale.
- Grouped cards: **Account**, **Preferences**, **Notifications** (reuses Day 6.1
  settings), **Danger Zone**.
- Destructive controls appear ONLY in the Danger Zone with distinct error-token
  styling; confirmation modals are keyboard-accessible with a focus trap.
- Controls are real `<label>`, `<input type="checkbox">`, `<select>`, `<button>`;
  confirmations announce via `aria-live`; focus-visible rings in accent;
  reduced-motion respected; no horizontal scroll at any breakpoint (D8/A9).

### Coding Standards

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (V override).
- No new npm dependencies (D6/A7). No new env vars. No mock data.
- Naming, imports, comments, dead-code, and purity rules identical to the Day
  4.1/5.1/6.1 coding standards.

### Definition of Done (Day 7.1 Success Criteria)

1. Users can update profile, units, theme, and notification preferences from a
   dedicated `/settings` page inside `DashboardLayout`, with a `Settings` nav
   entry.
2. Units (kg/lb) and theme preferences persist per user, load correctly at
   session start, and apply instantly across every consuming surface without
   mutating stored canonical data.
3. Users can change their password securely (current password required, validated
   new password, session cleared on success).
4. Users can log out cleanly (session cookie cleared, redirected to `/login`, no
   state leak).
5. Users can delete their account only after clear two-step confirmation
   (Danger Zone, type-to-confirm); deletion cascades the acting user's owned data
   only (workouts, nutrition, notifications, settings, profile) and never another
   user's data.
6. Notification preferences are the single Day 6.1 source of truth — no second
   storage key or duplicated controls.
7. The entire Settings experience is visually and behaviorally consistent with
   the rest of the app: same sidebar, dark theme, accent tokens, tight spacing.
8. All new files are `.js`/`.jsx`; zero new npm dependencies; zero new env vars;
   no route/nav removals (ST7).
9. `npm run build` (vite build) succeeds cleanly; backend `node --check`/import
   smoke passes for new/changed modules.
10. Manual browser verification is recorded (preference persistence across
    reload, theme switch, unit switch, password change, logout, delete-account
    confirm flow, empty/error states, responsive at 3 breakpoints, prior-day
    regression).
11. Accessibility pass: labelled controls, keyboard nav, focus trap in the delete
    modal, `aria-live` confirmations, contrast readable on dark.

### Out of Scope (Day 7.1 — Deferred)

Explicitly NOT part of Day 7.1; do not expand Day 7.1 work to include:

- Two-factor authentication (2FA).
- Connected social accounts (OAuth/linking).
- Advanced privacy controls (consent dashboards, data review history).
- Export all data.
- Multiple theme options beyond the supported ones (dark + at most one light);
  custom theme builders/appearances.
- Email or username change; multi-account switching; account recovery/security
  questions.
- Privilege/role management (staff/coach views).
- Cross-device preference sync beyond standard server persistence (no websockets,
  no push).

---

## Day 8.1 — Reports & Export (COMPLETE)

### Project Goal & Definition

Day 8.1 builds the **Reports & Export** system for the Fitness Tracker,
continuing the shipped MERN application on the Day 7.1 additive pattern. Reports
MUST reflect real persisted user data over a user-selected date range and offer
reliable CSV and PDF exports. It is **JavaScript-only (`.js`/`.jsx`, no
TypeScript)**, reuses the committed React + Vite + React Router + Express +
Mongoose + Tailwind stack, renders inside the existing `DashboardLayout` shell
(`Sidebar` + `TopNavbar`), and MUST NOT break, modify, or regress any prior-day
behaviour or route.

Unlike the mock-data phases (Day 1.1-6.1), Day 8.1 is an **additive MERN phase**:
report data is aggregated **server-side** from the real, owner-scoped `workouts`
and `nutrition` collections over the selected date range (Principle VII), and
totals follow the server-computed rule of Principle VIII. The client renders and
exports that pre-aggregated data. This honors Accuracy First (real data only),
Reliability (no drift between view and export), and Performance
(pre-aggregated queries).

The phase delivers a dedicated **Reports page** (`/reports`) with report tabs,
matching the existing visual language (deep charcoal background, `dash-card`
surfaces, orange accent, consistent type scale):

1. **Fitness Report (Overview)** — a summary dashboard combining key KPIs from
   Workout, Nutrition, and Progress: Total Workouts, Total Volume, Calories
   Consumed (vs goal when a persisted goal exists), Weight Change (when weight
   history exists), and a derived Consistency Score, with tab navigation into
   the detailed reports.
2. **Workout report** — workout count, total volume, frequency, per-category
   breakdown, and notable lifts / PRs for the range. Duration and muscle-group
   breakdowns are shown ONLY where that data is persisted (currently NOT in the
   model → graceful "not tracked" states, never invented).
3. **Nutrition report** — server-computed daily calorie/macro totals, averages,
   per-meal-type breakdown, and the logged meals list for the range; goal
   comparison ONLY when a persisted goal target exists.
4. **Progress report** — real-data-only progress (profile weight, workout +
   nutrition consistency); strength progression and PRs derived from real
   exercises; weight history and milestones ONLY if persisted owner-scoped data
   exists (progress photos are not reportable — no such feature exists).
5. **Date-range selection** — presets (Last 7/30/90 days, This Month, Last
   Month, This Year, All Time) + custom `from`/`to`, default **Last 30 days**,
   respected by every report and export and persisted across tabs via the URL.
6. **Export** — accurate, downloadable **CSV** and **PDF** per report (including
   the Overview), plus clear Generate / Download buttons.

### Core Principles (R1-R9)

#### R1. Accuracy First (NON-NEGOTIABLE)

Every report MUST reflect the acting user's real, persisted data for the selected
range. The system MUST NEVER invent, estimate, or approximate missing values;
gaps render as explicit "no data" states, never as filler numbers or trends.
All report aggregation MUST be server-computed from owner-scoped rows
(`{ owner: req.userId }` queries) — extending the Principle VIII totals rule to
every report aggregate, not just calories/macros. Valid report sources are the
`workouts` and `nutrition` collections plus the user's own profile fields
(`weightKg`, `goal`). Frontend-only mock datasets (Day 2.1 weight/measurement/
streak mocks, Day 3.1 history mocks, Day 4.1 analytics mocks) are NOT report
sources under any circumstances.

Data that the persisted model does not capture — workout `duration`, exercise
muscle-group metadata, progress photos, macro/calorie goal targets, historical
weight entries — MUST NOT be approximated from other fields and MUST render as
graceful "not tracked / no data in this range" states until the model actually
persists them (see Report Type Rules and Out of Scope).

Rationale: A report is a claim about past activity. Fabricating or approximating
values makes the report untrustworthy — the exact failure mode this phase exists
to prevent.

#### R2. Clarity (NON-NEGOTIABLE)

Every report MUST be understandable at a glance: a clear report heading, the
applied date range, a sectioned layout, summary headline metrics, and consistent
labels/units throughout. No jargon, no unexplained metrics, and no number on a
report that cannot be traced to the data behind it.

#### R3. Dashboard Consistency (NON-NEGOTIABLE)

The Reports page MUST use the exact same design system as the Dashboard: the
fixed left sidebar, dark theme, `--color-*` tokens, `dash-card` surfaces,
`dash-num` headline numbers, orange accent, 4px spacing scale, and tight side
spacing (no large empty black areas). Day 8.1 MAY add a `Reports` nav entry and a
`/reports` route inside `DashboardLayout`, but MUST NOT remove, hide, or
repurpose any existing nav entry or route (additive/non-destructive, mirroring
ST7).

#### R4. User Control (NON-NEGOTIABLE)

Users MUST be able to select an inclusive date range and choose exactly which
report(s) to generate and export. The date-range selector (presets + custom
`from`/`to`, default Last 30 days) and the Generate/Download action buttons MUST
be clearly visible and consistent with the design system. Presets and the custom
range MUST all drive the same aggregation path.

#### R5. Reliability (NON-NEGOTIABLE)

CSV and PDF exports MUST produce correctly formatted, downloadable files without
errors. CSV MUST open cleanly in spreadsheet software (UTF-8 BOM, quoted/escaped
cells). PDF MUST be a well-formatted, share/print-ready file. Exports MUST be
generated from the exact same pre-aggregated data the page rendered — never from
a second, different fetch that could drift — and MUST never throw on empty or
sparse data (a valid "no records" file is still a valid export). Failed fetches
or failed export generation MUST surface an error state with a Retry action,
never a silent no-op.

#### R6. Performance Through Pre-Aggregation

Report data MUST be computed server-side via pre-aggregated, owner-scoped
aggregation queries (index-friendly, no N+1). The client renders and exports the
returned summaries without re-aggregating large datasets. Aggregation and
formatting helpers MUST be pure and memoizable. Generating a report or export
MUST stay fast even with larger historical datasets (Performance Targets).

#### R7. Accessibility & Internationalization (NON-NEGOTIABLE)

All interactive elements (date picker, filters, download buttons) MUST be
keyboard-accessible and screen-reader friendly. Numeric formats, date formats,
and units MUST respect user locale settings. Provide text alternatives for
charts and visual summaries.

- All controls MUST be operable by keyboard alone (Tab, Enter, Space, Escape).
- Interactive elements MUST have `aria-label` or associated `<label>` elements.
- Export progress/success/error MUST be announced via `aria-live` regions
  without blocking the user.
- Chart SVGs MUST include `role="img"` and `aria-label` with a text summary.
- Numeric formatting MUST respect the user's locale; units (kg/lb) MUST
  respect the user's preference and convert consistently everywhere.

Rationale: Accessibility ensures all users can benefit from reports. Locale
awareness prevents confusion when numbers or dates appear in unexpected formats.

#### R8. Testing & Reliability (NON-NEGOTIABLE)

Define contract tests for each report type: given sample data, assert exact
CSV/PDF structure and content. Include edge-case tests: empty data, single-day
range, very large ranges, missing fields. All export endpoints MUST have
integration tests verifying headers, content-type, and streaming behavior.

- Contract tests MUST verify: given known persisted data and a specific date
  range, each report returns the exact expected metrics, tables, and chart
  series.
- CSV export tests MUST verify: UTF-8 BOM, correct headers, proper quoting/
  escaping, valid file structure.
- PDF export tests MUST verify: header items present, charts included where
  data exists, "No data" notes for empty sections.
- Edge-case tests MUST cover: empty range, single-day range, All-Time range,
  missing profile fields, no workouts, no nutrition logs, concurrent users.
- Integration tests MUST verify: correct HTTP headers, content-type, streaming
  behavior, authentication enforcement.

Rationale: Reports make claims about user data. Testing ensures those claims
are accurate and that exports are reliable under all conditions.

#### R9. Evolution & Governance (NON-NEGOTIABLE)

New report types MUST conform to the shared report model and export pipeline.
Any change to the report schema requires a migration plan and backward-
compatible export behavior for at least one major version. This constitution
can be amended via a documented proposal that includes impact analysis on
existing reports and exports.

- New report types MUST use the same data model shape and export pipeline.
- Schema changes MUST include a migration plan and maintain backward-compatible
  exports for at least one major version.
- Constitution amendments MUST be proposed in writing with rationale, impact
  analysis, and migration plan before implementation.

Rationale: The module will evolve as the app grows. Governance ensures changes
are deliberate, backward-compatible, and documented.

### Required Capabilities (non-negotiable)

The Reports & Export system MUST support, and ship with:

- Dedicated Fitness Report page (`/reports`)
- Fitness Report overview (KPI summary of the three detailed reports)
- Workout report
- Nutrition report
- Progress report
- Report tabs / navigation between overview and detailed reports
- Date-range selection (presets + custom range, default Last 30 days)
- Export to CSV (per report, incl. overview)
- Export to PDF (per report, incl. overview)
- Clear Generate / Download report buttons
- Loading (skeleton), empty, and error/retry states for reports and exports

### Fitness Report (Overview) Rules

- The Overview combines the SAME pre-aggregated data as the three detailed
  reports for the SAME range into KPI cards: Total Workouts, Total Volume,
  Calories Consumed (daily average and, when a persisted calorie goal target
  exists, adherence vs goal), Weight Change (only when persisted weight history
  covers the range; otherwise current weight or "no data"), and a **Consistency
  Score**.
- **Consistency Score** MUST be a pure, derived function (`reportUtils.js`) of
  real activity days — e.g. `% of days with a logged workout AND/OR nutrition
  entry` — with the exact formula stated in the plan. Never fabricated; zero
  activity → "no data", never `0%` with fake precision.
- Overview KPI cards reuse the `dash-num` summary-card style (Day 1.1). A tab
  row (Overview / Workout / Nutrition / Progress) switches views; all tabs share
  the one date-range selector.
- Overview export = a combined CSV (a sectioned sheet/columns per report) and a
  PDF that includes each report's summary + key tables/charts.

### Report Type Rules

**Workout report** (from `workouts`): workout count; total volume and total
sessions; average sessions per week; frequency series; per-category breakdown
(strength/cardio/flexibility/hybrid/other); notable lifts and **PR count**
(best lift by `weightKg` across recorded exercises — the plan MUST pin whether a
PR compares against the caller's full history or only the range; both are pure
over real data). **Duration** (average/total) and **muscle-group distribution**
are NOT computable from the current `Workout`/`Exercise` model (no such fields)
and MUST render "Not tracked" no-data states, never estimates (R1). Drill-down
to a single workout's details reuses the existing `WorkoutDetail` view or data.

**Nutrition report** (from `nutrition`): per-day totals for calories, protein,
carbs, fat plus range totals and daily averages; per-meal-type breakdown
(breakfast/lunch/dinner/snack); the logged meals list for the range. All totals
MUST come from the server aggregation (Principle VIII) — the client never sums
raw entries as the source of truth. **Comparison against goals** is shown ONLY
when a persisted calorie/macro goal target exists; otherwise "No goal set in this
range" (macro goal targets are not currently persisted — see Out of Scope).

**Progress report** (real data only): latest recorded weight and goal from the
user's profile; workout consistency (workouts per week, count); nutrition
consistency (days logged in range); strength progression and PRs derived from
real exercise records (weight/reps/volume over time). **Weight trend/changes**
and **milestones** are included ONLY if persisted owner-scoped data exists; when
it does not, show a graceful "No weight history in this range" / "No milestone
data yet" state. Never derive history from the Day 2.1 mock data or the single
profile `weightKg`. Progress photos / visual progress timeline are NOT
reportable (no such feature exists).

Rationale: Reports must claim only what the app actually persists (R1). The Day
2.1 weight/measurement/streak mocks and any model field that is not persisted
(e.g. duration, muscle groups, macro goals) are barred as report sources by
definition until the underlying model actually stores them.

### Date Range Rules

- Inclusive `from`/`to` in `YYYY-MM-DD` (same convention as prior days).
- Presets are FIXED: **Last 7 days, Last 30 days (default), Last 90 days, This
  Month, Last Month, This Year, All Time** plus a custom pair of date inputs.
- Changing the range MUST re-fetch / re-calculate every metric, chart, and export
  on the current report AND the Overview — a single shared aggregation path
  (R4/R6).
- **Persistence**: the applied range MUST be serialized to the URL query params
  (`?from=...&to=...`) via `useSearchParams` (the Day 5.1 S5 convention), so it
  is shared consistently across all report tabs and survives refresh within the
  session. NO localStorage, NO backend persistence.
- Server validation: an invalid, empty, or inverted range MUST be rejected with
  `400 VALIDATION_ERROR` (friendly message), never rendered as a broken report.
- Every report and export MUST display the applied range; exports embed it in
  the filename and document header.

### Server-Side Aggregation & API Surface

- New **auth-scoped, `authenticate`-gated aggregation endpoints** mirroring the
  existing route/controller/service pattern (final paths in the plan; one or few
  endpoints, e.g. `GET /api/reports/:type?from&to`, including an overview
  aggregate), each returning pre-aggregated data in the standard
  `{ success, data?, error? }` envelope.
- Every query MUST be owner-scoped by `req.userId` (Principle VII); an
  empty-aggregation result must never leak another user's data.
- **No new Mongoose models** — aggregates derive from the existing `workouts` and
  `nutrition` collections (owner+date indexes already exist) and the user's
  profile.
- **No new environment variables.**

### CSV Export Rules

- Built **client-side** from the pre-aggregated data already fetched for display
  (R5 — single source of truth), via a pure function in `reportUtils.js` and a
  Blob + anchor download.
- Format: UTF-8 **with BOM** so spreadsheet software opens it cleanly; an
  optional report title + date-range header row; a data header row; comma-
  separated; fields containing commas, quotes, or newlines MUST be quoted with
  doubled quotes escaped; every value stringified consistently.
- Filename: `<report-type>-<from>_<to>.csv` (e.g.
  `workout-2026-08-11_2026-09-10.csv`); overview exports use `fitness-...`.
- Empty range: still export a valid file — headers present, zero data rows, and a
  summary line like `No records for 2026-08-11 to 2026-09-10` (never an empty or
  broken file, never fabricated rows).

### PDF Export Rules

- A REAL downloadable `.pdf` file (not `window.print()`; no print-CSS
  substitute).
- One **approved client-side PDF library** is allowed as a constitution-approved
  exception (plan picks it and records it in Complexity Tracking with
  justification). This is the ONLY new runtime dependency of the phase. No other
  chart/date/state/export libraries.
- Layout: clean, professional, print-ready — a header with the app name
  ("Fitness Tracker"), report title, user name, applied date range, and the
  **generation timestamp**; summary/KPI metrics; section headings; simple
  tables; and charts rendered as STATIC vector drawings (bars/lines) using the
  approved library's drawing API, or rasterized from the app's hand-rolled SVG
  without adding another dependency. A chart with data MUST NOT be silently
  omitted; a section with no data shows a "No data" note instead of an empty
  image.
- Basic app-identity header (app name + timestamp) IS in scope; watermarking and
  full branded template kits remain out of scope.
- Generated from the same pre-aggregated data as the page and CSV (R5). An empty
  range produces a valid one-page "No records" PDF (still titled + timestamped).

### Empty & Sparse Data Rules

- **Empty range**: each report section renders the shared `EmptyState` with a
  range-scoped message ("No workouts in this date range", etc.) and an action
  (e.g. widen the range). Exports remain valid zero-data files (R5).
- **Sparse data**: render exactly what exists — real counts and real averages;
  0 rows show "no data", never `0`/`NaN` artifacts; 1-point series render as
  markers, never broken axes; no fabricated percentages or approximated trends
  (R1).
- **Loading**: cards/tables/charts use `Skeleton` loaders (skeleton shimmer for
  charts), i.e. progressive loading on every data-driven section.
- **Error**: a failed data fetch or failed export generation MUST show a friendly
  error state with a **Retry** action (never a stack trace, never a silent
  no-op).

### Performance Targets

- Reports MUST load within **< 2s** for a typical 30-day range (server
  aggregation + client render, warm).
- Exports MUST complete within **< 10s** for normal ranges.
- Large ranges (e.g. All Time) MUST degrade gracefully: pure, memoized
  aggregation, daily-bucketed/capped series for charts, and clear messaging if a
  request exceeds a sane limit — never a timeout crash. Verification of these
  targets MUST be recorded in the plan/spec.

### Folder & Component Structure (Day 8.1)

Frontend (all under the existing `frontend/src/` workspace, additive only):

```text
frontend/src/
├── App.jsx                     # + <Route path="/reports">
│                               #   (inside DashboardLayout, like /settings)
├── components/reports/         # (new; mirrors components/settings/)
│   ├── ReportTabs.jsx          # Overview / Workout / Nutrition / Progress tabs
│   ├── DateRangeSelector.jsx   # presets + custom from/to + Generate button
│   ├── ReportCard.jsx          # reusable report section card + header
│   ├── OverviewReport.jsx      # KPI summary cards + Consistency Score
│   ├── WorkoutReport.jsx       # workout report section
│   ├── NutritionReport.jsx     # nutrition report section
│   ├── ProgressReport.jsx      # progress report section
│   ├── ReportSummary.jsx       # headline metrics row (dash-num)
│   └── ExportButtons.jsx       # per-report CSV + PDF actions (two buttons or one Export dropdown)
├── pages/
│   └── Reports.jsx             # /reports — composes tabs + selector + report views
├── services/
│   └── reports.js              # fetch pre-aggregated endpoints (API layer only)
└── utils/
    └── reportUtils.js          # pure: buildReportMetrics, consistencyScore,
                                #   buildCsv, exportPdf, serializeRange
```

Backend (additive, mirroring the existing route/controller/service shape):
`routes/reports`, `controllers/reports`, `services/reports` (or the plan's
equivalent) implementing the owner-scoped aggregation endpoints. No new models,
no env changes.

Rules: components are `.jsx`, logic/data/formatting are `.js` (V override). One
logical unit per file. `services/` is the only place `fetch` is called (IV).

### UI/UX Rules

- Same dark shell, tokens, accent, `dash-card` surfaces, `dash-num`, 4px scale,
  and tight side spacing as every prior day (Day 1.1 D2/D3, Day 7.1 ST3).
- Page layout: report tabs (Overview / Workout / Nutrition / Progress) with a
  shared date-range selector + Generate button at top (visible on every tab);
  per-report Export actions (Export CSV / Export PDF — two buttons or one Export
  dropdown with both options), styled as clear primary actions.
- Consistent component usage across all report views (same cards, tables, chart
  wrappers); fully responsive desktop + mobile (charts reflow, no horizontal
  scroll at any breakpoint).
- Designed empty states per report for the selected range; `Skeleton` loaders
  during load; error states with a Retry action.
- Controls are real `<button>`/`<select>`/`<input type="date">`; export buttons
  show a pending/spinner + success state (announced via `aria-live`) and never
  block; focus-visible rings use the accent; `aria-label` for icon-only
  controls; reduced motion respected.
- Numeric formatting consistent with the app (weights with decimals, volume with
  thousands separators, kcal whole numbers, percentages whole); long names
  truncate.

### Coding Standards

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (V override, as
  applied by Day 7.1).
- **Dependencies**: exactly ONE new runtime dependency (the approved PDF library,
  R5 / Complexity Tracking); no others. No new env vars (D6/A7 budget
  unchanged).
- Naming, imports, comments, dead-code, and purity rules identical to the Day
  4.1/5.1/6.1/7.1 coding standards; report + export math lives in
  `reportUtils.js` pure functions (R6), never in render.

### Definition of Done (Day 8.1 Success Criteria)

Day 8.1 is DONE only when ALL of the following hold, in addition to Day 1.1
through Day 7.1 still passing:

1. `/reports` renders inside `DashboardLayout` (same shell, tokens, tight
   spacing) with a `Reports` nav entry; existing nav/routes are not removed or
   repurposed.
2. The Fitness Report **Overview** shows the combined KPIs (Total Workouts, Total
   Volume, Calories, Weight Change or no-data, Consistency Score) for the
   selected range, computed purely from real pre-aggregated data.
3. Report tabs (Overview / Workout / Nutrition / Progress) navigate correctly and
   share the single date-range selector.
4. Workout, Nutrition, and Progress report sections render correct values for the
   selected date range, aggregated server-side from the real owner-scoped data.
5. Date-range selection works with ALL presets (Last 7/30/90 days, This/Last
   Month, This Year, All Time; default Last 30 days) plus custom from/to, drives
   every report simultaneously, is validated (invalid/inverted range → friendly
   400 message), and persists across tabs via URL params.
6. Duration, muscle-group, progress-photo, macro-goal, and weight-history items
   that the model does not persist render graceful "not tracked / no data"
   states — no fabricated values (R1).
7. CSV export downloads a correctly structured file for every report incl. the
   Overview (UTF-8 BOM, valid headers, proper quoting/escaping) that opens
   cleanly in spreadsheet software and reflects exactly what the page showed.
8. PDF export downloads a clean, print-ready file for every report incl. the
   Overview (app-name header, title, date range, generation timestamp, KPIs,
   tables, static chart renderings) generated from the same data as the page.
9. Empty/sparse ranges render designed empty states and still export valid
   zero-data CSV/PDF; no `NaN`, no fabricated values, no broken sections
   (R1/R5); failed fetches/exports show an error state with Retry.
10. Ownership isolation holds: a second user can never influence or read another
    user's reports (aggregation is owner-scoped, Principle VII).
11. Performance targets met: 30-day report loads < 2s and exports complete < 10s;
    All-Time ranges degrade gracefully (recorded in the plan/spec).
12. All new files are `.js`/`.jsx`; exactly zero new env vars; exactly one
    approved new npm dependency (the PDF library) documented in Complexity
    Tracking.
13. `npm run build` (vite build) succeeds cleanly; backend `node --check`/import
    smoke passes for new/changed modules.
14. Manual browser verification is recorded (overview + all reports, all presets +
    custom range, URL persistence across tabs, CSV + PDF downloads
    opened/validated, empty/sparse/error/retry states, responsive at 3
    breakpoints, prior-day regression check).
15. Accessibility pass: labelled controls, keyboard nav, `aria-live` export
    feedback, contrast readable on dark.

### Out of Scope (Day 8.1 — Deferred)

Explicitly NOT part of Day 8.1; do not expand Day 8.1 work to include:

- Emailing reports; scheduling / recurring reports.
- Sharing reports via social media, public/secret links, or with
  coaches/trainers.
- Advanced custom report builders / report personalization.
- Advanced filtering beyond the date range (reuses any Day 5.1 filters already in
  the app, nothing new).
- Excel (.xlsx) export (CSV + PDF only).
- Watermarking or full branded PDF template kits beyond the basic app-name +
  timestamp header.
- Adding muscle-group metadata, workout `duration`, macro/calorie goal-target
  CRUD, or a persisted weight-history collection to the data model — the reports
  MAY use such data only if it already exists, never create or fake it.
- Progress photos / visual progress timeline (no such feature exists in the app).
- Server-side file generation/file storage of reports; report export history or
  saved exports.
- Charting/analytics libraries, date libraries, or any export library beyond the
  single approved PDF library.
- Automated test suite and CI for the frontend.
- Deployment or production hosting; cross-device report sync.

These MUST NOT be silently added to Day 8.1; open a new spec if one is required.

---

## Day 8.2 — Public Landing Page (COMPLETE)

### Project Goal & Definition

Day 8.2 builds the **public landing page** for the Fitness Tracker
("FitTrack"), continuing the shipped MERN application on the additive pattern.
The landing page is the product's conversion-focused public face: it presents
FitTrack's value proposition, features, and proof to visitors who are NOT yet
authenticated, and funnels them into the sign-up flow. It is a single, generic
public page rendered from a **single content module**, so copy, statistics,
testimonials, nav links, and CTA targets can be updated without touching
component code.

The page is **JavaScript-only (`.js`/`.jsx`, no TypeScript)**, reuses the
committed React + Vite + Tailwind + framer-motion stack (framer-motion is
already bundled; **zero new runtime dependencies**), MUST use the exact same
design system as the Dashboard (dark theme, `--color-*` tokens, orange accent,
4px spacing scale, existing type scale), is **mobile-first**, and MUST NOT
break, modify, or regress any prior-day behaviour or route. Because it is
public-facing, accessibility + basic SEO (semantic landmarks, one `<h1>`, meta
description, labelled links, alt text) are part of the phase.

### Core Principles (L1-L9)

#### L1. Conversion-Focused (NON-NEGOTIABLE)

Every element of the landing page MUST serve the conversion narrative:
headline → value → proof → action. Primary CTAs ("Get Started" / "Start
Tracking") MUST be above the fold, repeated at logical decision points (after
Features, after Statistics, and in the Final CTA), and remain the visually
dominant action on every viewport. No section MAY end in a dead end — each
section MUST lead to the next or to a CTA.

#### L2. Clarity & Immediate Impact (NON-NEGOTIABLE)

The hero headline MUST communicate the value proposition within seconds, and
the first viewport MUST be instantly scannable (headline → supporting line →
CTA). Copy MUST be benefit-driven, plain-language, and free of jargon. Visual
hierarchy MUST lead the eye deliberately; no vague claims, no unexplained
statistics, no walls of text.

#### L3. Visual Consistency (NON-NEGOTIABLE)

The landing page MUST be unmistakably FitTrack: the same dark theme as the
Dashboard, `--color-*` tokens, vibrant orange accent (v4.0.0:
`--color-accent: #F97316`, see Day 8.3 PU2), 4px
spacing scale, existing type scale, and the same card/surface language
(`dash-card` / `dash-num` where used). No new color system, no off-brand
styling, no third-party theme. Glow/gradient effects MUST be built from the
existing accent tokens (`--color-accent-glow`, `--color-primary-glow`), never
new colors.

#### L4. Modern & Premium (NON-NEGOTIABLE)

Craft MUST be product-launch quality: precise spacing rhythm, cohesive type
scale, accent-tinted gradients/glows built from tokens (e.g. hero backdrop,
primary-button treatment), refined silhouette cards, and purposeful
micro-motion. The page defines the product's first impression and MUST NOT look
generic, template-made, or like a stock landing page.

#### L5. Mobile-First Responsive (NON-NEGOTIABLE)

Mobile-first and fully responsive with **no horizontal scroll at any
breakpoint** (D8/A9). On mobile the nav collapses to an accessible menu, CTAs
remain large and thumb-friendly, and every section stacks cleanly. All sections
MUST render correctly at 3 breakpoints (mobile, tablet, desktop).

#### L6. Performance & Lightweight Animation (NON-NEGOTIABLE)

No heavy media, no 3D/WebGL, no hero video backgrounds, no image carousels, no
large image assets. Animations MUST use transforms + opacity only, prefer the
already-bundled framer-motion for reveal effects, be GPU-friendly, collapse to
static under `prefers-reduced-motion`, and respect an LCP budget (performance
target, recorded in the plan). The landing page MUST NOT measurably bloat the
app bundle or slow first paint. Zero new npm dependencies.

#### L7. Authentic Content (NON-NEGOTIABLE)

Statistics and testimonials MUST be truthful or clearly labelled (extends the
R1 real-data spirit to public marketing content). Stats MAY show honest,
clearly-labelled placeholder figures that the app can genuinely produce; they
MUST NOT present invented user claims as real. Testimonials MUST be visibly
marked as illustrative/mock (consistent with the mock-data phases) until real
user content exists, and MUST be swapped in from the single content module
without code changes. No fabricated reviews presented as fact.

#### L8. Content Maintainability (NON-NEGOTIABLE)

ALL copy, statistics, testimonial items, nav links, and CTA targets MUST live
in ONE content module (e.g. `frontend/src/data/landingContent.js`).
Components MUST render from data, never hardcode strings across files. Editing
the page's content MUST NOT require component changes, and CTA route targets
MUST be centralized in the same module.

#### L9. Additive & Non-Destructive (NON-NEGOTIABLE)

Day 8.2 adds a PUBLIC landing experience WITHOUT removing, hiding, or
repurposing any existing route (`/login`, `/register`, the protected Dashboard
at `/`, and all prior-day routes; ST7/R3 additivity holds). The plan MUST state
the exact `App.jsx` wiring for the landing page (e.g. a new public route, and
how authenticated users are handled at `/`), and MUST confirm zero route
removals.

### Required Capabilities (non-negotiable)

The Landing Page MUST support, and ship with:

- A public landing page viewable WITHOUT login at the documented route
- Sticky navbar (brand/logo → anchor links → primary CTA)
- Hero section: headline, supporting copy, primary + secondary CTA buttons,
  and an ANIMATED hero visual (lightweight — CSS/SVG/framer-motion, L6)
- Features grid/section
- "How it works" steps section
- Fitness statistics band (honest, centrally-sourced figures, L7)
- Benefits section
- Testimonials section (clearly illustrative/mock, L7)
- Final CTA section (closing headline + CTA buttons)
- Footer (links, product info, Login / Sign up links)
- Every CTA routed to the correct auth flow (primary → sign-up/register,
  secondary/links → login)
- Static-first rendering: the page renders from the content module with NO
  authenticated /api dependency and never shows a broken state on absent data

### Page Structure Rules

Required sections in a coherent narrative order (the plan MAY refine ordering
but MUST include all of them):

1. **Navbar** — brand/logo, anchor links to on-page sections, and a primary
   "Get Started" CTA. Sticky with backdrop blur (matching `TopNavbar`);
   collapses to an accessible menu on mobile (L5).
2. **Hero** — one headline stating the value proposition, one supporting line,
   a primary CTA ("Get Started" → sign-up) + a secondary CTA ("Log in" →
   `/login`), and an animated hero visual demonstrating the product (a mock
   dashboard preview or abstract activity rings/chart — lightweight only, L6).
3. **Features** — the core capabilities (workouts, nutrition, goals, analytics,
   reports) presented as benefit-first cards reusing the `dash-card` language.
4. **How It Works** — 3-4 numbered steps (e.g. Create account → Log workouts →
   Track nutrition → See progress & reports).
5. **Fitness Statistics** — a stats band (e.g. workouts logged, meals tracked,
   streaks, reports generated) with HONEST, centrally-sourced figures (L7)
   formatted `dash-num` style.
6. **Benefits** — outcome-focused benefits section ("Why FitTrack").
7. **Testimonials** — 1-3 cards; MUST be visibly mock/illustrative with an
   on-page disclaimer (L7).
8. **Final CTA** — closing headline + the primary sign-up CTA (repeated).
9. **Footer** — brand, anchor/section links, and Login / Sign up links; social
   or legal links only if real (no dead placeholders).

Sections MAY be composed as separate `components/landing/*.jsx` files, all
rendering from `data/landingContent.js` (L8).

### CTA Routing Rules

- Primary conversion CTAs ("Get Started", "Start Tracking", "Sign up") MUST
  route to the auth sign-up flow (`/register`).
- Secondary CTAs and footer/nav "Log in" links MUST route to `/login`.
- NO dead buttons or empty `href`s: every anchor/button MUST have a real,
  centralized target (L8).
- The plan MUST state exactly how same-page anchor links and auth routes
  coexist in `App.jsx` (L9).

### Content & Data Rules

- Everything user-facing that may change — hero copy, section titles,
  descriptions, stats, testimonials, nav links, CTA labels + targets — lives in
  `frontend/src/data/landingContent.js` (ONE source of truth, L8).
- The content module MUST export plain data (arrays/objects/strings), not JSX
  and not components.
- Stats entries MAY carry a maintainer `note` clarifying provenance (e.g.
  "mock seed — replace with real usage figures"); testimonials MUST carry a
  visible `illustrative: true` marker that drives the on-page disclaimer (L7).
- Content updates MUST NOT require component or build changes beyond editing
  the module.

### Performance & Animation Rules

- ONE lightweight animation approach (framer-motion, already bundled, for
  reveals/counters; CSS transitions/keyframes for hover/micro-interactions).
- Only transform + opacity animation; never layout-thrashing properties
  (L6).
- The hero animation MUST be lightweight (SVG/CSS primitives or a mock product
  UI shot) — no videos, no WebGL, no heavy image strips.
- `prefers-reduced-motion`: all animations MUST collapse to static/fade only.
- LCP on average hardware MUST be < 2.5s for the landing route (record target
  + measurement method in the plan); the route MUST NOT add significant bytes
  to the shared bundle (zero new runtime dependencies).
- `useInView`-driven reveals MAY be used but MUST NOT block first paint
  (below-the-fold only).

### Folder & Component Structure (Day 8.2)

```text
frontend/src/
├── App.jsx                     # + public Landing route (exact wiring in plan, L9)
├── pages/
│   └── Landing.jsx             # landing page — composes the section components
├── components/landing/         # (new; one file per section, mirrors ui/ conventions)
│   ├── LandingNav.jsx          # sticky navbar: brand + anchors + CTA
│   ├── Hero.jsx                # headline, subcopy, CTA buttons, animated visual
│   ├── Features.jsx            # features grid
│   ├── HowItWorks.jsx          # numbered steps
│   ├── StatsBand.jsx           # fitness statistics (dash-num figures)
│   ├── Benefits.jsx            # benefits section
│   ├── Testimonials.jsx        # illustrative testimonial cards (L7)
│   ├── FinalCta.jsx            # closing headline + CTA buttons
│   └── LandingFooter.jsx       # footer: brand, links, auth links
└── data/
    └── landingContent.js       # ALL copy/stats/nav links/CTA targets (L8)
```

Rules: components are `.jsx`, content/data are `.js` (V override). One logical
unit per file. `data/` is the ONLY place landing copy lives (L8). `services/`
is NOT used — the landing page MUST NOT fetch authenticated data (public page).

### UI/UX Rules

- Same dark shell and tokens as the Dashboard: `--color-bg` (#0B0F14),
  `--color-panel` / `dash-card`, orange accent, 4px spacing scale, existing type
  scale, `dash-num` for all figures (Day 1.1 D2/D3, Day 7.1 ST3).
- Primary CTAs use the app's accent-button treatment (accent surface + dark
  text, rounded, hover glow via `--color-accent-glow`); secondary CTAs are
  outline/ghost.
- Clear visual hierarchy: one obvious primary CTA per viewport; generous but
  4px-scaled spacing; section padding scales consistently (no excessive gaps).
- Sticky nav with backdrop blur (matching `TopNavbar`); the mobile menu is
  keyboard-accessible and closes on selection.
- Real `<button>`/`<a>` controls only; `aria-label` for icon-only controls;
  focus-visible rings in accent; reduced-motion respected (L6).
- Public page MUST be screen-reader friendly: semantic landmarks
  (`<header>`, `<nav>`, `<main>`, `<footer>`), ONE `<h1>` (hero), correct
  heading hierarchy, meaningful link text, alt text on any imagery, descriptive
  `<title>` and meta description.
- No horizontal scroll at any breakpoint (D8/A9); all sections correct at 3
  breakpoints (L5).

### Coding Standards

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (V override, as
  applied by every prior day).
- **Dependencies**: ZERO new npm dependencies (`framer-motion` is already
  bundled and reusable; everything else is CSS/Tailwind). No new env vars
  (D6/A7 budget unchanged). No backend, API, model, or route changes (L9).
- Naming, imports, comments, dead-code, and purity rules identical to the Day
  4.1/5.1/6.1/7.1/8.1 coding standards; the content module is data-only (no
  logic, no DOM, no timers).

### Definition of Done (Day 8.2 Success Criteria)

Day 8.2 is DONE only when ALL of the following hold, in addition to Day 1.1
through Day 8.1 still passing:

1. A public landing page renders WITHOUT login at the documented route(s); all
   existing routes (`/login`, `/register`, protected Dashboard, prior-day
   routes) remain unchanged (L9).
2. All nine required sections are present and coherent (navbar, hero with
   headline + CTA buttons + animated visual, features, how-it-works, fitness
   statistics, benefits, testimonials, final CTA, footer).
3. Every CTA routes to the correct auth flow — primary CTAs to the
   sign-up/register flow, Login links to `/login`; zero dead links (L9 CTA
   routing rules).
4. The page matches the design system exactly: dark theme, tokens, orange
   accent,
   4px scale, type scale, `dash-num` figures — unmistakably FitTrack (L3).
5. Fully responsive and mobile-first at 3 breakpoints; no horizontal scroll;
   the nav collapses to an accessible menu (L5).
6. Animations are lightweight (transform/opacity, framer-motion or CSS),
   GPU-friendly, and fully collapse under `prefers-reduced-motion` (L6).
7. Performance: landing route LCP < 2.5s (measured & recorded); zero new npm
   dependencies; no meaningful bundle bloat (L6).
8. All copy, stats, testimonial items, nav + CTA targets are sourced from the
   single `data/landingContent.js` module; content edits require zero component
   changes (L8).
9. Stats are honest/clearly-labelled; testimonials are visibly marked
   illustrative and render an on-page disclaimer (L7).
10. All new files are `.js`/`.jsx`; zero new env vars; no backend/API/model
    changes.
11. `npm run build` (vite build) succeeds cleanly.
12. Manual browser verification is recorded (all sections, all CTAs, anchor
    links, mobile menu, 3 breakpoints, reduced-motion, sign-up flow reachable
    from every primary CTA, prior-day regression check incl. `/login`,
    `/register`, Dashboard).
13. Accessibility + SEO pass: semantic landmarks, single `h1`, labelled links,
    alt text, descriptive title + meta description, focus-visible rings,
    contrast readable on dark.

### Out of Scope (Day 8.2 — Deferred)

Explicitly NOT part of Day 8.2; do not expand Day 8.2 work to include:

- Blog / content-marketing sections or pages.
- Pricing tables / pricing plans page.
- Live chat or chatbot widgets.
- Complex 3D / WebGL scenes and hero video backgrounds.
- Multi-language / i18n of the landing page.
- SEO tooling, SSR/prerendering, or marketing analytics/tracking.
- A CMS or admin UI to edit content — content stays in the single data module
  (L8).
- Password-less / OAuth "continue with" logins on the landing page itself.
- Lead-gen forms (email subscription) — sign-up is the only conversion action.
- Landing-page A/B testing / experiment frameworks.
- Any data fetching from authenticated endpoints (public page only).

These MUST NOT be silently added to Day 8.2; open a new spec if one is required.

---

## Day 8.3 - Premium UI/UX Upgrade (COMPLETE)

### Project Goal & Definition

Day 8.3 is a **cross-cutting visual and interaction upgrade** of the entire
FitTrack application, elevating the product to a premium, modern, polished
experience. It replaces the current lime-accent visual language with a **full
black + vibrant orange design system** and modernizes every surface — layout,
sidebar/navigation, cards, buttons, icons, typography, spacing, hover effects,
page/loading animations, skeleton loaders, toasts, and modals — while
**improving consistency, usability, and perceived quality on every page**:
Dashboard, Progress, Goals, Workout History, Analytics, Notifications,
Settings, Reports, the functional auth/nutrition/workout pages, AND the public
Landing Page (theme alignment only). It is an **additive/non-destructive**
phase to behaviour and routes: it REDEFINES the design system while changing
**no product functionality and no routes**.

It is **frontend-only, JavaScript-only (`.js`/`.jsx`, no TypeScript)**, reuses
the committed React + Vite + React Router + Tailwind stack with the
already-bundled **lucide-react** (icon system) and **framer-motion**
(animation), and adds **zero new runtime dependencies** (Day 4.1 A7 / Day 7.1
D6) and **zero new env vars**.

> **Governance note (v4.0.0 MAJOR):** This phase redefines the brand accent
> from lime (`--color-accent: #A3E635`) to **vibrant orange** (canonical
> target `--color-accent: #F97316`), SUPERSEDING every earlier "lime accent"
> reference in prior-day sections (see the v4.0.0 amendment note in the Day
> 1.1 Design System Decisions). All prior-day functionality, ownership,
> security, and coding rules remain binding and unchanged.

### Core Principles (PU1-PU6)

#### PU1. Premium Feel (NON-NEGOTIABLE)

Every screen MUST feel modern, intentional, and high-quality. Generic or
outdated UI patterns — flat grey boxes, default browser styling, stock-template
buttons, absent/weak hover states — MUST NOT remain anywhere in the app. Each
viewport MUST look deliberately crafted: refined surface separation, subtle
elevation, generous-but-4px-scaled spacing, crisp focus states, and purposeful
motion. Perceived quality is a first-class, enforceable acceptance criterion.

Rationale: "Premium" is the user's headline requirement; without a rule it is
unverifiable. PU1 makes taste a testable acceptance criterion and the visual
baseline for every task in the phase.

#### PU2. Complete Theme Consistency (NON-NEGOTIABLE)

The ENTIRE application MUST adopt the **full black + vibrant orange theme**.
**Zero leftover green/lime accents and zero mixed color systems are allowed.**
The brand accent is REDEFINED to vibrant orange (canonical target
`--color-accent: #F97316`, Tailwind orange-500; the plan MAY finalize the exact
hex within the vibrant-orange hue family). Every `--color-primary*` /
`--color-accent*` token and every raw lime literal (`#A3E635`, `#BEF264`,
`#84CC16`) MUST be replaced or tokenized; any component using a raw color
literal MUST be tokenized before the upgrade lands (no scattered hex codes
anywhere). Semantic status colors (success/warning/error) remain ONLY for
their semantic meaning (`on-track`, deficit/surplus, errors) — never as
decorative brand accents.

Rationale: "No leftover green accents" is an explicit user requirement; a
single, verifiable token system is the only way to guarantee it and prevent
regression.

#### PU3. Design System Discipline (NON-NEGOTIABLE)

Cards, buttons, inputs, icons, spacing, radius, shadows, and typography MUST
follow ONE unified system driven by tokens. Spacing MUST follow one consistent
scale (4px-based, as established Day 1.1); radius, shadow, border, and type
values MUST be standardized and defined once (CSS variables / Tailwind theme)
and referenced everywhere — never per-component hex, shadow, or font decisions.
Shared primitives (`Card`, `Button`, `Badge`, `Input`, `Modal`, `Skeleton`,
toast container) MUST be reused, never forked per page (D4). Any upgrade to a
shared primitive MUST propagate to every consumer page.

Rationale: Consistency across dozens of screens is impossible without a single
source of truth; discipline keeps the upgrade a cohesive system rather than a
patchwork of restyles.

#### PU4. Delight with Purpose (NON-NEGOTIABLE)

Animations, hover effects, transitions, and loaders MUST enhance the experience
— they MUST NOT distract, add latency, or confuse. Every motion MUST serve
orientation (what changed), feedback (what is interactive), or progress (what
is loading). Motion MUST be performant (transform + opacity only; CSS
transitions/keyframes or the already-bundled framer-motion), GPU-friendly,
collapsed under `prefers-reduced-motion`, and MUST NOT block first paint or
interaction. Micro-interactions (hover, active, focus, press) MUST be
consistent site-wide. No excessive motion (see Out of Scope).

Rationale: Performance and accessibility constrain "premium"; motion that
slow-downs or annoys reads as cheap, not premium.

#### PU5. Clarity & Hierarchy (NON-NEGOTIABLE)

Strong visual hierarchy, consistent spacing, and readable typography are
mandatory on every page: one clear visual priority per screen, an obvious
primary action per viewport, scannable section headings, legible body copy,
and consistent numeric display. The type scale is improved and tokenized
(display / heading / subheading / body / caption); text contrast MUST be
readable on the deep black background; information MUST be grouped
purposefully with tighter, consistent gaps — no large empty black areas, no
cramped crowds.

Rationale: Hierarchy is the difference between premium and cluttered, and it is
an accessibility requirement at the same time.

#### PU6. Responsive by Default (NON-NEGOTIABLE)

The upgraded UI MUST work excellently on mobile, tablet, and desktop. The
modernized navigation MUST collapse appropriately (icon rail on tablet, drawer
on mobile, per Day 1.1 D8), grids reflow, modals/overlays fit small viewports,
controls remain thumb-friendly, and the app MUST have **no horizontal scroll
at any breakpoint** (D8/A9).

Rationale: Responsiveness has been binding since Day 1.1 (D8); the upgrade must
not regress it while restyling every component.

### Required Capabilities (non-negotiable)

The Premium UI/UX Upgrade MUST deliver, and ship with, ALL of the following:

- Complete **black + orange** theme across the entire app (all pages, all
  surfaces, dashboard, auth flows, and the public Landing Page theme alignment)
- **Modern sidebar / navigation** (refined brand block, clean active states,
  preserved badge affordances, responsive rail/drawer)
- **Improved cards** (clear hierarchy, refined borders/shadows, consistent
  padding, hover lift where interactive)
- **Improved buttons** with full states — **default, hover, active, disabled**
  (accent-filled primary + outline/ghost secondary, consistent radius/height)
- **Consistent icon system** (lucide-react across all icon usage, one
  size/weight convention, `aria-label` on icon-only controls)
- **Hover effects** (consistent, token-based, transform/opacity only)
- **Smooth transitions** (standardized duration/easing, reduced-motion
  respected)
- **Page animations** (lightweight enter/reveal, transform/opacity only,
  framer-motion or CSS)
- **Loading animations / skeleton loaders** for major data-loading states
  (Skeleton upgrade; charts use shimmer)
- **Toast messages** in the new visual language (accent-bordered, consistent
  placement + timing, dismissible, `aria-live`)
- **Modal improvements** (refined overlay/panel, consistent padding, focus
  trap, scroll-lock, keyboard-accessible, styled per the new system)
- **Consistent spacing system** (one 4px-based scale, applied app-wide)
- **Better typography** (tokenized display/heading/body/caption scale, improved
  readability and hierarchy)
- **Fully responsive design** on mobile + tablet + desktop (no horizontal
  scroll)

### Theme & Design System Rules

- **Canonical palette (v4.0.0)**: page background deep black / near-black
  (`--color-bg` dark family, narrowed toward true black as the plan decides);
  panels/cards on a slightly raised surface with refined subtle borders and
  shadow; and a SINGLE vibrant orange accent family replacing every
  green/lime value:
  ```
  --color-accent: #F97316        (primary accent — vibrant orange)
  --color-accent-light/hover: (lighter orange, e.g. #FB923C)
  --color-accent-dark/pressed:  (darker orange, e.g. #EA580C)
  --color-accent-glow:          translucent orange (e.g. rgba(249, 115, 22, 0.25))
  ```
  The exact light/dark variant hexes are finalized in the plan; ALL MUST be in
  the vibrant-orange family and MUST derive from the accent token.
- **Tokens are the ONLY color source**: every component MUST use `--color-*`
  CSS variables / Tailwind theme values. A repo-wide scan MUST confirm zero raw
  green/lime literals remain (PU2). Success green stays ONLY as the semantic
  `--color-success` status color (e.g. on-track badges), never as a decorative
  accent.
- **Spacing**: one 4px-based scale (Tailwind `p-*`, `gap-*`, `space-*`); cards
  share one padding standard; section padding scales consistently (no excessive
  gaps, no cramped layouts).
- **Radius/shadows**: one radius scale and one shadow set (tokenized); cards use
  a consistent refined border + elevation; interactive elements get one
  consistent hover shadow/lift.
- **Typography**: one type scale (display / heading / subheading / body /
  caption) with defined weights and sizes; `dash-num`-style headline numbers
  kept for all stat figures; base text contrast readable on black (PU5).

### Navigation & Sidebar Rules

- The fixed left sidebar / top navbar shell is modernized but **not
  restructured functionally**: all existing entries, badges (e.g. unread
  notification count), and active-route states stay; styling, hover/active
  states, elevation, and the brand block are upgraded in place.
- Active nav state MUST be obvious — orange accent fill/indicator, never
  ambiguous. Brand block: FitTrack mark + name in the refined style.
- Responsive behaviour of the existing shell is preserved (icon rail on tablet,
  drawer on mobile, D8) — no new nav pattern that breaks prior-day behaviour.
- **No nav entry or route is removed, hidden, or repurposed** (ST7/R3/L9
  additivity holds); the upgrade only restyles existing surfaces.

### Component Upgrade Rules

- **Buttons**: one `Button` primitive with variants (primary accent-filled,
  secondary outline/ghost, danger, ghost) and full states (default, hover,
  active, disabled). Height, radius, padding, and focus ring standardized;
  icon buttons standardized with `aria-label`.
- **Cards**: `Card` / `dash-card` upgraded as THE single card surface —
  refined border (subtle `--color-line`), one consistent radius + shadow,
  consistent padding, optional hover lift ONLY when the card is interactive
  (with a clear interactive affordance such as a chevron or hover border).
- **Icons**: lucide-react (already bundled) is THE icon set; no other icon
  library, no emoji-as-icons. One stroke style/size convention; icon-only
  controls carry `aria-label`.
- **Inputs/selects/date**: upgraded orange focus ring, consistent heights and
  padding, dark-surface styling, readable on black.
- **Modals**: one `Modal` primitive — dimmed overlay, refined panel with
  standard radius/border/shadow and padding, `role="dialog"` +
  `aria-modal`, focus trap, Escape to close, body scroll-lock, animated via
  opacity/transform only, `prefers-reduced-motion` respected. Confirmation
  flows (delete account, clear all) reuse the upgraded modal consistently.
- **Toasts**: the existing toast/banner pattern (reused since Day 6.1/7.1) is
  restyled — orange accent border/icon, consistent placement and timing,
  dismissible, auto-dismiss with pause-on-hover, `aria-live="polite"`; status
  variants (success/info/error) use the semantic colors, never new hues.
- **Skeleton loaders**: the existing `Skeleton` primitive is upgraded
  (accent-neutral shimmer) and MUST be used for every major data-loading state
  across Dashboard, Nutrition, History, Analytics, Notifications, Settings,
  and Reports; charts use skeleton/shimmer placeholders.

### Animation & Interaction Rules

- Prefer CSS transforms/opacity; use bundled framer-motion only for
  page/reveal polish. No new animation library (A7).
- Standardized motion tokens (e.g. durations 150/200/300ms, ease-out) defined
  once; hover/focus/active micro-interactions consistent on all interactive
  elements.
- Page transitions: lightweight enter animations (fade + subtle translate),
  never layout-thrashing, never blocking above-the-fold content.
- `prefers-reduced-motion`: all animation MUST collapse to static/fade.
- Loading skeletons appear immediately (never blank regions) with smooth
  shimmer; loading MUST NOT push layout around (reserved space or stable
  placeholders).

### Folder & Component Structure (Day 8.3)

Frontend only; all under the existing `frontend/src/` workspace, additive and
non-destructive. The upgrade is delivered primarily through **token/CSS
redefinition in `index.css`** plus **upgraded shared primitives** in
`components/ui/`; only genuinely new primitives are added to `components/ui/`
(never mirrored copies of existing ones):

```text
frontend/src/
├── index.css                  # v4.0.0 token redefinition (orange accent family,
│                              #   spacing/radius/shadow/type scales) + parity for
│                              #   the existing [data-theme="light"] scheme
├── components/
│   └── ui/                    # upgraded shared primitives (single source, D4/PU3):
│       ├── Button.jsx         #   variants + full states (default/hover/active/disabled)
│       ├── Card.jsx           #   refined unified card surface
│       ├── Input.jsx          #   upgraded field primitive (select/textarea share styling)
│       ├── Modal.jsx          #   upgraded overlay/panel primitive (a11y + motion)
│       ├── ToastContainer.jsx #   restyled toast container (existing pattern)
│       ├── Skeleton.jsx       #   upgraded shimmer loader
│       └── Badge.jsx          #   tokenized badge/pill
├── (optional) tokens/         # MAY consolidate motion/radius/shadow/type tokens
└── (all prior feature folders)# consume the upgraded primitives/tokens; no route,
                               #   functionality, or data changes
```

Rules: components are `.jsx`, logic/data are `.js` (V override). One logical
unit per file. `components/ui/` is the ONLY place new/upgraded shared
primitives live; consumer pages import them (never fork local copies). No mock
data changes; no backend, API, model, env, or route changes.

### UI/UX Rules

- Reuse the upgraded `Card`/`dash-card`, `Button`, `Input`, `Modal`,
  `Skeleton`, and toast primitives on every page; NO page-specific style forks.
- Same deep-black shell and v4.0.0 orange tokens across every route —
  including auth flows (`/login`, `/register`) and the public Landing Page
  (theme alignment only; a Landing redesign itself stays out of scope).
- Accessibility is NOT regressed by restyling: focus-visible rings in the new
  orange accent everywhere, labelled controls (real `<label>` / `aria-label`),
  semantic landmarks preserved, contrast on black verified, keyboard nav
  intact, modals/toasts accessible per the component rules.
- No horizontal scroll at any breakpoint; layouts stay responsive per PU6 and
  prior-day D8/A9/L5.
- Numeric formatting conventions (weights with decimals, volume with thousands
  separators, kcal whole numbers, percentages whole) remain unchanged and
  consistent.

### Coding Standards

- **Language**: JavaScript only (`.js`/`.jsx`); no TypeScript (V override, as
  applied by every prior day).
- **Dependencies**: ZERO new npm dependencies (lucide-react and framer-motion
  are already bundled). No new env vars. No backend, API, model, or route
  changes.
- Naming, imports, comments, dead-code, and purity rules identical to prior-day
  standards.
- Design token changes MUST live in `index.css` (and any token module), never
  scattered per component; a token-usage audit is part of the phase deliverable.

### Definition of Done (Day 8.3 Success Criteria)

Day 8.3 is DONE only when ALL of the following hold, in addition to Day 1.1
through Day 8.2 still passing:

1. The ENTIRE app uses one consistent **black + orange** theme — a token scan
   confirms zero leftover green/lime accents (`#A3E635`, `#BEF264`, `#84CC16`
   and any other green accent values are gone); semantic status colors remain
   only for their semantic meaning (PU2).
2. Cards, buttons, navigation, typography, and spacing are clearly upgraded and
   token-consistent on every page; no page feels visually inconsistent (PU3).
3. The sidebar/navigation is modernized with obvious active states, an upgraded
   brand block, and responsive rail/drawer behaviour; no nav entry or route is
   removed (PU2/PU6/ST7).
4. Hover effects, transitions, page animations, and loaders are smooth and
   purposeful, GPU-friendly, transform/opacity-only, and fully collapse under
   `prefers-reduced-motion` (PU4).
5. Skeleton loaders are used for all major data-loading states; toasts and
   modals follow the new visual language with full a11y (focus trap,
   `aria-live`, labels, Escape/close).
6. Spacing follows one 4px-based scale and visual hierarchy is unified and
   readable on the deep-black background (PU3/PU5).
7. Fully responsive on mobile, tablet, and desktop with no horizontal scroll at
   any breakpoint (PU6/D8/A9).
8. The public Landing Page and all auth flows match the black + orange tokens
   (theme alignment only) — no mixed color systems anywhere.
9. All new files are `.js`/`.jsx`; zero new npm dependencies; zero new env
   vars; no backend/API/model/route/functionality changes.
10. `npm run build` (vite build) succeeds cleanly; no lint errors under the
    project's lint script.
11. Manual browser verification is recorded (every page + auth flows + landing,
    hover/active/disabled states, page transitions, reduced-motion, skeleton
    loaders, toasts, modals, responsive at 3 breakpoints, prior-day regression
    check).
12. A token/design-vars audit is part of the phase deliverable and passes: all
    colors flow through `--color-*` tokens, and the v4.0.0 orange family is the
    only accent.

### Out of Scope (Day 8.3 — Deferred)

Explicitly NOT part of Day 8.3; do not expand Day 8.3 work to include:

- Changing core product functionality, behaviour, or workflows.
- Adding completely NEW features, pages, or routes.
- Redesigning the public Landing Page from scratch (only black + orange theme
  alignment is in scope).
- Removing, hiding, or repurposing any existing nav entry or route.
- Heavy 3D, parallax, video, or excessive motion design.
- New npm dependencies, new env vars, or any backend/API/model changes.
- Introducing a THIRD theme scheme beyond the existing dark + optional light
  token system (Day 7.1); the upgrade restyles both schemes to the orange
  accent family only.
- Full visual/UI redesign of individual feature logic, new chart types, or new
  interaction flows.
- Automated visual-regression test suite or CI (manual verification suffices,
  as prior days).
- Deployment or production hosting.

These MUST NOT be silently added to Day 8.3; open a new spec if one is required.

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

> **Day 2.1 amendment:** The Progress & Goals phase is frontend-only with mock
> data and adds NO environment variables or new required config.

> **Day 3.1 amendment:** The Activities & Workout History phase is frontend-only
> with mock data and adds NO environment variables or new required config.

> **Day 4.1 amendment:** The Analytics Module phase is frontend-only with mock
> data and adds NO environment variables or new required config.

> **Day 5.1 amendment:** The Search & Filtering phase is frontend-only with
> local state and adds NO environment variables or new required config.

> **Day 6.1 amendment:** The Notifications & Reminders phase is frontend-only
> with in-app alerts and a single localStorage key; it adds NO environment
> variables or new required config.

> **Day 8.1 amendment:** The Reports & Export phase is an additive MERN phase
> reusing the existing `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, and cookie
> config. It adds NO environment variables or new required config.

> **Day 8.2 amendment:** The Landing Page phase is a public, frontend-only
> phase rendering from a single content data module (`data/landingContent.js`);
> it needs no auth and adds NO environment variables or new required config.

> **Day 8.3 amendment:** The Premium UI/UX Upgrade phase is a frontend-only,
> design-system phase redefining the existing `--color-*` tokens in
> `index.css`; it adds NO environment variables or new required config.

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

> **Day 2.1 amendment:** Day 2.1 adds `/progress` and `/goals` as standalone
> routes that render `Progress`/`Goals` pages inside the existing
> `DashboardLayout` (mirroring the Day 1.1 `/` wiring). No auth route (`/login`,
> `/register`) is touched; auth-protected routes (`/profile`, `/workouts*`,
> `/nutrition`) stay unchanged. The plan MUST state the exact `App.jsx` wiring.

> **Day 3.1 amendment:** Day 3.1 adds `/workouts-history`, `/workouts/:id`
> (detail), and `/exercises` as standalone routes that render inside the existing
> `DashboardLayout`, mirroring the Day 2.1 `/progress` wiring. These do NOT
> collide with or replace the existing auth-phase `/workouts`, `/workouts/new`,
> or `/workouts/:id/edit` routes. The plan MUST state the exact `App.jsx`
> wiring and confirm no route removals (H10).

> **Day 4.1 amendment:** Day 4.1 adds `/analytics` as a standalone route that
> renders inside the existing `DashboardLayout`, mirroring the Day 2.1/3.1
> pattern. This does NOT collide with or replace any existing routes. The plan
> MUST state the exact `App.jsx` wiring and confirm no route removals (A10).

> **Day 5.1 amendment:** Day 5.1 adds NO new routes. Search and filtering
> capabilities are embedded within existing pages (Dashboard, Nutrition,
> Activities, Analytics) as local UI controls. Filter state is managed locally
> per page. No route changes or `App.jsx` wiring required.

> **Day 6.1 amendment:** Day 6.1 adds `/notifications` as a standalone route
> that renders inside the existing `DashboardLayout`, mirroring the Day 4.1
> `/analytics` pattern, PLUS a `Notifications` nav entry (N10). This does NOT
> collide with or replace any existing routes. The plan MUST state the exact
> `App.jsx` wiring and confirm no route removals (N10).

> **Day 7.1 amendment:** Day 7.1 adds `/settings` as a standalone route that
> renders inside the existing `DashboardLayout`, mirroring the Day 6.1
> `/notifications` pattern, PLUS a `Settings` nav entry (ST7). This does NOT
> collide with or replace `/profile`, `/notifications`, or any existing route.
> The plan MUST state the exact `App.jsx` wiring and confirm no route removals
> (ST7).

> **Day 8.1 amendment:** Day 8.1 adds `/reports` as a standalone route that
> renders inside the existing `DashboardLayout`, mirroring the Day 7.1
> `/settings` pattern, PLUS a `Reports` nav entry (R3). This does NOT collide
> with or replace any existing route. The plan MUST state the exact `App.jsx`
> wiring and confirm no route removals (R3).

> **Day 8.2 amendment:** Day 8.2 adds a PUBLIC landing page as a new
> non-auth route (e.g. `/landing`, or a public splash that coexists with the
> protected Dashboard at `/`). Because `/` is the protected Dashboard and
> `/login`/`/register` are the public auth routes, the plan MUST state the exact
> `App.jsx` wiring — including how authenticated users are handled at the
> landing route — and confirm no existing route is removed, hidden, or
> repurposed (L9).

> **Day 8.3 amendment:** The Premium UI/UX Upgrade adds NO new routes and
> changes NO route wiring. It restyles the existing shell and every existing
> surface in place (including `/login`, `/register`, the protected Dashboard,
> and all prior-day routes). Any nav change is visual only — no entry or route
> is removed, hidden, or repurposed (PU2, Day 8.3 navigation rules).

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
  calendar heat-maps. (Day 4.1 now implements the Analytics Module; remaining
  items like calendar heat-maps and advanced forecasting remain deferred.)
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

---

## Day 9 — Final Testing & Requirements Check (ACTIVE)

### Project Goal & Definition

Day 9 is a **comprehensive QA and verification phase** that validates every
feature built across all prior days (Day 1 through Day 8.3) against the original
requirements. It is NOT a new feature build — it is a structured, evidence-based
audit that identifies gaps, confirms correctness, and fixes any bugs found
before the project is marked complete.

The phase covers: manual end-to-end testing of every feature, one-by-one
verification of every original requirement from every spec, cross-device
responsive testing, bug identification and fixes, and a final sign-off gate
backed by recorded evidence.

### Core Principles (Day 9)

#### T1. Requirements Traceability (NON-NEGOTIABLE)

Every requirement from every spec (`specs/001-*` through `specs/013-*`) MUST be
individually verified and checked off with a pass/fail result and evidence (screenshot,
console output, or description of manual test). No requirement may be marked as
"assumed pass" or skipped. If a requirement cannot be verified, it MUST be marked
as BLOCKED with a reason.

Rationale: The project has 13 spec files with hundreds of requirements accumulated
over many days. Without explicit traceability, gaps silently accumulate. This
principle ensures nothing is lost.

#### T2. End-to-End Coverage (NON-NEGOTIABLE)

Every user-facing flow MUST be tested end-to-end from the browser: signup → login
→ navigate → use feature → see correct result → logout. Backend unit tests or
build-passing alone are NOT sufficient — the test is whether a real user can
complete the flow in a real browser against a live server.

Rationale: Build passing means the code compiles. It does not mean the feature
works for a user. End-to-end testing is the only test that matches how users
actually experience the app.

#### T3. No Silent Failures (NON-NEGOTIABLE)

Every error path, empty state, loading state, and edge case MUST be explicitly
tested and confirmed to behave correctly: friendly error messages (never stack
traces), proper empty states, spinners/skeletons during loading, and graceful
handling of invalid input. Console errors, warnings, or uncaught exceptions
during testing MUST be logged and fixed.

Rationale: Silent failures erode user trust incrementally. A feature that
"usually works" but breaks under specific conditions is worse than a feature
that does not exist, because users cannot predict when it will fail.

#### T4. Cross-Device Quality

Every page and component MUST be verified at three responsive breakpoints:
desktop (≥1280px), tablet (~768px), and mobile (~375px). No horizontal scroll,
no overlapping elements, no unreadable text, and no inaccessible interactive
elements at any breakpoint.

Rationale: Responsive breakage is the most common quality issue in CSS-heavy
frontends. Explicit cross-device verification catches layout regressions that
single-viewport testing misses.

#### T5. Fix Before Finish

No feature or page may be signed off as "done" if it has known unfixed bugs
that affect usability. All bugs found during Day 9 MUST be fixed before the
final sign-off. Cosmetic issues that do not affect usability (e.g. minor
spacing differences) MAY be logged as known-issues for future polish but MUST
not block sign-off if they were present before Day 9.

Rationale: Signing off with known bugs creates technical debt that compounds.
Fixing now is cheaper than fixing after launch. Cosmetic issues from prior
phases are grandfathered — only bugs introduced or revealed during Day 9
testing block sign-off.

#### T6. Evidence-Based Sign-off

The final sign-off MUST be backed by a written record of every test performed,
its result (pass/fail/blocked), and the evidence captured. Verbal "it looks
good" is insufficient. Every pass must have a description of what was verified;
every fail must have a bug report with reproduction steps.

Rationale: Evidence creates accountability and enables future testers to
reproduce results. Without evidence, sign-off is opinion, not verification.

### Required Testing Areas (Non-Negotiable)

The following testing areas MUST all be covered during Day 9. This list is
mandatory and cannot be reduced. Each area must have at least one documented
test scenario with a recorded result.

1. **CRUD Operations** — Workout create, read, update, delete; Nutrition create,
   read, update, delete; Profile view and edit. Verify data persists after
   page refresh and across sessions.

2. **Authentication Flow** — Signup (new user), login (existing user), logout,
   session persistence (close and reopen browser → still logged in), protected
   route access (attempt access while logged out → redirected to login).

3. **Dashboard Calculations & Metrics** — Verify all dashboard summary numbers
   (workout count, calorie totals, macro totals, streak, weight) are calculated
   correctly from the underlying data. Verify numbers update after adding or
   editing entries.

4. **Charts & Analytics** — Verify all analytics charts render with correct data,
   interactive hover works, date range filtering works, and period comparison
   shows accurate results.

5. **Search & Filtering** — Verify search across workouts, nutrition, and
   exercises returns correct results. Verify category and date filters compose
   correctly. Verify empty-filter-results state shows properly.

6. **Notifications & Reminders** — Verify notification list loads, mark-as-read
   works, settings toggle persists, and reminder scheduling fires correctly
   (or is gracefully disabled when not configured).

7. **Settings** — Verify preferences (units: kg/lb, theme: dark/light) persist
   and apply immediately across all pages. Verify password change flow works.
   Verify account deletion flow works (confirmation prompt → delete → redirect).
   Verify notification settings persist.

8. **Reports & Export** — Verify each report tab (Workouts, Nutrition, Fitness
   Overview) renders correct data. Verify CSV export downloads correct data.
   Verify PDF export generates a valid, readable document. Verify date range
   presets and URL-param persistence work.

9. **Mobile & Tablet Responsiveness** — Test all major pages at 375px and 768px
   widths. Verify no horizontal scroll, all interactive elements are
   touch-tappable, text is readable, and layout stacks correctly.

### Out of Scope (Day 9)

Day 9 is a testing and fixing phase ONLY. It MUST NOT include:

- New features, new pages, new components, or new API endpoints.
- Major visual redesigns or layout overhauls beyond fixing broken layouts.
- Performance/load testing, accessibility audits (WCAG), or security audits
  beyond confirming existing auth flows work.
- Automated test suite creation (unit tests, integration tests, e2e tests).
- Infrastructure changes, deployment, or production hosting setup.
- Backend architecture changes, database migrations, or model restructuring.

These MUST NOT be silently added to Day 9; open a new spec if one is required.

### Process Rules (Day 9)

1. **One feature at a time**: Test one feature area completely before moving to
   the next. Do not partially test multiple areas and return later.
2. **Record as you go**: Every test result MUST be recorded immediately after
   performing the test — not from memory at the end of the day.
3. **Fix, then re-test**: When a bug is found, fix it immediately, then re-run
   the same test to confirm the fix. Do not batch all fixes at the end.
4. **Regression after fix**: After fixing any bug, re-test the feature area
   surrounding the fix to confirm no regression was introduced.
5. **No sign-off under uncertainty**: If a test result is "I'm not sure if this
   is correct", it is a FAIL until confirmed otherwise. Ambiguity is not a pass.

### Definition of Done (Day 9 Success Criteria)

Day 9 is DONE only when ALL of the following hold:

1. Every testing area (CRUD, auth, dashboard, charts, search, notifications,
   settings, reports, responsive) has at least one documented test with a
   recorded PASS result.
2. Every requirement from every spec has been individually verified and checked
   off as PASS or BLOCKED (with reason).
3. All bugs found during Day 9 have been fixed and re-tested to confirm the fix.
4. No console errors, uncaught exceptions, or stack traces appear during any
   tested flow.
5. A written test report exists recording every test performed, its result, and
   evidence.
6. `npm run build` (vite build) succeeds cleanly after all fixes.
7. Both frontend and backend (`node --check`) pass syntax validation after all
   fixes.

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
  (TypeScript → JavaScript-only for the Dashboard) → **3.0.0** (MAJOR). Day 2.1
  added the Progress & Goals frontend phase (extends the JS-only override,
  adds P1-P9 + domain sections) → **3.1.0** (MINOR). Day 3.1 added the
  Activities & Workout History frontend phase (extends the JS-only override,
  adds H1-H10 + domain sections) → **3.2.0** (MINOR). Day 4.1 added the
  Analytics Module frontend phase (extends the JS-only override, adds A1-A10
  + domain sections) → **3.3.0** (MINOR). Day 5.1 added the Search & Filtering
  frontend phase (extends the JS-only override, adds S1-S10 + domain sections)
  → **3.4.0** (MINOR). Day 6.1 added the Notifications & Reminders frontend
  phase (extends the JS-only override, adds N1-N10 + domain sections) →
  **3.5.0** (MINOR). Day 6.1 amendment moved persistence to MongoDB + added
  auth-scoped `/api/notifications` routes and server-side reminders (approved
  decision) → **3.5.1** (PATCH clarification + approved migration of N9). Day
  7.1 added the Settings system phase (adds ST1-ST8 + Required Capabilities +
  domain sections covering preferences, theme, password change, logout, and the
  confirmation-gated Danger Zone delete-account flow) → **3.6.0** (MINOR).
  Day 8.1 added the Reports & Export phase (adds R1-R6 + Required Capabilities +
  domain sections covering date-range selection, server-side pre-aggregation,
  CSV + PDF export, and empty/sparse handling) → **3.7.0** (MINOR).
  Day 8.1 spec amendment expanded the Reports & Export phase (adds the Fitness
  Report Overview page, fixed date-range presets + URL-param persistence across
  tabs, performance targets, PDF static-chart + app-name/timestamp header rules,
  skeleton/error-retry states, and explicit "not tracked" dispositions for
  duration/muscle-group/photo/macro-goal/weight-history data the model does not
  persist) → **3.8.0** (MINOR).
  Day 8.1 constitution amendment added R7 (Accessibility & Internationalization),
  R8 (Testing & Reliability), and R9 (Evolution & Governance) non-negotiable
  principles for the Reports & Export module → **3.9.0** (MINOR).
  Day 8.2 added the Public Landing Page phase (adds L1-L9 + Required
  Capabilities + domain sections covering the nine required page sections, CTA
  routing into the auth flow, single-sourced content maintainability, and
  performance/lightweight-animation rules) → **3.10.0** (MINOR).
  Day 8.3 added the Premium UI/UX Upgrade phase and REDEFINED the brand accent
  from lime (`--color-accent: #A3E635`) to vibrant orange (canonical target
  `--color-accent: #F97316`), SUPERSEDING every earlier lime accent reference
  across all prior-day sections, and adds PU1-PU6 + Required Capabilities +
  domain sections covering the black + orange theme, navigation/sidebar and
  component upgrade rules, animation/interaction rules, skeleton/toast/modal
  modernization, and spacing/typography standardization →
  **4.0.0** (MAJOR, backward-incompatible design-identity change; all Core
  Principles I-VIII and prior-day functionality rules remain binding).
  Day 9 added the Final Testing & Requirements Check phase (adds T1-T6 +
  Required Testing Areas + domain sections covering requirements traceability,
  end-to-end coverage, no silent failures, cross-device quality, fix-before-
  finish, and evidence-based sign-off) → **4.1.0** (MINOR).
- **Compliance review**: All plans, specs, and task lists MUST pass the
  "Constitution Check" gate before implementation. Pull requests/reviews MUST
  confirm no violation of the security, ownership, and coding standards. Any
  deliberate complexity beyond this constitution MUST be recorded in the plan's
  Complexity Tracking with justification.
- **Runtime guidance**: Use `.specify/memory/constitution.md` as the source of
  truth; append amendments here and propagate changes to dependent templates.
- **Day ownership**: This document governs the whole project. Day 1 scope is
  complete; Day 2 (profile + workouts) is complete; Day 3 (nutrition tracking)
  is complete; Day 1.1 (dark dashboard) is complete; Day 2.1 (Progress & Goals)
  is complete; Day 3.1 (Activities & Workout History) is complete; Day 4.1
  (Analytics Module) is complete; Day 5.1 (Search & Filtering) is complete;
  Day 6.1 (Notifications & Reminders) is complete; Day 7.1 (Settings) is
  complete; Day 8.1 (Reports & Export) is
  complete; Day 8.2 (Public Landing Page) is complete;
  Day 8.3 (Premium UI/UX Upgrade) is
  complete; Day 9 (Final Testing & Requirements
  Check) is the current governed day. Later days
  append here via amendment, never by rewriting prior
  rules without a MAJOR bump and migration note.

**Version**: 4.1.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-09-10
