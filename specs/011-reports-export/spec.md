# Feature Specification: Reports & Export (8.1)

**Feature Branch**: `011-reports-export`  
**Created**: 2026-09-10  
**Status**: Draft  
**Input**: User description: "/sp.specify

## 8.1 — Reports & Export

### Context
We are building the Reports & Export module as defined in the constitution.
Create a precise, implementation-ready specification for:

- Fitness Report page (overview)
- Workout Report
- Nutrition Report
- Progress Report
- Date-range selection
- Export CSV
- Export PDF
- Download / Generate Report buttons

### Specification Requirements

Produce a complete specification that includes:

1. **User Stories** — clear user stories for each major capability (viewing each report type, changing date range, exporting CSV, exporting PDF).
2. **Detailed Functional Specification** — screen-by-screen / component-level behavior for: Fitness Report (overview dashboard), Workout Report, Nutrition Report, Progress Report; exact metrics, tables, and charts that must appear on each report; date-range selector behavior (presets + custom range), default value, and how it affects data; Export CSV exact columns/data per report type; Export PDF required structure, content, and layout guidelines (title, date range, summary cards, tables, charts as images, branding, timestamp).
3. **UI/UX Specification** — layout structure for the reports section (navigation between reports, placement of date range + export buttons); loading, empty, and error states for every report and both export actions; responsive behavior (desktop vs mobile); accessibility requirements.
4. **Data & Calculation Rules** — how each key metric is calculated (total volume, consistency score, calorie adherence, weight change, strength progress); data sources and aggregation rules; timezone handling for date ranges.
5. **API / Backend Expectations** (high-level) — endpoints or data contracts needed to support the reports and exports; performance expectations for data fetching and file generation.
6. **Acceptance Criteria** — testable acceptance criteria for every major feature (including edge cases such as no data, very large date ranges, failed exports, etc.).
7. **Edge Cases & Error Handling** — no data in selected range, partial data, export failures / timeouts, very large date ranges, missing goals or incomplete user profile data.

### Output Format
Structure the specification clearly with headings and sub-headings so it can be directly used by developers and designers. Be precise and unambiguous. Prefer concrete definitions over vague statements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the Fitness Report overview (Priority: P1)

A signed-in user opens the Reports section and immediately sees the **Fitness Report (Overview)** for the default range (last 30 days): a row of KPI cards summarizing everything at a glance — how many workouts they logged, total volume lifted, calories consumed, their weight (or weight change when history exists), and a Consistency Score showing how regularly they were active. Below the KPI row, clearly-labelled tabs let them jump into the detailed Workout, Nutrition, and Progress reports without losing their place or their chosen range.

**Why this priority**: Without the Overview, there is no entry point to the Reports module. It is the smallest slice that delivers standalone value — an at-a-glance answer to "how am I doing?" — and it establishes the tab navigation and KPI card pattern every other report reuses.

**Independent Test**: Fully testable by opening the Reports section, verifying all five KPI cards render real values for the last 30 days, checking the Consistency Score appears (or shows a "no data" state), and clicking each tab to confirm the corresponding detailed report opens while the KPI row and date range remain visible.

**Acceptance Scenarios**:

1. **Given** a user with workouts, nutrition logs, and a profile weight on file, **When** they open the Reports section, **Then** the Overview shows Total Workouts, Total Volume, Calories Consumed (with daily average), Weight (or Weight Change), and Consistency Score for the last 30 days.
2. **Given** the selected range, **When** all five KPI cards require data, **Then** every card shows a real value or a designed "no data" state — never a blank, a placeholder, or a fabricated number.
3. **Given** a user is viewing the Overview, **When** they click the Workout, Nutrition, or Progress tab, **Then** the corresponding detailed report opens with the same date range already applied.
4. **Given** a user with zero activity, **When** they open the Overview, **Then** the page shows a friendly empty state explaining no data exists for the range and offering to widen it.

---

### User Story 2 - Change the date range and see every report update (Priority: P1)

A user chooses how far back to look. From the date-range selector (offered once, at the top of every report tab), they pick a preset — Last 7 days, Last 30 days (default), Last 90 days, This Month, Last Month, This Year, or All Time — or enter custom start/end dates, then press Generate. Every metric, table, and chart on the current report AND the Overview recalculates from the same underlying data for exactly that inclusive range. If they switch tabs or refresh the page, their chosen range is still applied.

