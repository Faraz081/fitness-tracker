# Feature Specification: Nutrition Search (AI-Powered Food Logging)

**Feature Branch**: `018-ai-nutrition-search`
**Created**: 2026-09-13
**Status**: Draft
**Input**: User description: "Nutrition Search (AI-Powered Food Logging)" — a dedicated AI-powered nutrition search and food-logging feature where users type what they are in plain natural language, the system looks up real nutrition data via a live AI (Gemini) backend call, and shows a result card with full macros which the user can add to a meal section of their daily nutrition log.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural-Language Food Search Returns a Live AI Result Card (Priority: P1)

The user types plain-language food descriptions (e.g., "grilled chicken sandwich with cheese" or "2 slices of toasts and a glass of orange juice") into a search box. There is no search-keyword database and no manual macro entry. Every search triggers a live AI call (routed through the authenticated backend — the Gemini key exists only server-side), and the AI result is presented as a single result card. The card is clearly labeled as an AI suggestion (an "AI" badge) and shows the food name, a "Per Xg serving" label, and the required macro fields — Calories | Protein | Carbs | Fat — plus the optional micronutrients Fiber | Sugar | Sodium when available.

**Why this priority**: This is the core value of the feature — getting real, per-serving nutrition data for arbitrary natural language input. Without live results, there is nothing to log, so this slice must exist first.

**Independent Test**: Can be fully tested by opening the page, typing a natural-language food description, and verifying a result card appears with the food name, "AI" badge, "Per Xg serving" label, the four required macros, and optional micronutrients. Delivers live, per-serving AI nutrition lookups.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the nutrition page with no prior search, **When** they type "2 slices of toasts and a glass of orange juice" and submit, **Then** a single result card shows the food name, an "AI" badge, a "Per Xg serving" label, and Calories | Protein | Carbs | Fat values (with Fiber | Sugar | Sodium when available).
2. **Given** the user submits a search, **When** the request is submitted, **Then** the call is routed through the authenticated backend endpoint and reaches the live AI (no cached/hardcoded source of truth is consulted).
3. **Given** the user's search is processed, **When** the result is displayed, **Then** the card is explicitly labeled as an AI suggestion (AI badge) and is never presented as authoritative.

---

### User Story 2 - Add an AI Food to a Meal via the Add-to-Log Modal (Priority: P1)

From the result card, the user clicks a "+" button which opens the Add-to-Log modal. The modal pre-fills the quantity (grams) from the AI result, allows the user to edit that quantity, and live-recalculates the macros ("For [X]g: [Y] kcal | P | C | F") strictly from the AI's real per-gram data. The modal includes a meal section dropdown (Breakfast | Lunch | Dinner | Snack). Cancelling closes the modal with no changes; confirming persists the entry as real data.

**Why this priority**: This is the conversion step — turning a lookup into an actual logged entry. Without it, search results have no lasting value.

**Independent Test**: Can be fully tested by searching a food, clicking "+", editing the quantity, observing the recalculation, selecting a meal, and confirming. Delivers validated, logged entries derived from live search results.

**Acceptance Scenarios**:

1. **Given** a displayed result card, **When** the user clicks "+", **Then** an Add-to-Log modal opens with the quantity pre-filled from the AI result and a meal dropdown (Breakfast | Lunch | Dinner | Snack).
2. **Given** the modal is open, **When** the user edits the quantity, **Then** the summary "For [X]g: [Y] kcal | P | C | F" recalculates live and strictly proportionally from the AI's real data (no independent/guessed math on non-AI values).
3. **Given** the modal is open, **When** the user clicks Cancel, **Then** the modal closes and nothing is persisted.
4. **Given** the modal is open with a selected meal and quantity, **When** the user confirms (e.g., "+ Add Food"), **Then** the entry is persisted to the real database and associated with the authenticated user.

---

### User Story 3 - Saved Food Reflects Instantly Under Its Meal Section (Priority: P2)

After confirming, the added food appears immediately under the correct meal section on the nutrition page — in real time, with no page refresh. Each meal section (Breakfast | Lunch | Dinner | Snack) shows its own logged foods; a section with zero logged foods shows the honest empty state "No food logged for [Meal]" with the hint "Use AI search above to find and add foods."

**Why this priority**: Real-time reflection is user-visible proof the save worked, and the empty-state guidance teaches users how to populate each meal. It depends on Story 2's persistence but can be verified independently afterward.

