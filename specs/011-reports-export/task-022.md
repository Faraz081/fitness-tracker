# Task T022: Create ExportButtons Component

**Feature**: 011-reports-export
**Phase**: 4 — Export Pipeline
**Story**: US-006, US-007
**Priority**: Medium

## Objective
Create the Export CSV and Export PDF buttons component with loading, success, and error states. Provides user feedback during export generation and announces results to assistive technology.

## Scope
- **Create**: `frontend/src/components/reports/ExportButtons.jsx`
- **Imports**: `Button` from `../ui/Button`, CSV/PDF export utilities
- **Exports**: `ExportButtons` (named export)

## Dependencies
- T020 (CSV export utility)
- T021 (PDF export utility)

## Acceptance Criteria
1. `ExportButtons` is a named export component
2. Accepts props: `reportType` (string), `data` (report data), `dateRange`, `userName`
3. Renders two buttons: "Export CSV" and "Export PDF"
4. Loading state: button shows spinner and "Exporting..." text while generating
5. Success state: brief success feedback (e.g., checkmark or toast)
6. Error state: shows error message with "Retry" action
7. Export feedback announced via `aria-live="polite"` region (non-blocking)
8. Buttons disabled while export is in progress
9. Filename includes report type and date range
10. Uses existing `Button` component with `isLoading` prop
11. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: two buttons render with correct labels
- Functional test: click Export CSV, verify download; click Export PDF, verify download
- State test: verify loading spinner appears during export
- Error test: simulate failure, verify error message and retry button
- Accessibility test: verify aria-live announcement
