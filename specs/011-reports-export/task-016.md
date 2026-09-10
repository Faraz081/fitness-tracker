# Task T016: Create NutritionReport Component

**Feature**: 011-reports-export
**Phase**: 3 — Report Views
**Story**: US-004
**Priority**: High

## Objective
Implement the Nutrition report tab showing calorie/macro totals, meal type breakdown, daily totals, meals list, and goal comparison.

## Scope
- **Create**: `frontend/src/components/reports/NutritionReport.jsx`
- **Imports**: `ReportCard`, `Badge`, `EmptyState`, `Spinner`
- **Exports**: `NutritionReport` (named export)

## Dependencies
- T009 (API layer)
- T012 (ReportCard)

## Acceptance Criteria
1. `NutritionReport` is a named export component
2. Accepts props: `data` (nutrition report data from API), `isLoading`, `dateRange`
3. Renders metrics row: Total Calories, Avg Daily Calories, Days Logged, Total Protein, Total Carbs, Total Fat
4. Renders meal type breakdown table: meal type, entries, calories, protein, carbs, fat
5. Renders daily totals table: date, calories, protein, carbs, fat
6. Renders meals list table: date, meal type, food name, quantity, unit, calories, protein, carbs, fat
7. Renders goal comparison section: "No goal set in this range" (since no goals are persisted)
8. Shows loading skeletons while `isLoading` is true
9. Shows `EmptyState` when no nutrition entries in range
10. Meal type breakdown sums to range totals (visual verification)
11. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: metrics, tables, goal comparison section
- State check: loading, empty, normal data
- Data check: verify totals match underlying nutrition data
