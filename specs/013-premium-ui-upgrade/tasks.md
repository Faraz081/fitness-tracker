---

description: "Task list for Premium UI/UX Upgrade (black + orange design system)"
---

# Tasks: Premium UI/UX Upgrade

**Input**: Design documents from `specs/013-premium-ui-upgrade/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT requested — this feature is a visual restyle; QA is **manual browser verification** recorded in `quickstart.md` (per constitution Day 8.3 DoD-11). No TDD/unit-test tasks are generated.

**Organization**: Phases follow the user's recommended execution order (1 Foundation → 2 Components → 3 Navigation → 4 Motion/Feedback → 5 Pages → 6 Spacing/Type/Responsive → 7 QA). Each task carries the **[USn]** label of the spec user story it serves so every story stays traceable and independently verifiable (see User Story Delivery Map below).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Path Conventions

- Web app → `frontend/src/` (only touched workspace; `backend/`, `data/`, `services/`, `context/`, `utils/` are out of scope and MUST NOT be edited)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pre-upgrade baseline + repeatable audit tooling so later checks are executable and comparable.

- [x] T001 [P] Run pre-upgrade baseline: `npm run build` (vite) MUST succeed and record current console warnings; capture grep audit output (lime/green literals `#A3E635|#BEF264|#84CC16|lime` and arbitrary hex `[#hex]`) into `specs/013-premium-ui-upgrade/quickstart.md` appendix as the "before" baseline
- [x] T002 [P] Record the full route/page inventory (17 pages in `frontend/src/pages/` incl. Login/Register/Landing + `components/layout/` files) in the quickstart walk-through table so every surface is checked in QA
- [x] T003 [P] Make the audit repeatable: confirm the exact grep/rg patterns in `quickstart.md` step 2 (green/lime literals, raw `[#hex]`, semantic `--color-success` usage) run cleanly from repo root

---

## Phase 2: Foundational (Blocking Prerequisites) — Design System Foundation

**Purpose**: The v4.0.0 token redefinition in `frontend/src/index.css`. Because every component already reads tokens, this phase applies the black + orange theme app-wide by itself; the exact orange family, alias, semantic, light-parity, and motion tokens must land here before ANY story phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete and `npm run build` still passes.

- [x] T004 Redefine accent family in `frontend/src/index.css` `@theme`: `--color-accent: #F97316`, `--color-accent-light: #FB923C`, `--color-accent-dark: #EA580C`, `--color-accent-glow: rgba(249,115,22,0.25)`
- [x] T005 [P] Alias the primary family in `frontend/src/index.css`: `--color-primary: #F97316`, `--color-primary-light: #FB923C`, `--color-primary-dark: #EA580C`, `--color-primary-50/100/200` → orange rgba, `--color-primary-glow: rgba(249,115,22,0.4)` (single accent family, no dual accent)
- [x] T006 [P] Add semantic token `--color-trend-negative: #F87171` in `frontend/src/index.css` (absorbs the raw `text-[#F87171]` literal in `components/analytics/TrendIndicator.jsx`)
- [x] T007 [P] Add motion tokens in `frontend/src/index.css`: `--duration-fast: 150ms`, `--duration-base: 200ms`, `--duration-slow: 300ms`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- [x] T008 [P] Add `--shadow-lift` (interactive hover elevation, subtle orange-tinted glow) in `frontend/src/index.css`
- [x] T009 [P] Tokenize the type scale in `frontend/src/index.css` (display / heading / subheading / body / caption utilities over Barlow + Barlow Condensed)
- [x] T010 [P] Remap the `[data-theme="light"]` overrides in `frontend/src/index.css` (approx. lines 84-130 and 442) to the orange family (base `#EA580C`, hover `#C2410C`) — keep exactly two schemes (Day 7.1), no third theme
- [x] T011 Verify `frontend/src/index.css` internal consistency: grep for old lime values (`#A3E635`, `#BEF264`, `#84CC16`, `163, 230, 53`, `190, 242, 100`, `132, 204, 22`) returns ZERO; `npm run build` passes

**Checkpoint**: Foundation ready — the whole app renders in the black + orange theme (MVP level achieved); story phases can begin.

---

## Phase 3: Core Component Upgrade (User Story 3 - P2)

