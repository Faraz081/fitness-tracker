# Reports & Export — Implementation Roadmap

**Module**: Day 8.1 — Reports & Export  
**Created**: 2026-09-10

---

## Phase 1: Data Models + Fitness Report Page

**Goal**: Establish the server-side aggregation foundation and deliver the
at-a-glance Fitness Report Overview.

**Deliverables**:
- Server-side report aggregation endpoints (auth-scoped, owner-filtered)
  for workout, nutrition, and progress summaries over a date range.
- Shared `DateRangeSelector` component (presets + custom from/to, default
  Last 30 days) with URL-param persistence across tabs.
- Fitness Report Overview page (`/reports`) with KPI cards: Total Workouts,
  Total Volume, Calories Consumed, Weight, Consistency Score.
- Report tabs (Overview / Workout / Nutrition / Progress) navigation.
- Empty, loading (skeleton), and error/retry states for all sections.
- Backend: `routes/reports`, `controllers/reports`, `services/reports`
  (or equivalent) with owner-scoped aggregation queries.

**Key decisions to make**:
- Exact API endpoint paths (e.g. `GET /api/reports/:type?from&to`).
- Consistency Score formula (active days ÷ range days).
- PR definition (full history vs range-only comparison).

**Gates**:
- `/reports` renders inside `DashboardLayout` with correct shell/tokens.
- KPI cards show real values from server aggregation.
- Date range persists across tabs and survives page refresh.
- Invalid/inverted ranges produce friendly validation errors.
- No new env vars; no new Mongoose models.

---

## Phase 2: Workout & Nutrition Reports

**Goal**: Deliver the detailed Workout and Nutrition report views with
accurate metrics, tables, and charts.

**Deliverables**:
- **Workout Report**: workout count, total volume, average sessions/week,
  frequency series, per-category breakdown, per-workout list, notable
  lifts, PR count. "Not tracked" states for duration and muscle groups.
- **Nutrition Report**: range totals and daily averages for calories,
  protein, carbs, fat; per-meal-type breakdown; daily totals table;
  meals list. Goal comparison only when persisted goal exists.
- Charts: volume over time, workout frequency, category distribution,
  calories per day, macro distribution.
- Drill-down from workout report to existing `WorkoutDetail` view.

**Key decisions to make**:
- Chart types (line vs bar) for each metric.
- Whether to show a calorie goal adherence gauge (only if persisted goal
  exists).

**Gates**:
- Workout metrics match independent count of user's records in range.
- Nutrition totals are server-computed (Principle VIII) and match sums.
- Per-meal-type breakdown sums exactly to range totals.
- Duration/muscle-group sections show "Not tracked" states.
- Empty/sparse ranges render designed states; no `NaN` or fabricated values.

---

## Phase 3: Progress Report + Charts

**Goal**: Deliver the Progress report with strength progression, PRs, and
real-data-only progress indicators.

**Deliverables**:
- **Progress Report**: latest weight and goal from profile; workout
  consistency (sessions/week); nutrition consistency (logged days ÷
  range days); strength progression per exercise (best weight over time);
  PR count and notable lifts.
- Charts: strength progression per exercise (line/markers).
- "No data" states for weight trend, milestones, and progress photos
  (not persisted in current model).

**Key decisions to make**:
- Exact strength progression chart format.
- Whether to show prior-best comparison in the progression table.

**Gates**:
- Strength progression derived only from real exercise records.
- Weight/milestone/photo sections show "no data" states when not persisted.
- Consistency metrics use real logged days only.
- All charts have `role="img"`, `aria-label`, and text alternatives.

---

## Phase 4: CSV/PDF Export Pipeline

**Goal**: Implement reliable, accurate CSV and PDF exports for every
report type including the Overview.

**Deliverables**:
- **CSV export**: client-side generation from pre-aggregated data; UTF-8
  BOM, proper quoting/escaping, report title + date-range header, correct
  filename format. Valid zero-data files for empty ranges.
- **PDF export**: one approved client-side PDF library (recorded in
  Complexity Tracking); header (app name, user name, title, range,
  timestamp); KPIs, tables, static chart renderings; "No data" notes for
  empty sections; paginated, print-ready.
- **Export UI**: ExportButtons component with idle → loading → success/
  error states; `aria-live` announcements; Retry on failure.
