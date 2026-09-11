# Data Model: Premium UI/UX Upgrade (013-premium-ui-upgrade)

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-10
**Scope**: Frontend-only design system. No persistence, no Mongoose models, no new data. This document defines the **design-token schema** and **primitive contracts** — the single source of truth the upgrade is built on (constitution PU3 / D4).

## Overview

The feature has no domain entities. The "model" is the **visual contract**: a set of named tokens (colors, spacing, radius, shadows, typography, motion) and the **component contracts** for the shared primitives that consume them. Both live in / reference `frontend/src/index.css` `@theme` + `frontend/src/components/ui/`.

## Design-Token Schema

### Color tokens (v4.0.0 — orange accent family)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` / `--color-primary` | `#F97316` | Single brand accent (primary fills, active nav, primary buttons, focus rings, links) |
| `--color-accent-light` / `--color-primary-light` | `#FB923C` | Hover accent; icon-on-accent emphasis |
| `--color-accent-dark` / `--color-primary-dark` | `#EA580C` | Pressed/active accent; on-light-theme base |
| `--color-accent-glow` / `--color-primary-glow` | `rgba(249, 115, 22, 0.25)` | Glow rings, gradient highlights (e.g. hero, stat accents) |
| `--color-primary-50/100/200` | orange `rgba(249,115,22, ·)` 0.1/0.2/0.3 | Soft accent tints (badges, charts, subtle fills) |

**Semantic tokens (status meaning ONLY — never decorative, PU2):**

| Token | Value | Allowed usage |
|-------|-------|---------------|
| `--color-success` | `#22C55E` | On-track status, success feedback |
| `--color-warning` | `#F59E0B` | Deficit/surplus warnings, caution |
| `--color-error` | `#EF4444` | Error states, destructive actions |
| `--color-trend-negative` | `#F87171` (new) | Down/negative trend indicator (absorbs the `text-[#F87171]` literal) |

**Surface / text / line (existing, raised-on-black family — unchanged):**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0B0F14` | Page background (deep near-black) |
| `--color-panel` / `--color-panel-soft` | `#131821` / `#161C26` | Cards/panels |
| `--color-surface` / `-elevated` / `-hover` | `#1A1A1A` / `#222222` / `#2A2A2A` | Surfaces (dark-control family) |
| `--color-line` | `#232A33` | Borders, card edges |
| `--color-ink` / `-soft` / `-muted` | `#F4F6F8` / `#A9B0BC` / `#6B7280` | Text hierarchy |

### Spacing scale (4px-based — one scale)

`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` via Tailwind (`p-*`, `m-*`, `gap-*`, `space-*`). Cards share one padding standard (md: `16px`, lg: `24px`); section rhythm uses 32/48/64 multiples. No one-off values (DoD-6 audit).

### Radius scale (existing)

`--radius-sm 0.375rem` · `--radius-md 0.5rem` · `--radius-lg 0.75rem` · `--radius-xl 1rem` · `--radius-2xl 1.5rem` · `--radius-full` (pills). Cards = `--radius-lg`; buttons/inputs = `--radius-md`; badges/pills = `--radius-full`.

### Shadow / elevation tokens

`--shadow-sm/md/lg` (existing, black-based). **Add** `--shadow-lift` (interactive hover elevation) with a subtle orange-tinted glow so hover-lift reads as the premium affordance.

### Typography scale (tokenized)

| Token/role | Face | Purpose |
|------------|------|---------|
| Display | Barlow Condensed, strong weight, `dash-num` | Page/stat hero numbers (e.g. dashboard metrics) |
| Heading | Barlow semi-bold | Section headings |
| Subheading | Barlow medium | Card titles, group labels |
| Body | Barlow regular | Readable copy on black (verified) |
| Caption | Barlow regular, muted | Labels, timestamps, footnotes |

Numeric formatting rules unchanged (weights w/ decimals, volume thousands-separators, kcal whole, % whole).

### Motion tokens (new, defined once)

`--duration-fast: 150ms` · `--duration-base: 200ms` · `--duration-slow: 300ms` · `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Keyframes reused: `fade-in`, `slide-up`, `slide-down`, `scale-in`, `pulse-slow`, `skeleton-shimmer`. Global `prefers-reduced-motion` guard (index.css ~206) collapses all motion for free.

## Primitive Contracts (components/ui)

| Primitive | Contract |
|-----------|----------|
| `Button` | Variants: primary (accent-filled), outline, ghost, danger. States: default, hover, active, focus-visible, disabled. One height/radius/padding; icon + `aria-label` for icon-only buttons; `disabled` clearly distinct (no accent). |
| `Card` | One surface: `--color-panel` (or surface-elevated), `--color-line` border, `--radius-lg`, standard padding. Optional hover-lift `--shadow-lift` **only** when interactive (must also show an affordance — chevron/hover border). |
| `Input` / `Select` | Dark-surface field, consistent height/padding, orange focus ring (`--color-accent`), readable-on-black text, correct error styling via `--color-error`. Date controls match. |
| `Modal` | One overlay pattern: dimmed backdrop, refined panel (`--radius-lg` border+shadow), standard padding, `role="dialog"` + `aria-modal`, focus trap, Escape = close, body scroll-lock, entry/exit via opacity/transform only, collapses under reduced-motion. Confirmations reuse it. |
| `Toast` | Accent-bordered/topped toast, consistent placement + timing, `aria-live="polite"`, dismissible, auto-dismiss with pause-on-hover; success/info/error variants via semantic tokens only. |
| `Skeleton` | Accent-neutral shimmer (`skeleton-shimmer`), reserved space/stable placeholders (no layout shift), used for all major data-loading states incl. charts. |
| `Badge` | Tokenized pill: accent variants (vibrant orange), semantic variants (success/warning/error) ONLY for status. |
| `PageTransition` | Fade + subtle translate via motion tokens; reduced-motion → static. |

## Page Coverage Matrix

All surfaces re-themed through the tokens + primitives above — no page styles native:

| Surface | Applies |
|---------|---------|
| Dashboard, WorkoutList/Form/Detail/History, ExerciseHistory, Nutrition, Goals, Progress | Cards, stat numbers, charts, skeletons, buttons, inputs, empty states |
| Analytics, Reports | Charts (shimmer placeholders), stat cards, export buttons, CSV/PDF flows (no logic change) |
| Notifications, Profile, Settings | Settings forms, toggles, delete/confirmation modals, toast feedback |
| Login, Register | Auth card surfaces, orange primary buttons, form fields (no auth logic change) |
| Landing | Theme alignment only — swap to the black + orange token set; no section redesign |
| Layout (Sidebar / TopNavbar / DashboardLayout) | Brand block, orange active indicator, hover/focus states, preserved badges; structure + responsive behaviour unchanged |

No new entities → no state transitions, no relationships, no validation rules beyond the primitive/accessibility guarantees in the table above.