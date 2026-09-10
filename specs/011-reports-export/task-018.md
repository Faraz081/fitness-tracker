# Task T018: Create Reports Page Shell

**Feature**: 011-reports-export
**Phase**: 3 — Report Views
**Story**: US-001, US-002
**Priority**: High

## Objective
Create the main Reports page component that orchestrates tab navigation, date-range state management, data fetching, and report view rendering. This is the central coordinator for the entire Reports module.

## Scope
- **Create**: `frontend/src/pages/Reports.jsx`
- **Imports**: `DashboardLayout`, `ReportTabs`, `DateRangeSelector`, `OverviewReport`, `WorkoutReport`, `NutritionReport`, `ProgressReport`, `reports API functions`
- **Exports**: default export `Reports`

## Dependencies
- T009 (API layer)
- T010 (ReportTabs)
- T011 (DateRangeSelector)
- T014 (OverviewReport)
- T015 (WorkoutReport)
- T016 (NutritionReport)
- T017 (ProgressReport)

## Acceptance Criteria
1. Default export: `export default function Reports()`
2. Wraps content in `DashboardLayout`
3. Uses `useSearchParams` for date range persistence (from/to in URL)
4. Default range: last 30 days (computed from current date)
5. Manages active tab state (default: "overview")
6. Fetches data from the correct API endpoint when tab or date range changes
7. Shows loading state during data fetch
8. Shows error state with retry button on fetch failure
9. Passes fetched data to the active report component
10. Date range persists across tab switches and page refresh (via URL params)
11. Invalid range shows validation message, does not fetch
12. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: page renders with tabs, date range selector, and report content
- Functional test: switch tabs, verify data updates; change date range, verify data updates
- Persistence test: refresh page, verify date range and tab are preserved
- Error test: verify error state appears when API fails (can simulate by stopping backend)
