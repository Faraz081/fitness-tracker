# Task T004: Create Progress Report Service

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Story**: US-005
**Priority**: High

## Objective
Implement the server-side aggregation logic for the Progress report. This service combines user profile data with workout and nutrition aggregation to compute profile info, consistency metrics, strength progression, and PRs.

## Scope
- **Create**: `backend/src/services/reports/progressReportService.js`
- **Reads from**: `backend/src/models/User.js`, `backend/src/models/Workout.js`, `backend/src/models/Nutrition.js`
- **Exports**: `getProgressReport(owner, fromDate, toDate)` — returns pre-aggregated progress summary

## Dependencies
- T001 (date-range validation used at route layer, but service can be built independently)

## Acceptance Criteria
1. `getProgressReport(owner, fromDate, toDate)` returns an object matching the `GET /api/reports/progress` contract shape:
   - `dateRange: { from, to, days }`
   - `profile: { latestWeight, goal, hasWeightHistory }`
   - `consistency: { workoutConsistency, nutritionConsistency, nutritionDaysLogged, rangeDays }`
   - `strengthProgression: [{ exercise, bestWeight, priorBest, delta }]`
   - `prCount: number`
   - `notTracked: { weightHistory: true, milestones: true, photos: true }`
2. Latest weight from `user.weightKg`; goal from `user.goal`
3. Workout consistency = average sessions per week (same formula as workout report)
4. Nutrition consistency = (days logged / range days) × 100, whole percent
5. Strength progression: for each exercise, best weight in range vs best weight before range start
6. PRs: range best > full historical best per exercise (same rule as workout report)
7. All queries filtered by `{ owner }` — no cross-user data leakage
8. `node --check backend/src/services/reports/progressReportService.js` passes

## Verification Approach
- Run `node --check` on the file
- Unit test: verify consistency calculations, strength progression deltas, PR detection
- Edge cases: no profile weight, no workouts, no nutrition entries, exercises with only bodyweight