**Why this priority**: The date range is the spine of the whole module — every report and every export is only meaningful over a defined range. Without it, none of the detailed reports or exports deliver correct value.

**Independent Test**: Fully testable by selecting each preset and a custom range, confirming the report values change to match the underlying data for that inclusive range, switching between all tabs and refreshing the page to verify the range persists, and entering an invalid range to confirm a friendly error.

**Acceptance Scenarios**:

1. **Given** the default selection of Last 30 days, **When** a user opens any report, **Then** the report shows the range as "Last 30 days" with concrete from/to dates and all data scoped to those dates inclusive.
2. **Given** a user selects any preset (Last 7/30/90 days, This/Last Month, This Year, All Time), **When** they press Generate, **Then** every metric, table, chart, and KPI on the current report and the Overview reflects exactly that inclusive range.
3. **Given** a user enters custom from/to dates, **When** they press Generate, **Then** the report covers precisely those dates inclusive, and the custom range is labelled with both dates.
4. **Given** a user with an applied range, **When** they switch between Overview, Workout, Nutrition, and Progress tabs, **Then** every tab keeps the same range applied.
5. **Given** a user with an applied range, **When** they refresh the page, **Then** the same range is still selected and applied.
6. **Given** a user enters a from date later than the to date, or an empty/invalid date, **When** they press Generate, **Then** a friendly validation message is shown and no broken report is rendered.

---

### User Story 3 - Review the Workout report (Priority: P2)

A user opens the Workout report to see how much and how consistently they trained in the selected range: how many workouts they logged, total volume, average sessions per week, a breakdown by workout category (strength, cardio, flexibility, hybrid, other), a frequency series, and their notable lifts and personal records (PRs). They can drill into any individual workout for its details. Duration and muscle-group statistics cannot be shown because the app does not record them, so those sections clearly say "Not tracked" rather than showing guesses.

**Why this priority**: Workouts are the core activity the app tracks, so a dedicated, accurate workout analysis over the chosen range is the highest-value detailed report. It builds directly on the Overview's workout KPIs.

**Independent Test**: Fully testable by comparing the report's totals and per-workout rows against the workouts logged in the range, selecting a range that excludes some workouts to confirm they drop out, and confirming the duration and muscle-group sections show designed "Not tracked" states.

**Acceptance Scenarios**:

1. **Given** a user with logged workouts in the range, **When** they open the Workout report, **Then** it shows workout count, total volume, average sessions per week, category breakdown, a frequency series, and a list of workouts with date, title, category, and volume.
2. **Given** the user has exercises with recorded weight in the range, **When** the report renders, **Then** notable lifts (best weight per exercise) and a PR count appear, calculated only from recorded data.
3. **Given** the range changed, **When** the report reloads, **Then** all workout metrics, tables, and charts match only the workouts in that range.
4. **Given** the app does not record workout duration or muscle groups, **When** the report renders, **Then** those sections state "Not tracked" in designed no-data form and no estimated values appear anywhere.
5. **Given** a user clicks a workout in the report, **When** the detail view opens, **Then** it shows that workout's logged exercises, sets, reps, weights, and notes.

---

### User Story 4 - Review the Nutrition report (Priority: P2)

A user opens the Nutrition report to see how they ate in the selected range: total and daily-average calories and macros (protein, carbs, fat), a per-meal-type breakdown (breakfast, lunch, dinner, snack), a day-by-day table, a calories-over-time chart, and the full list of logged meals. If a calorie/macro goal target has been persisted, the report shows how their intake compares to it; otherwise it clearly says no goal is set for the range.

**Why this priority**: Nutrition tracking is a shipped part of the app, and the report turns daily logs into a clear assessment of eating patterns over any range. It is the nutrition companion to the Workout report.

**Independent Test**: Fully testable by comparing totals, averages, and the meal list to the nutrition logs in the range, verifying the per-meal breakdown sums to the totals, and confirming the goal-comparison section states no goal is set when none exists.

**Acceptance Scenarios**:

