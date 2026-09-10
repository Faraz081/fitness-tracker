# Task T005: Create Overview Report Service

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Story**: US-001
**Priority**: High

## Objective
Implement the server-side aggregation logic for the Overview report. This service combines the workout, nutrition, and progress reports into a single KPI summary, computing the consistency score across both workout and nutrition activity.

## Scope
- **Create**: `backend/src/services/reports/overviewReportService.js`
- **Imports**: `workoutReportService.js`, `nutritionReportService.js`, `progressReportService.js`
- **Exports**: `getOverviewReport(owner, fromDate, toDate)` — returns combined KPI summary

## Dependencies
- T002, T003, T004 (imports the 3 report services)

## Acceptance Criteria
1. `getOverviewReport(owner, fromDate, toDate)` returns an object matching the `GET /api/reports/overview` contract shape:
   - `dateRange: { from, to, days }`
   - `workouts: { totalWorkouts, totalVolume }`
   - `nutrition: { totalCalories, avgDailyCalories, daysLogged }`
   - `progress: { latestWeight, weightChange, hasWeightHistory, goal, consistencyScore }`
2. Consistency score = `(unique active days in range / range days) × 100`, rounded to whole percent
3. Active day = day with ≥1 workout OR ≥1 nutrition entry
4. Consistency score is `null` when no active days exist (never 0%)
5. Weight change = difference between earliest and latest weight in range (null when no history)
6. All queries use owner-scoped services — no direct model access
7. `node --check backend/src/services/reports/overviewReportService.js` passes

## Verification Approach
- Run `node --check` on the file
- Unit test: verify consistency score calculation with known active/inactive days
- Verify it correctly delegates to sub-services and combines their results
