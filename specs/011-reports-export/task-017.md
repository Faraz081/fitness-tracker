# Task T017: Create ProgressReport Component

**Feature**: 011-reports-export
**Phase**: 3 — Report Views
**Story**: US-005
**Priority**: High

## Objective
Implement the Progress report tab showing profile data, consistency metrics, strength progression, and "No data" states for weight history, milestones, and photos.

## Scope
- **Create**: `frontend/src/components/reports/ProgressReport.jsx`
- **Imports**: `ReportCard`, `Badge`, `EmptyState`, `Spinner`
- **Exports**: `ProgressReport` (named export)

## Dependencies
- T009 (API layer)
- T012 (ReportCard)

## Acceptance Criteria
1. `ProgressReport` is a named export component
2. Accepts props: `data` (progress report data from API), `isLoading`, `dateRange`
3. Renders profile section: latest weight, goal (or "No data" if missing)
4. Renders consistency section: workout consistency (sessions/week), nutrition consistency (%)
5. Renders strength progression table: exercise, best weight, prior best, delta
6. Renders PR count summary
7. Renders "No data in this range" for weight history, milestones, and photos sections
8. Shows loading skeletons while `isLoading` is true
9. Shows `EmptyState` when no data at all
10. Strength progression shows only exercises with recorded weights
11. Delta values show improvement (positive) or no change (0)
12. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: profile, consistency, strength table, "No data" sections
- State check: loading, empty, normal data
- Data check: verify consistency and strength values match underlying data
