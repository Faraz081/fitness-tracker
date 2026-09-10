# Task T010: Create ReportTabs Component

**Feature**: 011-reports-export
**Phase**: 2 — Frontend Foundation
**Story**: US-001
**Priority**: Medium

## Objective
Create the tab bar component that lets users switch between Overview, Workout, Nutrition, and Progress report views. This is a shared component used in the Reports page shell.

## Scope
- **Create**: `frontend/src/components/reports/ReportTabs.jsx`
- **Exports**: `ReportTabs` (named export)

## Dependencies
None (pure UI component, no data dependencies)

## Acceptance Criteria
1. `ReportTabs` is a named export component
2. Accepts props: `activeTab` (string), `onTabChange` (function)
3. Renders 4 tabs: Overview, Workout, Nutrition, Progress
4. Active tab has visual distinction (different background/text color)
5. Tabs are keyboard navigable (Tab key, Enter/Space to activate)
6. Uses existing design tokens / theme consistent with app
7. Follows existing component patterns: named export, functional component
8. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: renders 4 tabs, active tab is highlighted
- Keyboard test: can tab through all tabs and activate with Enter/Space
