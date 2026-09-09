# Feature Specification: Search & Filtering

**Feature Branch**: `008-search-filtering`
**Created**: 2026-09-09
**Status**: Draft
**Input**: User description: "Provide fast and consistent search + filtering across Workouts, Exercises, and Nutrition records so users can quickly find what they need."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Workout Search & Filter (Priority: P1)

As a fitness enthusiast with many logged workouts, I want to search my workouts by name, notes, or exercise name and filter them by category and date range, so I can quickly find specific sessions without scrolling through a long list.

**Why this priority**: Workout search is the highest-value capability — users accumulate hundreds of workouts over time. Finding a specific session (e.g., "that bench press day last month") is a daily need. This story delivers the core search + filter value independently.

**Independent Test**: Can be fully tested on the WorkoutList page (`/workouts`) by typing a workout title, selecting a category filter, and choosing a date range. Delivers immediate value for any user with 10+ logged workouts.

**Acceptance Scenarios**:

1. **Given** the user is on the WorkoutList page, **When** they type "bench" into the search input, **Then** the workout list shows only workouts whose title, notes, or exercise names contain "bench" (case-insensitive).
2. **Given** the user has workouts in categories "Strength" and "Cardio", **When** they select "Strength" from the category filter, **Then** only strength workouts are shown.
3. **Given** the user has workouts from January through September, **When** they select a date range of March 1 to June 30, **Then** only workouts within that range are shown.
4. **Given** the user types "deadlift" AND selects category "Strength" AND sets date range to last 3 months, **When** the filters are applied, **Then** only strength workouts from the last 3 months containing "deadlift" in their name, notes, or exercises are shown.
5. **Given** the user has active filters (search text, category, or date range), **When** they click "Clear all filters", **Then** all filters reset and the full workout list is displayed.
6. **Given** the user's filters produce zero matches, **When** the empty state renders, **Then** a message "No workouts match your filters" appears with a "Clear all filters" action.

---

### User Story 2 - Nutrition Search & Filter (Priority: P2)

As a user tracking my nutrition, I want to search my food entries by name and filter them by meal type and date, so I can quickly review what I ate for a specific meal on a specific day.

**Why this priority**: Nutrition tracking generates many entries daily. Searching by food name ("chicken") or filtering by meal type ("dinner") is a common daily need. This extends the search pattern to the second major data domain.

**Independent Test**: Can be fully tested on the Nutrition page (`/nutrition`) by typing a food name, selecting a meal type filter, and choosing a date. Delivers immediate value for any user who logs meals daily.

**Acceptance Scenarios**:

1. **Given** the user is on the Nutrition page, **When** they type "chicken" into the search input, **Then** only nutrition entries whose food name contains "chicken" (case-insensitive) are shown.
2. **Given** the user has entries for Breakfast, Lunch, and Dinner, **When** they select "Lunch" from the meal type filter, **Then** only lunch entries are shown.
3. **Given** the user selects a specific date, **When** the date filter is applied, **Then** only entries for that date are shown.
4. **Given** the user types "salad" AND selects meal type "Lunch" AND sets a date, **When** the filters combine, **Then** only lunch entries from that date containing "salad" in the food name are shown.
5. **Given** the user has active filters, **When** they click "Clear all filters", **Then** all filters reset and the full nutrition list for the current date is shown.
6. **Given** the user's filters produce zero matches, **When** the empty state renders, **Then** a message "No nutrition entries match your filters" appears with a "Clear all filters" action.

---

### User Story 3 - Exercise Search (Priority: P3)

As a user reviewing my exercise history, I want to search exercises by name on the ExerciseHistory page, so I can quickly find all sessions for a specific exercise (e.g., "Bench Press") without scrolling through every exercise I've ever done.

**Why this priority**: Exercise history is a secondary page, but searching by exercise name is a common need for users tracking progress on specific lifts. This completes search coverage across all data domains.

**Independent Test**: Can be fully tested on the ExerciseHistory page (`/exercises`) by typing an exercise name. Delivers value for users who want to review their history for a specific movement.

**Acceptance Scenarios**:

1. **Given** the user is on the ExerciseHistory page, **When** they type "squat" into the search input, **Then** only exercises whose name contains "squat" (case-insensitive) are shown.
2. **Given** the user types "bp" (abbreviated), **When** no exercises match, **Then** an empty state message appears suggesting they try a broader search term.
3. **Given** the user clears the search input, **When** the input becomes empty, **Then** all exercises are shown again.

---

### User Story 4 - Clear Filters & Filter State via URL (Priority: P4)

As a user who has applied multiple filters, I want a clearly visible "Clear all" button that resets everything, and I want my filter state to persist if I navigate away and come back (via URL), so I don't lose my place.

**Why this priority**: This is a cross-cutting UX concern that improves all filtered views. It ensures filter state is recoverable and shareable. Lower priority than core search because it enhances existing functionality rather than adding new capability.

**Independent Test**: Can be tested by applying filters on any page, navigating away, using the browser back button, and verifying filters are restored from URL params. Also test by clicking "Clear all" and verifying all filters reset.

**Acceptance Scenarios**:

1. **Given** the user has search text "bench" and category "Strength" active on WorkoutList, **When** they click "Clear all filters", **Then** the search input clears, category resets to "All", and the full workout list is shown.
2. **Given** the user has filters active on WorkoutList, **When** they navigate to another page and return, **Then** the filter state is restored from URL query parameters (if URL sync is implemented) or reset to defaults.
3. **Given** the user has no active filters on any page, **When** they view the page, **Then** no "Clear all filters" button is shown.

---

### Edge Cases