**Goal**: One upgraded set of shared primitives in `frontend/src/components/ui/` — buttons with full states, unified cards, upgraded inputs/selects, consistent icons — so every page inherits the premium language (PU3/D4).

**Independent Test**: Open any page and inspect a button (all 5 states), two same-type cards on different modules, an input's focus ring, and icon sizing — all clearly upgraded and identical in style.

- [x] T012 [US3] Upgrade `frontend/src/components/ui/Button.jsx`: variants (primary accent-filled, outline, ghost, danger) + full states (default, hover, active, focus-visible, disabled), one consistent height/radius/padding, icon-only buttons carry `aria-label`
- [x] T013 [P] [US3] Upgrade `frontend/src/components/ui/Card.jsx`: unified surface (panel color, `--color-line` border, `--radius-lg`, standard padding) with an explicit interactive hover-lift flag using `--shadow-lift` (lift ONLY when interactive)
- [x] T014 [P] [US3] Upgrade `frontend/src/components/ui/Input.jsx` and `frontend/src/components/ui/Select.jsx`: dark-surface fields, orange focus ring, consistent heights/padding, readable-on-black text, error styling via `--color-error`
- [x] T015 [P] [US3] Icon audit: single lucide-react size/stroke convention + `aria-label` on every icon-only control across `frontend/src/components/**` and pages
- [x] T016 [US3] Sweep `frontend/src/pages/` and feature components: replace any local/forked button/card/input styling with the upgraded primitives (no page-specific style forks)

**Checkpoint**: Core components are clearly upgraded and token-consistent app-wide.

---

## Phase 4: Navigation Upgrade (User Story 2 - P1)

**Goal**: Modern, polished sidebar/nav in place — obvious orange active state, crisp hover/focus, refined brand block — with NO entry or route changed (ST7/R3/L9) and responsive rail/drawer behaviour preserved (D8/PU6).

**Independent Test**: Click through every nav item; hover shows a clear state, the current section shows the orange active treatment, badges (unread count) intact, mobile drawer still reachable — same destinations as before.

- [ ] T017 [P] [US2] Restyle brand block + active-state indicator (orange accent fill/highlight, never ambiguous) in `frontend/src/components/layout/Sidebar.jsx`
- [ ] T018 [P] [US2] Add hover + focus-visible states and refined item styling (icon/pill/chevron) in `frontend/src/components/layout/Sidebar.jsx`
- [ ] T019 [P] [US2] Restyle `frontend/src/components/layout/TopNavbar.jsx` to the black + orange tokens
- [ ] T020 [US2] Restyle `frontend/src/components/layout/DashboardLayout.jsx` shell (surface/borders/active accents) preserving the responsive icon-rail (tablet) / drawer (mobile) behaviour; no nav entry or route removed
- [ ] T021 [US2] Verify navigation: active/hover/focus states, unread-badge intact, mobile drawer reachable at 360px — record in `quickstart.md`

**Checkpoint**: Navigation feels premium, consistent, and unchanged in structure.

---

## Phase 5: Motion & Feedback (User Stories 4 + 5 - P2)

**Goal**: Purposeful motion (hover, transitions, page enters, loading, skeletons — transform/opacity only, reduced-motion-safe, PU4) and polished feedback surfaces (toasts + modals, DoD-5).

**Independent Test**: Open a data-loading screen (Dashboard/Analytics) → skeletons appear immediately, no blank region, no layout shift; trigger a toast and a modal → consistent styling, `aria-live`, focus trap, Escape close, animation collapses under reduced-motion.

