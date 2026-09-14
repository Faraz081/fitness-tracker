# Feature Specification: Nutrition Page Rebuild (AI Food Search)

**Feature Branch**: `019-nutrition-page-rebuild`
**Created**: 2026-09-13
**Status**: Draft
**Input**: User description: "Nutrition Page Rebuild (AI Food Search) — Completely remove the current broken Nutrition page implementation and rebuild a clean, minimal AI Food Search page that matches the required structure exactly. Do not patch the old page. Do not add extra features. Delete the existing page and its components/state/files first, then rebuild strictly to: a Header (fork/utensil icon + 'AI Food Search'), a Search Bar (one input + Search button + helper text), a Search Result (label '1 RESULT — CLICK TO ADD', Clear link, food name, serving size, CAL/P/C/F colored badges, '+' icon; data from a live Gemini API call only), Meal Tabs (Breakfast/Lunch/Dinner/Snacks with coffee-cup/sun/moon/clock icons), and a Meal Section (empty state 'No food logged for [Meal Name]' + hint; persisted foods showing macros). Added foods must persist in the real backend/database, scoped to the authenticated user, and never local-only. Strict scope limits: no date picker, no separate macro summary bar, no extra filters, no duplicate search bars, no extra sidebar widgets, no unlisted features. The goal is a clean, minimal, working version only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean-Slate: Old Nutrition Page Is Completely Removed Before Any Rebuild (Priority: P1)

The existing Nutrition page is declared broken and overcomplicated, and is never to be patched, partially reused, or carried over. Before a single new screen or component is built, the old page implementation — its page, its components, any state created specifically for it, and its feature-specific files — is removed entirely. Only after the deletion is confirmed does the rebuild begin with the new page in its place.

**Why this priority**: This is the foundation of the feature. The rebuild cannot be trusted to be clean and minimal if it inherits any part of the broken implementation. Getting deletion right first makes every later criterion verifiable against a true clean slate.

**Independent Test**: Can be fully tested by confirming the old page implementation (page, components, and feature-specific files/state) no longer exists in the delivered code while the new page renders in its place. Delivers assurance that the rebuild is genuinely from scratch.

**Acceptance Scenarios**:

1. **Given** the current broken Nutrition page exists in the codebase, **When** the feature is delivered, **Then** that page implementation and all components, feature-specific state, and files created for it have been removed (no patched remnants are reused by the new page).
2. **Given** the deletion is complete, **When** the rebuild begins, **Then** the new page is built independently and the navigation still reaches a working, clean Nutrition page.

---

### User Story 2 - Search a Food and Receive a Single Live AI Result (Priority: P1)

From the new page, the user types a food name (for example "banana") into the single search input and clicks "Search". The system calls a live AI nutrition lookup routed through the authenticated backend — never a static database, cached catalog, or hardcoded value. A single result appears in the required result section: a section label "1 RESULT — CLICK TO ADD" with a "Clear" link on its right, and one result row showing the food name, its serving size (e.g., "per 118g"), and four colored badges — CAL, P, C, F — plus a "+" icon to add the food. While a search is in flight, duplicate searches are blocked until that result returns.

**Why this priority**: This is the core value of the rebuilt page — live, real nutrition data for a bare food name, presented in the exact required format. Without it, nothing can be logged.

**Independent Test**: Can be fully tested by opening the page, typing a food name, submitting, and verifying a single result row appears with the exact label, Clear link, food name, serving size, four colored badges, and "+" icon, with the data demonstrably originating from the live AI call.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the new page, **When** they type "banana" and click "Search", **Then** a single result appears showing "1 RESULT — CLICK TO ADD", a "Clear" link, the food name, a serving size such as "per 118g", CAL / P / C / F badges in four distinct colors, and a "+" icon.
2. **Given** a search is submitted, **When** the request is handled, **Then** the nutrition data comes from the live AI call through the authenticated backend — no static or hardcoded source of truth exists anywhere.
3. **Given** a search is already in flight, **When** the user submits again, **Then** the second submission is blocked until the first completes (no duplicate concurrent requests).
4. **Given** a successful search result is showing, **When** the user clicks "Clear", **Then** the result is removed from the page and nothing is saved.

---

### User Story 3 - Add a Result to the Active Meal and See It Persist (Priority: P1)

