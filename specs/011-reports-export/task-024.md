# Task T024: Accessibility Pass

**Feature**: 011-reports-export
**Phase**: 5 — Integration & Polish
**Story**: US-001–US-007
**Priority**: Medium

## Objective
Perform a comprehensive accessibility audit and fix pass on the entire Reports module. Ensure all controls are keyboard accessible, announced to assistive technology, and export feedback is non-blocking.

## Scope
- **Modify**: All files in `frontend/src/components/reports/`
- **Modify**: `frontend/src/pages/Reports.jsx`
- **Focus areas**: keyboard navigation, aria-labels, aria-live regions, focus management

## Dependencies
- T023 (empty/loading/error states must be in place)

## Acceptance Criteria
1. All tab buttons are focusable and activatable by keyboard (Tab + Enter/Space)
2. All preset buttons in DateRangeSelector are keyboard accessible
3. Date inputs are keyboard accessible with proper labels
4. Generate button is keyboard accessible
5. Export buttons are keyboard accessible
6. Active tab has `aria-selected="true"`, inactive tabs have `aria-selected="false"`
7. Tab group has `role="tablist"`, tabs have `role="tab"`, panels have `role="tabpanel"`
8. Export progress announced via `aria-live="polite"` region
9. Export success/failure announced via `aria-live="assertive"` region
10. All images/icons have appropriate `alt` text or `aria-label`
11. Focus is managed correctly: loading → content focus, error → retry focus
12. No focus traps (user can always Tab out of any component)
13. `npm run build` in frontend passes

## Verification Approach
- Keyboard test: navigate entire Reports module using only keyboard
- Screen reader test: verify all controls are announced correctly (using browser dev tools or screen reader)
- aria-live test: trigger export, verify announcement appears
- Focus test: verify focus moves logically between states
- Automated audit: run Lighthouse accessibility audit (if available)
