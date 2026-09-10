# Task T002: Create Workout Report Service

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Story**: US-003
**Priority**: High

## Objective
Implement the server-side aggregation logic for the Workout report. This service queries the owner-scoped `workouts` collection and computes all metrics: total workouts, total volume, average sessions per week, category breakdown, frequency series, per-workout list, notable lifts, and PR count.

## Scope
- **Create**: `backend/src/services/reports/workoutReportService.js`
- **Reads from**: `backend/src/models/Workout.js` (existing `workouts` collection)
- **Exports**: `getWorkoutReport(owner, fromDate, toDate)` — returns pre-aggregated workout summary

## Dependencies
- T001 (date-range validation used at route layer, but service can be built independently)

## Acceptance Criteria
1. `getWorkoutReport(owner, fromDate, toDate)` returns an object matching the `GET /api/reports/workout` contract shape:
   - `dateRange: { from, to, days }`
   - `summary: { totalWorkouts, totalVolume, avgSessionsPerWeek, frequencySeries }`
   - `categoryBreakdown: [{ category, count, percentage }]`
   - `workouts: [{ id, name, category, date, volume, exerciseCount, prCount }]`
   - `notableLifts: [{ exercise, weight }]`
   - `prCount: number`
   - `notTracked: { duration: true, muscleGroups: true }`
2. Total volume = sum of `sets × reps × (weightKg || 0)` across all exercises in all workouts in range
3. Avg sessions/week = `(workoutCount / rangeDays) × 7`, shown only when workoutCount ≥ 1
4. Category percentages are computed only when total workouts ≥ 1
5. PRs: range-best weight > full historical best weight per exercise (full-history comparison per research.md)
6. All queries filtered by `{ owner }` — no cross-user data leakage
7. `node --check backend/src/services/reports/workoutReportService.js` passes

## Verification Approach
- Run `node --check` on the file
- Unit test: call with a known owner/date range, verify totals match manual calculation
- Edge cases: empty range (no workouts), single workout, exercises without weightKg (contribute 0 volume)
