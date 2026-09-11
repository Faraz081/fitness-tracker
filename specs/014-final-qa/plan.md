# Implementation Plan: Final Testing & Requirements Check

**Branch**: `014-final-qa` | **Date**: 2026-09-10 | **Spec**: [specs/014-final-qa/spec.md](spec.md)
**Input**: Feature specification from `/specs/014-final-qa/spec.md`

## Summary

Day 9 is a comprehensive manual QA phase that verifies the entire FitTrack application (Days 1-8.3) works correctly across all features, matches all original requirements, and is stable on mobile/tablet/desktop before final delivery. The phase produces no new features, pages, components, or API endpoints — it is a structured audit that tests existing functionality end-to-end from the browser, traces every requirement from every spec, fixes any bugs found, and produces a written test report with evidence-backed sign-off.

## Technical Context

**Language/Version**: JavaScript (ES2022, JSX) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2 — existing codebase, no new code written (except bug fixes)
**Primary Dependencies**: Express, Mongoose 9, React 19, React Router 7, Tailwind CSS v4, lucide-react, framer-motion — all existing, no new dependencies
**Storage**: MongoDB Atlas (existing `users`, `workouts`, `nutrition`, `notifications`, `notificationsettings` collections) — no schema changes
**Testing**: Manual browser-based end-to-end testing (no automated test frameworks per constitution Day 9 out-of-scope). Browser developer tools for console error inspection.
**Target Platform**: Web application (Chrome/Firefox/Safari latest) at 375px, 768px, 1280px+ viewports
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: N/A — this is a verification phase, not a performance optimization phase
**Constraints**: Manual testing only (no automated test suite creation per constitution). All testing against live server with real data. Bug fixes must not introduce new features or major redesigns.
**Scale/Scope**: 13 prior specs (001-013) with ~200+ individual requirements to verify. 9 testing areas. 11 user stories. 43 functional requirements in the spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| T1. Requirements Traceability (NON-NEGOTIABLE) | ✅ COMPLIANT | FR-039/FR-040 mandate 100% requirement verification with traceability matrix. User Story 10 covers this explicitly. |
| T2. End-to-End Coverage (NON-NEGOTIABLE) | ✅ COMPLIANT | All 11 user stories specify browser-based testing against live server. No backend-only or unit-level testing. |
| T3. No Silent Failures (NON-NEGOTIABLE) | ✅ COMPLIANT | FR-015, FR-018, FR-022, FR-026, FR-035 cover empty states. SC-004 mandates 0 console errors. Edge cases include error paths. |
| T4. Cross-Device Quality | ✅ COMPLIANT | FR-036/FR-037/FR-038 cover responsive testing at 375px/768px/1280px+. User Story 9 covers all major pages. |
| T5. Fix Before Finish | ✅ COMPLIANT | FR-042 mandates blocker/major bug fixes before sign-off. SC-003 mandates 0 open blocker/major bugs. Assumptions grandfather pre-Day-9 cosmetic issues. |
| T6. Evidence-Based Sign-off | ✅ COMPLIANT | SC-005 mandates written test report with all results, traceability matrix, bug reports, and sign-off recommendation. |
| I-VIII. Core Principles | ✅ COMPLIANT | No new backend, API, model, route, or env changes. No new dependencies. Frontend-only bug fixes (JSX only). Build must pass. |
| Out of Scope | ✅ COMPLIANT | No new features, no major redesigns, no automated tests, no infra changes, no performance audits — all excluded per constitution and spec. |

**Gate result**: PASS — all constitution principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/014-final-qa/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output — testing methodology decisions
├── spec.md              # Feature specification (already written)
├── quickstart.md        # Phase 1 output — test environment setup guide
└── checklists/
    └── requirements.md  # Spec quality checklist (already written)