1. **Given** a user with nutrition logs in the range, **When** they open the Nutrition report, **Then** it shows range totals and daily averages for calories, protein, carbs, and fat, plus the number of days logged.
2. **Given** logs spanning multiple days and meal types, **When** the report renders, **Then** the per-meal-type breakdown (breakfast/lunch/dinner/snack) sums exactly to the range totals.
3. **Given** a persisted calorie/macro goal target, **When** the report renders, **Then** it shows adherence vs the goal; **Given** no goal target is persisted, **Then** it states "No goal set in this range".
4. **Given** the user changes the range, **When** the report reloads, **Then** all nutrition metrics and the meal list reflect only that range.

---

### User Story 5 - Review the Progress report (Priority: P2)

A user opens the Progress report to see their trajectory: their latest recorded weight and their goal from their profile, how consistently they trained and logged nutrition in the range, and strength progression with PRs derived from their real exercise records. Weight history and milestone features are shown only when the app actually records them; since the app does not persist weight history, photos, or milestone data, those sections show graceful "no data in this range" states rather than invented trends.

**Why this priority**: Progress is the motivational core of the app. This report, built purely from persisted profile, workout, and nutrition data, gives users an honest picture of whether they are moving toward their goal.

**Independent Test**: Fully testable by comparing the profile weight/goal, workout and nutrition consistency numbers, and the strength progression table against the real underlying data, and confirming history-dependent sections render "no data" states.

**Acceptance Scenarios**:

1. **Given** a user with a profile weight and goal, **When** they open the Progress report, **Then** their latest weight and goal are displayed.
2. **Given** workouts and nutrition logs in the range, **When** the report renders, **Then** workout consistency and nutrition consistency are shown, derived only from real logged days.
3. **Given** recorded exercises with weights over the range, **When** the report renders, **Then** strength progression and PRs are shown per exercise, calculated only from recorded data.
4. **Given** no persisted weight history, progress photos, or milestone data, **When** the report renders, **Then** the weight-trend, photo, and milestone sections show designed "no data in this range" states and never an estimated trend.

---

### User Story 6 - Export any report to CSV (Priority: P3)

At any point, a user clicks Export CSV on any report (including the Overview) and downloads a correctly structured CSV file that opens cleanly in spreadsheet software. The file contains exactly the data the on-screen report showed for the current range: a title and date-range header, then the relevant tables/rows. If a range has no data, the download still succeeds — a valid file with headers and a "No records" line, never a broken or empty file.

**Why this priority**: CSV is the fastest, most universal way to take data elsewhere (their own analysis, spreadsheets). It is independently valuable once at least one report exists and depends only on that report's data.

**Independent Test**: Fully testable by exporting each report type, opening files in spreadsheet software, verifying headers/columns/rows match what the page showed for the same range, and exporting an empty range to confirm a valid zero-data file downloads.

**Acceptance Scenarios**:

1. **Given** a report with data for the current range, **When** the user clicks Export CSV, **Then** a CSV file downloads whose content exactly matches the data displayed on that report for that range.
2. **Given** an exported file, **When** it is opened in spreadsheet software, **Then** columns align, text with commas/quotes/newlines is handled correctly, and the date range is identifiable from the header.
3. **Given** a range with no data, **When** the user clicks Export CSV, **Then** a valid file still downloads with headers, a "No records" line, and zero fabricated rows.
4. **Given** a file export is generated, **When** the download completes, **Then** the filename identifies the report type and the range.
5. **Given** an export that fails while generating, **When** the failure occurs, **Then** a friendly error message with a Retry action appears and no partial file is left behind.

---

### User Story 7 - Export any report to PDF (Priority: P3)

At any point, a user clicks Export PDF on any report (including the Overview) and downloads a clean, print-ready PDF. It opens with a professional header (app name, user name, report title, date range, and a generation timestamp), shows the same KPI/summary values and tables as the page, and includes the report's charts as static graphics. Sections without data show a "No data" note instead of empty images. An empty range still produces a valid one-page "No records" PDF.

