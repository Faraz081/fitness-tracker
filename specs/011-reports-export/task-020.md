# Task T020: Create CSV Export Utility

**Feature**: 011-reports-export
**Phase**: 4 — Export Pipeline
**Story**: US-006
**Priority**: Medium

## Objective
Implement client-side CSV generation functions for all 4 report types. Each function takes pre-aggregated report data and produces a valid CSV file with proper headers, encoding, and empty-range handling.

## Scope
- **Create**: `frontend/src/utils/csvExport.js`
- **Exports**: `exportOverviewCsv(data, dateRange)`, `exportWorkoutCsv(data, dateRange)`, `exportNutritionCsv(data, dateRange)`, `exportProgressCsv(data, dateRange)`

## Dependencies
None (pure utility functions, no UI dependencies)

## Acceptance Criteria
1. All 4 export functions are named exports
2. Each function accepts `(data, dateRange)` and triggers a browser download
3. CSV files start with UTF-8 BOM (`\uFEFF`) for spreadsheet compatibility
4. First row: report title and date range (e.g., "Fitness Report: 2026-08-11 to 2026-09-10")
5. Proper CSV formatting: fields with commas/quotes/newlines are quoted with doubled quotes
6. Filename format: `<report-type>-<from>_<to>.csv` (e.g., `workout-2026-08-11_2026-09-10.csv`)
7. Empty range: valid CSV with headers and "No records for <from> to <to>" line
8. Overview CSV: sectioned blocks (Workouts Summary, Nutrition Summary, Progress Summary)
9. Workout CSV: summary block + per-workout rows with columns: date, title, category, volume_kg, exercise_count, pr_count
10. Nutrition CSV: summary block + daily totals + meals list
11. Progress CSV: summary block + strength progression rows
12. All numeric formatting consistent: weights 1 decimal, calories whole, percentages whole
13. Download triggered via `URL.createObjectURL` + anchor click pattern

## Verification Approach
- Unit test: call each function with sample data, verify CSV content structure
- Manual test: export each report type, open in spreadsheet software, verify columns/rows match
- Empty range test: export with no data, verify valid file with "No records" line
- Encoding test: verify special characters (commas, quotes) are properly escaped
