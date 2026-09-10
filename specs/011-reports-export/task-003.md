# Task T003: Create Nutrition Report Service

**Feature**: 011-reports-export
**Phase**: 1 — Backend Foundation
**Story**: US-004
**Priority**: High

## Objective
Implement the server-side aggregation logic for the Nutrition report. This service queries the owner-scoped `nutrition` collection and computes all metrics: calorie/macro totals, daily averages, meal type breakdown, daily totals, and meals list.

## Scope
- **Create**: `backend/src/services/reports/nutritionReportService.js`
- **Reads from**: `backend/src/models/Nutrition.js` (existing `nutrition` collection)
- **Exports**: `getNutritionReport(owner, fromDate, toDate)` — returns pre-aggregated nutrition summary

## Dependencies
- T001 (date-range validation used at route layer, but service can be built independently)

## Acceptance Criteria
1. `getNutritionReport(owner, fromDate, toDate)` returns an object matching the `GET /api/reports/nutrition` contract shape:
   - `dateRange: { from, to, days }`
   - `summary: { totalCalories, avgDailyCalories, totalProtein, avgDailyProtein, totalCarbs, avgDailyCarbs, totalFat, avgDailyFat, daysLogged }`
   - `mealTypeBreakdown: [{ mealType, entries, calories, protein, carbs, fat }]`
   - `dailyTotals: [{ date, calories, protein, carbs, fat }]`
   - `meals: [{ id, date, mealType, foodName, quantity, unit, calories, protein, carbs, fat }]`
   - `goalComparison: null` (no persisted goals in current app)
2. Daily averages = total / days with entries (logged days), not range days
3. Meal type breakdown sums exactly to range totals (breakfast + lunch + dinner + snack = totals)
4. Days logged = count of distinct dates with at least one nutrition entry
5. All queries filtered by `{ owner }` — no cross-user data leakage
6. `node --check backend/src/services/reports/nutritionReportService.js` passes

## Verification Approach
- Run `node --check` on the file
- Unit test: call with known data, verify totals match manual sum
- Edge cases: empty range, single entry, all entries same day, entries with 0 macros