**Independent Test**: Can be fully tested by adding a food with meal "Lunch", then confirming the entry appears under the Lunch section instantly without refresh; and clearing a meal and confirming the exact empty state text appears. Delivers trustworthy, immediately-consistent logging UI.

**Acceptance Scenarios**:

1. **Given** the user has just confirmed an entry with meal "Lunch", **When** the save completes, **Then** the food appears under the Lunch section immediately with no page refresh.
2. **Given** a meal section with no logged foods, **When** the section is rendered, **Then** it shows "No food logged for [Meal]" and the hint "Use AI search above to find and add foods."
3. **Given** multiple foods added to the same meal, **When** the section is rendered, **Then** all added foods are listed under that meal ordered by recency as persisted.

---

### User Story 4 - Graceful Loading, Error, and Empty Search States (Priority: P2)

While an AI call is in flight the UI shows a loading state. If the AI call fails or returns no usable result, the UI fails gracefully with an error/empty message — it never fabricates or fills in numbers. A failed search is retryable.

**Why this priority**: Trust in the feature depends on honest states. Fabricated numbers would break the "AI is the assistant, the app is a calculator" contract, so this is a hard requirement worth an early independent slice.

**Independent Test**: Can be fully tested by submitting a search while the AI backend is unavailable (or returns an error), and verifying an honest error/empty state appears with no placeholder nutrition numbers, plus a retry path. Delivers trustworthy failure behavior for AI lookups.

**Acceptance Scenarios**:

1. **Given** the user has submitted a search, **When** the AI call is in progress, **Then** a loading indicator is shown and no partial/fabricated results are displayed.
2. **Given** the AI call fails (timeout, downstream error, rate limit), **When** the user sees the response, **Then** an honest error/empty state appears with a retry option and zero fabricated nutrition numbers.
3. **Given** the AI returns no edible/nutrition-relevant data for the input, **When** the response is rendered, **Then** an empty/no-results state appears instead of an invented food.

---

### User Story 5 - Secure, Isolated AI Backend Proxy and Data Scoping (Priority: P1)

All AI calls are proxied by an authenticated backend endpoint: the Gemini API key lives only on the backend and is never exposed to the client. Every persisted nutrition entry is owner-scoped to the authenticated user, so no user can read, modify, or delete another user's entries.

**Why this priority**: This is the foundation for everything else. It is a P1 correctness/security slice that can be verified independently and gates all other stories.

**Independent Test**: Can be fully tested by searching as an authenticated user while verifying (via inspection of network traffic / source bundle) that no AI key reaches the client, and by confirming saved entries are retrievable only by their owner and are isolated across two test users. Delivers the secure, isolated AI + data path the whole feature depends on.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they search or confirm a food, **Then** every request is accepted only through the authenticated backend endpoint and the Gemini key is present only server-side.
2. **Given** two users with entries in the same meal collection, **When** each queries their log, **Then** each user sees only their own entries — no cross-user leakage.
3. **Given** an unauthenticated client, **When** it attempts a search or a save, **Then** the request is rejected (auth required).

---

### Edge Cases

