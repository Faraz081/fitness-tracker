# Feature Specification: AI-Powered Nutrition Page

**Feature Branch**: `017-ai-nutrition`  
**Created**: 2026-09-13  
**Status**: Draft  
**Input**: User description: "Upgrade the existing Nutrition page into an
AI-powered, real-time nutrition system — natural-language food logging with AI
analysis, editable preview, save to meal sections, dynamic daily totals, and
Dashboard synchronization."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log Food by Typing Plain Language (Priority: P1)

An authenticated user types a natural-language food description such as
"2 eggs", "1 banana", "1 bowl chicken biryani", or "200g grilled chicken with
rice", triggers the "Analyze with AI" action, and receives a structured
nutrition estimate (food name, quantity, unit, calories, protein, carbs, fat)
in an editable preview.

**Why this priority**: AI-powered natural-language logging is the defining value
of this feature and the foundation everything else builds on. It is
independently deliverable and testable without any totals, filters, or
Dashboard work.

**Independent Test**: A logged-in user can type a food description, press
"Analyze with AI", and see a complete, editable estimate — usable on its own.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Nutrition page, **When** they type
   "1 banana" and select "Analyze with AI", **Then** an editable preview appears
   with a food name, quantity, unit, and calories/protein/carbs/fat values.
2. **Given** a description with an explicit quantity (e.g. "200g grilled chicken
   with rice"), **When** it is analyzed, **Then** the estimate is quantity-aware
   and consistent with that serving size.
3. **Given** the analysis is in progress, **When** the action is triggered again,
   **Then** the duplicate request is blocked until the first one finishes.

---

### User Story 2 - Review, Adjust & Save the AI Result (Priority: P1)

The AI result is never saved directly. The user reviews it, can edit food name,
quantity, unit, calories, protein, carbs, fat, meal type, and date, sees the
note "AI-generated nutrition values — please verify before saving.", picks a
meal type, and only then explicitly saves the entry, which appears immediately
in that meal section.

**Why this priority**: This enforces "AI as assistant, not authority" — the user
stays in control and is never surprised by an unverified record. It completes
the core logging loop started in Story 1.

**Independent Test**: A user can edit every AI-estimated field and save to a
chosen meal, verifying nothing persists until they confirm.

**Acceptance Scenarios**:

1. **Given** an AI result preview, **When** the user edits any of the editable
   fields and selects a meal type, **Then** no record is created until they
   explicitly confirm/save.
2. **Given** the verification note is present on the preview, **When** the user
   saves, **Then** the entry is stored with the authenticated user, food name,
   meal type, quantity, unit, calories, protein, carbs, fat, date, and
   timestamps, and appears in the selected meal section.
3. **Given** an AI result preview, **When** the user cancels without saving,
   **Then** no entry is created and no values are stored.

---

### User Story 3 - See the Day's Meals, Filters & Dynamic Totals (Priority: P1)

The page defaults to today's date. Meal sections (Breakfast, Lunch, Dinner,
Snack) and the Calories/Protein/Carbs/Fat summary cards are populated entirely
from the user's saved records for the selected date. Selecting a meal filter
shows only that meal's real entries, and changing the date refreshes the entry
list, meal sections, and all totals.

**Why this priority**: Dynamic, real-data totals and date/meal navigation are
the core utility of the upgraded page and directly reflect saved AI/manual
entries. Delivered independently of the AI flow.

**Independent Test**: A user with saved entries can change date and meal filters
and watch totals recompute from actual records — no browser refresh, no demo
data.

**Acceptance Scenarios**:

1. **Given** saved entries across multiple meals on a date, **When** the user
   selects a meal filter, **Then** only that meal's real database entries are
   shown for the selected date.
2. **Given** a date with entries, **When** the user changes the selected date,
   **Then** the entries, meal sections, and calories/protein/carbs/fat totals
   all recollect to that date (zeros + empty state when it has no entries).
3. **Given** any date, **When** it has no saved entries, **Then** the summary
   shows zeros and the page shows "No nutrition entries for this date." rather
   than any demo/static data.

---

### User Story 4 - Edit & Delete Existing Entries (Priority: P1)

Existing CRUD support is preserved: the user can edit a saved entry (updating
the database and recalculating all affected totals) or delete it after
confirmation (removing the record and recalculating totals).

**Why this priority**: The feature must not regress the existing Nutrition CRUD
lifecycle, and accurate totals depend on correct edit/delete behavior.

**Independent Test**: A user can edit and delete entries and immediately see the
meal sections and summary cards recompute.

**Acceptance Scenarios**:

1. **Given** a saved entry, **When** the user edits its values and saves,
   **Then** the database is updated and all daily and meal totals are
   recalculated instantly.
2. **Given** a saved entry, **When** the user confirms deletion, **Then** the
   record is removed and totals are recalculated; cancelling leaves it intact.
