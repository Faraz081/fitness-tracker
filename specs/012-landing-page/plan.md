# Implementation Plan: Landing Page

**Branch**: `012-landing-page` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/012-landing-page/spec.md` (Day 8.2, constitution v3.10.0)

## Summary

Build a public, high-converting landing page for FitTrack that introduces the product, communicates value, builds trust, and funnels visitors into the sign-up flow. Nine required sections (Navbar, Hero, Features, How It Works, Statistics, Benefits, Testimonials, Final CTA, Footer) rendered from a single data-only content module (`frontend/src/data/landingContent.js`), all primary CTAs → `/register` (secondary → `/login`), fully responsive with the product's dark + green identity (tokens), lightweight framer-motion animations (already bundled, zero new deps), and LCP < 2.5s.

The page is purely presentational — **no backend, no API, no database, no new env vars**. It is routed at `/landing` as a public, top-level route; authenticated users are redirected to `/` (Dashboard).

## Technical Context

**Language/Version**: JavaScript (ES2022, JSX) — JS-only per Day 6.1 override (no TypeScript). Node.js 24 LTS (v24.18.0)
**Primary Dependencies**: React 19.2.8, Vite 8.2.2, React Router 7.18.2. Reuses bundled framer-motion, lucide-react, Tailwind CSS, existing ui primitives (`Button`, `Badge`, `Card`, `Counter`, `EmptyState`). **Zero new npm dependencies** (Day 4.1 A7 / Day 7.1 D6)
**Storage**: N/A — no persistence. Landing content lives in one frontend data module `frontend/src/data/landingContent.js`
**Testing**: No test suite in repo. Gates = `git grep` content-routing audit, `npm run build` (vite), manual browser verification, reduced-motion + responsive checks, LCP timing recorded in quickstart.md
**Target Platform**: Modern evergreen browsers (web, responsive down to ~360px)
**Project Type**: Web — frontend-only feature inside existing `frontend/` SPA
**Performance Goals**: LCP < 2.5s on the landing route (Core Web Vitals); no render-blocking work; <90 Lighthouse opportunity items at 4G-throttled desktop
**Constraints**: Zero new deps; zero new env vars; zero backend/API/model changes; reuse token system `--color-accent: #A3E635`, `--color-bg: #0B0F14`, panel `#131821`, glow tokens; no horizontal scroll at any breakpoint (Day 4.1 D8/A9); reduced-motion respected (Day 8.2)
**Scale/Scope**: Single public page; ~9 sections; ~9 new components + 1 data module + 1 route line in `App.jsx` + additive CSS. No backend surface.

## Constitution Check

*GATE: Passed (verified against `.specify/memory/constitution.md` v3.10.0, Day 8.2 = CURRENT ACTIVE PHASE). Re-checked after Phase 1 — still all green.*

| # | Principle / Rule | How the plan satisfies it |
|---|------------------|---------------------------|
| L1 | Conversion-Focused | Primary CTA in Hero, Features, How It Works, Benefits, and Final CTA all route to `/register`; secondary/Login → `/login`. Zero dead links (every anchor resolves). |
| L2 | Clarity & Immediate Impact | Hero states product + 15-second value proposition + primary action above the fold; section headings are plain-language (`dash-num` scale); no jargon. |
| L3 | Visual Consistency | Uses the dark + green token set only (`--color-bg`, `--color-accent`, panel/glow tokens, `gradient-primary`); landing root pins the dark palette so guests never see a stale light-theme override. |
| L4 | Modern & Premium | Subtle framer-motion reveals (`useInView`), hero glow ring composition, `opacity/transform` only; no janky scrolling behaviors. |
| L5 | Mobile-First Responsive | Components built mobile-first; grid stacks below sm; hero CTAs full-width below md; verified at 360px/768px/1440px (quickstart). |
| L6 | Performance & Lightweight Animation | CSS scroll/glow micro-animations + a few framer-motion `useInView` reveals; hero is CSS/SVG (no images, no video) → LCP < 2.5s. |
| L7 | Authentic Content | All claims true to the product (stats/tracking features from real screens); testimonials are illustrative spins labeled as such in the content module. |
| L8 | Content Maintainability | All copy + CTA targets + stats + testimonials in `frontend/src/data/landingContent.js` (data-only, no JSX); pages/components contain zero hard-coded marketing copy/links. |
| L9 | Additive & Non-Destructive | Public route added — `/` stays the protected Dashboard, `/login`/`/register` untouched, `*` catch-all unchanged. `App.jsx` wiring: top-level `<Route path="/landing" element={<PublicOnly><Landing /></PublicOnly>} />`; `PublicOnly` (existing) redirects authenticated users to `/`. |
| V | JS-only (Day 6.1) | All new files `.js`/`.jsx`; no TypeScript. |
| A7/D6 | No new npm deps | Only bundled framer-motion + lucide-react + Tailwind + existing ui primitives. |
| D8/A9 | No horizontal scroll | `overflow-x: clip` on landing root; no fixed-width elements; verified at 3 breakpoints. |
| DoD-12 | SEO | `index.html` gains descriptive `<title>` + `<meta name="description">`; semantic HTML (`header`, `main`, `section`, `footer`). |