With a result showing, the user clicks the "+" icon and the food is added to the currently active meal tab. The entry persists to the real backend/database, scoped to the authenticated user, and appears immediately under the selected meal's section with its logged macros — no page refresh, no local-only or session-only storage. After a reload, the entry is still there.

**Why this priority**: This is the conversion step — turning a live lookup into a real, permanent log entry. Without persistence, search results have no lasting value.

**Independent Test**: Can be fully tested by searching a food, activating a meal tab, clicking "+", confirming the entry appears under that meal instantly, and reloading to verify it remains. Delivers real, durable food logging.

**Acceptance Scenarios**:

1. **Given** a displayed result row and the "Lunch" tab active, **When** the user clicks "+", **Then** the food is saved against the authenticated user's log for Lunch and appears under the Lunch section immediately, with no page refresh.
2. **Given** the add completed on the previous step, **When** the user reloads the page, **Then** the entry is still present under Lunch (real persistence, not local-only).
3. **Given** a user adds the same food to a meal multiple times, **When** each "+" is clicked, **Then** each addition is saved as its own entry reflecting the macros shown at add time.

---

### User Story 4 - Browse Meals, Empty States, and Graceful Failures (Priority: P2)

The page shows exactly four meal tabs — Breakfast, Lunch, Dinner, Snacks — each with its own icon (coffee cup, sun, moon, clock). A meal with no saved foods shows the designed empty state: a plate/utensils icon, "No food logged for [Meal Name]", and the hint "Use AI search above to find and add foods." When the AI cannot complete a search (service unavailable, unrecognized food, or the feature is not configured), the user sees a clear, retryable message and no data is written.

**Why this priority**: Empty states teach users how to populate each meal, and honest failure messages keep the page trustworthy. It depends on Stories 2 and 3 but is independently verifiable afterward.

**Independent Test**: Can be fully tested by viewing each empty meal tab (exact empty-state text and icon), and by triggering a failed search to confirm a clear retryable message with no data written. Delivers a trustworthy, self-explanatory page.

**Acceptance Scenarios**:

1. **Given** a meal with no logged foods, **When** its tab is active, **Then** the section shows a plate/utensils icon, "No food logged for [Meal Name]", and the hint "Use AI search above to find and add foods."
2. **Given** the four tabs, **When** the page renders, **Then** exactly Breakfast, Lunch, Dinner, and Snacks appear (with coffee-cup, sun, moon, and clock icons respectively).
3. **Given** the AI lookup fails or is not configured, **When** the user searches, **Then** a clear, retryable message appears and no food is saved.

### Edge Cases

- The AI service is unavailable, unreachable, or times out → a clear retryable error, retry allowed, no data written.
- The searched text is not a food (e.g., "purple") → a friendly "unrecognized food" message, no fabricated values, no save.
- The AI feature is not configured (no server-side credential) → a clear message that search is unavailable while the rest of the page still works.
- No search has been run yet → the result section is not shown at all; the page shows only the header, search bar, tabs, and (empty) meal sections.
- The user clears the result then searches again → a fresh live lookup runs; the old result is gone.
- The user switches the active tab without searching → the meal section simply shows the selected meal's foods.
- The user adds an entry, then searches and adds again → each add persists under the then-active tab, including same-food repeat adds.
- Duplicate same-text searches → each runs live; repeated submissions while in flight are blocked and silently ignored.
- A page reload mid-use → any previously persisted entries survive; transient search results do not.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fully remove the existing Nutrition page implementation — its page, components, feature-specific state, and files created specifically for it — before any new build occurs, with no patched remnants reused.
- **FR-002**: The rebuilt page MUST display a header with a fork/utensil icon and the exact title "AI Food Search".
- **FR-003**: The page MUST contain exactly one search input that accepts a food name (placeholder e.g., "banana"), one "Search" button, and the helper text "Supports natural language — try 'large chicken breast' or '100g of oats with milk'".
- **FR-004**: Every submission of a search MUST trigger a live AI nutrition lookup through the authenticated backend; the system MUST NOT consult any static database, cached catalog, permanent hardcoded values, or demo content as the source of truth.
- **FR-005**: System MUST block duplicate search submissions while a search is already in flight.
- **FR-006**: After a successful search, the result section MUST show the label "1 RESULT — CLICK TO ADD" with a "Clear" link on its right side, and exactly one result row displaying: the food name, a serving size (e.g., "per 118g"), four badges — CAL, P, C, F — in four distinct colors, and a "+" icon to add the food.
- **FR-007**: Clicking "Clear" MUST remove the current search result from the page without writing any data.
- **FR-008**: Clicking the "+" icon MUST add the displayed food to the currently active meal tab and save it as a real entry.
- **FR-009**: The page MUST show exactly four meal tabs — Breakfast, Lunch, Dinner, Snacks — in fixed order, each with its mandated icon (coffee cup, sun, moon, clock), and one active tab at a time.
- **FR-010**: A meal section with no saved foods MUST show a plate/utensils icon, the text "No food logged for [Meal Name]", and the hint "Use AI search above to find and add foods."
- **FR-011**: Added foods MUST persist to the real backend/database, be scoped to the authenticated user, appear immediately under the selected meal (no page refresh), and survive a page reload.
- **FR-012**: Saved entries MUST display their logged macros (CAL, P, C, F) under the correctly selected meal.
- **FR-013**: System MUST handle AI failures gracefully and honestly: unavailable/timed-out service, unrecognized food, and missing configuration each produce a clear, retryable message, and MUST NOT fabricate values or save any data on failure.
- **FR-014**: The AI service credential MUST remain server-side only and MUST NEVER be exposed to the browser, to users, or in any client-visible surface.
- **FR-015**: System MUST NOT add any feature beyond the listed structure: no date picker, no separate macro summary bar, no extra filters, no duplicate search bars, no page-specific sidebar widgets, and no other unlisted functionality.
- **FR-016**: The page MUST remain usable by any authenticated user in isolation: a user's search results and saved foods MUST never leak to or from another user.

