# Task T006: Create Reports Controller

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Priority**: High

## Objective
Implement the Express controller handlers for all 4 report types. The controller extracts validated query params, calls the appropriate service, and returns the result using the standard `success()` response pattern.

## Scope
- **Create**: `backend/src/controllers/reports.js`
- **Imports**: `backend/src/services/reports/overviewReportService.js`, `workoutReportService.js`, `nutritionReportService.js`, `progressReportService.js`, `backend/src/utils/response.js`
- **Exports**: `getOverviewHandler`, `getWorkoutHandler`, `getNutritionHandler`, `getProgressHandler`

## Dependencies
- T002, T003, T004, T005 (services must exist for controller to import)

## Acceptance Criteria
1. All 4 handlers are exported as named exports
2. Each handler extracts `from` and `to` from `req.validatedQuery` (set by `validateQuery` middleware)
3. Each handler calls `req.userId` for owner (set by `authenticate` middleware)
4. Each handler calls the corresponding service function and wraps result with `success(res, data)`
5. Default date range: if `from`/`to` not provided, defaults to last 30 days
6. Error handling: catches service errors and passes to `next()` (error handler middleware)
7. Follows existing controller pattern: `import * as service`, `success(res, data)`, `req.userId ?? ''`
8. `node --check backend/src/controllers/reports.js` passes

## Verification Approach
- Run `node --check` on the file
- Verify all 4 handlers follow the same pattern as existing controllers (e.g., `workout.js`)
- Verify `success()` is called with correct data shape from each service
