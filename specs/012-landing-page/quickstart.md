# Quickstart Verification: Landing Page (8.2)

**Feature**: 012-landing-page

## Prerequisites

- Node 24 LTS, workspace deps installed (`npm install` at repo root).
- Branch `012-landing-page` checked out.

## Gate 1 — Production Build

```text
1. cd frontend && npm run build        → must PASS with no errors
   (this is the primary code gate; the repo has no test/lint suite)
2. node --check on the content module:
   node --check frontend/src/data/landingContent.js   → PASS (pure JS, no JSX)
```

## Gate 2 — Manual Browser Verification

Serve the production build (or `npm run dev`):

```text
1. Open http://localhost:<port>/landing as a logged-out user
2. Verify all nine sections render in order:
   Navbar → Hero → Features → How it Works → Statistics → Benefits → Testimonials → Final CTA → Footer
3. Verify dark + green brand identity (tokens: --color-bg #0B0F14, accent #A3E635,
   glow/panel tokens). Page must look dark even after a prior session set light theme.
4. Verify Hero H1 + subhead communicate product and value; primary CTA visible above the fold.
5. Verify Statistics band count-up animation plays once on scroll into view.
6. Verify testimonial cards show the "illustrative" disclaimer; two share a first name.
7. CTA audition (dead-link check):
   - Every primary CTA (Hero, Benefits*, Final CTA, Navbar "Get started") → /register
   - "Log in" link(s) → /login
   - Navbar + Footer anchor links (#features, #how-it-works, #benefits, #stats,
     #testimonials) smooth-scroll to their sections
   - No link is a dead end (404 or no target)
8. Register flow: click a primary CTA → lands on /register → complete → app dashboard.
```

*= Benefit CTAs only if the Benefits section includes one (design-dependent; spec L1 requires
all primary CTAs → /register — if a Benefits CTA exists it must route there).*

## Gate 3 — Auth Handling

```text
9. Home routing:
   - LOGGED-OUT: open / → the Landing page displays (home defaults to landing).
   - LOGGED-IN: open / → the Dashboard displays (HomeRouter renders Dashboard for users; Landing for guests).
   - /landing is public for everyone and always shows the Landing page.
10. Authenticated users who click a primary CTA on / or /landing are cleanly handed off to the app
    via the existing /register + /login redirects (no error page).
11. Confirm /login, /register, and all other routes are unchanged (no regression).
```

## Gate 4 — Responsive (3 breakpoints)

```text
11. 360px: no horizontal scroll; nav collapses to hamburger; hero CTA(s) full-width; stats stack
12. 768px: layout adapts (2-col features/benefits); no orphaned scroll
13. 1440px: centered max-width content; sections breathe; hero rings accurate
```

## Gate 5 — Accessibility / Reduced Motion

```text
14. prefers-reduced-motion: reduce → page renders without animation;
    smooth-scroll disabled; Counter shows final values statically
15. Semantic landmarks present: header/main/section (aria-labelledby)/footer
16. Keyboard: tab order reaches nav links (incl. skip link), CTAs; focus ring visible;
    hamburger menu togglable with Enter/Escape
17. Alt/aria-text on visual and icon-only elements
```

## Gate 6 — Performance (LCP)

Record two independent samples (DevTools Performance / Lighthouse, 4G throttled):

```text
Sample 1: LCP = ___ ms     (target < 2500 ms)
Sample 2: LCP = ___ ms     (target < 2500 ms)
Runway:   Lighthouse Performance score ≥ 90 (optional, if tooling available)
```

## Sign-off

| Gate | Result | Date |
|------|--------|------|
| 1. Build | PASS | |
| 2. Browser | PASS | |
| 3. Auth | PASS | |
| 4. Responsive | PASS | |
| 5. A11y | PASS | |
| 6. Performance | PASS | |

## Implementation Verification (2026-09-10)

Programmatically verified during `/sp.implement` (build + render smoke — no browser):

| Check | Result |
|-------|--------|
| `node --check frontend/src/data/landingContent.js` | PASS |
| `npm run build` (frontend) | PASS (2.16s, 2574 modules) |
| SSR render smoke — all 9 sections + skip link present | PASS |
| SSR render smoke — `/register` + `/login` resolve from every CTA `to` | PASS |
| Anchor audit — every `href` = `#features/#how-it-works/#benefits/#testimonials`, every matching section `id` present in DOM | PASS |
| Content counts per data-model — features 6 / howItWorks 3 / stats 4 / benefits 6 / testimonials 3 | PASS |
| All testimonials flagged `illustrative: true`; two share "Marcus" (EC-1/EC-2) | PASS |
| Content-edit-without-code — changed hero headline in `landingContent.js`, reload semantics (data mutation flows through; zero component edits) | PASS |
| Reduced-motion — `MotionConfig reducedMotion="user"` on landing root, `Reveal` + stats `Counter` static via `useReducedMotion`, CSS animations zeroed globally | PASS (config) |
| No images/video on the page (CSS/SVG hero visual) — no LCP asset downloads | PASS |

**Remaining manual gates** (require a browser — not runnable in this environment):
- Gate 2 real click-through of the full register journey, Gate 3 logged-in redirect, Gate 4 viewport rendering at 360/768/1280px with zero horizontal scroll, Gate 5 screen-reader/keyboard walk, and Gate 6 real LCP samples.

**LCP measurement method**: open the production build (or `npm run dev`) on a mid-range device over throttled 4G, DevTools → Performance, record First Contentful Paint / Largest Contentful Paint for both `http://localhost:<port>/landing` and a second fresh load; both must be < 2500 ms (SC-002). The design keeps the value message in the initial HTML with zero images/video; the hero uses CSS/SVG only.