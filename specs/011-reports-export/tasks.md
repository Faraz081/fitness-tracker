# Tasks: Reports & Export (8.1)

**Feature**: 011-reports-export
**Date**: 2026-09-10
**Branch**: `011-reports-export`

## Overview

Break the "8.1 — Reports & Export" implementation into 25 atomic tasks organized across 5 phases. Each task is independently testable with clear verification criteria.

**Spec**: [spec.md](./spec.md) — 7 user stories (US-001–US-007), 39 functional requirements, 14 success criteria
**Plan**: [plan.md](./plan.md) — 5 implementation groups, 22 technical tasks, 4 API endpoints

## User Stories

| Story | Priority | Description |
|-------|----------|-------------|
| US-001 | P1 | View the Fitness Report overview |
| US-002 | P1 | Change date range and see every report update |
| US-003 | P2 | Review the Workout report |
| US-004 | P2 | Review the Nutrition report |
| US-005 | P2 | Review the Progress report |
| US-006 | P3 | Export any report to CSV |
| US-007 | P3 | Export any report to PDF |

## Phases

### Phase 1: Backend Foundation
Establish the server-side aggregation layer. All endpoints return pre-computed summaries scoped to the authenticated user.

### Phase 2: Frontend Foundation
Build shared UI components, API layer, and page shell. Reusable across all report types.

### Phase 3: Report Views (US-001 through US-005)
Implement the Overview, Workout, Nutrition, and Progress report views with real data rendering.

### Phase 4: Export Pipeline (US-006, US-007)
Implement CSV and PDF export from pre-aggregated data. Client-side generation from the same data the page renders.

### Phase 5: Integration & Polish
Wire up routing, accessibility, responsive design, performance verification, and final E2E checks.

---

## Task List

- [X] T001 Create date-range validation schema and Zod query validators in `backend/src/utils/validators.js`
- [X] T002 Create `backend/src/services/reports/workoutReportService.js` — workout aggregation pipeline (total workouts, volume, avg sessions/week, category breakdown, frequency series, workout list, notable lifts, PRs)
- [X] T003 Create `backend/src/services/reports/nutritionReportService.js` — nutrition aggregation pipeline (calorie/macro totals, daily averages, meal type breakdown, daily totals, meals list)
- [X] T004 Create `backend/src/services/reports/progressReportService.js` — progress aggregation (profile data, workout/nutrition consistency, strength progression, PRs)
- [X] T005 Create `backend/src/services/reports/overviewReportService.js` — overview aggregation combining workout + nutrition + progress KPIs with consistency score
- [X] T006 Create `backend/src/controllers/reports.js` — controller handlers for all 4 report types using success() response pattern
- [X] T007 Create `backend/src/routes/reports.js` — GET `/api/reports/:type` route with authenticate middleware and Zod query validation
- [X] T008 Register reports router in `backend/src/app.js` as `app.use('/api/reports', reportsRouter)`
- [X] T009 Create `frontend/src/services/reports.js` — API client functions (getOverview, getWorkout, getNutrition, getProgress) using existing apiGet pattern
- [X] T010 Create `frontend/src/components/reports/ReportTabs.jsx` — tab bar with Overview/Workout/Nutrition/Progress tabs (named export, keyboard accessible)
- [X] T011 Create `frontend/src/components/reports/DateRangeSelector.jsx` — preset buttons + custom date inputs + Generate button (presets: Last 7/30/90 days, This Month, Last Month, This Year, All Time)
- [X] T012 Create `frontend/src/components/reports/ReportCard.jsx` — reusable section wrapper with title and content slot
- [X] T013 Create `frontend/src/components/reports/KpiCard.jsx` — single KPI display card with label, value, and optional subtitle
- [X] T014 Create `frontend/src/components/reports/OverviewReport.jsx` — Overview tab: 5 KPI cards (Total Workouts, Total Volume, Calories Consumed, Weight, Consistency Score) with empty state
- [X] T015 Create `frontend/src/components/reports/WorkoutReport.jsx` — Workout tab: metrics row, category breakdown, workout list table, notable lifts, "Not tracked" states for duration/muscle groups
- [X] T016 Create `frontend/src/components/reports/NutritionReport.jsx` — Nutrition tab: metrics row, meal type breakdown, daily totals, meals list, goal comparison ("No goal set" when none)
- [X] T017 Create `frontend/src/components/reports/ProgressReport.jsx` — Progress tab: profile section, consistency, strength progression table, "No data" states for weight history/milestones/photos
- [X] T018 Create `frontend/src/pages/Reports.jsx` — page shell: DashboardLayout + ReportTabs + DateRangeSelector + date range state via useSearchParams + active tab + report data fetching + loading/error states
- [X] T019 Add `/reports` route to `frontend/src/App.jsx` inside ProtectedRoute, add "Reports" nav entry to Sidebar
- [X] T020 Create `frontend/src/utils/csvExport.js` — pure functions: buildOverviewCsv, buildWorkoutCsv, buildNutritionCsv, buildProgressCsv (UTF-8 BOM, proper quoting, empty range handling, filename generation)
- [X] T021 Install `jspdf` and `jspdf-autotable` in frontend; create `frontend/src/utils/pdfExport.js` — pure functions: exportOverviewPdf, exportWorkoutPdf, exportNutritionPdf, exportProgressPdf (header with app name/user/range/timestamp, KPIs, tables, chart placeholders, empty range handling)
- [X] T022 Create `frontend/src/components/reports/ExportButtons.jsx` — Export CSV + Export PDF buttons with loading/success/error states, aria-live announcement, retry on failure
- [X] T023 Add empty states (EmptyState component with icon+title+message+action), loading skeletons (Skeleton variants), and error/retry states to all report views
- [X] T024 Accessibility pass: keyboard navigation for all controls, aria-labels on tabs/buttons/inputs, aria-live region for export feedback, focus management, screen reader announcements
- [X] T025 Performance verification: time 30-day report load (<2s target), time CSV/PDF exports (<10s target), verify All-Time range degrades gracefully, record results in quickstart.md

