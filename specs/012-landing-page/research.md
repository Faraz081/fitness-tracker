# Research: Landing Page (8.2)

**Date**: 2026-09-10
**Feature**: 012-landing-page

## Unknowns Resolved

### 1. Public Route Wiring (Principle L9)

**Decision**: New top-level public route `GET /landing` in `frontend/src/App.jsx`, wrapped in the existing `PublicOnly` component.

```jsx
<Route path="/landing" element={<PublicOnly><Landing /></PublicOnly>} />
```

**Rationale**:
- `/` is the protected Dashboard — repurposing it would break the authenticated app (L9: additive only).
- `/login` and `/register` are the public auth routes and must stay untouched.
- `PublicOnly` already redirects authenticated users to `/` — exactly the L9-required handling for authed visitors to the landing page.
- Top-level (outside `<Layout/>`) because the landing must be full-bleed; `<Layout/>` wraps routes in dashboard chrome (`main p-4 sm:p-6 lg:p-8`, sidebar padding).

**Alternatives Rejected**:
- Replacing `/` with the landing page: breaks Dashboard URL / L9.
- Rendering landing inside `<Layout/>`: unwanted sidebar/topbar chrome and padded main on a marketing page.
- Duplicate auth logic in `Landing.jsx`: `PublicOnly` already exists — no new gate code.

### 2. Single Content Source (Principle L8)

**Decision**: `frontend/src/data/landingContent.js` — plain JavaScript data module. No JSX, no components, no hard-coded copy anywhere else.

**Rationale**:
- L8 mandates a single content source for the landing page (content maintainability).
- Matches the existing `frontend/src/data/*` convention (constants.js, dashboardData.js, analyticsData.js).
- Pure data module → trivially diffable, reviewable, and safe to `node --check`.

**Shape** (detailed schema in data-model.md):

```js
export const landingContent = {
  brand: { name: 'FitTrack', tagline: '...' },
  navLinks: [{ id, label, href }],          // '#features' | '#how-it-works' | ...
  hero: { eyebrow, title, subhead, primaryCta, secondaryCta, visual: {...} },
  features: [{ title, description, icon }],  // 6
  howItWorks: [{ step, title, description }],// 3
  stats: [{ prefix, value, suffix, label, decimals }], // 4
  benefits: [{ title, points }],             // 6 (2-col)
  testimonials: [{ quote, name, role, illustrative }], // 3
  finalCta: { headline, subhead, primaryCta },
  footer: { about, navLinks, legal }
};
```

### 3. CTA Routing (Principle L1)

**Decision**: All primary CTAs resolve to `'/register'`; the single "Log in" entry resolves to `'/login'`. Both literal targets are defined **once** in `landingContent.js` (inside `hero.primaryCta`, `finalCta.primaryCta`, `navbar.cta`, and a `LOGIN_PATH` constant). No component hard-codes a route.

**Implementation Notes**:
- `LandingLink.jsx` renders a React Router `Link` (client-side nav) using `{ label, to, variant }` from the content module.
- Dead-link audit (quickstart step 7): every `to`/`href` resolves to an existing route (`/register`, `/login`) or an in-page anchor (`#features`, `#how-it-works`, `#stats`, `#testimonials`, `#signup`).
- TOP: conversion flow for a freshly-landed guest = `/landing` → `/register` → app.

### 4. Animation Approach (Principle L6, L4)

**Decision**: Bundled framer-motion + CSS only. Zero new dependencies (A7/D6).

- Shared `Reveal.jsx`: `motion.div` with `useInView({ once: true, margin: '-40px' })` + `whileInView` opacity/transform (`y: 16 → 0`). Honors `useReducedMotion()` → renders plain (no animation) for `prefers-reduced-motion: reduce` users.
- `StatsSection.jsx` reuses existing `ui/Counter.jsx` (already framer-motion count-up on scroll) — no new animation code for stats.
- CSS micro-animations (transition, hover glow) + `html { scroll-behavior: smooth }` for anchor nav, guarded by `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`.

**Why not heavier**: hero = pure CSS/SVG composition (concentric rings + glow via `--color-accent-glow`, `animate-pulse`-style CSS) → no image downloads, no video, keeps LCP inside budget.

### 5. Dark Identity For Guests

**Decision**: `LandingPage.jsx` root pins the dark token set regardless of any persisted light-theme preference (guests are pre-login; the app's light theme is an authenticated-user preference).

**Implementation Notes**:
- Landing root element sets dark variant markers (e.g., locally scoped dark palette via the existing token variables on the root class). The dark token variables remain the source of truth (`--color-bg: #0B0F14`, `--color-accent: #A3E635`, `--color-accent-glow`, panel `#131821`, `gradient-primary`).
- Visual check at quickstart step 6 (open landing with a light-theme persisted from a previous session → page still renders dark).

### 6. SEO (DoD)

**Decision**: Static edit to `frontend/index.html`.
- Title: descriptive product title (brand + value hook).
- Add `<meta name="description" content="..." />`.
- No head-management library in the SPA; a static edit is the clean, dependency-free fix. Semantic HTML landmarks (`<header>/<main>/<section>/<footer>`) come from the component structure.

### 7. API Contracts

**Decision**: N/A. The landing page is public and static — no fetch, no REST endpoints, no auth middleware, no backend changes. `contracts/README.md` documents this explicitly so future readers don't hunt for endpoints.

### 8. Content Maintenance & Mock Data

**Decision**: Center content records only; testimonials are illustrative (fantasy) personas labeled `illustrative: true` per EC-2 with a visible bracketed disclaimer and an in-content footnote; per EC-1, two testimonials share a first name. Stats values are feature-driven (real trackable metrics) per L7.

## Technology Choices

| Choice | Selected | Alternatives | Rationale |
|--------|----------|--------------|-----------|
| Route | `/landing` (public, PublicOnly) | Reuse `/`, nested in Layout | `/` is protected; Layout adds chrome to marketing |
| Animation | Bundled framer-motion + CSS | New lib (gsap, AOS) | A7/D6 zero new deps; reuse `Counter` |
| Hero visual | CSS/SVG glow ring composition | Static image, video, canvas | LCP budget, zero assets, premium feel |
| Content | `data/landingContent.js` (single source) | JSX constants in components | L8 mandate; matches `data/` convention |
| Scroll | CSS `scroll-behavior: smooth` + reduced-motion guard | scrollIntoView JS | Declarative, no JS hook wiring, a11y-safe |
| SEO | Static `index.html` title + meta | Head lib/JS injection | No head-manager in SPA; zero deps |

## Integration Points

1. **App.jsx**: one new top-level public route (`/landing`) reusing `PublicOnly`; no other route changed.
2. **frontend/index.html**: title + meta description only.
3. **frontend/src/index.css**: additive landing utilities + smooth-scroll block + overflow guard. Nothing existing removed/renamed.
4. **ui primitives**: `Button` (variants primary/outline), `Counter` (stats), `Badge`/`Card` as needed, `EmptyState` not required.
5. **lucide-react**: already bundled; section icons (`Dumbbell`, `Target`, `TrendingUp`, `Flame`, `Apple`, `Clock`, `Menu`, `X`, `ChevronRight`, `Sparkles`, etc.).
6. **framer-motion**: bundled; `motion`, `useInView`, `useReducedMotion` only.
7. **Brand/visual system**: tokens, `dash-num` display scale, `gradient-primary` button glow — all existing.