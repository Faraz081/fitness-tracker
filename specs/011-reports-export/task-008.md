# Task T008: Register Reports Router in App

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Priority**: High

## Objective
Register the new reports router in the Express application so that `GET /api/reports/:type` endpoints are accessible.

## Scope
- **Modify**: `backend/src/app.js`
- **Import**: `backend/src/routes/reports.js`

## Dependencies
- T007 (reports router must exist)

## Acceptance Criteria
1. `reportsRouter` imported from `./routes/reports.js`
2. Route registered as `app.use('/api/reports', reportsRouter)`
3. Registration is placed after other `/api/` routes and before the 404 catch-all
4. Existing routes are untouched
5. `node --check backend/src/app.js` passes
6. Server boots without errors: `cd backend && node src/index.js` starts successfully

## Verification Approach
- Run `node --check` on the file
- Start the server and verify it boots without errors
- Verify existing routes still work (regression check)
