# Research: Final Testing & Requirements Check

**Date**: 2026-09-10 | **Feature**: 014-final-qa

## Research Questions

### Q1. Test Report Format

**Question**: What structure should the final test report follow?

**Decision**: Single markdown file with sections per testing area, individual test scenarios with results and evidence, a requirements traceability matrix, bug reports, and a sign-off section.

**Rationale**: Markdown is the project's documentation standard. A single file keeps all evidence co-located and version-controllable. The structure maps 1:1 to the 9 testing areas from the constitution (Day 9 Required Testing Areas).

**Alternatives considered**:
- Separate files per testing area: Rejected — fragments evidence across files, makes sign-off harder
- Spreadsheet (CSV/XLSX): Rejected — not version-controllable in git, breaks the markdown documentation standard
- Test management tool (TestRail, Zephyr): Rejected — adds dependency, overkill for manual testing of a single project

### Q2. Bug Severity Classification

**Question**: How should discovered bugs be classified and prioritized?

**Decision**: Four severity levels — Blocker, Major, Minor, Cosmetic — with the constitution's T5 rule determining which must be fixed before sign-off.

| Level | Example | Fix Required? |
|-------|---------|--------------|
| Blocker | Login fails, data deleted on save, security vulnerability | YES — blocks testing |
| Major | Dashboard shows wrong calorie total, export produces empty file | YES — must fix |
| Minor | Search returns extra irrelevant results, notification timestamp off by hours | YES if new; NO if pre-existing |
| Cosmetic | 2px misalignment, slightly wrong shade of orange | NO — log only |

**Rationale**: Directly maps to the constitution's T5 (Fix Before Finish) distinction between "bugs that affect usability" and "cosmetic issues that do not affect usability." The "pre-existing cosmetic issues are grandfathered" rule from the spec's assumptions prevents scope creep.

**Alternatives considered**:
- Three levels (Critical/Major/Minor): Rejected — no way to distinguish pre-existing visual issues from new ones
- Binary (Blocks/Doesn't Block): Rejected — too coarse, doesn't help with prioritization within the fix cycle
- Numeric priority (P0-P4): Rejected — maps poorly to the constitution's T5 language

### Q3. Traceability Matrix Organization

**Question**: How should the requirements traceability matrix be structured to satisfy T1?

**Decision**: Organized by spec directory (001 through 013), with each requirement listed as a row containing: requirement ID, requirement text, status (Pass/Fail/Partial/Blocked), test scenario reference, and evidence notes.

**Rationale**: Grouping by spec mirrors how requirements were originally written — each spec has its own FR-XXX numbering. This makes it trivial to verify that every spec was covered and every requirement was checked. The "test scenario reference" column creates the traceability chain from requirement → test → evidence that T1 demands.

**Alternatives considered**:
- Flat list of all requirements: Rejected — loses the spec grouping, makes it hard to verify coverage per spec
- Organized by testing area (CRUD, Auth, etc.): Rejected — requirements span multiple testing areas, creating ambiguity about where to record results
- Organized by priority (P1/P2/P3): Rejected — testing priority != requirement importance; all requirements must be verified regardless

### Q4. Test Environment Prerequisites

**Question**: What must be in place before Day 9 testing can begin?

**Decision**: Three test accounts, running frontend + backend, browser with DevTools, populated primary account.

**Prerequisites checklist**:
1. Node.js 24 LTS installed
2. MongoDB Atlas connection string configured in `.env`
3. Backend running (`npm run dev` in backend/)
4. Frontend running (`npm run dev` in frontend/)
5. `npm run build` passes in frontend/ (baseline build verification)
6. Primary test account created and populated (5+ workouts, nutrition entries, profile data, goals)
7. Secondary test account created (1-2 workouts for isolation testing)
8. Fresh test account created (no data for empty state testing)
9. Browser (Chrome recommended) with DevTools open, Console tab active
10. All prior-day features (001-013) confirmed functional on the test environment

**Rationale**: The spec's assumptions explicitly require these. Without them, testing cannot produce reliable results.

**Alternatives considered**:
- Single test account: Rejected — cannot test cross-user isolation or empty states
- Automated data seeding script: Rejected — constitution Day 9 out-of-scope prohibits automated test suite creation; manual setup is simpler and more reliable for a one-time QA phase
- Docker-based test environment: Rejected — overkill for a single-project manual testing phase; adds complexity without value