- **Shared pipeline**: pure functions in `reportUtils.js` for CSV building
  and PDF generation; same pre-aggregated data as the page (single source
  of truth).

**Key decisions to make**:
- Which PDF library to use (e.g. jsPDF, pdfmake, @react-pdf/renderer).
- Whether to use an Export dropdown or separate CSV/PDF buttons.

**Gates**:
- CSV opens cleanly in spreadsheet software (Excel, Google Sheets).
- PDF opens in standard readers with all required header items.
- Exports match on-screen data exactly (zero drift).
- Empty ranges produce valid zero-data files.
- Failed exports show error + Retry; no partial/corrupt files.
- Exactly one new npm dependency (PDF library) documented in Complexity
  Tracking.

---

## Phase 5: Polish, Accessibility, and Performance Tuning

**Goal**: Final pass across all reports and exports for accessibility,
performance, edge cases, and visual polish.

**Deliverables**:
- **Accessibility audit**: all controls keyboard-operable, `aria-label`s
  on icon-only controls, `aria-live` for export feedback, focus-visible
  rings in accent color, contrast verified on dark theme.
- **Performance tuning**: verify <2s load for 30-day reports, <10s for
  exports; optimize server-side aggregation queries; add indexes if
  needed; verify All-Time ranges degrade gracefully.
- **Edge-case hardening**: comprehensive testing of empty ranges, single-
  day ranges, All-Time ranges, missing profile fields, concurrent users.
- **Visual polish**: consistent numeric formatting, responsive layout at
  3 breakpoints, no horizontal scroll, chart reflow, tight side spacing.
- **Regression check**: verify all prior-day features (Dashboard, Progress,
  Goals, History, Analytics, Search, Notifications, Settings) still work
  unchanged.
- **Documentation**: update quickstart with Reports section walkthrough;
  record manual verification results.

**Gates**:
- All SC-001 through SC-014 success criteria met.
- All 8 constitution principles verified as non-violated.
- `npm run build` passes cleanly; backend `node --check` passes.
- Manual browser verification recorded at 3 breakpoints.
- No prior-day regressions detected.

---

## Phase Dependencies

```
Phase 1 (Data Models + Overview)
  ↓
Phase 2 (Workout & Nutrition Reports)
  ↓
Phase 3 (Progress Report + Charts)
  ↓
Phase 4 (CSV/PDF Export Pipeline)
  ↓
Phase 5 (Polish, Accessibility, Performance)
```

Each phase depends on the previous phase's completion. Phases 2 and 3
could potentially run in parallel if staffed, as they deliver independent
report types built on the same Phase 1 foundation.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF library adds bundle size or conflicts | Medium | Evaluate library size early in Phase 4; record in Complexity Tracking |
| Server aggregation too slow for All-Time ranges | High | Pre-aggregate with daily buckets + capping; test with realistic data volumes |
| CSV encoding issues across spreadsheet apps | Medium | Test UTF-8 BOM with Excel, Google Sheets, Numbers; use proven quoting logic |
| Chart rendering in PDF loses fidelity | Medium | Use static vector drawings from approved library; test print quality |
| Scope creep from new report types | High | Constitution principle 8 (Evolution) requires amendment for new types |

---

## Success Criteria Summary

| ID | Criterion | Phase |
|----|-----------|-------|
| SC-001 | 30-day report loads < 2s | 1, 5 |
| SC-002 | Exports complete < 10s | 4, 5 |
| SC-003 | Screen = CSV = PDF (zero drift) | 4 |
| SC-004 | Metrics match independent record count | 1, 2, 3 |
| SC-005 | Non-persisted data → "not tracked" states | 2, 3 |
| SC-006 | Empty ranges → valid states + valid exports | 2, 3, 4 |
| SC-007 | CSV opens cleanly in spreadsheet software | 4 |
| SC-008 | PDF opens with required header items | 4 |
| SC-009 | User isolation verified | 1 |
| SC-010 | Range persists across tabs + refresh | 1 |
| SC-011 | Keyboard accessible + screen-reader friendly | 5 |
| SC-012 | Visual consistency with Dashboard | 1, 5 |
| SC-013 | Invalid ranges → friendly validation | 1 |
| SC-014 | No prior-day regressions | 5 |
