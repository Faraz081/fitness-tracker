# Task T007: Create Reports Routes

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Priority**: High

## Objective
Create the Express router for report endpoints. Routes use the `authenticate` middleware globally, Zod query validation per-route, and delegate to the reports controller.

## Scope
- **Create**: `backend/src/routes/reports.js`
- **Imports**: `backend/src/controllers/reports.js`, `backend/src/middleware/authenticate.js`, `backend/src/middleware/validate.js`, `backend/src/utils/validators.js`
- **Exports**: `reportsRouter` (named export)

## Dependencies
- T001 (validators must exist)
- T006 (controller must exist)

## Acceptance Criteria
1. `reportsRouter` is exported as a named export using `Router()`
2. `authenticate` middleware applied via `router.use(authenticate)` at the top
3. 4 GET routes defined: `/overview`, `/workout`, `/nutrition`, `/progress`
4. Each route uses `validateQuery(reportQuerySchema)` for `from`/`to` validation
5. Route parameter `:type` validated against `reportTypeSchema`
6. Each route delegates to the corresponding controller handler
7. Follows existing route pattern (see `backend/src/routes/workout.js`)
8. `node --check backend/src/routes/reports.js` passes

## Verification Approach
- Run `node --check` on the file
- Verify route structure matches existing patterns (Router + authenticate + validate + handler)
- Verify all 4 report type routes are registered
