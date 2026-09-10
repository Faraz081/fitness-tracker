---
description: "Task list for the Landing Page feature (012-landing-page)"
---

# Tasks: Landing Page

**Input**: Design documents from `/specs/012-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md, contracts/README.md

**Tests**: No automated test suite exists in this repo. Gates are `node --check` on the content module, `npm run build` (frontend), and the manual browser/reduced-motion/responsive/LCP checks in `specs/012-landing-page/quickstart.md`. Per-phases "Independent Test" lines below are the manual verification for each story.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US4 from spec.md)
- Include exact file paths in descriptions

## Mapping to /sp.tasks request

The user-supplied section order (1 Foundation → 2 Navbar → 3 Hero → 4 Core Content → 5 Trust & Conversion → 6 Polish) is honored **within** the story-based phases the spec mandates:

| User request section | Where it lands |
|----------------------|----------------|
| 1. Foundation (route, layout shell, visual base, responsiveness) | Phase 1 Setup + Phase 2 Foundational |
| 2. Navbar + sticky + CTA | US2 (T016) + mobile menu in US4 (T022-T023) |
| 3. Hero + CTAs + visual + animation | US1 (T010) |
| 4. Features / How-it-Works / Stats / Benefits | Features+Benefits US1 (T011-T012) · How-it-Works US2 (T015) · Stats US3 (T019) |
| 5. Testimonials / Final CTA / Footer | Testimonials US3 (T020) · Final CTA US1 (T013) · Footer Polish (T033) |
| 6. Smooth scroll, polish, performance, responsive, review | Phase 7 Polish (T026-T033) + US4 responsiveness |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Create `frontend/src/components/landing/` directory per the plan structure (source tree in `specs/012-landing-page/plan.md#project-structure`)
- [X] T002 [P] Verify `framer-motion` and `lucide-react` are already in `frontend/package.json` dependencies (Day 4.1 A7 / Day 7.1 D6: zero new npm deps — no `npm install` permitted)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All tasks here touch distinct files → safe to parallelize.

