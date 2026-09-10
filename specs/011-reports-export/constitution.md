# Reports & Export Module Constitution

**Module**: Day 8.1 — Reports & Export  
**Ratified**: 2026-09-10  
**Version**: 1.0.0

---

## Mission

Enable users to view and export structured reports about their fitness activity,
workouts, nutrition, and progress over selectable date ranges, in both CSV and PDF
formats.

---

## Non-Negotiable Principles

### 1. Data Integrity (NON-NEGOTIABLE)

All report data MUST be derived from validated, time-stamped records. No data
mutation occurs in the reporting layer; reports are read-only views. Date ranges
are inclusive of start date 00:00 and end date 23:59 in the user's timezone.

- Every metric MUST trace to a real persisted record (workouts, nutrition,
  profile fields) — never fabricated, estimated, or approximated.
- The reporting layer MUST be strictly read-only; no create, update, or delete
  operations may occur through report endpoints.
- Date range boundaries MUST be interpreted in the user's local timezone,
  consistently across all reports and exports.

Rationale: A report is a claim about past activity. Fabricating or approximating
values makes the report untrustworthy — the exact failure mode this module exists
to prevent.

### 2. Consistency & Reusability (NON-NEGOTIABLE)

Use a shared report data model and shared date-range component across all report
types. Common export pipeline: query → transform → format (CSV/PDF) →
stream/download. Reuse UI components for tables, charts, filters, and download
buttons.

- A single `DateRangeSelector` component MUST drive all report tabs; changing the
  range MUST re-fetch/re-calculate every metric simultaneously.
- Report data models MUST follow a consistent shape (summary metrics, detail
  tables, chart series) so new report types can conform without redesign.
- The export pipeline MUST be a shared, pure-function chain: fetch → transform
  → format → download; no report-specific export logic outside this pipeline.
- UI primitives (`Card`, `Table`, `Chart`, `EmptyState`, `Spinner`) MUST be
  reused across all report views — no forked copies.

Rationale: Consistency reduces implementation cost and prevents drift between
report types. Reuse keeps the codebase maintainable and ensures every report
behaves identically for the same range.

### 3. User Experience (NON-NEGOTIABLE)

Default to a sensible recent range (e.g., last 30 days) with clear override.
Provide preview before export; show row counts and date range in the preview.
Export actions MUST show progress and clear error messages if generation fails.
PDFs MUST be paginated, printable, and include report title, date range, and
generation timestamp.

- The default date range MUST be "Last 30 days" with a clear label and easy
  override via presets or custom dates.
- Before export, the report MUST display a preview of what will be exported
  (row counts, applied range, metric summary).
- Export buttons MUST show idle → loading → success/error states; the user MUST
  never wonder whether an export is in progress.
- Failed exports MUST surface a clear error message with a Retry action — never
  a silent no-op or partial file.
- PDF exports MUST include: app name, user name, report title, applied date
  range, generation timestamp, and be paginated for printing.

Rationale: Reports are only valuable if users can find, understand, and act on
them. Clear defaults, previews, and feedback prevent confusion and wasted effort.

### 4. Performance & Scalability (NON-NEGOTIABLE)

Reports MUST load within 2 seconds for up to 6 months of data on typical
connections. Use server-side pagination and aggregation for large datasets.
CSV/PDF generation MUST stream for large exports instead of buffering entire
files in memory.

- A 30-day report MUST load end-to-end in under 2 seconds (server aggregation
  + client render, warm).
- Exports MUST complete within 10 seconds for normal ranges; All-Time ranges
  MUST degrade gracefully (bucketed/capped series, clear messaging) rather than
  timing out.
- Server-side aggregation MUST use owner-scoped, index-friendly queries with no
  N+1 patterns; the client renders pre-computed summaries.
- Large exports MUST use streaming (not full-buffer) to avoid memory exhaustion.
- Charts with large datasets MUST use daily-bucketed series with capping and
  clear messaging when limits are exceeded.

Rationale: Slow reports discourage use. Pre-aggregation and streaming ensure the
module scales with user history without degrading the experience.

### 5. Accessibility & Internationalization (NON-NEGOTIABLE)

All interactive elements (date picker, filters, download buttons) MUST be
keyboard-accessible and screen-reader friendly. Numeric formats, date formats,
and units MUST respect user locale settings. Provide text alternatives for
charts and visual summaries.

- All controls MUST be operable by keyboard alone (Tab, Enter, Space, Escape).
- Interactive elements MUST have `aria-label` or associated `<label>` elements.
- Export progress/success/error MUST be announced via `aria-live` regions
  without blocking the user.