### Key Entities *(include if feature involves data)*

- **Food Log Entry**: Represents one saved food in a user's nutrition log — the food name, the logged serving size, its macro values at save time (CAL, P, C, F), and the meal it belongs to (Breakfast / Lunch / Dinner / Snacks). Each entry is owned by exactly one authenticated user, who is the only person able to see or manage it.
- **Search Result**: A transient, per-search outcome (food name, serving size, CAL/P/C/F values) returned by the live AI lookup. It is not stored; it exists only until the user adds it or clears it.

### Assumptions

- The default active meal tab is Breakfast when the page first loads.
- Each "+" click creates its own entry, even for the same food in the same meal (no merging or quantity editing — quantity editing is explicitly out of scope).
- The rebuild lands on the same page/route that the old Nutrition page occupied, so navigation behavior does not change.
- "Currently active meal" means the tab the user has selected at add time.
- Existing saved nutrition entries for the user remain valid; the rebuild does not wipe user data.
- Search-result values are estimates and are labeled/presented as the AI's suggestion, never as medically authoritative.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the old Nutrition page implementation (page, components, feature-specific state, and files) is removed from the delivered code, confirmed before the new build.
- **SC-002**: The new page matches the required structure exactly — header with fork/utensil icon + "AI Food Search", a single search input with the exact helper text, a single result row format ("1 RESULT — CLICK TO ADD", Clear, food name, serving size, four distinct-color badges, "+"), exactly four meal tabs with the mandated icons, and a meal section with the exact empty state or persisted foods.
- **SC-003**: 100% of searches obtain their nutrition data from the live AI lookup — no static or hardcoded source of truth exists anywhere in the delivered code.
- **SC-004**: Added foods appear under the selected meal immediately (within 1 second of the add action) and are still present after a page reload for 100% of test saves.
- **SC-005**: All saved foods are shown only to the owning authenticated user; cross-user isolation verifies in two-user testing (no access, no leakage).
- **SC-006**: 0 unlisted extra features exist on the page (no date picker, macro summary bar, extra filters, duplicate search bars, side widgets, or other additions).
- **SC-007**: Every empty meal section renders the exact required empty-state text and icon for 100% of checkable meals.
- **SC-008**: 100% of AI failure paths produce a clear, retryable message and write zero data (no fabricated values).
- **SC-009**: The AI service credential is verifiably absent from every client-visible surface and every committed artifact.
- **SC-010**: The delivered build compiles cleanly, the page is fully functional at the standard breakpoints with no horizontal scroll, and a recorded manual browser verification (search → result → add → persisted row per meal, empty states, AI failure paths, two-user check) passes before sign-off.