- [x] T022 [P] [US4] Align `frontend/src/components/ui/PageTransition.jsx` to the motion tokens: fade + subtle translate, collapses to static under `prefers-reduced-motion`
- [x] T023 [P] [US4] Converge transition/hover values across `frontend/src/index.css` utilities and components onto the motion tokens (replaces scattered `.2s ease` values; hover/active/press consistent site-wide)
- [x] T024 [US4] Upgrade `frontend/src/components/ui/Skeleton.jsx`: accent-neutral shimmer via existing `skeleton-shimmer` keyframe, reserved space / stable placeholders (no layout shift)
- [x] T025 [US4] Apply `Skeleton` to every major data-loading view: Dashboard, WorkoutList, Nutrition, WorkoutHistory, Analytics + Reports (chart shimmer placeholders), Notifications, Settings
- [ ] T026 [P] [US5] Upgrade `frontend/src/components/ui/Modal.jsx`: dimmed overlay + refined panel (radius/border/shadow/padding), `role="dialog"` + `aria-modal`, focus trap, Escape-to-close, body scroll-lock, opacity/transform animation respecting reduced-motion
- [ ] T027 [P] [US5] Upgrade `frontend/src/components/ui/Toast.jsx` + `frontend/src/hooks/useToast.js`: accent-bordered/topped toast, consistent placement/timing, `aria-live="polite"`, dismissible, auto-dismiss with pause-on-hover, semantic variants via `--color-success`/`--color-error`/`--color-warning` only
- [ ] T028 [US5] Verify confirmation flows (delete account in Settings, clear-all flows) reuse the upgraded `Modal` + `Toast` consistently

**Checkpoint**: Motion is smooth and purposeful; toasts and modals are polished and accessible.

---

## Phase 6: Apply Across Pages (User Story 1 - P1)

**Goal**: Whole-app cohesion — every surface in scope uses the black + orange theme with ZERO leftover green accents, no page visually inconsistent (PU2/PU1). This is the cumulative application pass; primitives from Phases 3-5 already carry most of the theme.

**Independent Test**: Walk the full navigation tree (all 17 pages + auth + Landing): every screen deep-black base + vibrant orange accent, no green; identical element types look identical everywhere; ditch the green-accent audit (0 hits outside semantic status).

- [x] T029 [P] [US1] Apply theme to Dashboard + Workout surfaces (`frontend/src/pages/Dashboard.jsx`, `WorkoutList.jsx`, `WorkoutForm.jsx`, `WorkoutDetail.jsx`, `WorkoutHistory.jsx`, `ExerciseHistory.jsx` + their `components/`): stat numbers, empty states, badges, charts
- [x] T030 [P] [US1] Apply theme to `frontend/src/pages/Nutrition.jsx`, `Goals.jsx`, `Progress.jsx` (+ `components/progress/`, `components/dashboard/` shared bits)
- [x] T031 [P] [US1] Apply theme to `frontend/src/pages/Analytics.jsx` + `Reports.jsx` (+ `components/analytics/`, `components/reports/`): charts, export buttons, shimmer skeletons; replace the raw literal `text-[#F87171]` in `components/analytics/TrendIndicator.jsx` with `--color-trend-negative`
- [x] T032 [P] [US1] Apply theme to `frontend/src/pages/Notifications.jsx`, `Profile.jsx`, `Settings.jsx` (+ `components/notifications/`, `components/profile/`, `components/settings/`, `components/search/`)
- [x] T033 [P] [US1] Align auth flows `frontend/src/pages/Login.jsx` + `Register.jsx` and Landing theme alignment in `frontend/src/components/landing/` (tokens only — NO Landing redesign)
- [x] T034 [US1] Green-literal elimination sweep (repo root): `#A3E635|#BEF264|#84CC16|lime` and arbitrary `[#hex]` return ZERO across `frontend/src` (semantic `--color-success` usage is the only permitted green)
- [x] T035 [US1] Cohesion pass: walk every page + auth + Landing; fix any surface still off-theme, inconsistent, or "old-looking"; no page visually inconsistent

**Checkpoint**: The ENTIRE app reads as one cohesive premium black + orange product.

---

## Phase 7: Spacing, Typography & Responsiveness (User Stories 6 + 7 - P3)

**Goal**: One 4px spacing scale, a tokenized type hierarchy, and excellent behavior at 360/768/1440px with zero horizontal scroll (PU3/PU5/PU6, D8, A9).

**Independent Test**: Compare spacing between cards/sections on a dense page (Analytics) vs a simple page (Settings) — same rhythm; headings/body/numbers hierarchy clear; resize the app through 360/768/1440 — nav reachable, grids reflow, no horizontal scroll.