- What happens when the user types a very long search string (100+ characters)? The search should still work with substring matching; no truncation needed.
- What happens when the user types special characters (e.g., `(`, `*`, `@`)? The search should treat them as literal characters, not regex operators.
- What happens when the user rapidly types (e.g., 20 characters in 1 second)? The search should debounce (200-300ms) and only filter after the user pauses typing.
- What happens when the user selects a date range where the start date is after the end date? The system should treat this as an empty range and show zero results with an empty state.
- What happens when all data items have the same name? All matching items are shown; no deduplication.
- What happens when the user applies a meal type filter on the Nutrition page but the current date has no entries of that type? The empty state message should indicate no matches for the selected filters.
- What happens when the user navigates directly to a page with URL filter params (e.g., `/workouts?search=bench&category=strength`)? The page should initialize with those filters pre-applied.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The WorkoutList page MUST provide a text search input that filters workouts by matching the search query against workout title, notes, and exercise names (case-insensitive substring match).
- **FR-002**: The WorkoutList page MUST provide a category filter dropdown with options: All, Strength, Cardio, Flexibility, Hybrid, Other.
- **FR-003**: The WorkoutList page MUST provide a date range filter with preset options (All time, This week, This month, Last 3 months, Last 6 months, This year) and a custom range (from/to date inputs).
- **FR-004**: The Nutrition page MUST provide a text search input that filters nutrition entries by matching the search query against food name (case-insensitive substring match).
- **FR-005**: The Nutrition page MUST provide a meal type filter with options: All, Breakfast, Lunch, Dinner, Snack.
- **FR-006**: The Nutrition page MUST provide a date filter (single date or date range) for filtering entries by date.
- **FR-007**: The ExerciseHistory page MUST provide a text search input that filters exercises by matching the search query against exercise name (case-insensitive substring match).
- **FR-008**: All search inputs MUST debounce user keystrokes at 200-300ms before applying the filter, preventing layout thrashing on rapid typing.
- **FR-009**: Multiple active filters MUST compose as logical AND — a user filtering by search text AND category AND date range sees only items matching all three criteria.
- **FR-010**: Search text and filters MUST be combinable — applying a filter does not clear the search, and vice versa.
- **FR-011**: When filters produce zero matches, the page MUST display an empty state component with a descriptive message and a "Clear all filters" action.
- **FR-012**: A "Clear all filters" button MUST be visible whenever any filter or search is active on a page. Clicking it MUST reset all filters and search text to their default (empty) state.
- **FR-013**: Filter state MUST be maintained while the user stays on the page (does not reset on re-render).
- **FR-014**: Active filters SHOULD be visually indicated with removable chip/tag components below the filter bar.
- **FR-015**: Search and filter operations MUST be read-only — they MUST NOT modify source data or trigger side effects.
- **FR-016**: Filter state SHOULD be reflected in URL query parameters (e.g., `?search=bench&category=strength`) so filter state survives page refresh and is shareable.
- **FR-017**: The search input MUST have an associated label or `aria-label` for accessibility.
- **FR-018**: Filter controls MUST be keyboard-navigable.
- **FR-019**: Active filter state changes MUST be announced to screen readers via `aria-live="polite"`.
- **FR-020**: All search and filter UI MUST follow the existing dark theme design system (dark backgrounds, green accents, consistent input/card styles, tight layout spacing matching the Dashboard).
- **FR-021**: On mobile viewports (< 768px), advanced filters (date range) SHOULD be collapsed behind a "Filters" toggle button. Desktop shows filters inline.

### Key Entities

- **Workout**: A logged workout session. Key searchable attributes: title (text), notes (text), exercises[].name (text). Filterable by: category (enum: strength, cardio, flexibility, hybrid, other), date (date).
- **NutritionEntry**: A logged food/meal entry. Key searchable attributes: foodName (text). Filterable by: mealType (enum: breakfast, lunch, dinner, snack), date (date).
- **Exercise**: An individual exercise within a workout. Key searchable attributes: name (text). Exercises are embedded within workouts; the ExerciseHistory page flattens them for display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find a specific workout by typing part of its name in under 2 seconds (search + scan results).
- **SC-002**: Filter results update instantly (< 100ms perceived) after the debounce period.
- **SC-003**: 100% of filter combinations produce correct results (no false positives or false negatives).
- **SC-004**: Empty state is shown within 200ms of a filter producing zero results, with a clear message and actionable "Clear all" button.
- **SC-005**: Users can reset all filters to defaults with a single click ("Clear all filters").
- **SC-006**: Search and filter work consistently across WorkoutList, Nutrition, and ExerciseHistory pages — same UX pattern, same debounce behavior, same empty state style.
- **SC-007**: The feature works on viewports from 320px (mobile) to 1920px+ (desktop) without horizontal overflow or broken layout.
- **SC-008**: All interactive elements (search input, filter dropdowns, clear button) are keyboard-accessible (Tab, Enter, Escape).
- **SC-009**: No new external dependencies are added — search and filtering use existing browser APIs and in-memory data operations.

## Assumptions

- All data is in-memory (frontend-only, mock data) — no server-side search API is needed for this phase.
- Search is client-side: case-insensitive substring matching against in-memory data, with no server round-trip.
- The existing `HistoryFilters` component pattern (category + date range) is extended, not replaced, for the WorkoutList page.
- The existing `DateRangeFilter` component on the Analytics page is NOT modified by this feature — it already has its own filter logic.
- URL query parameter sync is a nice-to-have enhancement; if not implemented, filter state resets on page navigation (acceptable for a frontend-only mock-data phase).
- The ExerciseHistory page currently displays exercises grouped by name — search filters which exercise groups are shown, not individual exercise sets.
- Debounce timing of 250ms is the default; no configuration needed.
- No pagination is implemented — all matching items are shown at once (data volume is small in a mock-data environment).
