# Data Model: Landing Page (8.2)

**Date**: 2026-09-10
**Feature**: 012-landing-page

## Scope

No persistence. The landing page owns **no MongoDB collections, no Mongoose models, and no server-side records.** This document specifies the **frontend content schema** for the single data-only source `frontend/src/data/landingContent.js` (constitution L8).

The schema is a reference/contract for the tasks that consume it — components read these records; they never manufacture or duplicate marketing copy.

## Entities

### 1. `PageContent` (root export)

```js
{
  brand: Brand,
  navbar: NavbarContent,
  hero: HeroContent,
  features: FeatureItem[],     // exactly 6
  howItWorks: Step[],          // exactly 3
  stats: Statistic[],          // exactly 4
  benefits: BenefitItem[],     // exactly 6
  testimonials: Testimonial[], // exactly 3
  finalCta: FinalCtaContent,
  footer: FooterContent,
}
```

### 2. `Brand`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | "FitTrack" |
| `tagline` | string | short brand line for footer/nav |
| `ariaLabel` | string | brand link a11y text |

### 3. `CTA` (shared shape, used by hero/finalCta/nav)

| Field | Type | Notes |
|-------|------|-------|
| `label` | string | button text |
| `to` | string | route **or** in-page anchor (`'/register'`, `'/login'`, `'#features'`) — defined once here |
| `variant` | 'primary' \| 'outline' | maps to existing `ui/Button` variants |

*`LOGIN_PATH = '/login'` and `REGISTER_PATH = '/register'` literals defined once at the top of the module for reuse.*

### 4. `NavbarContent`

| Field | Type | Notes |
|-------|------|-------|
| `links` | NavLink[] | 4 anchors: Features, How it works, Benefits, Testimonials |
| `cta` | CTA | "Get started" → `/register` |
| `login` | CTA | "Log in" → `/login` |

### 5. `NavLink`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | anchor id also used for scroll target |
| `label` | string | nav text |
| `href` | string | `#<id>` |

### 6. `HeroContent`

| Field | Type | Notes |
|-------|------|-------|
| `eyebrow` | string | small uppercase kicker |
| `title` | string | H1 (rendered with brand/glow emphasis) |
| `subhead` | string | value proposition |
| `primaryCta` | CTA | → `/register` |
| `secondaryCta` | CTA | → `/login` or "See how it works" → `#how-it-works` |
| `visual` | { label, rings, chip } | CSS/SVG composition descriptors |

### 7. `FeatureItem`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | feature name |
| `description` | string | 1–2 sentence, feature-true |
| `icon` | string | lucide-react icon key, resolved via an icon map |

### 8. `Step`

| Field | Type | Notes |
|-------|------|-------|
| `step` | string | "01" | "02" | "03" |
| `title` | string | action headline |
| `description` | string | how it works text |

### 9. `Statistic`

| Field | Type | Notes |
|-------|------|-------|
| `prefix` | string | optional, e.g. "$" |
| `value` | number | digits animated by `ui/Counter` |
| `decimals` | number | 0 unless required |
| `suffix` | string | e.g. "%", "k", "min" |
| `label` | string | caption under stat |

*Values are marketing-plausible and feature-driven (L7); counter animation reuses `ui/Counter.jsx`.*

### 10. `BenefitItem`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | benefit headline |
| `points` | string[] | bullet list (2–3) |

### 11. `Testimonial`

| Field | Type | Notes |
|-------|------|-------|
| `quote` | string | testimonial text |
| `name` | string | persona name (EC-1: two share a first name) |
| `role` | string | persona descriptor, e.g. "Runner" |
| `illustrative` | boolean | always `true` (fantasy personas per EC-2) |

### 12. `FinalCtaContent`

| Field | Type | Notes |
|-------|------|-------|
| `eyebrow` | string | optional kicker |
| `headline` | string | H2 |
| `subhead` | string | supporting line |
| `primaryCta` | CTA | → `/register` |

### 13. `FooterContent`

| Field | Type | Notes |
|-------|------|-------|
| `about` | string | brand blurb |
| `navLinks` | NavLink[] | repeats page anchors |
| `legal` | string | legal line, e.g. year + brand |

## Validation Rules (content sanity checks)

- `features.length === 6`, `howItWorks.length === 3`, `stats.length === 4`, `benefits.length === 6`, `testimonials.length === 3`.
- Every `CTA.to` is `'/register'`, `'/login'`, or a `#id` present in the rendered page.
- Every `NavLink.href` matches the document anchor of the corresponding `section`.
- `testimonials[].illustrative === true` (all are fantasy personas).
- No component hard-codes copy or routes (enforced via review; single source of truth).

## Non-Changes

- No new/staged Mongoose models.
- No changes to `users`, `workouts`, `nutrition`, `notifications`, or `notificationsettings` collections.
- No API payloads.