- [ ] T036 [P] [US6] Standardize spacing application on the 4px scale: card padding standard + section rhythm (32/48/64) across `frontend/src/pages/**` and `components/**`
- [ ] T037 [P] [US6] Apply the tokenized type hierarchy (display/heading/subheading/body/caption) across pages/headings; keep `dash-num` stat figures + numeric formatting rules unchanged
- [ ] T038 [US6] Fix one-off spacing/type inconsistencies surfaced by T036/T037 (no arbitrary values remain)
- [ ] T039 [P] [US7] Refine mobile (360px): sidebar drawer + grid/forms behavior, controls thumb-friendly, no horizontal scroll
- [ ] T040 [P] [US7] Refine tablet (768px): icon-rail nav, sensible multi-column layouts, no horizontal scroll
- [ ] T041 [US7] Refine desktop (1440px): airy, organized layouts with sidebar fixed; verify no horizontal scroll at any breakpoint

**Checkpoint**: Spacing/type consistent; app excellent on mobile, tablet, and desktop.

---

## Phase 8: Final QA & Polish

**Purpose**: Constitution Day 8.3 Definition of Done — audits (DoD-12/DoD-1/DoD-2/DoD-10), manual browser verification (DoD-11), reduced-motion (DoD-4), responsive (DoD-7), regressions, and performance samples.

- [x] T042 [P] DoD audits: token-usage scan (all colors flow through `--color-*`; orange family is the only accent) + green-literal scan (DoD-1) + `npm run build` (DoD-10) + lint clean
- [x] T043 [P] Reduced-motion verification: under `prefers-reduced-motion` ALL new motion (page transitions, skeleton shimmer, hover, modal/toast) collapses to static/fade without losing functionality
- [x] T044 Verify skeletons, toasts, and modals per DoD-5 + `quickstart.md` step 3 (data-loading views skeletonized; toast `aria-live`/dismiss/pause-on-hover; modal focus-trap/Escape/scroll-lock)
- [x] T045 [P] Responsive verification at 360/768/1440 per `quickstart.md` step 5 (nav reachable, zero horizontal scroll)
- [x] T046 [P] Prior-day regression spot-check per `quickstart.md` step 6: register/login, add workout, log nutrition, analytics/reports charts, notifications unread badge, CSV/PDF export, change-password + delete-account modals, settings prefs persist
- [x] T047 [P] Performance samples: record ≥2 LCP timings for `Dashboard` + `Analytics` routes in `quickstart.md` (target < 2.5s); note any motion-related interaction delay (none expected)
- [x] T048 Complete `quickstart.md` result tables (walk-through + interaction checks) with PASS/FAIL per surface; final polish pass (dead CSS cleanup, no temporary classes) + housekeeping

---

## Dependencies & Execution Order

### Phase Dependencies (execution order per user's recommended sequence)

1. **Setup (Phase 1)**: No dependencies — can start immediately.
2. **Foundational (Phase 2)**: Depends on Setup; **BLOCKS all story phases** (tokens are the single source every story consumes).
3. **Core Components (Phase 3)**: Depends on Phase 2. Independent of Phases 4-6.
4. **Navigation (Phase 4)**: Depends on Phase 2; consumes upgraded components. Independent of Phase 3.
5. **Motion & Feedback (Phase 5)**: Depends on Phase 2; parts (skeletons/toasts on pages) benefit from Phase 3 but are independently testable.
6. **Apply Across Pages (Phase 6)**: Depends on Phases 2-5 completing together (this is the cumulative US1 application pass).
7. **Spacing/Typography/Responsive (Phase 7)**: Depends on Phases 3 and 6 (refines what is already styled).
8. **Final QA (Phase 8)**: Depends on all phases complete.

### User Story Delivery Map

| Story | Priority | Delivered by | Independent Test |
|-------|----------|--------------|------------------|
| US1 Whole-app premium + cohesive theme | P1 (cumulative) | Phases 2 + 6 (T029-T035) + audits T042/T044/T045 | Full nav-tree walk: every screen black + orange, zero green accents, no inconsistent page |
| US2 Modern navigation | P1 | Phase 4 (T017-T021) | Nav walk-through: obvious active/hover/focus, badges intact, mobile drawer reachable, same destinations |
| US3 Core components | P2 | Phase 3 (T012-T016) | Inspect buttons (5 states), cards, inputs (focus ring), icons on any module — unified + upgraded |
| US4 Purposeful motion | P2 | Phase 5 (T022-T025) | Open data-loading views → skeletons now, no blank/shift; hover/transitions smooth; reduced-motion safe |
| US5 Feedback surfaces | P2 | Phase 5 (T026-T028) | Trigger toasts + modals — uniform pattern, aria-live, focus trap, Escape, stacking on mobile |
| US6 Consistent spacing & type | P3 | Phase 7 (T036-T038) | Compare dense vs simple pages: same rhythm; hierarchy clear; no one-off values |
| US7 Responsive excellence | P3 | Phase 7 (T039-T041) | Resize 360/768/1440: nav reachable, reflow clean, zero horizontal scroll |

