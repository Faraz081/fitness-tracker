# Implementation Plan: Premium UI/UX Upgrade

**Branch**: `013-premium-ui-upgrade` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/013-premium-ui-upgrade/spec.md` (Day 8.3, constitution v4.0.0)

## Summary

Cross-cutting, frontend-only visual + interaction upgrade of the entire FitTrack app from the lime-accent identity to a **full black + vibrant orange** design system. Delivered primarily through a **token/CSS redefinition in `frontend/src/index.css`** (v4.0.0 orange accent family + spacing/radius/shadow/type/motion scales), **upgraded shared primitives** in `frontend/src/components/ui/` (`Button`, `Card`, `Input`, `Select`, `Modal`, `Toast`, `Skeleton`, `Badge`) as the single source of truth (D4/PU3), an **in-place sidebar/navigation modernization** (`layout/Sidebar.jsx`, `TopNavbar.jsx`, `DashboardLayout.jsx`), and a **page-by-page consumption pass** over all 17 pages + auth flows + Landing theme alignment. Includes refined motion (hover/transitions/page-enters/loading/skeleton shimmer), consistent 4px spacing + tokenized type hierarchy, and responsive verification at 360/768/1440px. **Zero functional/behaviour, route, dependency, env, backend, or data changes.**

Direct constitution anchors this plan implements: PU1 top-down 4.0.0 fingers — see Constitution Check. Exact green/lime literals to eliminate are already located (see [research.md](./research.md)): `index.css` `--color-primary*` + `--color-accent*` (lime `#A3E635`/`#BEF264`/`#84CC16` + lime glow rgba) and one raw arbitrary hex in `components/analytics/TrendIndicator.jsx` (`text-[#F87171]`). The semantic `--color-success: #22C55E` is **kept for status meaning only**.

## Technical Context

**Language/Version**: JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: React 19.2.8, Vite 8.2.2, React Router 7.18.2, Tailwind CSS v4 (CSS-first `@theme`). Reuses the **already-bundled** lucide-react (icons) and framer-motion (page/reveal polish). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6)
**Storage**: N/A — no new persistence. The design system lives as CSS variables in `frontend/src/index.css` `@theme` (single source of truth).
**Testing**: No test suite in repo. Gates = grep token/literal audits, `npm run build` (vite), manual browser verification recorded in quickstart.md (per DoD-11). No automated visual-regression suite (explicitly out of scope).
**Target Platform**: Modern evergreen browsers (web, responsive down to ~360px)
**Project Type**: Web — frontend-only, cross-cutting restyle of the existing `frontend/` SPA.
**Performance Goals**: No regression vs prior-day pages; LCP < 2.5s sampled on Dashboard + Analytics routes; all motion `transform`/`opacity` only, GPU-friendly, nothing blocks first paint or interaction (PU4).
**Constraints**: Zero new deps; zero new env vars; zero backend/API/model/route/functional changes; zero leftover green/lime accents (PU2); raw-hex audit (exactly 1 known arbitrary literal today: `TrendIndicator.jsx` `text-[#F87171]` — to tokenize); no horizontal scroll at any breakpoint (D8/A9); `prefers-reduced-motion` fully collapses animation (PU4); `[data-theme="light"]` scheme (Day 7.1) gets orange parity, no third theme (out-of-scope rule).
**Scale/Scope**: 1 token file (574-line `index.css`, line-count checked pre-plan), 7 ui primitives re-themed (Button, Card, Input, Select, Modal, Toast, Skeleton, Badge — 8 files), 3 layout files (Sidebar, TopNavbar, DashboardLayout), 17 pages + 4 auth/Landing surfaces, ~30 feature components flagged for state-styling audit, TrendIndicator tokenization, PageTransition motion review. No backend surface.

## Constitution Check

*GATE: Passed (verified against `.specify/memory/constitution.md` v4.0.0, Day 8.3 = CURRENT ACTIVE PHASE). Re-checked after Phase 1 — still all green.*

