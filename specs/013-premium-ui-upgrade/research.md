# Research: Premium UI/UX Upgrade (013-premium-ui-upgrade)

**Stage**: /sp.plan — Phase 0 (Outline & Research)
**Date**: 2026-09-10
**Source**: constitution v4.0.0 Day 8.3 (PU1-PU6 + design-system rules), spec.md (013), live repo inspection (index.css tokens, ui primitives, layout files, page inventory)

## Research Questions

There were **no `NEEDS CLARIFICATION` unknowns** in Technical Context — the constitution already pins every design decision (canonical palette, token-only rule, semantic-green rule, spacing/radius/type/motion standards, navigation rules, out-of-scope bounds). Research therefore verified the **ground truth of the codebase** and finalized variant hexes + integration mechanics. Findings are recorded as Decision / Rationale / Alternatives for each.

## Findings

### 1. Exact current lime surface to replace

| Location | Current value | Target |
|----------|---------------|--------|
| index.css:5 `--color-primary` | `#A3E635` lime | `#F97316` orange |
| index.css:6 `--color-primary-light` | `#BEF264` | `#FB923C` |
| index.css:7 `--color-primary-dark` | `#84CC16` | `#EA580C` |
| index.css:8-11 `--color-primary-50/100/200/glow` | lime rgba(163,230,53,*) | orange rgba(249,115,22,*) |
| index.css:26 `--color-success` | `#22C55E` | **KEEP (semantic only)** |
| index.css:31-33 `--color-accent/-light/-dark` | lime family | orange family |
| index.css:34 `--color-accent-glow` | rgba(163,230,53,0.25) | rgba(249,115,22,0.25) |
| components/analytics/TrendIndicator.jsx:28 | `text-[#F87171]` (red, raw literal) | `--color-trend-negative` token |
| index.css:84-130, 442 `[data-theme="light"]` block | uses lime-derived values | remap to darker orange for contrast |

- **Decision**: Replace flatten `--color-primary*` and `--color-accent*` both with the same vibrant-orange family (the primary family becomes an **alias** of the accent family so no component sees two accents). Add semantic `--color-trend-negative` (≈ `#F87171`) to absorb the only raw arbitrary hex in JSX. Keep `--color-success` untouched for on-track/surplus status meaning only.
- **Rationale**: PU2 requires zero leftover green/lime *and* zero scattered hex codes. Aliaising preserves Tailwind `primary-*` utility consumers (`bg-primary`, `text-accent` etc.) while guaranteeing one accent hue.
- **Alternatives considered**: (a) Remove `--color-primary*` entirely and migrate all Tailsweep primary utilities — higher churn, more component edits, same visual result (rejected). (b) Keep `--color-success` and repoint nav/trend into it — would conflate status semantics with decorative intent, violating PU2 (rejected).

### 2. Canonical orange family (finalized in this plan)

```css
--color-accent: #F97316;                    /* primary accent — vibrant orange (Tailwind orange-500) */
--color-accent-light: #FB923C;              /* hover / lighter */
--color-accent-dark: #EA580C;               /* pressed / darker */
--color-accent-glow: rgba(249, 115, 22, 0.25);
```

- **Decision**: Pin the constitution's canonical hexes verbatim; derive light/dark/glow from it.
- **Rationale**: Matches Day 8.3's canonical-palette block exactly; all variants are within the vibrant-orange family and derive from the accent token as required.
- **Alternatives**: orange-400 `#FB923C` as base (too light on deep black for text), orange-600 `#EA580C` as base (duller; loses vibrancy). Rejected.

### 3. Near-black background

- **Decision**: Keep `--color-bg: #0B0F14` (already a deep near-black) plus the existing `--color-panel*` / `--color-line` / ink tokens. Do not introduce a new background token.
- **Rationale**: PU5 requires readable contrast — the validated surface/line/ink pair already delivers it; re-tuning the base adds churn with no user-visible gain.
- **Alternatives**: `#000000` / `#050505` true-black (rejected: loses surface separation from panels), `#0A0A0A` (rejected: near-identical to current, not worth the risk).

### 4. Light-theme parity (Day 7.1 scheme, no third theme)

- **Decision**: Remap the existing `[data-theme="light"]` overrides to the orange family, using a darker orange for on-light contrast: accent base `#EA580C`, hover `#C2410C`, glow stays translucent orange. Backgrounds/surfaces of the light scheme keep their existing light values (or orange-hinted tint only).
- **Rationale**: Day 7.1 mandates exactly two schemes (dark + optional light); out-of-scope rule forbids a third. The upgrade restyles BOTH schemes to the orange accent family only.
- **Alternatives**: Keep light scheme on lime (violates PU2 "zero mixed color systems"); drop the light scheme (violates Day 7.1). Both rejected.

### 5. Motion system (standardized, GPU-friendly, reduced-motion)

- **Decision**: Add one motion-token block to `@theme` — `--duration-fast: 150ms`, `--duration-base: 200ms`, `--duration-slow: 300ms`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — and route all transitions through it. Reuse the existing keyframes (`fade-in`, `slide-up`, `slide-down`, `scale-in`, `pulse-slow`, `skeleton-shimmer`) and the existing global `prefers-reduced-motion` guard (index.css:206-210) without duplication.
- **Rationale**: PU4 — transform/opacity only, consistent micro-interactions, motion collapsed under reduced-motion. The existing guard already collapses every animation/transition site-wide; reusing it means new motion inherits the guarantee for free.
- **Alternatives**: Introduce framer-motion for micro-interactions (rejected: CSS is cheaper and the guard already works), or per-component transition values (rejected: violates PU3 token discipline).

### 6. Spacing, radius, shadow, type scales

- **Decision**: Keep the 4px-based Tailwind spacing scale and the existing radius/shadow families (index.css:38-47), add a **hover-lift shadow token**, and tokenize the **type scale** (display/heading/subheading/body/caption) over the existing Barlow / Barlow Condensed pairing. `dash-num` stat figures and numeric formatting rules stay.
- **Rationale**: PU3/PU5 — one scale, defined once, referenced everywhere; type hierarchy is the readability lever on deep black.
- **Alternatives**: New custom spacing values per page (rejected: no single source), a new font (rejected: zero-dep + existing fonts are good).

### 7. Navigation modernization bounds

- **Decision**: Restyle `components/layout/Sidebar.jsx`, `TopNavbar.jsx`, `DashboardLayout.jsx` **in place**: refined brand block, orange active indicator, hover/focus states, preserved badges (e.g. unread count) and labels. Structure, routes, entries, and responsive rail/drawer behaviour (D8) unchanged.
- **Rationale**: Navigation rules — active state obvious, no entry/route removed/hidden/repurposed (ST7/R3/L9 additivity).
- **Alternatives**: Rebuild sidebar shell (rejected: violates no-structure-change + no-route-change rules).

### 8. Verifiability (no automated visual-regression suite)

- **Decision**: Gates = grep literal audits + `npm run build` + manual browser walk-through recorded in quickstart.md (per DoD-11), exactly as prior days. No CI/visual-diff infra (explicitly out of scope).
- **Rationale**: Out-of-scope rule lists automated visual-regression and CI as deferred; manual verification suffices per prior-day convention.
- **Alternatives**: Add a visual-test dependency (rejected: zero-new-deps rule + out-of-scope).

## Consolidated Decisions

All resolved; zero `[NEEDS CLARIFICATION]` markers remain. Full token/model details in [data-model.md](./data-model.md); verification steps in [quickstart.md](./quickstart.md).