- [X] T003 [P] Create `frontend/src/data/landingContent.js` — single data-only content source (L8) exporting `landingContent` with `brand`, `navbar` (4 anchor links), `hero` (eyebrow/title/subhead/primaryCta/secondaryCta/visual), `features` (exactly 6), `howItWorks` (exactly 3), `stats` (exactly 4, each with prefix/value/decimals/suffix/label), `benefits` (exactly 6), `testimonials` (exactly 3, each `illustrative: true`; two share a first name per EC-1), `finalCta`, `footer`. Define `REGISTER_PATH = '/register'` and `LOGIN_PATH = '/login'` literals once and reuse in every CTA `to` (research#3, data-model.md). Taboo: no JSX, no React imports.
- [X] T004 [P] Create `frontend/src/components/landing/Reveal.jsx` — shared framer-motion wrapper using `useInView` + `whileInView` (opacity/transform only); `useReducedMotion()` short-circuits to a plain div (research#4, L6)
- [X] T005 [P] Create `frontend/src/components/landing/LandingLink.jsx` — renders a React Router `Link` + `ui/Button` from a content record `{ label, to, variant }`; supports `'/register'`/`'/login'` routes or `'#anchor'` in-page targets (research#3)
- [X] T006 [P] Add additive landing styles to `frontend/src/index.css` — landing root utilities (pin dark palette for guests), `overflow-x: clip`, `html { scroll-behavior: smooth }` + `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` guard (research#4-5); reuse tokens `--color-bg`, `--color-accent`, panel/glow tokens (L3, D8/A9)
- [X] T007 [P] Create `frontend/src/pages/Landing.jsx` (thin) + `frontend/src/components/landing/LandingPage.jsx` (semantic shell: `<header>`/`<main>`/`<footer>` landmarks) with nine section slots in spec order — navbar, hero, features, howItWorks, stats, benefits, testimonials, finalCta, footer (FR-002, FR-024). Placeholder slots; each story phase wires its sections.
- [X] T008 Add public top-level route to `frontend/src/App.jsx`: `<Route path="/landing" element={<PublicOnly><Landing /></PublicOnly>} />` using the EXISTING `PublicOnly` (authenticated users → redirect `/`). No other route modified; `/`, `/login`, `/register`, `*` catch-all untouched (L9, FR-001; research#1)
- [X] T009 [P] Add descriptive `<title>` + `<meta name="description">` to `frontend/index.html` (SEO; FR-024, DoD-12; research#6)

**Checkpoint**: Public route renders an empty semantic shell on `/landing`; authed users redirect to `/`; no new dependencies.

---

## Phase 3: User Story 1 - First-Time Visitor Signs Up (Priority: P1) 🎯 MVP

**Goal**: Guest opens `/landing`, the hero immediately communicates FitTrack's value, primary CTAs (hero + final CTA) route to `/register`, and Features/Benefits reinforce the offer.

**Independent Test** (quickstart Gate 2 steps 1-8): load `/landing` logged-out → hero headline + subhead + visible primary CTA above the fold; click the hero + final CTA primary buttons → land on `/register` with a valid registration journey; Features (6 cards) and Benefits (6 items, outcome-driven) render; the page delivers conversion without navbar/stats/testimonials present.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `frontend/src/components/landing/HeroSection.jsx` — eyebrow, H1, subhead (value proposition), primary CTA → `/register` + secondary CTA (Login → `/login`), CSS/SVG animated glow-ring visual composition (opacity/position only, no images/video; research#4) — content from `landingContent.hero`
- [X] T011 [P] [US1] Create `frontend/src/components/landing/FeaturesSection.jsx` — 6 icon + description cards from `landingContent.features` in a responsive grid/card layout (lucide icon map resolved from content icon keys; FR-005)
- [X] T012 [P] [US1] Create `frontend/src/components/landing/BenefitsSection.jsx` — 6 outcome-focused benefit items from `landingContent.benefits`, 2-column, benefit-driven not feature-listing (FR-008)
- [X] T013 [P] [US1] Create `frontend/src/components/landing/FinalCtaSection.jsx` — value restatement + prominent closing sign-up CTA → `/register` from `landingContent.finalCta` (FR-010)
- [X] T014 [US1] Mount T010-T013 sections into `frontend/src/components/landing/LandingPage.jsx` slots (hero → features → benefits → finalCta) in spec narrative order; confirm every primary CTA resolves to `/register` (depends on T010-T013)

**Checkpoint**: US1 fully functional — guest sees hero value message and completes the sign-up path from hero and final CTA (MVP box above).

---

## Phase 4: User Story 2 - Product Explorer Navigates the Story (Priority: P2)

**Goal**: Sticky navbar with brand, on-page anchor links, Login + primary CTA; How-It-Works explains the 3-step value path; internal links smooth-scroll to matching sections.

**Independent Test** (quickstart Gate 2 step 7/8): click every navbar link → page smooth-scrolls to the matching section with the heading in view; How-It-Works shows 3 simple steps with a clear visual flow; Features cards already render their core capabilities (from US1).

### Implementation for User Story 2

- [X] T015 [P] [US2] Create `frontend/src/components/landing/HowItWorksSection.jsx` — 3 numbered steps from `landingContent.howItWorks` with a clear visual flow (FR-006)
- [X] T016 [P] [US2] Create `frontend/src/components/landing/LandingNavbar.jsx` — sticky/fixed, FitTrack brand, 4 anchor links from `landingContent.navbar.links` (`#features`, `#how-it-works`, `#benefits`, `#testimonials`), Login link → `/login`, primary CTA → `/register` (FR-003, FR-012)
- [X] T017 [US2] Mount navbar + How-It-Works into `frontend/src/components/landing/LandingPage.jsx`; align section `id`s so every `landingContent` anchor resolves (FR-013); CSS smooth scroll already enabled (T006)
- [X] T018 [US2] Browser-verify SC-008: every navbar anchor smooth-scrolls to its section with heading in view; no dead anchors

**Checkpoint**: US1 + US2 both work — visitor can self-serve the product story via sticky nav.

---

## Phase 5: User Story 3 - Visitor Builds Trust (Priority: P2)

**Goal**: Statistics band and Testimonials provide honest, clearly-labelled social proof that reduces sign-up hesitation.

**Independent Test** (quickstart Gate 2 step 6): all 4 statistics are feature-true values or visibly labelled illustrative; each of the 3 testimonials shows a quote + name + short context, all marked illustrative with a visible disclaimer; no fabricated-as-real claims (L7, FR-021).

### Implementation for User Story 3

- [X] T019 [P] [US3] Create `frontend/src/components/landing/StatsSection.jsx` — 4-stat band from `landingContent.stats` reusing `ui/Counter.jsx` count-up, consistent readable format + provenance handling (illustrative labelled) (FR-007, FR-021)
- [X] T020 [P] [US3] Create `frontend/src/components/landing/TestimonialsSection.jsx` — 3 quote cards from `landingContent.testimonials` (quote, name, role context); render the EC-2 bracketed disclaimer for illustrative entries (FR-009)
- [X] T021 [US3] Mount stats + testimonials into `frontend/src/components/landing/LandingPage.jsx` in spec order (after benefits); include the illustrative footnote element; verify both trust sections render and no overclaims present (FR-021)

**Checkpoint**: US1, US2, US3 all independent and working — trust layer complete.

---

## Phase 6: User Story 4 - Mobile and Tablet Visitor Converts (Priority: P3)

**Goal**: Mobile/tablet experience is fully responsive: no horizontal scroll, clean stacking, accessible collapsible navbar, tappable CTAs; identical sign-up journey to desktop.

**Independent Test** (quickstart Gate 4): complete every CTA + navigation flow at 360px, ≈768px, ≥1280px; zero horizontal scroll; mobile navbar collapses to an accessible menu whose links/CTA are large, tappable, and close the menu on selection.

### Implementation for User Story 4

- [X] T022 [US4] Create `frontend/src/components/landing/MobileNavMenu.jsx` — accessible collapsible panel (large tap targets ≥44px, closes on link/CTA selection, focus management, Escape to close) (FR-018, SC-009)
- [X] T023 [US4] Integrate the mobile menu toggle into `frontend/src/components/landing/LandingNavbar.jsx` — hamburger button with `aria-expanded`/`aria-controls`, live-region state announcement, sensible focus order (FR-023)
- [X] T024 [US4] Mobile-first polish: verify sections stack cleanly, CTAs are full-width/tappable, grids/gutters adapt at ≤430px, ≈768px, ≥1280px with zero horizontal scroll (FR-017, D8/A9)
- [X] T025 [US4] Verify the full sign-up journey at all 3 breakpoints (nav + primary CTA flows; SC-003) and record results in `specs/012-landing-page/quickstart.md`

**Checkpoint**: All four user stories independently functional; conversion path works for the full traffic mix.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, performance, SEO/conversion review across all stories; final gates.

- [X] T026 [P] Accessibility pass — keyboard-only + screen-reader verification on `/landing` (one primary heading, landmark order, labelled controls, focus-visible indicators, skip link, live menu announcements; FR-023/024, SC-009); fix issues in `frontend/src/components/landing/*`
- [X] T027 [P] Reduced-motion verification — with OS `prefers-reduced-motion: reduce`, page shows complete static content, no animation, smooth-scroll disabled, `Counter` renders final values (FR-016, SC-004); fix in `Reveal.jsx`/`index.css` if needed
- [X] T028 [P] Performance — measure LCP on `/landing`, 2 samples, target < 2.5s; confirm no images/video/render-blocking (SC-002); record timing table in `specs/012-landing-page/quickstart.md`
- [X] T029 [P] Content-edit-without-code check — change one headline, one statistic, one CTA target in `frontend/src/data/landingContent.js` → reload renders updated content with zero code/component changes (FR-020, SC-005); revert content after
- [X] T030 [P] Responsive + no-horizontal-scroll regression — re-verify ≥1280px wide and very narrow windows; content readable, no overflow, no off-screen controls (spec edge cases)
- [X] T031 [P] Conversion/CTA audit — every primary CTA (hero/final CTA/navbar) → `/register`, every Login → `/login`, zero dead links/anchors; authenticated-visitor CTA click → clean redirect to app, never an error page (FR-012/013, SC-001, edge case 1)
- [X] T032 [P] Gates — `node --check frontend/src/data/landingContent.js` PASS; `cd frontend && npm run build` PASS; complete the `specs/012-landing-page/quickstart.md` sign-off table (all 6 gates PASS)
- [X] T033 Create `frontend/src/components/landing/LandingFooter.jsx` — brand, about blurb, anchor links, legal line (year + brand), Login / Sign up links (FR-011); mount in `LandingPage.jsx` `<footer>`; final 9-section order audit (SC-006) + visual token review (SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational completion; proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependencies on other stories (MVP)
- **US2 (P2)**: After Foundational — uses US1's Features section as a nav anchor target, but is independently testable (nav + How-It-Works + smooth scroll)
- **US3 (P2)**: After Foundational — independently testable (stats + testimonials trust layer)
- **US4 (P3)**: After Foundational — integrates with US2's navbar (mobile menu toggle edits `LandingNavbar.jsx`), so it runs after US2 in sequence

### Within Each User Story

- Content record first (T003), shared primitives/wiring before sections
- Components before composition/wiring within a story
- Story verification (Independent Test) before advancing to the next priority

### Parallel Opportunities

- Phase 1: T001, T002 run in parallel
- Phase 2: T003-T009 all run in parallel (distinct files)
- US1: T010-T013 parallel (distinct component files) → T014 mount
- US2: T015, T016 parallel → T017 mount → T018 verify
- US3: T019, T020 parallel → T021 mount
- Phase 7: T026-T032 parallel → T033 final (footer adds the last missing section, so it finishes last)

---

## Parallel Example: User Story 1

```bash
Task: "Create HeroSection.jsx in frontend/src/components/landing/"
Task: "Create FeaturesSection.jsx in frontend/src/components/landing/"
Task: "Create BenefitsSection.jsx in frontend/src/components/landing/"
Task: "Create FinalCtaSection.jsx in frontend/src/components/landing/"
# then:
Task: "Mount US1 sections into LandingPage.jsx (T014)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run US1 Independent Test (hero + primary CTAs → sign-up); door: hero value message + working conversion path
5. Deploy/demo the conversion shell if ready

### Incremental Delivery

1. Setup + Foundational → bare public shell on `/landing` (authed redirect verified)
2. Add US1 → **MVP demo**: hero + features + benefits + final CTA convert guest → registration
3. Add US2 → sticky nav + How-It-Works + smooth scroll
4. Add US3 → trust layer (stats + testimonials)
5. Add US4 → responsive + accessible mobile menu (full traffic mix)
6. Polish → a11y, reduced-motion, LCP, content-edit check, gates

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done: Developer A → US1 (P1, MVP); after US1, spread the remaining sections
3. US2 (nav/how-it-works) + US3 (stats/testimonials) are independent of each other after US1 lands
4. US4 after US2 (nav integration); finish with Phase 7 polish

---

## Notes

- [P] tasks = different files, no dependencies (within the same phase/story as labeled)
- [Story] label maps a task to its spec user story for traceability
- Each user story is independently completable + testable via its Independent Test
- Gates: `node --check frontend/src/data/landingContent.js` + `npm run build` in `frontend/` + manual browser checks from quickstart.md
- Avoid: editing `/`, `/login`, `/register`; hard-coding marketing copy/CTA targets outside `landingContent.js`; new npm dependencies; horizontal scroll; leaving a section slot unmounted
- Commit after each phase (or logical group): e.g. `feat: landing US1 conversion shell` → `feat: landing nav + how-it-works` → ...