**Why this priority**: PDF is the shareable, presentable form of a report (for the user's own records or to print). It completes the export story and is the natural final slice after data and CSV are working.

**Independent Test**: Fully testable by exporting each report type, opening each PDF in a reader, verifying title, range, timestamp, KPIs, tables, and charts match the on-screen data for the same range, and exporting an empty range to confirm a valid "No records" PDF.

**Acceptance Scenarios**:

1. **Given** a report with data for the current range, **When** the user clicks Export PDF, **Then** a PDF file downloads whose header contains the app name, user name, report title, date range, and generation timestamp.
2. **Given** a report with charts, **When** the PDF is generated, **Then** each chart with data is included as a static graphic; no chart with data is silently dropped.
3. **Given** a report section with no data, **When** the PDF is generated, **Then** the section shows a "No data" note in place of an empty image.
4. **Given** a user clicks Export PDF on the Overview, **When** the PDF is generated, **Then** it includes each report's summary values and key tables/charts.
5. **Given** a range with no data, **When** the user clicks Export PDF, **Then** a valid one-page "No records" PDF is produced, still titled and timestamped.
6. **Given** a PDF export is generated, **When** the download completes, **Then** the filename identifies the report type and the range.

---

### Edge Cases

- **No data in the selected range**: every report section shows the shared empty state with a range-scoped message ("No workouts in this date range", etc.) and an action to widen the range; the Overview KPI cards show "no data" rather than zero-filled artifacts; CSV/PDF exports still download valid zero-data files.
- **Sparse data (1 workout, 1 meal, 1 logged day)**: real values render as-is — count is 1, totals equal that one record, averages equal that record's value over the day(s) logged; single-point charts render as markers, never broken axes; no percentages or trends are fabricated.
- **Very large ranges (e.g. All Time)**: charts use daily-bucketed series with capping/messaging; page and exports must not time out or crash (Performance targets in Success Criteria); a clear message appears if a request exceeds a sane limit.
- **Invalid / inverted / empty custom range**: friendly validation message; no broken report ever renders.
- **Range boundary inclusivity**: the from date is the first inclusive day and the to date the last inclusive day; a workout or meal logged on the boundary date is counted.
- **Export failure / timeout**: friendly error state with a Retry action; no partial or corrupt file is offered for download; the retry reuses the same data.
- **Missing goals**: macro/calorie goal comparison sections state "No goal set in this range" — never a fabricated adherence percentage.
- **Incomplete profile**: no weight or no goal on the profile — the Progress report shows the fields that exist and "no data" for the rest; the app does not block rendering of a report because a profile field is missing.
- **Non-tracked quantities**: duration, muscle-group distribution, progress photos, weight-history trends, and milestones are always "Not tracked / no data in this range" — never estimated, averaged into being, or derived from mock data.
- **Units preference**: kg vs lb preference is respected and the SAME units appear in the report and any export for the same range (no silent mixing).
- **User isolation**: a user only ever sees and exports their own data; another account's records never appear, even under an empty-result edge case.
- **Concurrent shape of data**: a workbook category with zero entries in the range still shows a real count of 0 rows (or is omitted) without breaking the category breakdown percentages.

## Requirements *(mandatory)*

### Functional Requirements

**Reports page & navigation**

- **FR-001**: System MUST provide a dedicated Reports section, reachable in one click from the app's main navigation, containing the Fitness Report overview and the Workout, Nutrition, and Progress reports.
- **FR-002**: The section MUST present report tabs — Overview / Workout / Nutrition / Progress — that switch views without navigating away from the Reports section.
- **FR-003**: Each report MUST display a clear report heading and the currently applied date range.
- **FR-004**: The Overview MUST combine KPI cards from all three detailed reports for the selected range: Total Workouts, Total Volume, Calories Consumed (with daily average), Weight/Weight Change, and Consistency Score.

**Date-range selection**

- **FR-005**: EVERY report tab MUST expose the same date-range selector with presets: Last 7 days, Last 30 days (default), Last 90 days, This Month, Last Month, This Year, All Time.
- **FR-006**: The selector MUST also accept a custom range via from/to date inputs, inclusive of both dates.
- **FR-007**: A Generate action MUST apply the selected range to the current report AND the Overview simultaneously.
- **FR-008**: The applied range MUST persist across all report tabs and survive a page refresh.
- **FR-009**: Invalid, empty, or inverted ranges MUST be rejected with a friendly validation message; no broken report may render.
- **FR-010**: The applied range MUST be visible on every report and embedded in any exported file (header and filename).

**Workout report**

- **FR-011**: System MUST show workout count, total volume, average sessions per week, frequency over the range, per-category breakdown (strength/cardio/flexibility/hybrid/other), a per-workout list, notable lifts, and a PR count — all computed from recorded workouts in the range.
- **FR-012**: Each workout row MUST show its date, title, category, volume, exercise count, and PR count.
- **FR-013**: Users MUST be able to open any single workout's details from the report.
- **FR-014**: Duration and muscle-group sections MUST render as "Not tracked" no-data states whenever the app does not record these fields — never estimates.

**Nutrition report**

- **FR-015**: System MUST show range totals and daily averages for calories, protein, carbs, and fat, plus the number of days logged.
- **FR-016**: System MUST show a per-meal-type breakdown (breakfast/lunch/dinner/snack) that sums to the range totals.
- **FR-017**: System MUST list the logged meals for the range (date, meal type, food name, quantity/unit, calories, macros).
- **FR-018**: Goal comparison MUST appear only when a persisted calorie/macro goal target exists; otherwise the report states "No goal set in this range".

**Progress report**

- **FR-019**: System MUST show the user's latest recorded weight and goal from their profile.
- **FR-020**: System MUST show workout consistency and nutrition consistency derived only from real logged days in the range.
- **FR-021**: System MUST show strength progression and PRs per exercise, calculated only from recorded exercise data.
- **FR-022**: Weight-trend, photo-timeline, and milestone sections MUST render "no data in this range" states whenever the app does not persist such data.

**Exports (CSV & PDF)**

- **FR-023**: Users MUST be able to export CSV for every report, including the Overview.
- **FR-024**: Users MUST be able to export PDF for every report, including the Overview.
- **FR-025**: Each export MUST contain exactly the data shown on the page for the applied range (single source of truth — no drift between screen, CSV, and PDF).
- **FR-026**: Exports MUST succeed even for ranges with no data, producing a valid zero-data file with headers/notes — never an empty or corrupt file, never fabricated rows.
- **FR-027**: Export filenames MUST identify the report type and the date range.
- **FR-028**: A PDF export MUST include a header (app name, user name, report title, applied range, generation timestamp), KPI/summary values, tables, and static chart renderings; chartless or empty sections show "No data" notes.
- **FR-029**: A failed data fetch or a failed export generation MUST show a friendly error with a Retry action — never a silent no-op.

**Accuracy & data integrity**

- **FR-030**: Every metric MUST be computed from the acting user's real, persisted records for the selected range.
- **FR-031**: The system MUST NEVER invent, estimate, or approximate missing values (no fabricated averages, percentages, trends, or weight history).
- **FR-032**: All data MUST be scoped to the single signed-in user; no other user's records may influence or appear in any report or export.
- **FR-033**: Metrics that depend on data the app does not persist (duration, muscle groups, photos, macro goals, weight history, milestones) MUST render as clear "not tracked / no data" states.

**States, design consistency, and accessibility**

- **FR-034**: Every data-driven section MUST show a loading skeleton while its data loads.
- **FR-035**: Every report MUST render a designed empty state when the selected range has no data, with a message specific to that report and an action to widen the range.
- **FR-036**: The Reports section MUST use the app's existing visual language: same navigation shell, same theme, same card surfaces, same headline number style, same tight spacing — verified against the existing Dashboard at three screen sizes.
- **FR-037**: All controls (tabs, presets, date inputs, Generate, export buttons) MUST be operable by keyboard alone and announced to assistive technology; export progress/success MUST be announced (e.g. live region) without blocking the user.
- **FR-038**: The layout MUST be fully responsive (desktop + mobile); charts reflow and no horizontal scrolling occurs at any supported breakpoint.
- **FR-039**: Numeric formatting MUST be consistent everywhere (weights with decimals, volume with thousands separators, calories whole, percentages whole).

### Report Content & Metric Definitions

**Fitness Report (Overview)**

- KPI cards: **Total Workouts**, **Total Volume**, **Calories Consumed** (range total and daily average over logged days), **Weight** (latest weight) with **Weight Change** when a persisted weight history covers the range, and **Consistency Score**.
- Below the KPI row: tab row (Overview / Workout / Nutrition / Progress) and, on the Overview, a compact "what this tells you" area listing the range and the number of logged days.
- Consistency Score displays only when at least one day in the range has activity; with zero activity it shows "No data in this range" — never "0%".

**Workout report**

- Metrics row: Total Workouts, Total Volume, Average Sessions/Week.
- Chart 1: Volume over time (daily buckets; line or bar).
- Chart 2: Workout frequency per week (bar).
- Chart 3: Category distribution (strength/cardio/flexibility/hybrid/other) — bar or donut; percentages only when the range has workouts.
- Table 1: Per-workout list — date, title, category, volume, exercise count, PR count.
- Table 2: Notable lifts — exercise name and best recorded weight in the range.
- Section: Duration and Muscle groups — "Not tracked" state.

**Nutrition report**

- Metrics row: Total Calories, Avg Daily Calories (over logged days), Days Logged, Total/avg Protein, Carbs, Fat.
- Chart 1: Calories per day over time (line).
- Chart 2: Macro distribution (donut) — only when any macro total is above zero.
- Chart 3 (conditional): Goal adherence (gauge or bar) — only when a persisted goal target exists.
- Table 1: Daily totals — date, kcal, protein, carbs, fat.
- Table 2: Per-meal-type summary — meal type, entries, kcal, protein, carbs, fat.
- Table 3: Meals list — date, meal type, food name, quantity, unit, kcal, protein, carbs, fat.

**Progress report**

- Metrics row: Latest Weight, Goal, Workout Consistency (sessions/week), Nutrition Consistency (days logged / range days).
- Chart 1 (conditional): Weight trend — only when a persisted weight history covers the range; otherwise "No weight history in this range".
- Chart 2: Strength progression per exercise (best weight over time; line/markers).
- Table: Strength progression — exercise, best weight in range, prior best, delta.
- Sections: Milestones and Progress photos — "No milestone data yet" / "Not tracked" states (not persisted).

### Export Content Specification

**CSV columns (exact)**

- All CSVs open with a title + date-range header row, then a blank line, then the data.
- Overview (`fitness-<from>_<to>.csv`): three sectioned blocks separated by blank lines — each block starts with a section label row (`Workouts Summary`, `Nutrition Summary`, `Progress Summary`) followed by `metric,value` rows (e.g. `Total Workouts,12`; `Total Volume,1540.5`; `Calories Consumed (total),8900`; `Avg Daily Calories (logged days),635.7`; `Days Logged,14`; `Weight (kg),74.2`; `Weight Change (kg),No data`; `Consistency Score,43%`).
- Workout (`workout-<from>_<to>.csv`): a summary block (`metric,value`) then a per-workout block with header `date,title,category,volume_kg,exercise_count,pr_count` and one row per workout (volume with one decimal, others whole).
- Nutrition (`nutrition-<from>_<to>.csv`): a summary block (`metric,value`) then daily totals with header `date,calories,protein_g,carbs_g,fat_g`, then a meals block with header `date,meal_type,food_name,quantity,unit,calories,protein_g,carbs_g,fat_g`.
- Progress (`progress-<from>_<to>.csv`): a summary block (`metric,value` for Latest Weight, Goal, Workout Consistency, Nutrition Consistency, Strength PR Count), then a strength block with header `exercise,best_weight_kg,prior_best_kg,delta_kg`.
- Empty range: headers as above, zero data rows, plus a line `No records for <from> to <to>`.
- Encoding/escaping: file opens cleanly in spreadsheet software with no encoding artifacts; any field containing a comma, quote, or newline is quoted with doubled quotes.

**PDF structure (required)****

- Header: "Fitness Tracker", user name, report title, applied date range, generation timestamp.
- Body: KPI/summary metrics as cards; section headings; simple tables exactly matching the on-screen data; chart sections render the report's charts as static graphics (vector drawings).
- No-data sections: a "No data" note in place of any missing chart/table content.
- Empty range: a valid, titled, timestamped one-page "No records" PDF.
- Print-ready, shareable layout; basic app-identity header only (no watermarking or branded kit styling).

### Data & Calculation Rules

- **Total Volume (workout)**: the sum over all workouts in the range of Σ(sets × reps × weightKg) across each workout's recorded exercises. Exercises without a recorded weight contribute 0 volume. Volume is displayed and exported in the user's units preference.
- **Total Workouts / Sessions**: number of workout records whose date falls inside the range (inclusive).
- **Average Sessions/Week**: (workout count ÷ number of days in the range) × 7; shown only when workout count ≥ 1; short ranges are computed over their actual day count.
- **Frequency series**: number of workouts per day (daily buckets), aggregated to weekly buckets for very long ranges (e.g. All Time) and capped at a sane number of buckets with clear messaging.
- **Calories Consumed (range total)**: sum of calories across nutrition entries whose date falls inside the range.
- **Avg Daily Calories**: range total ÷ number of days in the range with at least one logged nutrition entry ("logged days"). The number of logged days is always displayed beside the average.
- **Macro totals/averages**: same rules as calories, per macro (protein, carbs, fat).
- **Consistency Score**: (number of days in the range with ≥1 workout entry OR ≥1 nutrition entry) ÷ (number of days in the range) × 100, rounded to a whole percent. Rendered only when ≥1 active day exists; otherwise "No data in this range".
- **Calorie/macro adherence**: only when a persisted calorie/macro goal target exists — daily average ÷ target × 100 (whole percent). Otherwise "No goal set in this range".
- **Weight**: latest recorded weight (from the user's profile, or from persisted weight history when it exists). **Weight Change**: earliest vs latest weight within the range when a persisted weight history provides ≥2 points in the range; otherwise the card shows latest weight or "No data".
- **Strength progression & PRs**: per exercise name, the best recorded weight in the range. A **PR** is recorded when the range's best weight exceeds the best weight for that same exercise name in the user's full previous logged history; **PR count** counts exercises meeting that rule (default definition — the plan MUST record the exact rule chosen). Notable lifts list exercises by their range-best weight. Best-weight values are used as recorded (weightKg).
- **Consistency (progress)**: Workout consistency = sessions/week (as above); Nutrition consistency = logged days ÷ range days (whole percent), plus the raw day count.
- **Percentages**: only computed when the denominator is ≥ 1 and a real value exists; otherwise the metric shows "no data" — never 0% with fake precision.

### Data Sources & Aggregation Rules

- Every metric derives from the acting user's persisted workout records, nutrition records, and profile fields, for the selected range only.
- Totals and averages are computed server-side from owner-scoped records; the client renders and exports those pre-computed summaries rather than re-summing raw records as the source of truth.
- All daily bucketing is by calendar day as defined in Timezone handling below.
- No mock, demo, or example data is a valid report source under any circumstances; reports and exports use only the same persisted data the user can see elsewhere in the app.

### Timezone & Range Handling

- The range and every daily bucket are interpreted in the **user's local timezone**. A record shows in the day that its stored timestamp falls into in the user's local time.
- The same interpretation applies to the report view, the CSV, and the PDF so a single range always yields identical figures everywhere.
- The range is inclusive of both the from and the to dates; a record on either boundary date is included.

### API / Backend Expectations *(high-level)*

- The app MUST provide an authorized, single-user-scoped data service that returns, for a requested date range and report type (overview, workout, nutrition, progress), pre-computed summaries for every metric, table, and chart defined above — including the KPI cards and Consistency Score.
- The service MUST validate the range (inclusive from/to; reject invalid/empty/inverted with a friendly, user-safe message) and MUST guarantee that an empty result never exposes or includes another user's data.
- The service MUST compute from the existing persisted records only; it adds no new data stores and performs no server-side file generation.
- The same returned summary must be the single source for the on-screen report, the CSV, and the PDF (no second, independent fetch that could drift).
- **Performance**: a typical 30-day report must load in under 2 seconds (end-to-end, warm); each export (CSV or PDF) must complete in under 10 seconds for normal ranges; All-Time/large ranges must degrade gracefully (bucketed/capped series and clear messaging) rather than failing or timing out. The plan MUST record how these targets are verified.

### Key Entities *(include if feature involves data)*

- **Report Range**: the inclusive from/to dates in effect for every report and export; identified by preset name or custom dates; carried across tabs and refresh via the page address.
- **Workout Summary**: pre-computed workout report data — count, volume, average/click session figures, per-category counts, frequency series, per-workout rows, notable lifts, PR count.
- **Nutrition Summary**: pre-computed nutrition report data — calorie/macro totals and daily averages, logged-day count, per-meal-type totals, daily totals, meals list.
- **Progress Summary**: pre-computed progress report data — latest weight, goal, workout/nutrition consistency, strength progression (exercise, range best, prior best, delta), PR count; plus explicit no-data markers for non-persisted history.
- **Consistency Score**: pure derived value from the range (active days ÷ range days), with an explicit no-data state when there is no activity.
- **Exported File (CSV/PDF)**: a downloadable artifact for one report and range, generated from the same summary the page displayed, with a header that identifies the app, report, range, and (for PDF) generation timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A 30-day report (any of the four views) loads end-to-end in under 2 seconds from selection/Generate.
- **SC-002**: Exports complete within 10 seconds for normal ranges; All-Time ranges complete without timeout or failure.
- **SC-003**: For every report, the numbers shown on screen equal the numbers in the matching CSV and PDF for the same range (verified by comparison — zero drift).
- **SC-004**: All presets and custom ranges produce results that exactly match an independent count of the user's records within the inclusive range (100% accuracy on audit).
- **SC-005**: 100% of metrics derived from non-persisted data (duration, muscle groups, photos, macro goals, weight history, milestones) appear only in designed "not tracked / no data" states — zero fabricated values.
- **SC-006**: Empty ranges render the designed empty state on every report and still produce valid CSV and PDF files with zero data rows and no errors.
- **SC-007**: 100% of exported CSV files open cleanly in spreadsheet software with correct columns, quoting, and no encoding artifacts (sample of every report type).
- **SC-008**: 100% of exported PDF files open in a PDF reader with the header items present (app name, user name, report title, range, timestamp) and charts included where data exists.
- **SC-009**: A second user's data never appears in any report or export for any range (verified isolation check under empty and populated conditions).
- **SC-010**: The selected range persists across all report tabs and survives a page refresh in 100% of checked cases.
- **SC-011**: All report and export controls are operable by keyboard alone, announced to assistive technology, and export feedback is announced non-blockingly.
- **SC-012**: The Reports section looks consistent with the existing Dashboard (same shell, theme, cards, spacing) at three screen sizes with no horizontal scrolling.
- **SC-013**: Invalid/inverted/empty ranges always produce a friendly validation message and never a broken report.
- **SC-014**: No prior-day feature, route, or visual breaks as a result of this feature (regression check across existing pages).

## Assumptions

- **Timezone**: ranges and daily buckets use the user's local timezone, consistently across report, CSV, and PDF.
- **PR definition default**: a PR is a range-best weight that exceeds the same exercise's best weight across the user's full previous logged history; the plan MUST pin and record this exact rule (the constitution requires the plan to decide full-history vs range-only comparison).
- **Consistency Score formula default**: active days (≥1 workout OR ≥1 nutrition entry) ÷ range days, whole percent, hidden as "no data" when there is no activity; the plan MUST record the exact formula.
- **Weight display**: with no persisted weight history, the Overview/progress shows the current profile weight (or "No data" if none) instead of a change figure.
- **Goal comparison**: macro/calorie goal targets are not currently persisted — the nutrition report shows "No goal set in this range" until such data exists; the reports may only use persisted goal data.
- **Export mechanism**: CSV and PDF are generated from the same pre-computed summary the page already rendered; downloads happen directly in the user's browser session and no server-side file storage or history is kept.
- **Performance verification**: verification of the under-2s / under-10s targets MUST be recorded during planning and implementation.
- **Range persistence**: accomplished through the page address (refresh-surviving), not stored invisibly; no login-required preferences are changed by this feature.
- **Units**: volume and weights display in the user's existing units preference and convert consistently to CSV/PDF.

## Out of Scope

- Emailing, scheduling, or recurring reports.
- Sharing reports publicly, via social media, or with coaches/trainers.
- Advanced report builders, personalization, or filtering beyond the date range.
- Excel (.xlsx) or any export format beyond CSV and PDF.
- Watermarking or branded PDF template kits beyond the basic header.
- Adding new data to the model — workout duration, muscle-group metadata, macro/calorie goal targets, weight-history collection, or progress photos; the reports may use such ONLY if it already exists, never create or fake it.
- Progress photos / visual progress timeline.
- Server-side file generation or storage; export history or saved exports.
- Other third-party charting/files libraries beyond the single approved PDF library.
- Automated test suites or CI for the frontend.
- Deployment or production hosting; cross-device report sync.