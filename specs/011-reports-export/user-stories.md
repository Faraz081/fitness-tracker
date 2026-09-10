# User Stories: Reports & Export (8.1)

**Feature**: Reports & Export
**Feature Branch**: `011-reports-export`
**Created**: 2026-09-10

---

## US-001 — View the Fitness Report overview (Priority: P1)

A signed-in user opens the Reports section and immediately sees the **Fitness Report (Overview)** for the default range (last 30 days): a row of KPI cards summarizing everything at a glance — how many workouts they logged, total volume lifted, calories consumed, their weight (or weight change when history exists), and a Consistency Score showing how regularly they were active. Below the KPI row, clearly-labelled tabs let them jump into the detailed Workout, Nutrition, and Progress reports without losing their place or their chosen range.

**Why this priority**: Without the Overview, there is no entry point to the Reports module. It is the smallest slice that delivers standalone value — an at-a-glance answer to "how am I doing?" — and it establishes the tab navigation and KPI card pattern every other report reuses.

**Independent Test**: Fully testable by opening the Reports section, verifying all five KPI cards render real values for the last 30 days, checking the Consistency Score appears (or shows a "no data" state), and clicking each tab to confirm the corresponding detailed report opens while the KPI row and date range remain visible.

**Acceptance Scenarios**:

1. **Given** a user with workouts, nutrition logs, and a profile weight on file, **When** they open the Reports section, **Then** the Overview shows Total Workouts, Total Volume, Calories Consumed (with daily average), Weight (or Weight Change), and Consistency Score for the last 30 days.
2. **Given** the selected range, **When** all five KPI cards require data, **Then** every card shows a real value or a designed "no data" state — never a blank, a placeholder, or a fabricated number.
3. **Given** a user is viewing the Overview, **When** they click the Workout, Nutrition, or Progress tab, **Then** the corresponding detailed report opens with the same date range already applied.
4. **Given** a user with zero activity, **When** they open the Overview, **Then** the page shows a friendly empty state explaining no data exists for the range and offering to widen it.

---

## US-002 — Change the date range and see every report update (Priority: P1)

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

## US-003 — Review the Workout report (Priority: P2)

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

## US-004 — Review the Nutrition report (Priority: P2)

A user opens the Nutrition report to see how they ate in the selected range: total and daily-average calories and macros (protein, carbs, fat), a per-meal-type breakdown (breakfast, lunch, dinner, snack), a day-by-day table, a calories-over-time chart, and the full list of logged meals. If a calorie/macro goal target has been persisted, the report shows how their intake compares to it; otherwise it clearly says no goal is set for the range.

**Why this priority**: Nutrition tracking is a shipped part of the app, and the report turns daily logs into a clear assessment of eating patterns over any range. It is the nutrition companion to the Workout report.

**Independent Test**: Fully testable by comparing totals, averages, and the meal list to the nutrition logs in the range, verifying the per-meal breakdown sums to the totals, and confirming the goal-comparison section states no goal is set when none exists.

**Acceptance Scenarios**:

1. **Given** a user with nutrition logs in the range, **When** they open the Nutrition report, **Then** it shows range totals and daily averages for calories, protein, carbs, and fat, plus the number of days logged.
2. **Given** logs spanning multiple days and meal types, **When** the report renders, **Then** the per-meal-type breakdown (breakfast/lunch/dinner/snack) sums exactly to the range totals.
3. **Given** a persisted calorie/macro goal target, **When** the report renders, **Then** it shows adherence vs the goal; **Given** no goal target is persisted, **Then** it states "No goal set in this range".
4. **Given** the user changes the range, **When** the report reloads, **Then** all nutrition metrics and the meal list reflect only that range.

---

## US-005 — Review the Progress report (Priority: P2)

A user opens the Progress report to see their trajectory: their latest recorded weight and their goal from their profile, how consistently they trained and logged nutrition in the range, and strength progression with PRs derived from their real exercise records. Weight history and milestone features are shown only when the app actually records them; since the app does not persist weight history, photos, or milestone data, those sections show graceful "no data in this range" states rather than invented trends.

**Why this priority**: Progress is the motivational core of the app. This report, built purely from persisted profile, workout, and nutrition data, gives users an honest picture of whether they are moving toward their goal.

**Independent Test**: Fully testable by comparing the profile weight/goal, workout and nutrition consistency numbers, and the strength progression table against the real underlying data, and confirming history-dependent sections render "no data" states.

**Acceptance Scenarios**:

1. **Given** a user with a profile weight and goal, **When** they open the Progress report, **Then** their latest weight and goal are displayed.
2. **Given** workouts and nutrition logs in the range, **When** the report renders, **Then** workout consistency and nutrition consistency are shown, derived only from real logged days.
3. **Given** recorded exercises with weights over the range, **When** the report renders, **Then** strength progression and PRs are shown per exercise, calculated only from recorded data.
4. **Given** no persisted weight history, progress photos, or milestone data, **When** the report renders, **Then** the weight-trend, photo, and milestone sections show designed "no data in this range" states and never an estimated trend.

---

## US-006 — Export any report to CSV (Priority: P3)

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

## US-007 — Export any report to PDF (Priority: P3)

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

## Edge Cases

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
