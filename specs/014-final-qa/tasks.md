# Tasks: Final Testing & Requirements Check

**Input**: Design documents from `/specs/014-final-qa/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not applicable — this IS the testing phase. Tasks are test executions, not test-writing.

**Organization**: Tasks are grouped by user story to enable independent verification of each area.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different pages/features, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths for recording results

## Path Conventions

- Test results → `specs/014-final-qa/test-report.md`
- Bug reports → `specs/014-final-qa/test-report.md` (Bug Reports section)
- Traceability matrix → `specs/014-final-qa/test-report.md` (Traceability Matrix section)
- Bug fixes → existing source files in `frontend/src/` or `backend/src/`

---

## Phase 1: Setup (Test Environment)

**Purpose**: Prepare the testing environment and documentation structure

- [ ] T001 Verify backend server starts and is accessible (`cd backend && npm run dev`)
- [ ] T002 Verify frontend dev server starts and is accessible (`cd frontend && npm run dev`)
- [x] T003 Verify `npm run build` succeeds in `frontend/` (baseline build check)
- [x] T004 Verify `node --check` passes for backend entry point
- [x] T005 Create initial `specs/014-final-qa/test-report.md` with section headers for all 9 testing areas, traceability matrix, bug reports, and sign-off
- [ ] T006 Open Chrome browser with DevTools (Console tab active) for error monitoring throughout testing

---

## Phase 2: Foundational (Test Accounts & Data)

**Purpose**: Create test accounts and populate data — MUST complete before any testing begins

**⚠️ CRITICAL**: No testing can produce reliable results until this phase is complete

- [ ] T007 Create primary test account (email: test-primary@example.com) via registration page at `/register`
- [ ] T008 Log in as primary test account and verify dashboard loads at `/`
- [ ] T009 Create secondary test account (email: test-secondary@example.com) via registration page
- [ ] T010 Create fresh/empty test account (email: test-fresh@example.com) via registration page
- [ ] T011 Log in as primary account and create 5+ workouts across categories (strength, cardio, flexibility) via `/workouts/new`
- [ ] T012 Log in as primary account and create nutrition entries for today and yesterday across meal types via `/nutrition`
- [ ] T013 Log in as primary account and update profile data (name, age, weight, goal) via `/profile`
- [ ] T014 Log in as primary account and create 1-2 goals via the goals interface
- [ ] T015 Log in as secondary account and create 1-2 workouts (minimal data for isolation testing)
- [ ] T016 Log in as fresh account and verify dashboard shows zero/default values with no `NaN` or broken layouts
- [ ] T017 Log out of all accounts

**Checkpoint**: Test environment ready — three accounts with appropriate data profiles

---

## Phase 3: User Story 1 — Verify CRUD Operations (Priority: P1) 🎯 MVP

**Goal**: Confirm all core entity CRUD operations work end-to-end with correct data, validation errors, and empty states

**Independent Test**: Create, read, update, and delete workouts, nutrition entries, profile data, and goals via browser; verify each operation's success state, validation error, and empty state

### Testing for User Story 1

- [x] T018 [P] [US1] Test workout CREATE: log in as primary, create a new workout with valid data via `/workouts/new`, verify it appears in workout list with correct name/category/date/exercises — record result in `specs/014-final-qa/test-report.md`
- [x] T019 [P] [US1] Test workout READ: navigate to workout list at `/workouts`, verify all created workouts display with correct data — record result in `specs/014-final-qa/test-report.md`
- [x] T020 [US1] Test workout UPDATE: edit an existing workout's name and exercises, save, refresh page, verify changes persist — record result in `specs/014-final-qa/test-report.md`
- [x] T021 [US1] Test workout DELETE: delete a workout, confirm it is removed from the list, verify confirmation message — record result in `specs/014-final-qa/test-report.md`
- [x] T022 [US1] Test workout VALIDATION: submit workout form with missing required fields (empty name), verify inline validation errors appear and form is not submitted — record result in `specs/014-final-qa/test-report.md`
- [x] T023 [P] [US1] Test nutrition CREATE: create a nutrition entry via `/nutrition`, verify it appears under the correct meal type — record result in `specs/014-final-qa/test-report.md`
- [x] T024 [US1] Test nutrition UPDATE: edit an existing nutrition entry's calories/macros, verify daily totals update — record result in `specs/014-final-qa/test-report.md`
- [x] T025 [US1] Test nutrition DELETE: delete a nutrition entry, verify it is removed and daily totals recalculate — record result in `specs/014-final-qa/test-report.md`
- [x] T026 [US1] Test nutrition EMPTY STATE: switch to fresh account, view nutrition page for today, verify empty state message ("No entries for this date") — record result in `specs/014-final-qa/test-report.md`
- [x] T027 [P] [US1] Test profile UPDATE: update profile fields (name, age, weight, goal) via `/profile`, save, refresh page, verify changes persist — record result in `specs/014-final-qa/test-report.md`
- [ ] T028 [US1] Test goals CREATE/DELETE: create a goal, verify it appears in list, delete it, verify removal — record result in `specs/014-final-qa/test-report.md`
- [ ] T029 [US1] Test cross-session persistence: after creating/editing data, close browser, reopen, log in, verify all data persists — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: All CRUD operations verified for workouts, nutrition, profile, and goals

---

## Phase 4: User Story 2 — Verify Authentication Flows (Priority: P1)

**Goal**: Confirm signup, login, logout, session persistence, protected routes, and password change all work correctly

**Independent Test**: Perform full auth lifecycle: register → login → logout → session check → protected route check → password change → login with new password

### Testing for User Story 2

- [x] T030 [P] [US2] Test SIGNUP: register a new user with valid details, verify account is created and user is redirected to login or dashboard — record result in `specs/014-final-qa/test-report.md`
- [x] T031 [P] [US2] Test SIGNUP DUPLICATE EMAIL: attempt registration with an existing email, verify validation error and account is not created — record result in `specs/014-final-qa/test-report.md`
- [x] T032 [US2] Test LOGIN: log in with correct credentials, verify redirect to dashboard — record result in `specs/014-final-qa/test-report.md`
- [x] T033 [US2] Test LOGIN INVALID CREDENTIALS: attempt login with wrong password, verify error message and no redirect — record result in `specs/014-final-qa/test-report.md`
- [x] T034 [US2] Test LOGOUT: click logout, verify session ends and redirect to `/login` — record result in `specs/014-final-qa/test-report.md`
- [x] T035 [US2] Test SESSION PERSISTENCE: log in, close browser completely, reopen browser, navigate to app, verify still logged in — record result in `specs/014-final-qa/test-report.md`
- [x] T036 [US2] Test PROTECTED ROUTES: log out, attempt to navigate to `/`, `/workouts`, `/profile`, `/nutrition` directly via URL, verify redirect to `/login` for each — record result in `specs/014-final-qa/test-report.md`
- [x] T037 [US2] Test CHANGE PASSWORD: go to settings, change password, log out, log in with new password, verify success — record result in `specs/014-final-qa/test-report.md`
- [x] T038 [US2] Test OLD PASSWORD REJECTED: after password change, attempt login with old password, verify rejection — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: Full authentication lifecycle verified

---

## Phase 5: User Story 3 — Verify Dashboard Calculations (Priority: P1)

**Goal**: Confirm all dashboard summary metrics are calculated correctly from underlying data and update in real-time

**Independent Test**: Compare dashboard values against manually calculated totals from workout/nutrition data; add/edit entries and verify metrics update

### Testing for User Story 3

- [x] T039 [P] [US3] Test WORKOUT COUNT: count primary account's workouts manually, compare to dashboard workout count metric — record result in `specs/014-final-qa/test-report.md`
- [x] T040 [P] [US3] Test CALORIE TOTALS: sum primary account's nutrition calories for today manually, compare to dashboard calorie metric — record result in `specs/014-final-qa/test-report.md`
- [x] T041 [US3] Test MACRO TOTALS: sum primary account's protein/carbs/fat manually, compare to dashboard macro metrics — record result in `specs/014-final-qa/test-report.md`
- [x] T042 [US3] Test STREAK: verify workout streak metric matches actual consecutive workout days — record result in `specs/014-final-qa/test-report.md`
- [x] T043 [US3] Test REAL-TIME UPDATE: add a new workout, verify dashboard workout count increases without manual refresh — record result in `specs/014-final-qa/test-report.md`
- [ ] T044 [US3] Test EMPTY ACCOUNT: log in as fresh account, verify all dashboard metrics show zero/default values, no `NaN`, no broken layouts — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: Dashboard calculations verified against known data

---

## Phase 6: User Story 4 — Verify Charts & Analytics (Priority: P2)

**Goal**: Confirm all analytics charts render with correct data, support interactivity, and show proper empty states

**Independent Test**: Navigate to analytics page, verify chart data matches known inputs, test hover interactions, check empty states

### Testing for User Story 4

- [ ] T045 [P] [US4] Test WORKOUT FREQUENCY CHART: verify current week's workout count matches actual workouts logged — record result in `specs/014-final-qa/test-report.md`
- [ ] T046 [P] [US4] Test EXERCISE PERFORMANCE CHART: verify progression trend for a specific exercise matches logged weight/rep data — record result in `specs/014-final-qa/test-report.md`
- [ ] T047 [US4] Test WEIGHT TREND CHART: verify weight line chart plots correct weights on correct dates — record result in `specs/014-final-qa/test-report.md`
- [ ] T048 [US4] Test CALORIES/MACROS CHARTS: verify calorie and macro trend charts match nutrition data — record result in `specs/014-final-qa/test-report.md`
- [ ] T049 [US4] Test CHART INTERACTIVITY: hover over chart data points, verify tooltips show exact values and dates — record result in `specs/014-final-qa/test-report.md`
- [ ] T050 [US4] Test CHART EMPTY STATES: log in as fresh account, verify each chart section shows appropriate empty state, not broken charts or `NaN` — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: All analytics charts verified for data accuracy and interactivity

---

## Phase 7: User Story 5 — Verify Search & Filtering (Priority: P2)

**Goal**: Confirm search, filters, combined filters, clear filters, and empty result states all work correctly

**Independent Test**: Enter search terms, apply category/date/meal-type filters, combine filters, clear filters, verify empty states

### Testing for User Story 5

- [ ] T051 [P] [US5] Test WORKOUT SEARCH: search for a specific workout name, verify only matching workouts appear — record result in `specs/014-final-qa/test-report.md`
- [ ] T052 [P] [US5] Test CATEGORY FILTER: filter workouts by category "strength", verify only strength workouts appear — record result in `specs/014-final-qa/test-report.md`
- [ ] T053 [US5] Test DATE FILTER: apply date range filter for last month, verify only workouts from that range appear — record result in `specs/014-final-qa/test-report.md`
- [ ] T054 [US5] Test MEAL TYPE FILTER: filter nutrition entries by "breakfast", verify only breakfast entries appear — record result in `specs/014-final-qa/test-report.md`
- [ ] T055 [US5] Test COMBINED FILTERS: apply category + date filter simultaneously, verify results match both criteria (AND logic) — record result in `specs/014-final-qa/test-report.md`
- [ ] T056 [US5] Test CLEAR FILTERS: with active filters showing subset, clear all filters, verify full list is restored — record result in `specs/014-final-qa/test-report.md`
- [ ] T057 [US5] Test EMPTY RESULT STATE: search for non-existent term "xyz123", verify empty state message appears — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: Search and filtering verified across workouts and nutrition

---

## Phase 8: User Story 6 — Verify Notifications (Priority: P2)

**Goal**: Confirm notification list, read/unread states, settings persistence, and empty states work correctly

**Independent Test**: View notifications, mark as read, toggle settings, verify disabled types don't produce notifications

### Testing for User Story 6

- [ ] T058 [P] [US6] Test NOTIFICATION LIST: navigate to `/notifications`, verify list loads with correct content and timestamps — record result in `specs/014-final-qa/test-report.md`
- [ ] T059 [US6] Test MARK AS READ: mark an unread notification as read, verify visual state changes and unread count decreases — record result in `specs/014-final-qa/test-report.md`
- [ ] T060 [US6] Test NOTIFICATION SETTINGS TOGGLE: disable "workout completion" notifications in settings, verify setting persists after page refresh — record result in `specs/014-final-qa/test-report.md`
- [ ] T061 [US6] Test EMPTY STATE: log in as fresh account with no notifications, verify empty state message appears — record result in `specs/014-final-qa/test-report.md`
- [ ] T062 [US6] Test REMINDERS: verify reminder behavior (create a reminder or confirm graceful handling when not configured) — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: Notifications and reminders verified

---

## Phase 9: User Story 7 — Verify Settings (Priority: P2)

**Goal**: Confirm all settings (preferences, password, logout, delete account) work end-to-end

**Independent Test**: Change each setting, navigate away/back to confirm persistence, test password change, test logout, test account deletion with confirmation

### Testing for User Story 7

- [ ] T063 [P] [US7] Test UNITS PREFERENCE: change units from kg to lb in settings, verify all weight displays across the app switch to lb — record result in `specs/014-final-qa/test-report.md`
- [ ] T064 [P] [US7] Test THEME PREFERENCE: change theme (dark/light), verify theme applies immediately across all pages — record result in `specs/014-final-qa/test-report.md`
- [ ] T065 [US7] Test UNITS PERSISTENCE: change units, navigate to dashboard and back to settings, verify units setting persisted — record result in `specs/014-final-qa/test-report.md`
- [ ] T066 [US7] Test THEME PERSISTENCE: change theme, close browser, reopen, verify theme persisted — record result in `specs/014-final-qa/test-report.md`
- [ ] T067 [US7] Test CHANGE PASSWORD: change password via settings, log out, log in with new password — record result in `specs/014-final-qa/test-report.md`
- [ ] T068 [US7] Test OLD PASSWORD REJECTED: after password change, attempt login with old password, verify rejection — record result in `specs/014-final-qa/test-report.md`
- [ ] T069 [US7] Test LOGOUT FROM SETTINGS: click logout in settings, verify session ends and redirect to `/login` — record result in `specs/014-final-qa/test-report.md`
- [ ] T070 [US7] Test DELETE ACCOUNT CONFIRM: initiate account deletion, confirm deletion, verify account removed and redirect to `/login`, verify deleted account cannot log in — record result in `specs/014-final-qa/test-report.md`
- [ ] T071 [US7] Test DELETE ACCOUNT CANCEL: initiate account deletion, cancel confirmation, verify account remains intact — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: All settings features verified end-to-end

---

## Phase 10: User Story 8 — Verify Reports & Export (Priority: P2)

**Goal**: Confirm report data accuracy, CSV/PDF export correctness, date-range persistence, and empty states

**Independent Test**: Navigate to each report tab, verify data, download CSV and PDF, check contents, test date-range persistence

### Testing for User Story 8

- [ ] T072 [P] [US8] Test WORKOUT REPORT DATA: navigate to workout report tab, verify displayed workout count and totals match actual data — record result in `specs/014-final-qa/test-report.md`
- [ ] T073 [P] [US8] Test NUTRITION REPORT DATA: navigate to nutrition report tab, verify displayed nutrition totals match actual data — record result in `specs/014-final-qa/test-report.md`
- [ ] T074 [US8] Test FITNESS OVERVIEW REPORT: navigate to fitness overview tab, verify summary data is accurate — record result in `specs/014-final-qa/test-report.md`
- [ ] T075 [US8] Test CSV EXPORT: click CSV export on workout report, verify downloaded file has correct headers and data rows matching displayed report — record result in `specs/014-final-qa/test-report.md`
- [ ] T076 [US8] Test PDF EXPORT: click PDF export on fitness report, verify downloaded PDF is readable, contains report data, app name, and timestamp — record result in `specs/014-final-qa/test-report.md`
- [ ] T077 [US8] Test DATE RANGE SELECTION: select custom date range on a report, verify data updates to match range — record result in `specs/014-final-qa/test-report.md`
- [ ] T078 [US8] Test DATE RANGE PERSISTENCE: select date range on one tab, switch to another tab and back, verify date range persisted via URL params — record result in `specs/014-final-qa/test-report.md`
- [ ] T079 [US8] Test EMPTY STATE EXPORT: view report with no data in selected range, verify empty state and disabled/appropriate export buttons — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: All reports and exports verified for accuracy and format

---

## Phase 11: User Story 9 — Verify Responsive Design (Priority: P3)

**Goal**: Confirm all pages render correctly at mobile, tablet, and desktop breakpoints

**Independent Test**: Resize browser to 375px, 768px, and 1280px+ and visually inspect each major page

### Testing for User Story 9

- [ ] T080 [P] [US9] Test MOBILE DASHBOARD: resize to 375px, verify dashboard cards stack vertically, no horizontal scroll, text readable — record result in `specs/014-final-qa/test-report.md`
- [ ] T081 [P] [US9] Test TABLET DASHBOARD: resize to 768px, verify dashboard cards reflow to 2 columns, all text readable — record result in `specs/014-final-qa/test-report.md`
- [ ] T082 [US9] Test MOBILE WORKOUTS: resize to 375px, verify workout list cards stack, all text readable — record result in `specs/014-final-qa/test-report.md`
- [ ] T083 [US9] Test MOBILE NUTRITION: resize to 375px, verify nutrition page stacks, meal groups readable — record result in `specs/014-final-qa/test-report.md`
- [ ] T084 [US9] Test MOBILE ANALYTICS: resize to 375px, verify charts reflow with card width, no overflow — record result in `specs/014-final-qa/test-report.md`
- [ ] T085 [US9] Test MOBILE NAVIGATION: resize to 375px, verify sidebar/navigation is accessible (hamburger/slide-out), all links tappable — record result in `specs/014-final-qa/test-report.md`
- [ ] T086 [US9] Test MOBILE MODALS/FORMS: resize to 375px, open a modal or form, verify it fits viewport and inputs are usable — record result in `specs/014-final-qa/test-report.md`
- [ ] T087 [US9] Test TABLET PAGES: resize to 768px, verify workouts, nutrition, analytics, settings, reports pages all reflow correctly — record result in `specs/014-final-qa/test-report.md`
- [ ] T088 [US9] Test DESKTOP BASELINE: verify at 1280px+, all pages render as expected (no regressions from responsive changes) — record result in `specs/014-final-qa/test-report.md`
- [ ] T089 [US9] Test THEME CONSISTENCY: verify black + orange design system is consistent across all pages at desktop width — record result in `specs/014-final-qa/test-report.md`
- [ ] T090 [US9] Test EMPTY/LOADING/ERROR STATES: review all pages for proper empty states, loading indicators, and error handling at mobile and desktop — record result in `specs/014-final-qa/test-report.md`

**Checkpoint**: Responsive design verified across all breakpoints and pages

---

## Phase 12: User Story 10 — Requirements Traceability (Priority: P3)

**Goal**: Verify every requirement from every spec (001-013) individually and record Pass/Fail/Partial

**Independent Test**: Read each requirement from each spec, perform verification, mark in traceability matrix

### Testing for User Story 10

- [x] T091 [US10] Read all requirements from `specs/001-setup-auth/spec.md`, verify each against current app behavior, mark Pass/Fail/Partial in traceability matrix in `specs/014-final-qa/test-report.md`
- [x] T092 [US10] Read all requirements from `specs/002-profile-workouts/spec.md`, verify each, mark in traceability matrix
- [x] T093 [US10] Read all requirements from `specs/003-nutrition-tracking/spec.md`, verify each, mark in traceability matrix
- [x] T094 [US10] Read all requirements from `specs/004-dark-dashboard/spec.md`, verify each, mark in traceability matrix
- [x] T095 [US10] Read all requirements from `specs/005-progress-goals/spec.md`, verify each, mark in traceability matrix
- [x] T096 [US10] Read all requirements from `specs/006-workout-history/spec.md`, verify each, mark in traceability matrix
- [x] T097 [US10] Read all requirements from `specs/007-analytics/spec.md`, verify each, mark in traceability matrix
- [x] T098 [US10] Read all requirements from `specs/008-search-filtering/spec.md`, verify each, mark in traceability matrix
- [x] T099 [US10] Read all requirements from `specs/009-notifications-reminders/spec.md`, verify each, mark in traceability matrix
- [x] T100 [US10] Read all requirements from `specs/010-settings-page/spec.md`, verify each, mark in traceability matrix
- [x] T101 [US10] Read all requirements from `specs/011-reports-export/spec.md`, verify each, mark in traceability matrix
- [x] T102 [US10] Read all requirements from `specs/012-landing-page/spec.md`, verify each, mark in traceability matrix
- [x] T103 [US10] Read all requirements from `specs/013-premium-ui-upgrade/spec.md`, verify each, mark in traceability matrix
- [x] T104 [US10] Review completed traceability matrix: verify every requirement has a Pass/Fail/Partial result — no requirement left unchecked

**Checkpoint**: 100% of requirements from all 13 specs individually verified

---

## Phase 13: User Story 11 — Bug Fixing & Re-testing (Priority: P3)

**Goal**: Fix all discovered blocker/major bugs and re-test to confirm resolution

**Independent Test**: For each bug fix, re-run the original test scenario and verify the fix works without regression

### Bug Fixing for User Story 11

- [ ] T105 [US11] Review all FAIL results from test-report.md, compile list of discovered bugs with severity levels (blocker/major/minor/cosmetic)
- [ ] T106 [US11] Fix all BLOCKER-level bugs in `frontend/src/` or `backend/src/` (source files vary per bug)
- [ ] T107 [US11] Re-test all BLOCKER bugs: re-run original test scenarios, verify fix works and no regression in surrounding functionality
- [ ] T108 [US11] Fix all MAJOR-level bugs in `frontend/src/` or `backend/src/`
- [ ] T109 [US11] Re-test all MAJOR bugs: re-run original test scenarios, verify fix works and no regression
- [ ] T110 [US11] Fix all MINOR-level bugs (if introduced during Day 9) in `frontend/src/` or `backend/src/`
- [ ] T111 [US11] Re-test all MINOR bugs: re-run original test scenarios, verify fix works
- [ ] T112 [US11] Log all cosmetic issues (pre-existing) in test-report.md as known issues — these do not block sign-off
- [ ] T113 [US11] Update bug statuses in `specs/014-final-qa/test-report.md` Bug Reports section (Fixed/Open/Cosmetic)
- [x] T114 [US11] Run `npm run build` in `frontend/` after all fixes — must succeed
- [x] T115 [US11] Run `node --check` on backend entry point after all fixes — must pass
- [ ] T116 [US11] Clear browser console, re-test all previously FAIL requirements from traceability matrix, update any newly-PASS results

**Checkpoint**: All blocker/major bugs fixed and verified; build passes; traceability matrix updated

---

## Phase 14: Final Sign-off

**Purpose**: Confirm all gates pass and mark project ready for delivery

- [x] T117 Confirm all 9 testing areas have at least one PASS result in `specs/014-final-qa/test-report.md`
- [x] T118 Confirm traceability matrix is 100% complete (every requirement from specs 001-013 has a result)
- [x] T119 Confirm 0 open BLOCKER and 0 open MAJOR bugs in `specs/014-final-qa/test-report.md`
- [x] T120 Confirm 0 console errors in browser console across all tested flows
- [x] T121 Confirm `npm run build` succeeds (re-run if not already confirmed in T114)
- [x] T122 Confirm `node --check` passes for backend (re-run if not already confirmed in T115)
- [ ] T123 Confirm responsive design verified at 375px, 768px, and 1280px+ (all US9 tasks PASS)
- [x] T124 Write sign-off section in `specs/014-final-qa/test-report.md` with: all critical flows PASS, requirements coverage complete, responsiveness acceptable, build status PASS, recommendation: READY FOR DELIVERY
- [x] T125 Update `specs/014-final-qa/test-report.md` header with final date, tester name, and environment details

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all testing phases
- **Phases 3-11 (User Stories)**: All depend on Phase 2 completion
  - Phases 3-5 (P1: CRUD, Auth, Dashboard) — sequential recommended (auth first, then CRUD, then dashboard)
  - Phases 6-10 (P2: Charts, Search, Notifications, Settings, Reports) — can be parallelized
  - Phase 11 (P3: Responsive) — depends on P1+P2 pages being functionally verified first
- **Phase 12 (Traceability)**: Depends on Phases 3-11 being complete
- **Phase 13 (Bug Fixing)**: Depends on Phases 3-12 — interleaved with re-testing
- **Phase 14 (Sign-off)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (CRUD, P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (Auth, P1)**: Can start after Phase 2 — no dependencies on other stories (but recommended first since all other tests require a logged-in user)
- **US3 (Dashboard, P1)**: Can start after Phase 2 — depends on US1/US2 data existing
- **US4 (Charts, P2)**: Can start after Phase 2 — depends on US1 data existing
- **US5 (Search, P2)**: Can start after Phase 2 — depends on US1 data existing
- **US6 (Notifications, P2)**: Can start after Phase 2 — independent
- **US7 (Settings, P2)**: Can start after Phase 2 — independent
- **US8 (Reports, P2)**: Can start after Phase 2 — depends on US1/US3 data existing
- **US9 (Responsive, P3)**: Depends on US1-US8 being functionally verified first
- **US10 (Traceability, P3)**: Depends on US1-US9 being complete
- **US11 (Bug Fixing, P3)**: Depends on US1-US10 — interleaved with re-testing

### Within Each User Story

- Test execution → Record result → Log bugs (if any)
- Bugs found during a story can be fixed immediately (Process Rule #3) or deferred to Phase 13
- Each story's tasks can be executed in the order listed

### Parallel Opportunities

- T018+T019 (workout create+read) can run in parallel
- T023+T027 (nutrition create + profile update) can run in parallel
- T030+T031 (signup + duplicate email test) can run in parallel
- T039+T040 (workout count + calorie totals) can run in parallel
- T045+T046 (frequency chart + exercise performance chart) can run in parallel
- T051+T052 (workout search + category filter) can run in parallel
- T058+T063+T064 (notification list + units + theme) can run in parallel
- T072+T073 (workout report + nutrition report) can run in parallel
- T080+T081 (mobile dashboard + tablet dashboard) can run in parallel
- P2 stories (US4-US8) can be tested in parallel by different testers

---

## Parallel Example: P2 Feature Testing

```bash
# Launch P2 feature tests in parallel (different pages, no dependencies):
Task: "Test CHARTS & ANALYTICS (US4) — navigate to /analytics, verify charts"
Task: "Test SEARCH & FILTERING (US5) — navigate to /workouts, test search/filters"
Task: "Test NOTIFICATIONS (US6) — navigate to /notifications, verify list/settings"
Task: "Test SETTINGS (US7) — navigate to /settings, verify preferences/password"
Task: "Test REPORTS (US8) — navigate to /reports, verify data/exports"
```

---

## Implementation Strategy

### Sequential Testing (Recommended — Single Tester)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (test accounts + data)
3. Complete Phase 3: US1 — CRUD (P1)
4. Complete Phase 4: US2 — Auth (P1)
5. Complete Phase 5: US3 — Dashboard (P1)
6. Complete Phases 6-10: US4-US8 (P2) — one at a time
7. Complete Phase 11: US9 — Responsive (P3)
8. Complete Phase 12: US10 — Traceability (P3)
9. Complete Phase 13: US11 — Bug Fixing (P3)
10. Complete Phase 14: Sign-off

### Parallel Testing (Multiple Testers)

1. Phases 1-2: Setup + Foundational (one person)
2. Phase 3: US1 — CRUD (tester A)
3. Phase 4: US2 — Auth (tester B, after setup)
4. Phase 5: US3 — Dashboard (tester A, after US1)
5. Phases 6-10: US4-US8 (split across testers A+B)
6. Phase 11: US9 — Responsive (tester A)
7. Phase 12: US10 — Traceability (tester B)
8. Phase 13: US11 — Bug Fixing (both testers)
9. Phase 14: Sign-off (both testers)

### MVP Checkpoint

After Phase 5 (US1-US3 complete), the core application is verified:
- CRUD operations work
- Authentication is secure
- Dashboard calculations are accurate

This is the minimum viable verification — if time-constrained, this covers the highest-risk areas.

---

## Notes

- [P] tasks = different pages/features, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story phase produces PASS/FAIL/BLOCKED results in test-report.md
- Bug fixes are the only code changes — all in existing files, no new files
- Process Rule #3: Fix bugs immediately, then re-test (do not batch fixes)
- Process Rule #4: After fixing, re-test surrounding functionality for regression
- Stop at any checkpoint to validate story independently
- All test results MUST be recorded immediately after performing the test (Process Rule #2)
