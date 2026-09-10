# Task T011: Create DateRangeSelector Component

**Feature**: 011-reports-export
**Phase**: 2 — Frontend Foundation
**Story**: US-002
**Priority**: High

## Objective
Create the date-range selector component with preset buttons and custom date inputs. This is the shared control at the top of every report tab that determines the data scope.

## Scope
- **Create**: `frontend/src/components/reports/DateRangeSelector.jsx`
- **Exports**: `DateRangeSelector` (named export)

## Dependencies
None (pure UI component)

## Acceptance Criteria
1. `DateRangeSelector` is a named export component
2. Accepts props: `from`, `to`, `onRangeChange(from, to)`, `isLoading`
3. Renders preset buttons: Last 7 days, Last 30 days (default), Last 90 days, This Month, Last Month, This Year, All Time
4. Renders custom date inputs: from date picker, to date picker
5. Renders "Generate" button that calls `onRangeChange(from, to)`
6. Preset buttons update the from/to values immediately (or on Generate click)
7. Date inputs are type="date" with proper min/max constraints
8. Invalid range (from > to) shows validation message, Generate button disabled
9. Keyboard accessible: all controls operable by keyboard
10. Uses existing Button component from `../ui/Button`
11. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Visual check: presets + custom inputs + Generate button render
- Functional test: click each preset, verify from/to values update
- Validation test: enter from > to, verify validation message appears
- Keyboard test: all controls reachable and operable by keyboard