- Chart SVGs MUST include `role="img"` and `aria-label` with a text summary.
- Numeric formatting MUST respect the user's locale: weights with decimals,
  volume with thousands separators, calories as whole numbers, percentages as
  whole numbers.
- Date formats MUST be consistent across report views, CSV headers, and PDF
  content.
- Units (kg/lb) MUST respect the user's preference and convert consistently
  everywhere.

Rationale: Accessibility ensures all users can benefit from reports. Locale
awareness prevents confusion when numbers or dates appear in unexpected formats.

### 6. Security & Privacy (NON-NEGOTIABLE)

Reports are private to the authenticated user; enforce authorization on every
report endpoint. Exported files MUST NOT include internal IDs or debug
information. Log export events (type, date range, format) for audit, but never
log raw personal data.

- Every report endpoint MUST require authentication and enforce owner-scoped
  queries (`{ owner: req.userId }`) — Principle VII applies.
- A second user's data MUST NEVER appear in any report or export, even under
  empty-result conditions.
- Exported CSV/PDF files MUST NOT contain internal MongoDB `_id` values,
  owner references, or debug metadata.
- Export events (report type, date range, format) MUST be logged for audit;
  raw personal data (food names, exercise details, weight values) MUST NOT
  be logged.
- Error responses MUST NOT leak internal details (stack traces, query shapes,
  database errors).

Rationale: Reports contain sensitive fitness and health data. Authorization,
data minimization, and audit logging protect user privacy without sacrificing
utility.

### 7. Testing & Reliability (NON-NEGOTIABLE)

Define contract tests for each report type: given sample data, assert exact
CSV/PDF structure and content. Include edge-case tests: empty data, single-day
range, very large ranges, missing fields. All export endpoints MUST have
integration tests verifying headers, content-type, and streaming behavior.

- Contract tests MUST verify: given known persisted data and a specific date
  range, each report returns the exact expected metrics, tables, and chart
  series.
- CSV export tests MUST verify: UTF-8 BOM, correct headers, proper quoting/
  escaping, valid file structure, and exact content match for sample data.
- PDF export tests MUST verify: header items present (app name, user name,
  title, range, timestamp), charts included where data exists, "No data"
  notes for empty sections.
- Edge-case tests MUST cover: empty range, single-day range, All-Time range,
  missing profile fields, no workouts, no nutrition logs, concurrent users.
- Integration tests MUST verify: correct HTTP headers, content-type for CSV/
  PDF, streaming behavior for large exports, authentication enforcement.
- All tests MUST pass before the module is considered complete.

Rationale: Reports make claims about user data. Testing ensures those claims
are accurate and that exports are reliable under all conditions.

### 8. Evolution & Governance (NON-NEGOTIABLE)

New report types MUST conform to the shared report model and export pipeline.
Any change to the report schema requires a migration plan and backward-
compatible export behavior for at least one major version. This constitution
can be amended via a documented proposal that includes impact analysis on
existing reports and exports.

- New report types MUST use the same data model shape (summary metrics, detail
  tables, chart series) and the same export pipeline — no report-specific
  export paths.
- Schema changes (new fields, renamed metrics, structural changes) MUST include
  a migration plan and maintain backward-compatible exports for at least one
  major version.
- Constitution amendments MUST be proposed in writing with: rationale, impact
  analysis on existing reports/exports, migration plan, and approval before
  implementation.
- Version bumps follow semver: MAJOR for principle removals/redefinitions,
  MINOR for new principles/materially expanded guidance, PATCH for
  clarifications.

Rationale: The module will evolve as the app grows. Governance ensures changes
are deliberate, backward-compatible, and documented.

---

## Scope

- Fitness report page (overview dashboard)
- Workout report (per-session and aggregated)
- Nutrition report (macros, calories, meals)
- Progress report (weight, body measurements, performance trends)
- Export functionality: CSV and PDF
- Date-range selection (preset ranges + custom)
- Download/report buttons with clear affordances and states (idle, loading,
  success, error)

---

## Governance

- **Amendment procedure**: Propose the change in writing with rationale,
  impact analysis, and migration plan. Requires explicit approval before
  implementation.
- **Versioning policy**: MAJOR for removed/redefined principles; MINOR for
  added principles or materially expanded guidance; PATCH for clarifications
  and typo fixes.
- **Compliance review**: All plans, specs, and task lists MUST pass a
  Constitution Check gate before implementation. Pull requests MUST confirm
  no violation of these principles.
- **Runtime guidance**: Use this document as the source of truth for the
  Reports & Export module; amendments propagate to dependent templates and
  specs.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