- What happens when the user submits an empty or whitespace-only search? (Block submission; show inline validation rather than calling the AI.)
- What happens when the AI call times out or the downstream service is rate-limited/unavailable? (Show an honest error state with a retry option; never show placeholder numbers.)
- What happens when the AI returns a response that cannot be mapped to the required fields (missing calories/protein/carbs/fat)? (Signal a no-results/error state rather than using fabricated values; optional micronutrients may be absent.)
- What happens when the user enters a non-food query (e.g., "hello" or a random sentence)? (Treat as no usable nutrition result — no invented food card.)
- What happens when the user edits the quantity to an invalid value (empty, non-numeric, or non-positive)? (Live summary must not render fabricated math; the confirm action is blocked until a valid quantity is present.)
- What happens when the quantity is very large or very small (e.g., 10,000g or 1g)? (Recompute from AI real data proportionally, bounded to a sane range; no overflow/NaN UI.
- What happens if the AI returns a serving size that is not gram-denominated (e.g., "1 slice")? (Present consistently in grams under the "Per Xg serving" contract; the Add-to-Log quantity is grams.)
- What happens if multiple rapid searches are submitted before the first returns? (Latest submission wins; stale responses must not overwrite newer results.)
- What happens if the user confirms the same food multiple times? (Each confirmation creates its own log entry — no deduplication/merge at this stage.)
- What happens when a meal section has entries but the search has produced nothing? (Sections render independently of search state; empty sections still show the honest empty state while populated sections show their foods.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept only natural-language input for searching foods (no manual macro entry, no keyed-in search keywords).
- **FR-002**: System MUST route every search through an authenticated backend endpoint that calls the live AI (Gemini); there MUST be no static or hardcoded source of nutrition truth behind results.
- **FR-003**: System MUST display a single result card per accepted search showing: food name, an "AI" badge, a "Per Xg serving" label, and Calories | Protein | Carbs | Fat, plus Fiber | Sugar | Sodium when the AI provides them.
- **FR-004**: System MUST present AI results as assistant-level suggestions (AI badge), never as authoritative-facing data.
- **FR-005**: Result card MUST offer a "+" control that opens the Add-to-Log modal.
- **FR-006**: Add-to-Log modal MUST pre-fill quantity (grams) from the AI result, allow editing that quantity, and live-recalculate "For [X]g: [Y] kcal | P | C | F" strictly from the AI's real data.
- **FR-007**: Add-to-Log modal MUST provide a meal dropdown with Breakfast | Lunch | Dinner | Snack.
- **FR-008**: Add-to-Log modal SHOULD only allow confirmation when the quantity is present and valid (positive number).
- **FR-009**: Cancelling the modal MUST NOT persist anything.
- **FR-010**: Confirming the modal MUST persist the entry to the real database, owner-scoped to the authenticated user, and reflect it under the selected meal section immediately with no page refresh.
- **FR-011**: Each meal section MUST display its logged foods; a section with zero foods MUST show "No food logged for [Meal]" and the hint "Use AI search above to find and add foods."
- **FR-012**: System MUST show a loading state during AI calls and an honest, retryable error/empty state on failure — never fabricated nutrition numbers.
- **FR-013**: Gemini API key MUST live only on the backend; it MUST NOT be exposed to the client at all.
- **FR-014**: All persisted entries MUST be scoped to the authenticated user and MUST be isolated from other users ([NEEDS CLARIFICATION: exact cross-user access semantics beyond the login-scoped contract — e.g., admin visibility for support — not specified]).
- **FR-015**: System MUST handle non-food queries and unmappable AI responses with a no-results/error state rather than inventing a food.

### Key Entities *(include if feature involves data)*

- **Nutrition Log Entry**: A single persisted food entry tied to a user's daily log — fields: owner (user ID), food name, meal section (Breakfast | Lunch | Dinner | Snack), quantity in grams, nutrition values (calories, protein, carbs, fat; optional fiber, sugar, sodium), a source marker distinguishing AI-augmented entries, and the date/timestamp of the log.
- **AI Search Result**: The transient response produced by the backend AI proxy for a single search — contains the recognized food name, a serving size contract in grams, and the nutrition fields above. Not persisted; used only to populate the result card and pre-fill the modal.
- **User (Authenticated Client)**: The owner whose credentials authorize the search/save requests and scope every Nutrition Log Entry; a user may have many entries, and entries belong to exactly one user.
- **Meal Section**: A grouping concept (Breakfast | Lunch | Dinner | Snack) within a user's log for a given day; determines where an added entry is displayed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A search for any realistic natural-language food description returns a result card with the required fields in under 5 seconds end-to-end (p95).
- **SC-002**: 100% of accepted searches hit the live AI through the backend; 0 searches resolve to a static/hardcoded data source.
- **SC-003**: 100% of confirmed Add-to-Log entries persist to the database and appear under the correct meal section immediately (no refresh).
- **SC-004**: The live quantity recalculation ("For [X]g: ...") is a strict mathematical re-derivation of the AI's data; verified equal (within rounding) at the AI-provided serving quantity.
- **SC-005**: Every empty meal section renders the exact empty state ("No food logged for [Meal]" + hint); 0 sections show placeholder/fake foods.
- **SC-006**: 100% of AI failure/timeout cases show an honest error/empty state with retry; 0 failures show fabricated numbers.
- **SC-007**: The Gemini key appears in 0 client-facing artifacts (bundle, network payloads, docs, logs).
- **SC-008**: With two users logging concurrently, each retrieves only their own entries in 100% of cases (no cross-user leakage in CRUD operations).