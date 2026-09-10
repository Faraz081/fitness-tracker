# Task T025: Performance Verification

**Feature**: 011-reports-export
**Phase**: 5 — Integration & Polish
**Story**: US-001–US-007
**Priority**: Low

## Objective
Verify that the Reports module meets performance targets: 30-day report loads in under 2 seconds, exports complete in under 10 seconds, and All-Time ranges degrade gracefully.

## Scope
- **Modify**: `specs/011-reports-export/quickstart.md` — record timing results
- **Manual testing**: browser DevTools Network tab + console timing

## Dependencies
- T023 (all states must be in place)
- T024 (accessibility must be complete)
- Full feature must be functional

## Acceptance Criteria
1. 30-day report (any tab) loads end-to-end in under 2 seconds (measured from Generate click to full render)
2. CSV export completes in under 10 seconds for 30-day range
3. PDF export completes in under 10 seconds for 30-day range
4. All-Time range loads without timeout or crash (graceful degradation)
5. All-Time range shows bucketed/capped frequency series with clear messaging
6. Results recorded in `quickstart.md` under a "Performance Results" section
7. No console errors during any test
8. `npm run build` in frontend passes

## Verification Approach
- Open browser DevTools Network tab
- Select "Last 30 days" → click Generate → measure time to full render
- Click Export CSV → measure download time
- Click Export PDF → measure download time
- Select "All Time" → verify graceful degradation
- Record all results in quickstart.md