```

**Note**: `data-model.md` and `contracts/` are NOT generated for this feature. Day 9 is a QA/verification phase that produces documents (test reports, bug reports, traceability matrices) — not new data models or API contracts. The entities defined in the spec (Test Scenario, Test Result, Bug Report, Traceability Matrix, Test Report) are markdown document structures, not database schemas.

### Source Code (repository root)

```text
Fitness_Tracker/
├── backend/              # Existing — no changes except bug fixes
│   ├── src/
│   │   ├── models/       # Existing Mongoose models (no schema changes)
│   │   ├── routes/       # Existing API routes (no new endpoints)
│   │   └── middleware/   # Existing auth middleware (no changes)
│   └── package.json
├── frontend/             # Existing — no changes except bug fixes
│   ├── src/
│   │   ├── components/   # Existing UI components (no new components)
│   │   ├── pages/        # Existing page components (no new pages)
│   │   ├── hooks/        # Existing custom hooks
│   │   ├── utils/        # Existing utility functions
│   │   ├── data/         # Existing data modules
│   │   └── services/     # Existing API service layer
│   └── package.json
├── specs/014-final-qa/   # This feature's documentation
└── history/prompts/final-qa/  # PHRs for this feature
```

**Structure Decision**: No structural changes. Day 9 operates on the existing codebase as-is. Bug fixes modify existing files in place. Test deliverables (test report, traceability matrix, bug reports) are markdown documents stored in `specs/014-final-qa/`.

## Complexity Tracking

> No violations — Constitution Check passed cleanly. No complexity justifications needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

---

## Phase 0: Research — Testing Methodology

### Research Questions

1. **Test report format**: What structure should the final test report follow?
2. **Bug tracking format**: How should bugs be logged and prioritized?
3. **Traceability matrix structure**: How should the requirements traceability matrix be organized?
4. **Test environment setup**: What prerequisites must be in place before testing begins?

### Decisions

#### D1. Test Report Structure

**Decision**: A single markdown file (`specs/014-final-qa/test-report.md`) containing sections for each testing area, with individual test scenarios, results, and evidence.

**Structure**:
```markdown
# Test Report: Final Testing & Requirements Check
## Date: [DATE]
## Tester: [NAME]
## Environment: [browser, viewport, server URL]

## 1. CRUD Operations
### TC-001: Create Workout
- Preconditions: [state]
- Steps: [numbered steps]
- Expected: [what should happen]
- Actual: [what happened]
- Result: PASS / FAIL / BLOCKED
- Evidence: [description or screenshot reference]
- Console Errors: None / [list]

## 2. Authentication
[...]

## N. Requirements Traceability Matrix
| Spec | Requirement | Status | Test Scenario | Evidence |
|------|-------------|--------|---------------|----------|

## Bug Reports
| ID | Description | Severity | Status | Fix Commit |
|----|-------------|----------|--------|------------|

## Sign-off
- All critical flows: PASS / FAIL
- Requirements coverage: X/Y verified
- Open blocker/major bugs: 0
- Build status: PASS / FAIL
- Recommendation: READY / NOT READY
```

**Rationale**: Markdown is the project's documentation standard. A single file keeps all evidence in one place. The structure maps directly to the 9 testing areas from the constitution.

#### D2. Bug Severity Levels

**Decision**: Four severity levels matching the constitution's T5 and spec's FR-041/FR-042:

| Level | Definition | Must Fix Before Sign-off? |
|-------|-----------|--------------------------|
| **Blocker** | Feature completely broken, no workaround. Data loss or security issue. | YES — blocks all other testing |
| **Major** | Feature partially broken, significant functionality missing or incorrect. | YES — must fix before sign-off |
| **Minor** | Feature works but with noticeable issues (wrong color, misaligned text, slow response). | YES if introduced during Day 9; NO if pre-existing |
| **Cosmetic** | Very minor visual inconsistency (1-2px spacing, subtle alignment). | NO — log for future polish, does not block sign-off |

**Rationale**: Matches the constitution's T5 distinction between "bugs that affect usability" (blocker/major/minor) and "cosmetic issues that do not affect usability" (cosmetic). Pre-existing cosmetic issues are grandfathered per assumptions.

#### D3. Traceability Matrix Format

**Decision**: A table mapping every requirement from every spec (001-013) to a test scenario and result. Organized by spec, then by requirement ID within each spec.

**Structure**:
```markdown
## Requirements Traceability Matrix

### specs/001-setup-auth
| Req ID | Requirement | Status | Test Scenario | Evidence |
|--------|-------------|--------|---------------|----------|
| 001-FR-01 | User can register | PASS | TC-006 | Signup flow verified |
| 001-FR-02 | User can login | PASS | TC-007 | Login flow verified |
[...]