3. **Given** an error during edit/delete, **When** it surfaces, **Then** the
   user sees a clear, retryable message and the form/action is re-enabled.

---

### User Story 5 - Dashboard Stays in Sync (Priority: P2)

Dashboard nutrition values (calories consumed, protein, carbs, fat, and related
nutrition progress/activity) are driven by the same records as the Nutrition
page. After any add/edit/delete there, the Dashboard reflects the change — there
is no separate dashboard-only nutrition dataset.

**Why this priority**: Consistency across the product is a hard constitutional
requirement; it depends on Stories 1–4 being functional first.

**Independent Test**: A user adds an entry on the Nutrition page, opens or
refreshes the Dashboard, and sees the same nutrition values without any
separate data entry.

**Acceptance Scenarios**:

1. **Given** an entry added, edited, or deleted on the Nutrition page,
   **When** the user views the Dashboard, **Then** the nutrition values shown
   match the same saved records.
2. **Given** no nutrition records at all, **When** the Dashboard is viewed,
   **Then** it shows consistent zero/empty nutrition state rather than a
   separate dataset.

---

### User Story 6 - Graceful Failures & Secure AI Integration (Priority: P1)

The AI analysis fails gracefully in every scenario: no key configured, AI
service outage, or an unidentifiable food. Clear, retryable messages are shown,
no fabricated values are ever generated, manual logging keeps working, and the
AI credential stays entirely server-side.

**Why this priority**: Security and honesty of the AI path are non-negotiable
constitutional rules and protect every other story from silent corruption.

**Independent Test**: A user triggers each failure mode (no key, outage,
unidentifiable food) and sees the correct message, can retry, and can still log
manually — with the credential never exposed anywhere client-facing.

**Acceptance Scenarios**:

1. **Given** no AI key configured on the server, **When** the user triggers an
   analysis, **Then** they see a clear, retryable error and can still log food
   manually.
2. **Given** a valid request with an unidentifiable description, **When**
   analysis completes, **Then** the user sees "Food could not be identified.
   Please try another search." and no values are generated.
3. **Given** an AI service failure, **When** analysis is attempted, **Then** a
   clear retryable error is shown and no fake nutrition values are produced.

---

### Edge Cases

- Whitespace-only or empty food description (Analyze action disabled / inline
  prompt, no request sent).
- AI returns missing, malformed, or out-of-range fields (rejected; user asked to
  retry, never silently defaulted to fake values).
- AI returns a quantity-less estimate ("a bowl of rice") — a reasonable standard
  serving may be offered and must remain editable.
- Duplicate "Analyze with AI" clicks during processing (second request blocked).
- Changing the date while an analysis is in progress (results still shown in the
  preview; save targets the meal + date the user confirms).
- Editing an entry so it moves to another meal or date (grouping/totals update).
- Deleting the last entry of a day (summary resets to zeros + empty state).
- Selecting a date with no entries (zeros + "No nutrition entries for this
  date.").
- Another user's entry id is requested directly (treated as not found; no data
  leak).
- Missing AI key at runtime (graceful error; app and manual logging unaffected).
- Network failure during save/edit/delete (retryable message; re-enable form).
- Zero/negative edited values (validation blocks save).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST preserve the existing Nutrition page — heading, Add
  Entry button, search/filter controls, date selector, summary cards, entries
  section, and CRUD — with its current layout and black/orange theme; no page
  redesign.
