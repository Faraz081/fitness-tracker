# Task T009: Create Frontend Reports API Layer

**Feature**: 011-reports-export
**Phase**: 2 — Frontend Foundation
**Priority**: High

## Objective
Create the frontend API client functions for fetching report data. These functions use the existing `apiGet` pattern from `services/api.js` and build query strings for the date range.

## Scope
- **Create**: `frontend/src/services/reports.js`
- **Imports**: `apiGet` from `./api.js`
- **Exports**: `getOverviewReport(from, to)`, `getWorkoutReport(from, to)`, `getNutritionReport(from, to)`, `getProgressReport(from, to)`

## Dependencies
None (can be built independently — the API contract is defined)

## Acceptance Criteria
1. All 4 functions are named exports
2. Each function builds a query string with `from` and `to` params: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
3. Each function calls `apiGet(\`/api/reports/${type}?${params}\`)` and returns the result
4. Follows existing API layer pattern: named export, uses `apiGet`, returns unwrapped data
5. Default date range: if `from`/`to` not provided, function omits them (server defaults to last 30 days)
6. `node --check frontend/src/services/reports.js` or `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend — no build errors
- Verify functions follow the same pattern as existing API functions in `services/api.js`
- Verify query string construction handles special characters in dates