**Complexity Tracking**: No violations — zero new dependencies, zero new routes beyond one additive public route, zero backend surface. (Table intentionally empty.)

## Project Structure

### Documentation (this feature)

```text
specs/012-landing-page/
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
├── index.html           # MODIFIED: descriptive <title> + <meta name="description">
└── src/
    ├── App.jsx          # MODIFIED: + one top-level public route `/landing`
    ├── index.css        # MODIFIED (additive): landing tokens/utilities, scroll-behavior + reduced-motion guard
    ├── data/
    │   └── landingContent.js   # NEW: single data-only content source (L8)
    ├── components/
    │   └── landing/    # NEW: 1 page wrapper + 6 section + 3 shared components
    │       ├── LandingPage.jsx      # Page wrapper: semantic shell, header/main/footer
    │       ├── LandingNavbar.jsx    # Sticky nav, brand, anchor links, CTA
    │       ├── HeroSection.jsx      # Headline + subhead + CTAs + hero visual
    │       ├── FeaturesSection.jsx  # 6 feature cards
    │       ├── HowItWorksSection.jsx# 3 steps
    │       ├── StatsSection.jsx     # Animated stat band (reuses ui/Counter)
    │       ├── BenefitsSection.jsx  # Benefit list/columns
    │       ├── TestimonialsSection.jsx # 3 testimonial cards
    │       ├── FinalCtaSection.jsx  # Conversion CTA band
    │       ├── LandingFooter.jsx    # Footer links + legal line
    │       ├── LandingLink.jsx      # SHARED: renders CTA from { label, to, variant }
    │       └── Reveal.jsx           # SHARED: framer-motion useInView wrapper (respects reduced motion)
    └── pages/
        └── Landing.jsx   # NEW: thin page that composes <LandingPage/>
```

**Structure Decision**: Web app, frontend-only. Follows the existing monorepo convention (`frontend/src/components/landing/` mirrors `components/reports/` and `components/dashboard/`). All marketing copy lives in `data/landingContent.js` per L8; components are dumb renderers. No `backend/` changes at all.

## Phase 0: Research

Full write-up in [research.md](./research.md). Key resolutions:

1. **Route wiring (L9)**: top-level public route `/landing`, wrapped in the **existing** `PublicOnly` component → authenticated users are redirected to `/`. `App.jsx` gains exactly one line; no other route touched.
2. **Content source (L8)**: `frontend/src/data/landingContent.js` — plain-JS data module (no JSX) exporting `{ brand, navLinks, hero, features, howItWorks, stats, benefits, testimonials, finalCta, footer }`. CTA targets are `'/register'` / `'/login'` string literals defined once in this module.
3. **Animation**: bundled framer-motion only. `Reveal.jsx` wraps `useInView` + `whileInView` opacity/transform; `useReducedMotion()` short-circuits to no animation. Hero uses a CSS/SVG glow ring composition (no images/video) — validates LCP budget.
4. **Dark identity for guests**: landing root applies the dark token set unconditionally (public page, pre-login; ignores any persisted light-theme preference).
5. **SEO**: static edit to `frontend/index.html` — descriptive title + meta description (SPA has no per-route head manager).
6. **Smooth scroll**: `html { scroll-behavior: smooth }` + `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` in `index.css`.
7. **No API contracts**: landing is public/static → `contracts/README.md` documents N/A explicitly (Phase 1).

### Best Practices Found