### specs/002-profile-workouts
[...]
```

**Rationale**: Grouping by spec makes it easy to verify that every spec was covered. The "Test Scenario" column links each requirement to the specific test that verified it, creating the traceability chain the constitution's T1 requires.

#### D4. Test Data Strategy

**Decision**: Three test accounts with different data profiles:

| Account | Purpose | Data Profile |
|---------|---------|-------------|
| **Primary** (populated) | Most testing | Workouts across categories, nutrition entries across meal types, profile with data, goals, notifications, analytics data |
| **Secondary** (isolation) | Cross-user isolation testing | Minimal data — 1-2 workouts, 1 nutrition entry |
| **Fresh** (empty) | Empty state testing | No data — newly created account |

**Rationale**: The spec's assumptions call for three accounts. This covers populated states, empty states, and cross-user isolation without complex setup.

---

## Phase 1: Design — Test Deliverables

### No Data Model

Day 9 produces no new data model. The "entities" from the spec (Test Scenario, Test Result, Bug Report, Traceability Matrix, Test Report) are markdown document structures, not database schemas. They exist as files in `specs/014-final-qa/`.

### No API Contracts

Day 9 validates existing API contracts — it does not create new ones. All API endpoints were defined in prior specs (001-013). The testing process verifies these existing contracts work correctly end-to-end.

### Quickstart — Test Environment Setup

The `quickstart.md` document provides the step-by-step setup to begin testing:

1. **Prerequisites**: Node.js 24 LTS, MongoDB Atlas connection, both frontend and backend running
2. **Start backend**: `cd backend && npm run dev` (or equivalent)
3. **Start frontend**: `cd frontend && npm run dev`
4. **Create test accounts**: Primary (populated), Secondary (isolation), Fresh (empty)
5. **Populate primary account**: Log 5+ workouts across categories, add nutrition entries for multiple days, set profile data, create goals, trigger notifications
6. **Verify build**: `cd frontend && npm run build` must pass
7. **Open browser**: Chrome with DevTools open (Console tab for error monitoring)
8. **Begin testing**: Follow the recommended order from the spec

### Agent Context Update

Run `update-agent-context.ps1 -AgentType opencode` after the plan lands to refresh AGENTS.md with Day 9 context.

---

## Execution Workflow — Recommended Order

The testing follows the constitution's Process Rule #1 (one feature at a time) and the spec's recommended order:

### Step 1: Preparation (30 min)
- Verify test environment is running (frontend + backend)
- Create/verify the three test accounts (primary, secondary, fresh)
- Populate primary account with representative data
- Open browser with DevTools (Console tab)
- Create initial `test-report.md` with section headers

### Step 2: CRUD + Authentication + Dashboard + Charts (core P1)
Test in this order because each depends on the previous:
1. **Authentication** (FR-006 to FR-012) — must work first since all other tests require a logged-in user
2. **CRUD: Profile** (FR-003) — simple, confirms API + UI connection
3. **CRUD: Workouts** (FR-001, FR-004) — full create/read/update/delete cycle
4. **CRUD: Nutrition** (FR-002, FR-004) — full create/read/update/delete cycle with daily totals
5. **CRUD: Goals** (FR-001 scope) — create/delete cycle
6. **Dashboard** (FR-013 to FR-015) — verify metrics match underlying data
7. **Charts & Analytics** (FR-016 to FR-018) — verify chart data matches known inputs

**Record results immediately** after each test scenario (Process Rule #2).

### Step 3: Search, Notifications, Settings, Reports (P2 features)
1. **Search & Filtering** (FR-019 to FR-022) — search, filter, combine, clear
2. **Notifications** (FR-023 to FR-026) — list, read/unread, settings, empty state
3. **Settings** (FR-027 to FR-030) — preferences, password, logout, delete account
4. **Reports & Export** (FR-031 to FR-035) — data accuracy, CSV, PDF, date range

### Step 4: Responsiveness + Visual Consistency (cross-cutting)
1. Resize browser to 375px → test all major pages
2. Resize browser to 768px → test all major pages
3. Verify at 1280px+ → confirm desktop baseline
4. Check visual consistency against black + orange design system
5. Verify empty states, loading states, error handling across all pages

### Step 5: Requirements Traceability (meta-verification)
1. Read every requirement from every spec (001-013)
2. For each requirement, reference the test scenario that verified it
3. Mark as Pass, Fail, or Partial in the traceability matrix
4. Any Fail items go to Step 6 for fixing

### Step 6: Bug Fixing + Re-testing
1. Log all discovered bugs in `test-report.md`
2. Fix blocker bugs first, then major, then minor
3. After each fix, re-run the original test scenario
4. After each fix, re-test surrounding functionality for regression
5. Update bug status in the report

### Step 7: Final Sign-off
1. Confirm all 9 testing areas have PASS results
2. Confirm traceability matrix is 100% complete
3. Confirm 0 open blocker/major bugs
4. Run `npm run build` → must pass
5. Run `node --check` on backend → must pass
6. Check browser console for 0 errors across all tested flows
7. Write sign-off section in test-report.md
8. If all gates pass → mark project as READY FOR DELIVERY

---

## Definition of Done

This plan is DONE when:

1. ✅ `research.md` documents testing methodology decisions (D1-D4)
2. ✅ `quickstart.md` provides test environment setup instructions
3. ✅ Constitution Check passes for all T1-T6 principles
4. ✅ Execution workflow covers all 9 testing areas in the recommended order
5. ✅ Bug handling process defined with severity levels and fix/re-test loop
6. ✅ Agent context update script run

**Note**: The *implementation* of this plan (the actual testing) produces `test-report.md` as the primary deliverable. That deliverable is created during `/sp.implement`, not during `/sp.plan`.
