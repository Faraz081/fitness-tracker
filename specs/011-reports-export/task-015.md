# Task T015: Create WorkoutReport Component

**Feature**: 011-reports-export
**Phase**: 3 — Report Views
**Story**: US-003
**Priority**: High

## Objective
Implement the Workout report tab showing workout metrics, category breakdown, workout list, notable lifts, and "Not tracked" states for duration and muscle groups.

## Scope
- **Create**: `frontend/src/components/reports/WorkoutReport.jsx`
- **Imports**: `ReportCard`, `Badge`, `EmptyState`, `Spinner`
- **Exports**: `WorkoutReport` (named export)

## Dependencies
- T009 (API layer)
- T012 (ReportCard)

## Acceptance Criteria
1. `WorkoutReport` is a named export component
2. Accepts props: `data` (workout report data from API), `isLoading`, `dateRange`
3. Renders metrics row: Total Workouts, Total Volume, Avg Sessions/Week
4. Renders category breakdown table: category, count, percentage (percentages only when workouts ≥ 1)
5. Renders workout list table: date, title, category, volume, exercise count, PR count
6. Renders notable lifts section: exercise name and best weight
7. Renders "Not tracked" state for duration and muscle groups (using `EmptyState` or similar)
8. Shows loading skeletons while `isLoading` is true
9. Shows `EmptyState` when no workouts in range ("No workouts in this date range")
10. Category breakdown percentages sum to 100% when workouts exist
11. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: metrics row, tables, notable lifts, "Not tracked" sections
- State check: loading, empty, normal data
- Data check: verify totals match underlying workout data
