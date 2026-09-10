# Task T023: Add Empty States, Loading Skeletons, and Error/Retry States

**Feature**: 011-reports-export
**Phase**: 5 — Integration & Polish
**Story**: US-001–US-007
**Priority**: Medium

## Objective
Ensure all report views consistently handle loading, empty, and error states with designed UI. This task adds the polish layer that makes the Reports module feel complete and user-friendly.

## Scope
- **Modify**: `frontend/src/components/reports/OverviewReport.jsx`
- **Modify**: `frontend/src/components/reports/WorkoutReport.jsx`
- **Modify**: `frontend/src/components/reports/NutritionReport.jsx`
- **Modify**: `frontend/src/components/reports/ProgressReport.jsx`
- **Modify**: `frontend/src/pages/Reports.jsx` (error/retry at page level)
- **Imports**: `EmptyState`, `Skeleton`, `Spinner` from `../ui/`

## Dependencies
- T014, T015, T016, T017 (report components must exist)
- T018 (page shell must exist)

## Acceptance Criteria
1. Every report component shows `Skeleton` loaders while its data is loading
2. Every report component shows `EmptyState` with a range-specific message when no data exists:
   - Overview: "No activity in this date range"
   - Workout: "No workouts in this date range"
   - Nutrition: "No nutrition entries in this date range"
   - Progress: "No progress data in this date range"
3. EmptyState includes an action button/link to widen the date range
4. Page-level error state shows error message with "Retry" button
5. Loading states do not show empty states simultaneously
6. Error states do not show stale data
7. All states are visually consistent with existing app patterns
8. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Loading test: observe skeleton loaders during data fetch
- Empty test: select a date range with no data, verify empty states
- Error test: stop backend, verify error state with retry; restart, click retry, verify recovery
