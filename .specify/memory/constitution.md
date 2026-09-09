<!--
  ============================================================================
  SYNC IMPACT REPORT (Day 7.1 Settings amendment)
  ============================================================================
  Version change      : (minor) 3.5.1  ->  3.6.0  (Day 7.1: Settings system)
  Modified principles : No Core Principle (I-VIII) removed or redefined. The
                        Day 1.1 frontend JavaScript-only override (Principle V
                        amendment + D1) is EXTENDED to the Day 7.1 Settings
                        phase by ST-stated coding standards. Day 6.1 heading
                        marker changed from (CURRENT ACTIVE PHASE) to (COMPLETE)
                        — its phase shipped under Amendment 2026-09-09
                        (3.5.1). The Day 6.1 notification settings remain the
                        single source of truth for notification preferences
                        (ST8 reuses I, no second storage key).
  Added sections      : Day 7.1 Settings - Project Goal & Definition
                        Day 7.1 - Core Principles (ST1-ST8)
                        Day 7.1 - Required Capabilities (non-negotiable)
                        Day 7.1 - Account & Profile Rules
                        Day 7.1 - Units Rule
                        Day 7.1 - Theme Rule
                        Day 7.1 - Notification Preference Rules
                        Day 7.1 - Password Change Rules
                        Day 7.1 - Logout Rules
                        Day 7.1 - Delete Account Rules (Danger Zone)
                        Day 7.1 - Backend Surface & Persistence
                        Day 7.1 - Folder & Component Structure
                        Day 7.1 - UI/UX Rules
                        Day 7.1 - Coding Standards
                        Day 7.1 - Definition of Done (Success Criteria)
                        Day 7.1 - Out of Scope (Deferred)
                        Route amendment note (Day 7.1) in Routes section
  Removed sections    : (none). All prior-day sections retained as governed
                        history.
  Templates           : ✅ plan-template.md   - Constitution Check gate stays
                                                   generic; the Day 7.1 phase
                                                   adds no new gate type
                        ✅ spec-template.md   - user-story grouping + acceptance
                                                   scenarios align with the
                                                   Day 7.1 DoD; reused as-is
                        ✅ tasks-template.md  - [P] parallel labelling and
                                                   [US#] user-story grouping
                                                   remain valid
                        ⚠ commands/           - NO commands/*.md directory exists
                                                   in this repo (PowerShell
                                                   setup); plan-template.md
                                                   references it as a note only
                                                   - non-blocking, left as-is
                        ⚠ AGENTS.md           - generated from feature plans;
                                                   refresh via
                                                   update-agent-context.ps1
                                                   when THE Day 7.1 plan lands
  Deferred TODOs      : (none). Ratification date (2026-08-27) and amendment
                        date (2026-09-09) confirmed from footer + prior PHRs.
  NOTE                : Day 7.1 defines the Settings system as an ADDITIVE
                        phase on the shipped MERN app: a new /settings route
                        inside DashboardLayout, owner-scoped preference
                        persistence (units kg/lb, theme), logout reusing the
                        existing auth path, secure change-password and
                        delete-account flows (both auth-scoped, confirmation-
                        gated), and notification preferences that REUSE the
                        Day 6.1 notification settings (Amendment 2026-09-09).
                        Delete Account is the first destructive data action;
                        it MUST be confirmation-gated and cascade-delete only
                        the acting user's owned data (Principle VII). Theme is
                        limited to dark (default) + at most one light scheme
                        via the existing token system. Out of scope: 2FA,
                        social accounts, advanced privacy, data export,
                        extra themes. JS-only, no new runtime deps, no new env
                        vars.
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
existing visual language (deep charcoal background, `dash-card` surfaces, lime
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
   theme: `on-track` = success green, `completed` = accent (lime),
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
  lime accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1.
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
existing visual language (deep charcoal background, `dash-card` surfaces, lime
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
  lime accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1/2.1.
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
`dash-card` surfaces, lime accent, consistent type scale):

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
  lime accent (`var(--color-accent)`), and 4px spacing scale as Day 1.1/2.1/3.1.
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
`dash-card` surfaces, lime accent (`var(--color-accent)`), 4px spacing scale,
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

- Same dark theme: `--color-accent` lime, `dash-card`, 4px scale, existing type
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

## Day 7.1 — Settings (CURRENT ACTIVE PHASE)

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
spacing scale, type scale, and lime accent (Day 1.1 D2/D3). Content MUST keep
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
- **Compliance review**: All plans, specs, and task lists MUST pass the
  "Constitution Check" gate before implementation. Pull requests/reviews MUST
  confirm no violation of the security, ownership, and coding standards. Any
  deliberate complexity beyond this constitution MUST be recorded in the plan's
  Complexity Tracking with justification.
- **Runtime guidance**: Use `.specify/memory/constitution.md` as the source of
  truth; append amendments here and propagate changes to dependent templates.
- **Day ownership**: This document governs the whole project. Day 1 scope is
  complete; Day 2 (profile + workouts) is complete; Day 3 (nutrition tracking)
  is   complete; Day 1.1 (dark dashboard) is complete; Day 2.1 (Progress & Goals)
  is complete; Day 3.1 (Activities & Workout History) is complete; Day 4.1
  (Analytics Module) is complete; Day 5.1 (Search & Filtering) is complete;
  Day 6.1 (Notifications & Reminders) is complete; Day 7.1 (Settings) is the
  current governed day. Later days
  append here via amendment, never by rewriting prior
  rules without a MAJOR bump and migration note.

**Version**: 3.6.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-09-09
