# Task T012: Create ReportCard Component

**Feature**: 011-reports-export
**Phase**: 2 — Frontend Foundation
**Story**: US-001–US-005
**Priority**: Medium

## Objective
Create a reusable section wrapper component for report content sections. Provides consistent styling and layout for all report sections (metrics, tables, charts).

## Scope
- **Create**: `frontend/src/components/reports/ReportCard.jsx`
- **Imports**: `Card` from `../ui/Card`
- **Exports**: `ReportCard` (named export)

## Dependencies
None (pure UI component)

## Acceptance Criteria
1. `ReportCard` is a named export component
2. Accepts props: `title` (string), `children`, `className`
3. Renders a `Card` wrapper with a section heading and content area
4. Heading uses consistent typography (h3 or similar)
5. Content area has appropriate padding and spacing
6. Follows existing Card styling patterns
7. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: renders with title and children, matches existing card style