> Rationale for interleaving: in a token-driven restyle, US1 is the cumulative outcome of every other story (its acceptance test — theme everywhere, zero green — is provable only once tokens + primitives + page pass all land). Priority labels preserve importance; execution order follows the user's recommended 1→7 sequence (which also happens to be the correct technical order: foundation before surfaces).

### Within Each Phase

- Values/decisions are already pinned by `plan.md` + `research.md` (exact hexes, tokens, contracts); implement against them — no invention.
- Commit after each task or logical group; stop at any checkpoint to run the phase's Independent Test.

### Parallel Opportunities

- Phase 1: T001-T003 all [P]
- Phase 2: T004-T010 all [P] (different token families)
- Phase 3: T013-T015 [P] (Button.jsx is sequential before T016 sweep)
- Phase 4: T017-T019 [P]; T020 after
- Phase 5: T022+T023 [P]; T024 then T025; T026/T027 [P]; T028 last
- Phase 6: T029-T033 all [P] (different page groups); T034/T035 after
- Phase 7: T036/T037 [P]; T038 after; T039/T040 [P]; T041 last
- Phase 8: T042-T048 mostly [P]

---

## Parallel Example: Phase 6 (Apply Across Pages)

```bash
# Launch all page-group tasks together (different files, no cross-dependencies):
Task: "T029 [P] [US1] Apply theme to Dashboard + Workout surfaces ..."
Task: "T030 [P] [US1] Apply theme to Nutrition + Goals + Progress ..."
Task: "T031 [P] [US1] Apply theme to Analytics + Reports ... TrendIndicator.jsx literal -> --color-trend-negative"
Task: "T032 [P] [US1] Apply theme to Notifications + Profile + Settings ..."
Task: "T033 [P] [US1] Align auth flows (Login/Register) + Landing theme alignment ..."

# Then, once all land:
Task: "T034 [US1] Green-literal elimination sweep (repo root) ..."
Task: "T035 [US1] Cohesion pass ..."
```

---

## Implementation Strategy

### MVP First (Theme-Applied Increment)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. **STOP and VALIDATE**: `npm run build` + visual check — the ENTIRE app is already black + orange because all styling is token-driven. This is the cheapest possible MVP of the feature (US1 core theme).
4. Then add Phases 3-5 (components, nav, motion/feedback) → each independently testable.
5. Then Phase 6 (page application + zero-green sweep) completes US1 fully.

### Incremental Delivery

1. Setup + Foundational → **MVP: whole app re-themed** (build + visual check + quickstart step 2 scan)
2. Core Components (US3) → test independently
3. Navigation (US2) → test independently
4. Motion & Feedback (US4/US5) → test independently
5. Apply Across Pages + green sweep (US1 complete) → test independently
6. Spacing/Typography/Responsive (US6/US7)
7. Final QA (DoD 1-12) + record quickstart.md

### Parallel Team Strategy

With multiple contributors:
1. Team completes Phase 1 + Phase 2 together (foundation blocks everything).
2. After Phase 2: Developer A → Phase 3 components; Developer B → Phase 4 navigation; Developer C → Phase 5 motion/feedback.
3. Merged primitives/nav/motion are then consumed by the page-application pass (Phase 6) run by the whole team across the 5 page groups in parallel.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps each task to its spec user story for traceability.
- Every task is self-contained with exact file paths; values/hexes to use are given — no additional context needed.
- Verify `npm run build` after each phase checkpoint; record QA results in `quickstart.md` before `/sp.implement` completes.
- Out of scope (do NOT add): functionality/behaviour changes, new routes, new deps, new env vars, backend/API/model edits, Landing redesign, third theme, visual-regression CI.