- Reuse `ui/Counter.jsx` (framer-motion `useInView` count-up) for the stats band — already built, zero new code.
- Reuse `ui/Button.jsx` variants (`primary`/`outline`) + `lucide-react` icons (already bundled) inside `LandingLink.jsx`.
- Anchor links (`#features`, `#how-it-works`, etc.) + CSS smooth scroll; footer + nav use identical anchors so section ids live once in content module.
- Testimonial fantasy-label ("illustrative") per spec EC-2; another story shares a name per EC-1.

## Phase 1: Design & Contracts

### Data Model (data-model.md)

No Mongoose models — [data-model.md](./data-model.md) specifies the **content schema** for `landingContent.js` (PageContent, NavLink, CTA, FeatureItem, Step, Statistic, BenefitItem, Testimonial, FooterLink) with field types. This is a frontend data contract, not persistence.

### API Contracts (contracts/)

None — [contracts/README.md](./contracts/README.md) documents that the landing page is public, requires no REST endpoints, and touches no auth middleware. Zero backend changes.

### Frontend Design

- **Route**: `/landing` (public, top-level); authed → redirect `/`. CTA targets from `landingContent.js`.
- **Page composition**: `Landing.jsx` → `<LandingPage/>` renders semantic `<header> <main> <footer>` shell with the 9 sections in spec-mandated order.
- **Sections & content keys**: Navbar (brand + 4 anchors + Login link + "Get started" CTA) · Hero (eyebrow, H1, subhead, 2 CTAs, hero visual) · Features (6 cards) · How It Works (3 steps) · Statistics (4 animated stats via `Counter`) · Benefits (6 items, 2-col) · Testimonials (3 cards, `illustrative: true`) · Final CTA (headline + register CTA) · Footer (brand, anchor links, legal line).
- **State management**: none needed — static content module; Router `Link` for navigation.

### Quickstart Verification

Full steps + LCP timing table in [quickstart.md](./quickstart.md). Flow: `npm run build` → serve → check `/landing` sections/CTAs → check authed redirect → responsive (360/768/1440) → reduced-motion → LCP timing ≥2 samples.

## Phase 2: Task Breakdown (for /sp.tasks)

Tasks will be parallel where safe:

### Group 1: Content & Foundation
- T01: Create `data/landingContent.js` (nav, hero, features, how-it-works, stats, benefits, testimonials, final CTA, footer data)
- T02: Create `components/landing/LandingPage.jsx` + `Reveal.jsx` + `LandingLink.jsx` shared primitives
- T03: Additive CSS in `index.css` (landing tokens/utilities, scroll-behavior + reduced-motion guard, overflow clip)

### Group 2: Sections
- T04: `LandingNavbar.jsx` + `HeroSection.jsx` (hero visual ring composition; primary CTA → `/register`)
- T05: `FeaturesSection.jsx` + `HowItWorksSection.jsx`
- T06: `StatsSection.jsx` (Counter reuse) + `BenefitsSection.jsx`
- T07: `TestimonialsSection.jsx` + `FinalCtaSection.jsx` + `LandingFooter.jsx`

### Group 3: Integration & Polish
- T08: `pages/Landing.jsx` + one route line in `App.jsx` (PublicOnly) + subtitle/meta in `index.html`
- T09: Accessibility pass (semantic landmarks, focus order, aria-labels, reduced-motion)
- T10: Responsive verification at 3 breakpoints; CTA click-through audit
- T11: Performance verification (LCP timing) + `npm run build` gate + record in quickstart.md

## Risks & Unknowns

| Risk | Mitigation | Status |
|------|------------|--------|
| L9 conflict (moving /, /login, /register) | Landing is a NEW additive `/landing` route; those routes untouched; git-diff audit in T08 | MITIGATED |
| Light theme leaking into public page | Landing root pins dark token set unconditionally; visual check in quickstart | MITIGATED |
| LCP miss from animation/glow work | No images/video; CSS/SVG hero; reveals are `useInView`-gated; ≥2 timing samples in quickstart | MITIGATED |
| Copy drift between page and content module | All copy/links live ONLY in `landingContent.js` (L8); zero hard-coded copy in components | MITIGATED |
| Horizontal scroll at 360px | `overflow-x: clip` + mobile-first layout; verified at 3 breakpoints | MITIGATED |
| Reduced-motion violations | `Reveal` uses `useReducedMotion`; CSS smooth-scroll guard; verified in quickstart step 8 | MITIGATED |

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` after plan creation to record the landing feature (public `/landing` route, `data/landingContent.js` single content source, `components/landing/*`, zero new deps, no backend) in AGENTS.md.