---

## Dependency Graph

```
Phase 1 (Backend):
  T001 ──┬── T002 [P]  (overview depends on workout + nutrition)
  T001 ──┼── T003 [P]
  T001 ──┼── T004 [P]
  T002+T003+T004 ── T005
  T005+T001 ── T006 ── T007 ── T008

Phase 2 (Frontend Foundation):
  T009 ── (no backend dependency for the API layer shape)
  T010 [P], T011 [P], T012 [P], T013 [P] — all independent

Phase 3 (Report Views):
  T009+T012+T013 ── T014 (Overview)
  T009+T012+T013 ── T015 (Workout)
  T009+T012+T013 ── T016 (Nutrition)
  T009+T012+T013 ── T017 (Progress)
  T014+T015+T016+T017+T010+T011 ── T018 (Page shell)
  T018 ── T019 (Route + Nav)

Phase 4 (Export Pipeline):
  T020 [P] — CSV (independent, needs only report data shapes)
  T021 [P] — PDF (independent, needs only report data shapes)
  T020+T021 ── T022 (ExportButtons)

Phase 5 (Polish):
  T019+T022 ── T023 (Empty/Loading/Error states)
  T023 ── T024 (Accessibility)
  T024 ── T025 (Performance verification)
```

## Parallel Execution Opportunities

**Phase 1** (backend services can run in parallel):
- T002, T003, T004 can all run simultaneously after T001

**Phase 2** (frontend foundation can run in parallel):
- T010, T011, T012, T013 can all run simultaneously

**Phase 3** (report views can run in parallel):
- T014, T015, T016, T017 can all run simultaneously (all depend on T009+T012+T013)

**Phase 4** (export utilities can run in parallel):
- T020 and T021 can run simultaneously

**Cross-phase**:
- Phase 1 and Phase 2 can overlap (backend T002-T005 and frontend T010-T013 run in parallel)
- Phase 4 can start as soon as report data shapes are known (T009+T014)

## Independent Test Criteria per Story

| Story | Test Criterion |
|-------|---------------|
| US-001 | Open /reports → 5 KPI cards show real values for last 30 days; tabs navigate correctly |
| US-002 | Select each preset → data changes; custom range → data changes; refresh → range persists; invalid range → validation message |
| US-003 | Workout count/volume match real data; category breakdown correct; "Not tracked" for duration/muscle groups |
| US-004 | Calorie/macro totals match real data; meal type breakdown sums correctly; "No goal set" when no goal |
| US-005 | Weight/goal from profile; consistency from real data; strength progression correct; "No data" for weight history |
| US-006 | CSV opens in spreadsheet; columns match report; empty range → valid file with "No records" |
| US-007 | PDF opens in reader; header has app name/user/range/timestamp; charts included; empty range → valid PDF |

## MVP Scope

**MVP = US-001 + US-002** (P1 stories): Overview page with KPI cards and date-range selection. Delivers the entry point to the Reports module.

**Incremental delivery**:
1. MVP: Overview + date range (T001-T011, T014, T018-T019)
2. + Workout report (T015)
3. + Nutrition report (T016)
4. + Progress report (T017)
5. + CSV export (T020, T022)
6. + PDF export (T021, T022)
7. Polish: accessibility, performance, responsive (T023-T025)

## Format Validation

- [x] All tasks have checkbox `- [ ]`
- [x] All tasks have sequential task ID (T001–T025)
- [x] Phase 1 tasks: NO story label (setup/foundation)
- [x] Phase 2 tasks: NO story label (foundation)
- [x] Phase 3 tasks: Have story labels [US1]–[US5]
- [x] Phase 4 tasks: Have story labels [US6], [US7]
- [x] Phase 5 tasks: NO story label (polish)
- [x] All tasks have file paths
- [x] Parallelizable tasks marked with [P]