- **FR-002**: System MUST allow an authenticated user to type a natural-language
  food description (e.g. "2 eggs", "1 banana", "1 bowl chicken biryani", "200g
  grilled chicken with rice").
- **FR-003**: System MUST provide an "Analyze with AI" action for a non-empty
  food description.
- **FR-004**: System MUST send the description to the backend, which performs the
  AI analysis using a server-side credential only (never client-exposed).
- **FR-005**: System MUST return structured results containing food name,
  quantity, unit, calories, protein, carbs, and fat.
- **FR-006**: System MUST produce quantity-aware estimates when a quantity is
  provided; if quantity is missing, MAY offer a reasonable standard serving that
  stays editable.
- **FR-007**: System MUST validate the AI's structured response before showing it;
  invalid/incomplete/out-of-range data is rejected and never saved.
- **FR-008**: System MUST show the result in an editable preview allowing changes
  to food name, quantity, unit, calories, protein, carbs, fat, meal type, and
  date.
- **FR-009**: System MUST display "AI-generated nutrition values — please verify
  before saving." on the preview.
- **FR-010**: System MUST NOT persist any entry until the user explicitly
  confirms/saves; cancelling discards the preview.
- **FR-011**: System MUST require a meal type (Breakfast/Lunch/Dinner/Snack) on
  save and show the new entry immediately in that meal section.
- **FR-012**: System MUST store each entry with the authenticated user, food
  name, meal type, quantity, unit, calories, protein, carbs, fat, date, and
  timestamps.
- **FR-013**: System MUST default the date to today and allow selecting another
  date; entries are stored with the selected date.
- **FR-014**: System MUST show only the selected date's entries and recalculate
  calories, protein, carbs, fat, and meal totals whenever the date changes.
- **FR-015**: System MUST make Breakfast/Lunch/Dinner/Snack filters operate on the
  user's real saved entries for the selected date (no static/demo data).
- **FR-016**: System MUST compute the four summary cards from the user's actual
  saved entries for the selected date and update them after add, edit, delete,
  and date change.
- **FR-017**: System MUST support view, edit, and delete of saved entries; edits
  update the database and recalculate totals; deletes remove the record and
  recalculate totals.
- **FR-018**: System MUST update the page immediately after any mutation without
  a manual browser refresh, using the project's existing data-refetch/state
  patterns.
- **FR-019**: System MUST derive Dashboard nutrition values from the same records
  as the Nutrition page; no separate dashboard-only dataset is maintained.
- **FR-020**: System MUST keep the AI credential only in backend environment
  variables — never in frontend code, client env vars, API responses,
  localStorage, or the repository.
- **FR-021**: System MUST handle a missing key, AI failure, and unidentifiable
  food with clear, retryable messages and MUST NOT fabricate nutrition values.
- **FR-022**: System MUST show specified states: "Loading nutrition data...",
  "Analyzing food...", "No nutrition entries for this date.", and "Food could
  not be identified. Please try another search.", plus a clear API-failure
  message.
- **FR-023**: System MUST prevent duplicate AI requests while an analysis is in
  progress.
- **FR-024**: System MUST isolate every user's nutrition records; no user can
  read, edit, delete, or total another user's entries.

### Key Entities *(include if feature involves data)*

- **Nutrition entry** (existing): a single logged food/meal owned by one user —
  food name, meal type, quantity, unit, calories, protein, carbs, fat, date,
  timestamps. Optionally marked as AI-derived when saved from a preview (an
  additive, non-breaking marker). One user owns zero or more entries.
- **User** (reused): the authenticated owner; owns Nutrition entries and the
  Dashboard nutrition values derived from them.
- **AI analysis result**: a transient, unpersisted structured estimate (food
  name, quantity, unit, calories, protein, carbs, fat) shown only in the
  editable preview until the user confirms a save.

### Scope & Assumptions

**In scope**: AI natural-language analysis; editable pre-save preview with
verification note; meal-type and date selection on save; instant update of meal
sections, summary cards, and totals; real-data meal filters; edit/delete
recalculation; Dashboard synchronization from the same records; loading/error/
empty states; backend-only AI credential; per-user isolation.

**Out of scope** (do not expand): page redesign or layout change; photo or
barcode food logging; a curated food database or favorites; meal templates /
copy-meal; multi-day or historical nutrition reporting; AI chat beyond a single
description; changes to authentication; offline mode.

**Assumptions**:
- AI service is a third-party dependency invoked only from the backend with a
  server-side credential; it is optional at runtime — the app, older Nutrition
  data, and manual logging keep working without a valid key.
- The existing Nutrition page, its CRUD, and the shared data/refetch patterns
  are reused unchanged where possible; the AI preview travels through the same
  save path as a manual entry.
- Meal types remain the fixed set Breakfast/Lunch/Dinner/Snack and `date` is a
  calendar day; totals are per selected date per user.
- No static/demo entries exist anywhere; any old placeholder data is removed.
- Dashboard duplication risk: none new — the Dashboards in the project must read
  the same nutrition records (single source of truth).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A logged-in user can go from typing a food description to a saved,
  user-verified entry in under 60 seconds.
- **SC-002**: 95% of realistic food descriptions (per the examples) return a
  complete, editable structured estimate on the first attempt.
- **SC-003**: After any add, edit, delete, or date change, meal sections and all
  four summary cards reflect the change in under 2 seconds with no manual
  refresh.
- **SC-004**: 100% of saved entries carry the authenticated user and appear in
  the selected meal section for the selected date.
- **SC-005**: Dashboard nutrition values always match the Nutrition page totals
  derived from the same records; verified via a mutation on one page and a
  comparison on the other.
- **SC-006**: 100% of cross-user access attempts fail without exposing or
  altering data.
- **SC-007**: The AI credential appears in zero client-facing surfaces and is
  absent from the repository; a scan of frontend code, responses, and committed
  files finds none.
- **SC-008**: With the AI unavailable or key missing, the page still shows the
  correct failure/empty states, allows retry, and lets users log food manually —
  no fabricated values.
- **SC-009**: No static/demo nutrition data appears in any date, meal filter, or
  state of the page or Dashboard.