| # | Principle / Rule | How the plan satisfies it |
|---|------------------|---------------------------|
| PU1 | Premium Feel | Every primitive and layout file in this plan gains refined surfaces, elevation, hover/lift, crisp focus rings, and token-driven motion; PU1 is encoded as the acceptance baseline in quickstart QA ("no flat grey boxes, no default-browser styling, no absent hover"). |
| PU2 | Complete Theme Consistency | v4.0.0 orange accent family replaces all lime tokens + one raw hex literal; a grep audit (patterns listed in quickstart) proves zero `#A3E635`/`#BEF264`/`#84CC16`/lime accents remain; `--color-success: #22C55E` retained ONLY for semantic on-track/surplus meaning. |
| PU3 | Design System Discipline | Changes flow through ONE token file (index.css) + ONE set of shared primitives (components/ui). No per-page forks; `dash-card`/`Card` is the single card surface; upgraded primitives propagate to ALL consumer pages by construction. |
| PU4 | Delight with Purpose | Motion tokens (150/200/300ms, ease-out) defined once; all new motion is transform/opacity; existing `skeleton-shimmer` + keyframes reused and tokenized; existing reduced-motion guard (index.css:206) enforced = everything collapses to static/fade; no new animation library. |
| PU5 | Clarity & Hierarchy | Tokenized display/heading/subheading/body/caption type scale over the existing Barlow/Barlow-Condensed fonts; one clear primary action per viewport via accent-filled Button; contrast on black verified in quickstart. |
| PU6 | Responsive by Default | Existing responsive shell preserved and upgraded (icon rail on tablet, drawer on mobile per D8); no layout/route change; verification at 360/768/1440 with zero horizontal scroll. |
| Nav rules | Sidebar modernized, not restructured | Sidebar/TopNav/DashboardLayout restyled in place; brand block refined; orange active indicator; **no nav entry or route removed/hidden** (ST7/R3/L9). Preserved badge affordances (unread count). |
| Component rules | Primitives are THE single source | Button (default/hover/active/disabled, primary/outline/ghost/danger), Card (border/radius/shadow/padding, hover lift ONLY on interactive), Modal (overlay, focus trap, Escape, scroll-lock, aria-modal, opacity/transform motion, reduced-motion), Toast (`aria-live="polite"`, semantic variants, dismissible, auto-dismiss + pause-on-hover), Skeleton (shimmer, no blank regions), Input/Select (orange focus ring, consistent height), Badge (tokenized). |
| Icons (caps) | lucide-react only | All icon usage audited; icon-only controls carry `aria-label`; one stroke/size convention. |
| Coding standards | JS-only / zero deps / zero env / additive | All new files `.js`/`.jsx`; token changes live ONLY in index.css; no backend/API/model/route/data edits; no third theme. |
| DoD-1..9,11 | Theme scan, upgrade, nav, motion, skeletons, spacing, responsive, landing/auth, zero changes | Each maps to a Phase group + quickstart verification step (see project structure + Phase 2 groups). |
| DoD-10 | Build + lint | `npm run build` gate in T-group G7; lint script must stay clean (no new warnings from plan's files). |
| DoD-12 | Token audit | Dedicated audit task (G7) — repo-wide scan that all colors flow through `--color-*` tokens and the orange family is the only accent; result recorded in quickstart.md. |

**Complexity Tracking**: No violations — zero new dependencies, zero new routes, zero backend surface, one file (index.css) owns all tokens, one set of primitives owns all styling. (Table intentionally empty.)

## Project Structure

### Documentation (this feature)

```text
specs/013-premium-ui-upgrade/
├── plan.md              # This file (/sp.plan output — active)
├── research.md          # Phase 0 output (/sp.plan output)
├── data-model.md        # Phase 1 output (/sp.plan output)
├── quickstart.md        # Phase 1 output (/sp.plan output)
├── contracts/README.md  # Phase 1 output — N/A statement (no API)
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
└── src/
    ├── index.css                    # MODIFIED: v4.0.0 token redefinition (orange accent family + spacing/radius/shadow/type/motion scales) + [data-theme="light"] orange parity; keyframes + reduced-motion guard retained
    ├── components/
    │   ├── ui/                      # UPGRADED shared primitives (single source, PU3/D4)
    │   │   ├── Button.jsx           #   variants + full states (default/hover/active/focus/disabled)
    │   │   ├── Card.jsx             #   refined unified card surface (interactive hover-lift flag)
    │   │   ├── Input.jsx            #   orange focus ring, consistent height/padding/dark styling
    │   │   ├── Select.jsx           #   same field language as Input
    │   │   ├── Modal.jsx            #   overlay/panel upgrade (a11y + opacity/transform motion + reduced-motion)
    │   │   ├── Toast.jsx            #   restyled toast (container + toast; accent border/icon; aria-live; pause-on-hover)
    │   │   ├── Skeleton.jsx         #   upgraded shimmer loader (accent-neutral, stable layout)
    │   │   ├── Badge.jsx            #   tokenized badge/pill (semantic status variants)
    │   │   └── PageTransition.jsx   #   review + align to motion tokens (fade/translate, reduced-motion)
    │   ├── layout/                  # UPGRADED in place (no structure change)
    │   │   ├── Sidebar.jsx          #   refined brand block, orange active indicator, hover states, preserved badges
    │   │   ├── TopNavbar.jsx        #   restyled to theme
    │   │   └── DashboardLayout.jsx  #   shell restyled; responsive rail/drawer behaviour preserved
    │   ├── analytics/
    │   │   └── TrendIndicator.jsx   #   MODIFIED: raw `text-[#F87171]` literal → semantic token (--color-trend-negative)
    │   └── (all prior feature components)  # consume upgraded primitives/tokens; NO functional/data/route changes
    ├── pages/                       # 17 pages restyled via token/primitives (no logic change): Dashboard, WorkoutList, WorkoutForm, WorkoutDetail, WorkoutHistory, ExerciseHistory, Nutrition, Progress, Analytics, Goals, Notifications, Profile, Settings, Reports, Login, Register, Landing
    └── (data/, hooks/, utils/, services/, context/)  # UNCHANGED — no data/logic/API edits
```

**Structure Decision**: Web app, frontend-only, additive + non-destructive. Follows the monorepo convention already used by prior features: one token file owns all color/spacing/radius/shadow/type/motion; `components/ui/` is the only home for shared primitives; consumer pages import them. No `backend/` changes at all. The upgrade is intentionally delivered as redefinition (tokens + primitives), not new architecture.

## Phase 0: Research

Full write-up in [research.md](./research.md). Key resolutions:

1. **Canonical orange family pinned**: `--color-accent: #F97316` (primary), hover/light `#FB923C`, pressed/dark `#EA580C`, glow `rgba(249,115,22,0.25)`. `--color-primary*` family is **aliased to the accent family** (same orange values; rendered as the same family, not a second accent) — replaces the current lime-based primary/accent duplication.
2. **Light-theme parity (Day 7.1)**: the `[data-theme="light"]` overrides in index.css (lines ~84-130, 442) remap to a slightly darkened orange for on-light contrast (`#EA580C` base / `#C2410C` hover); no third theme.
3. **Near-black preserved**: keep `--color-bg: #0B0F14` (already a deep near-black); "narrow toward true black" rejected to minimize churn and preserve the validated surface/line contrast. Surfaces (`--color-panel*`), `--color-line`, ink/text tokens stay as the raised-surface family.
4. **Semantic colors stay semantic-only**: `--color-success: #22C55E` (on-track), `--color-error`, `--color-warning` unchanged and used only for status meaning. New semantic token `--color-trend-negative` (≈ `#F87171`) absorbs the one raw literal in `TrendIndicator.jsx` so zero arbitrary hex codes remain anywhere.
5. **Motion tokens added once**: `--duration-fast: 150ms`, `--duration-base: 200ms`, `--duration-slow: 300ms`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`; existing keyframes (`fade-in`, `slide-up/down`, `scale-in`, `pulse-slow`, `skeleton-shimmer`) + the reduced-motion guard (index.css:206) are retained and referenced, never duplicated.
6. **Spacing/type discipline**: one 4px-based scale already in effect via Tailwind (`p-*`, `gap-*`, `space-*`); this plan standardizes card padding + section rhythm and tokenizes the type scale (display/heading/subheading/body/caption) over the existing Barlow font pairing. `dash-num` headline numbers and numeric formatting rules stay.
7. **No API contracts**: the upgrade changes nothing on the backend → `contracts/README.md` documents N/A explicitly (Phase 1).

### Best Practices Found

- **Primitive-first**: restyle `components/ui/*` once; every consumer page inherits the new language automatically (PU3). Grep-confirmed the only raw hex literal in JSX is `TrendIndicator.jsx:28` — component audit is tiny.
- **Token-only colors**: all new/changed colors flow through `@theme` variables; tailwind arbitrary-values (`text-[#…]`) are banned by the DoD-12 audit.
- **Framer-motion only where it pays**: page/reveal polish via the bundled framer-motion (fade + subtle translate); all micro-interactions as CSS transitions over motion tokens; the existing `.2s ease` transitions (index.css:274-349) converge onto the motion tokens.
- **Reduced-motion already guarded**: the existing global guard (index.css:206-210) collapses animations/transitions; new motion must route through existing keyframes/tokens so the guard keeps working without duplication.

## Phase 1: Design & Contracts

### Data Model (data-model.md)

No Mongoose models — [data-model.md](./data-model.md) specifies the **design-system token schema** (the frontend "data contract" for this feature): color tokens (accent family, semantic, surface, text, lines) with exact v4.0.0 values; spacing scale (4px-based); radius scale; shadow/elevation tokens incl. hover lift; type scale (display/heading/subheading/body/caption); motion tokens; and a **primitive contract table** (Button variants/states, Card, Input/Select, Modal, Toast, Skeleton, Badge) with required behaviour + a11y, plus the page-coverage matrix.

### API Contracts (contracts/)

None — [contracts/README.md](./contracts/README.md) documents that the upgrade is frontend-only, touches no REST endpoints, no auth middleware, no routes, and no env vars. Zero backend changes.

### Frontend Design

- **Token layer**: single `index.css` redefinition (Phase group G1) — the orange family replaces primary/accent lime everywhere including the light-theme block; motion tokens added; existing keyframes/guard retained.
- **Primitive layer**: `ui/*` upgraded against the token layer (G2) — Button (variants + full states), Card (unified surface + interactive hover-lift), Input/Select (orange focus ring), Modal (overlay/panel + a11y + motion), Toast (new visual language + behavior), Skeleton (shimmer), Badge (semantic variants).
- **Navigation layer**: Sidebar/TopNavbar/DashboardLayout restyled in place with orange active indicator, hover/focus states, refined brand block (G3); layout structure and responsive rail/drawer behaviour unchanged.
- **Motion layer**: hover/transitions/page-enters/loading aligned to motion tokens + reduced-motion guard (G4); TrendIndicator literal tokenized.
- **Application layer**: page-by-page visual application + consistency pass over all 17 pages, auth, and Landing theme alignment (G5), then spacing/typography/responsive refinements (G6).
- **QA layer**: grep audits, build gate, manual browser verification, DoD-12 token audit, quickstart record (G7).

### Quickstart Verification

Full steps + result tables in [quickstart.md](./quickstart.md): grep audits → `npm run build` → clean-token scan → page-by-page visual audit (hover/active/disabled, transitions, reduced-motion, skeletons, toasts, modals) → responsive 360/768/1440 → prior-day regressions → LCP samples on Dashboard/Analytics.

## Phase 2: Task Breakdown (for /sp.tasks)

Tasks will be parallel where safe:

### Group 1 — Design System Foundation
- T01: Redefine `index.css` v4.0.0 tokens: orange accent + primary families (incl. glow), spacing/radius/shadow/type/motion tokens, `--color-trend-negative`; light-theme orange parity
- T02: Grep-based literal audit tooling (patterns for `#A3E635`/`#BEF264`/`#84CC16`, lime, arbitrary `[#hex]`) captured in quickstart

### Group 2 — Core Component Upgrade
- T03: `ui/Button.jsx` — variants + full states (default/hover/active/focus/disabled), consistent height/radius, icon buttons + `aria-label`
- T04: `ui/Card.jsx` — unified surface (border/radius/shadow/padding) + interactive hover-lift flag
- T05: `ui/Input.jsx` + `ui/Select.jsx` — orange focus ring, consistent heights/padding, dark styling
- T06: `ui/Modal.jsx` — overlay/panel upgrade, a11y (dialog/aria-modal/focus trap/Escape/scroll-lock), motion + reduced-motion
- T07: `ui/Toast.jsx` — restyled toasts (accent border/icon, placement/timing, dismissible, pause-on-hover, `aria-live`)
- T08: `ui/Skeleton.jsx` + `ui/Badge.jsx` — shimmer loader + tokenized badge/pill

### Group 3 — Navigation Upgrade
- T09: `layout/Sidebar.jsx` — brand block, orange active indicator, hover/focus states, preserved badges/labels
- T10: `layout/TopNavbar.jsx` + `layout/DashboardLayout.jsx` — restyle shell; responsive rail/drawer behaviour preserved

### Group 4 — Motion & Feedback
- T11: `ui/PageTransition.jsx` + page-level motion aligned to tokens (fade/translate, reduced-motion)
- T12: Hover/transition convergence pass across interactive elements to motion tokens
- T13: TrendIndicator literal → `--color-trend-negative` (and any other raw-literal stragglers)

### Group 5 — Global Application
- T14: Dashboard + Workouts surfaces (List/Form/Detail/History/ExerciseHistory)
- T15: Nutrition + Goals + Progress
- T16: Analytics + Reports (incl. chart/shimmer skeletons)
- T17: Notifications + Profile + Settings + ExerciseHistory
- T18: Auth flows (Login/Register) + Landing theme alignment (no redesign)

### Group 6 — Spacing, Typography & Responsiveness
- T19: Spacing-scale + type-hierarchy pass across all pages; card padding/section rhythm standardization
- T20: Responsive refinement + zero-horizontal-scroll verification at 360/768/1440

### Group 7 — Final QA
- T21: DoD audit runs — green-literal grep (must be 0 outside semantic success usage), token-usage scan, `npm run build`, lint
- T22: Manual browser verification per quickstart + performance samples (LCP) + results recorded in quickstart.md
- T23: AGENTS.md refresh (update-agent-context) + final polish pass

## Risks & Unknowns

| Risk | Mitigation | Status |
|------|------------|--------|
| Leftover green after CSS swap | Grep audit fixed to exact lime values + `lime` keyword + arbitrary `[#hex]`; `--color-success` exempt only as semantic status | MITIGATED |
| Light-theme (Day 7.1) drifting to a third theme | `[data-theme="light"]` block remapped to orange family explicitly; no new scheme | MITIGATED |
| Raw hex literals beyond TrendIndicator | Repo-wide arbitrary-`[#hex]` scan found exactly 1; audit is part of T13/T21 | MITIGATED |
| Motion regressions (jank / reduced-motion) | Transform/opacity-only tokens; global reduced-motion guard already exists; verified in T20/T22 | MITIGATED |
| Primitive upgrade breaking a consumer page | No functional changes; build gate + full page walk-through in T21/T22 | MITIGATED |
| Sidebar restyle removing/cluttering an entry | Layout structure untouched; nav entries/routes diffed in T09 (no entries removed) | MITIGATED |
| Skeleton layout shifts | Skeleton reserved-space/stable-placeholder rule enforced in T08 + quickstart check | MITIGATED |

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` after plan creation to record the Premium UI/UX Upgrade (v4.0.0 orange accent family via index.css token redefinition, upgraded ui primitives, `--color-trend-negative`, zero new deps, no backend) in AGENTS.md.