# Task T014: Create OverviewReport Component

**Feature**: 011-reports-export
**Phase**: 3 — Report Views
**Story**: US-001
**Priority**: High

## Objective
Implement the Overview report tab that displays 5 KPI cards summarizing the user's fitness data for the selected date range. This is the entry point to the Reports module.

## Scope
- **Create**: `frontend/src/components/reports/OverviewReport.jsx`
- **Imports**: `KpiCard`, `ReportCard`, `EmptyState`, `Spinner`
- **Exports**: `OverviewReport` (named export)

## Dependencies
- T009 (API layer for data fetching)
- T012 (ReportCard)
- T013 (KpiCard)

## Acceptance Criteria
1. `OverviewReport` is a named export component
2. Accepts props: `data` (overview report data from API), `isLoading`, `dateRange`
3. Renders 5 KPI cards in a row:
   - Total Workouts (number)
   - Total Volume (formatted with units)
   - Calories Consumed (total + daily average subtitle)
   - Weight (with Weight Change when available)
   - Consistency Score (percentage or "No data")
4. Shows loading skeletons while `isLoading` is true
5. Shows `EmptyState` when data has no activity (consistency score is null)
6. KPI values are formatted: weights with 1 decimal, volume with thousands separators, calories whole, percentages whole
7. Consistency Score shows "No data in this range" when null (never 0%)
8. Uses existing `EmptyState` component from `../ui/EmptyState`
9. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: 5 KPI cards render with correct layout
- State check: loading skeleton, empty state, normal data display
- Format check: numbers formatted correctly (decimals, separators)
