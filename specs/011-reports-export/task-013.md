# Task T013: Create KpiCard Component

**Feature**: 011-reports-export
**Phase**: 2 — Frontend Foundation
**Story**: US-001
**Priority**: Medium

## Objective
Create a single KPI display card component for showing summary metrics (Total Workouts, Total Volume, Calories, Weight, Consistency Score). This is the atomic building block for the Overview KPI row.

## Scope
- **Create**: `frontend/src/components/reports/KpiCard.jsx`
- **Imports**: `Card` from `../ui/Card`
- **Exports**: `KpiCard` (named export)

## Dependencies
None (pure UI component)

## Acceptance Criteria
1. `KpiCard` is a named export component
2. Accepts props: `label` (string), `value` (string|number), `subtitle` (string, optional), `isLoading` (boolean), `className`
3. Shows a large headline number (value) with a label above and optional subtitle below
4. When `isLoading` is true, shows skeleton/placeholder instead of value
5. When value is null/undefined, shows "No data" text
6. Uses consistent typography: label is smaller/muted, value is large/bold
7. Follows existing Dashboard KPI card styling patterns
8. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: renders label, value, optional subtitle
- States: loading skeleton, "No data" for null value, normal display
