# Task T001: Create Date-Range Validation Schema

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Priority**: High

## Objective
Add Zod validation schemas for the reports date-range query parameters to the shared validators file. This is the foundation for all 4 report endpoints — every endpoint validates `from` and `to` query params against these schemas.

## Scope
- **Modify**: `backend/src/utils/validators.js`
- **API**: Query parameter validation for `GET /api/reports/:type?from&to`

## Dependencies
None. This is the first task.

## Acceptance Criteria
1. `reportQuerySchema` is exported from `validators.js` — validates `from` (YYYY-MM-DD string) and `to` (YYYY-MM-DD string)
2. `from` and `to` are both required strings matching the regex `/^\d{4}-\d{2}-\d{2}$/`
3. A `.refine()` ensures `from <= to` (inverted range rejected with clear message)
4. `reportTypeSchema` is exported — validates `type` param as `z.enum(['overview', 'workout', 'nutrition', 'progress'])`
5. Existing schemas in `validators.js` are untouched
6. `node --check backend/src/utils/validators.js` passes

## Verification Approach
- Run `node --check backend/src/utils/validators.js` — no syntax errors
- Import both schemas and call `.safeParse()` with valid/invalid inputs to confirm behavior
- Test cases: valid range, inverted range (from > to), missing from, missing to, invalid date format, invalid report type
