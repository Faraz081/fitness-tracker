# Implementation Plan: Reports & Export (8.1)

**Branch**: `011-reports-export` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-reports-export/spec.md`

## Summary

Build a comprehensive Reports & Export module for the Fitness Tracker MERN application. Reports are computed server-side from real owner-scoped workout and nutrition data over a user-selected date range. The frontend displays pre-aggregated data across four report tabs (Overview, Workout, Nutrition, Progress) with a shared date-range selector. CSV and PDF exports are generated client-side from the same pre-aggregated data. One new runtime dependency is approved: a client-side PDF generation library.

## Technical Context

**Language/Version**: JavaScript ES2022 (`.js`/`.jsx`) on Node.js 24 LTS (v24.18.0) + React 19.2.8, Vite 8.2.2, React Router 7.18.2
**Primary Dependencies**: Express 5.0.1, Mongoose 9.1.3, React 19.2.8, Vite 8.2.2, React Router 7.18.2, Zod 4.1.11, bcryptjs 3.0.2, jsonwebtoken 9.0.2
**Storage**: MongoDB Atlas (Mongoose 9) — existing `workouts`, `nutrition`, `users` collections; NO new models
**Testing**: Backend: `node --check` for syntax; Frontend: `npm run build` (vite build); Manual browser verification required
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: MERN monorepo (client/ + server/)
**Performance Goals**: 30-day report loads < 2s end-to-end; exports complete < 10s for normal ranges; All-Time ranges degrade gracefully
**Constraints**: JavaScript-only (no TypeScript); one new runtime dependency (PDF library); no new env vars; no new data models
**Scale/Scope**: Single-user reports; real persisted data only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| R1. Accuracy First | ✅ PASS | Server-computed aggregation from owner-scoped rows; no fabricated values |
| R2. Clarity | ✅ PASS | Clear headings, date range, sectioned layout, consistent labels |
| R3. Dashboard Consistency | ✅ PASS | Reuses DashboardLayout shell, dark theme, tokens, accent |
| R4. User Control | ✅ PASS | Date-range selector with presets + custom range; Generate/Export buttons |
| R5. Reliability | ✅ PASS | CSV/PDF from same pre-aggregated data; valid files on empty ranges |
| R6. Performance Through Pre-Aggregation | ✅ PASS | Server-side aggregation; client renders pre-computed summaries |
| R7. Accessibility & Internationalization | ✅ PASS | Keyboard-accessible controls; aria-labels; aria-live export feedback |
| R8. Testing & Reliability | ✅ PASS | Contract tests per report type; edge-case tests; integration tests |
| R9. Evolution & Governance | ✅ PASS | Shared report model and export pipeline; schema migration plan |
| VII. Resource Ownership | ✅ PASS | All queries filtered by `owner: req.userId` |
| VIII. Server-Computed Totals | ✅ PASS | Totals computed server-side from stored entries |
| V. JavaScript-Only | ✅ PASS | All new files `.js`/`.jsx` only |

## Project Structure

### Documentation (this feature)

```text
specs/011-reports-export/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── GET-reports-overview.md
│   ├── GET-reports-workout.md
│   ├── GET-reports-nutrition.md
│   └── GET-reports-progress.md
├── spec.md              # Feature specification
├── user-stories.md      # User stories
├── constitution.md      # Module-level constitution
├── mission.md           # Module mission statement
├── roadmap.md           # Implementation roadmap
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/
│   ├── middleware/       # authenticate.js, validate.js, errorHandler.js
│   ├── models/          # User.js, Workout.js, Nutrition.js, Notification.js, NotificationSettings.js
│   ├── routes/          # auth.js, workout.js, nutrition.js, profile.js, notification.js, + NEW reports.js
│   ├── controllers/     # auth.js, workout.js, nutrition.js, profile.js, notification.js, + NEW reports.js
│   ├── services/        # auth.js, workout.js, nutrition.js, profile.js, notification.js, + NEW reports.js
│   ├── utils/           # validators.js, response.js, jwt.js, apiError.js
│   ├── app.js
│   └── index.js
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── layout/      # Sidebar.jsx, TopNavbar.jsx, DashboardLayout.jsx
│   │   ├── ui/          # Card.jsx, Button.jsx, Badge.jsx, EmptyState.jsx, Spinner.jsx, Skeleton.jsx, etc.
│   │   ├── reports/     # NEW: ReportTabs.jsx, DateRangeSelector.jsx, ReportCard.jsx, OverviewReport.jsx, WorkoutReport.jsx, NutritionReport.jsx, ProgressReport.jsx, ExportButtons.jsx
│   │   ├── dashboard/   # SummaryCard.jsx, SummaryCards.jsx, etc.
│   │   ├── analytics/   # DateRangeFilter.jsx, ChartCard.jsx, etc.
│   │   └── ...
│   ├── pages/           # Dashboard.jsx, Progress.jsx, Analytics.jsx, Goals.jsx, Notifications.jsx, Settings.jsx, + NEW Reports.jsx
│   ├── services/        # api.js (+ NEW report API functions)
│   ├── utils/           # reportUtils.js (NEW), formatWeight.js, filterUtils.js, etc.
│   ├── context/         # AuthContext.jsx, SettingsContext.jsx, NotificationsContext.jsx
│   ├── hooks/           # useAuth.js
│   ├── App.jsx          # + <Route path="/reports"> inside DashboardLayout
│   └── main.jsx
└── package.json
```

**Structure Decision**: Additive MERN phase — new backend route/controller/service (`reports`) and new frontend components/pages/services/utils. No existing files modified except `App.jsx` (one new route) and `services/api.js` (new report API functions).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| One new runtime dependency (PDF library) | Constitution R5 requires real downloadable PDF files, not print-CSS | window.print() is not a real PDF; no other client-side PDF library meets the requirement |
| Server-side aggregation endpoints | Constitution R1/R6 mandate server-computed aggregation for accuracy and performance | Client-side aggregation of raw records would be slow and violate R6 pre-aggregation rule |

## Phase 0: Research

### Unknowns Resolved

1. **PDF Library Selection**: `jspdf` + `jspdf-autotable` — lightweight, well-maintained, client-side PDF generation with table support. Handles static vector drawings for charts via canvas-to-image conversion. No server-side rendering needed.

2. **Chart Rendering for PDF**: Canvas-based rendering of hand-rolled SVG charts → `canvas.toDataURL()` → embed in PDF as images. This avoids adding a charting library while producing static chart graphics for PDF exports.

3. **Date Range Persistence**: URL query params via `useSearchParams` (React Router 7) — consistent with Day 5.1 S5 convention.

4. **Consistency Score Formula**: `(days with ≥1 workout OR ≥1 nutrition entry) ÷ range days × 100`, rounded to whole percent. Hidden as "No data" when no activity exists.

5. **PR Definition**: A PR is a range-best weight that exceeds the same exercise's best weight across the user's full previous logged history (full-history comparison). Plan must record this exact rule.

6. **Backend Aggregation Pattern**: Single endpoint `GET /api/reports/:type` with `from` and `to` query params. Server computes all metrics server-side and returns pre-aggregated summary. Client renders without re-aggregating.

7. **CSV Generation**: Client-side pure function from pre-aggregated data. UTF-8 BOM for spreadsheet compatibility. Proper quoting/escaping for special characters.

8. **Performance Verification**: Manual timing during implementation; record results in quickstart.md.

### Best Practices Found

1. **jsPDF**: Use `doc.autoTable()` for structured tables; `doc.text()` for text; `doc.addImage()` for charts. Import only what's needed to minimize bundle.

2. **Date Range Handling**: Server validates inclusive `from`/`to` in `YYYY-MM-DD` format. Invalid/inverted ranges return `400 VALIDATION_ERROR`.

3. **Ownership Isolation**: Every report query filters by `{ owner: req.userId }`. Empty results never expose another user's data.

## Phase 1: Design & Contracts

### Data Model (data-model.md)

No new Mongoose models. Reports aggregate from existing collections:

- **Workouts**: `{ owner, title, category, date, exercises: [{ name, sets, reps, weightKg }] }`
- **Nutrition**: `{ owner, foodName, calories, protein, carbs, fat, mealType, date }`
- **User Profile**: `{ weightKg, goal, preferences: { units } }`

Aggregation queries use MongoDB's `$match`, `$group`, `$project`, and `$sort` operators with owner-scoped filters and date-range boundaries.

### API Contracts (contracts/)

Four endpoints, all auth-scoped:

1. **GET /api/reports/overview** — Combined KPI summary
2. **GET /api/reports/workout** — Workout report data
3. **GET /api/reports/nutrition** — Nutrition report data
4. **GET /api/reports/progress** — Progress report data

All accept `?from=YYYY-MM-DD&to=YYYY-MM-DD` query params. All return `{ success: true, data: { ...reportData } }` envelope.

### Frontend Design

**Page Structure**:
- `/reports` route inside DashboardLayout
- ReportTabs component with Overview/Workout/Nutrition/Progress tabs
- DateRangeSelector shared across all tabs
- ExportButtons (CSV + PDF) per report type
- Report-specific sections with KPI cards, tables, and hand-rolled SVG charts

**State Management**:
- `useState` in Reports.jsx for active tab and report data
- `useSearchParams` for date range persistence across tabs
- Report data fetched via `services/reports.js` API layer

**Shared Components**:
- DateRangeSelector (presets + custom picker)
- ReportCard (reusable section wrapper)
- ExportButtons (CSV + PDF actions with loading/success/error states)

### Quickstart Verification

```text
1. Start backend: cd backend && npm run dev
2. Start frontend: cd frontend && npm run dev
3. Login as test user
4. Navigate to /reports
5. Verify Overview tab shows KPI cards
6. Select "Last 7 days" preset → verify data updates
7. Click Workout tab → verify workout report renders
8. Click Nutrition tab → verify nutrition report renders
9. Click Progress tab → verify progress report renders
10. Click "Export CSV" → verify file downloads and opens in Excel
11. Click "Export PDF" → verify PDF downloads with correct content
12. Test empty range → verify empty states render
13. Test invalid range → verify validation message
14. Verify URL params persist across tab switches
15. Verify responsive layout at mobile breakpoint
16. Run backend `node --check` on new modules
17. Run frontend `npm run build` — no errors
```

## Phase 2: Task Breakdown (for /sp.tasks)

Tasks will be organized into parallel groups where possible:

### Group 1: Backend Foundation
- T01: Create reports service with aggregation logic
- T02: Create reports controller with request handling
- T03: Create reports routes with validation
- T04: Register reports router in app.js

### Group 2: Frontend Foundation
- T05: Create reportUtils.js with pure functions (consistency score, formatting, CSV builder)
- T06: Create services/reports.js API layer
- T07: Create Reports.jsx page with tab navigation
- T08: Create DateRangeSelector.jsx component
- T09: Create ReportTabs.jsx component

### Group 3: Report Views
- T10: Create OverviewReport.jsx with KPI cards
- T11: Create WorkoutReport.jsx with tables and charts
- T12: Create NutritionReport.jsx with tables and charts
- T13: Create ProgressReport.jsx with strength progression

### Group 4: Export Pipeline
- T14: Implement CSV export for all report types
- T15: Implement PDF export with jsPDF
- T16: Create ExportButtons.jsx with loading/success/error states

### Group 5: Integration & Polish
- T17: Wire up App.jsx route and nav entry
- T18: Add empty states, loading skeletons, error/retry states
- T19: Accessibility pass (keyboard nav, aria-labels, aria-live)
- T20: Responsive design verification at 3 breakpoints
- T21: Performance verification and timing tests
- T22: End-to-end verification against live server

## Risks & Unknowns

| Risk | Mitigation | Status |
|------|------------|--------|
| PDF library bundle size | jsPDF is ~200KB gzipped; acceptable for one-time export | ACCEPTED |
| Canvas chart rendering for PDF | Use existing hand-rolled SVG → canvas → PDF pipeline | ACCEPTED |
| Large date range performance | Server-side aggregation with daily bucketing; client-side capping | MITIGATED |
| CSV special character handling | Proper quoting/escaping in pure function; UTF-8 BOM | MITIGATED |
| PDF chart quality | Vector drawings via jsPDF drawing API for simple charts; canvas for complex SVGs | ACCEPTED |
| MongoDB aggregation performance | Use existing `{ owner, date }` indexes; no new indexes needed | ACCEPTED |

## Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode` after plan creation to update AGENTS.md with new technology (jsPDF, reports API, reports components).
