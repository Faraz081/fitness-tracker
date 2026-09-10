# Quickstart: Reports & Export (8.1)

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Prerequisites

- Node.js 24 LTS installed
- MongoDB Atlas connection configured in `.env`
- Backend server running on port 5000
- Frontend dev server running on port 5173

## Setup

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

Verify: Server starts on port 5000 without errors.

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Verify: Vite dev server starts on port 5173 without errors.

### 3. Seed Test Data

Ensure the test user has:
- At least 5 workouts with exercises (strength, cardio categories)
- At least 10 nutrition entries across multiple days
- Profile with `weightKg` and `goal` set

## Verification Steps

### Step 1: Navigate to Reports Page

1. Login as test user
2. Click "Reports" in sidebar navigation
3. Verify `/reports` route loads inside DashboardLayout

**Expected**: Reports page renders with Overview tab active, date range defaults to "Last 30 days"

### Step 2: Verify Overview Tab

1. Check KPI cards render:
   - Total Workouts
   - Total Volume
   - Calories Consumed (with daily average)
   - Weight (or Weight Change)
   - Consistency Score
2. Verify all values are real numbers (not placeholders)
3. Verify Consistency Score shows percentage or "No data"

**Expected**: KPI cards show real aggregated data

### Step 3: Test Date Range Selection

1. Select "Last 7 days" preset
2. Verify all KPI cards update
3. Select "Last 90 days" preset
4. Verify all KPI cards update
5. Enter custom date range (from: 2026-01-01, to: 2026-01-31)
6. Click "Generate"
7. Verify report shows data for that range

**Expected**: Date range changes update all report data

### Step 4: Test Tab Navigation

1. Click "Workout" tab
2. Verify Workout report renders
3. Click "Nutrition" tab
4. Verify Nutrition report renders
5. Click "Progress" tab
6. Verify Progress report renders
7. Click "Overview" tab
8. Verify Overview tab renders

**Expected**: All tabs navigate correctly, date range persists across tabs

### Step 5: Verify URL Persistence

1. Select "Last 90 days" range
2. Refresh the page
3. Verify date range is still "Last 90 days"
4. Verify URL contains `?from=...&to=...`

**Expected**: Date range persists in URL across page refresh

### Step 6: Test Workout Report

1. Click "Workout" tab
2. Verify metrics row shows: Total Workouts, Total Volume, Avg Sessions/Week
3. Verify category breakdown table renders
4. Verify workout list table renders with date, name, category, volume
5. Verify notable lifts section renders
6. Verify "Not tracked" state for duration and muscle groups

**Expected**: Workout report shows real aggregated data

### Step 7: Test Nutrition Report

1. Click "Nutrition" tab
2. Verify metrics row shows: Total Calories, Avg Daily Calories, Days Logged
3. Verify macro totals render (Protein, Carbs, Fat)
4. Verify meal type breakdown table renders
5. Verify daily totals table renders
6. Verify meals list renders

**Expected**: Nutrition report shows real aggregated data

### Step 8: Test Progress Report

1. Click "Progress" tab
2. Verify latest weight and goal display
3. Verify workout consistency shows
4. Verify nutrition consistency shows
5. Verify strength progression table renders
6. Verify "Not tracked" states for weight history, milestones, photos

**Expected**: Progress report shows real data, not tracked items show empty states

### Step 9: Test CSV Export

1. On any report tab, click "Export CSV"
2. Verify file downloads
3. Open file in spreadsheet software (Excel, Google Sheets)
4. Verify headers and data match on-screen report
5. Verify date range is in filename and header

**Expected**: CSV file opens cleanly with correct data

### Step 10: Test PDF Export

1. On any report tab, click "Export PDF"
2. Verify file downloads
3. Open PDF in reader
4. Verify header shows: App name, user name, report title, date range, timestamp
5. Verify KPI values match on-screen report
6. Verify tables render correctly
7. Verify charts render as static images

**Expected**: PDF file is print-ready with correct content

### Step 11: Test Empty State

1. Select a date range with no data (e.g., 2020-01-01 to 2020-01-07)
2. Verify empty state message renders
3. Verify message is specific to the report type
4. Verify "No workouts in this date range" (or similar) displays

**Expected**: Empty states render with helpful messages

### Step 12: Test Invalid Range

1. Enter from date after to date (e.g., from: 2026-09-10, to: 2026-08-11)
2. Click "Generate"
3. Verify validation message appears
4. Verify no broken report renders

**Expected**: Invalid ranges show friendly validation message

### Step 13: Test Responsive Design

1. Resize browser to mobile width (< 640px)
2. Verify report tabs stack or scroll horizontally
3. Verify KPI cards stack vertically
4. Verify tables scroll horizontally if needed
5. Verify no horizontal page scroll

**Expected**: Reports render correctly on mobile

### Step 14: Test Keyboard Navigation

1. Tab through all interactive elements
2. Verify focus rings are visible
3. Press Enter on buttons
4. Verify all controls are operable by keyboard

**Expected**: Full keyboard accessibility

### Step 15: Test Loading States

1. Observe report page during data fetch
2. Verify skeleton loaders appear
3. Verify no blank/empty states during load

**Expected**: Loading states render during data fetch

### Step 16: Test Error States

1. Stop backend server
2. Navigate to reports page
3. Verify error message renders
4. Verify "Retry" button appears
5. Restart backend, click "Retry"
6. Verify report loads successfully

**Expected**: Error states render with retry action

## Performance Verification

### 30-Day Report Load Time

1. Open browser DevTools Network tab
2. Select "Last 30 days" range
3. Time from clicking "Generate" to full render
4. Record time

**Target**: < 2 seconds

### Export Time

1. Click "Export CSV" with 30-day range
2. Time from click to download complete
3. Record time

**Target**: < 10 seconds

### All-Time Range

1. Select "All Time" range
2. Verify report loads without timeout
3. Verify data degrades gracefully (bucketed/capped series)

**Target**: No timeout, graceful degradation

## Regression Check

### Prior-Day Features

1. Dashboard at `/` renders unchanged
2. Progress at `/progress` renders unchanged
3. Analytics at `/analytics` renders unchanged
4. Goals at `/goals` renders unchanged
5. Notifications at `/notifications` renders unchanged
6. Settings at `/settings` renders unchanged
7. Workout History at `/workouts-history` renders unchanged

**Expected**: No regressions in prior-day features

## Ownership Isolation Check

1. Login as User A
2. Note workout/nutrition data
3. Login as User B
4. Navigate to reports
5. Verify User B's data appears (not User A's)
6. Verify no cross-user data leakage

**Expected**: Reports show only current user's data

## Code Quality Checks

### Backend

```bash
cd backend
node --check src/routes/reports.js
node --check src/controllers/reports.js
node --check src/services/reports.js
```

**Expected**: No syntax errors

### Frontend

```bash
cd frontend
npm run build
```

**Expected**: Build succeeds with no errors

## Environment Variables

Verify no new env vars added:

```bash
# Check .env.example unchanged
git diff .env.example
```

**Expected**: No changes to `.env.example`

## Dependencies

Verify only one new dependency added:

```bash
cd frontend
npm ls jspdf
```

**Expected**: `jspdf` listed, no other new dependencies

## Documentation

All artifacts present:

```bash
ls specs/011-reports-export/
```

**Expected**: plan.md, research.md, data-model.md, quickstart.md, contracts/, spec.md, user-stories.md, constitution.md, mission.md, roadmap.md

## Implementation Gate Results (recorded 2026-09-10)

| Gate | Command | Result |
| --- | --- | --- |
| Backend syntax | `node --check` on `app.js`, `controllers/reports.js`, `routes/reports.js`, all 4 report services | PASS |
| Frontend build | `npm run build` (frontend/) | PASS — 2557 modules, no errors |
| Import smoke | Server boot (`node src/index.js`, port 5999) | PASS — process stayed running |
| Dependency audit | `npm ls jspdf` in frontend/ | PASS — jspdf + jspdf-autotable only |

Live-data measurements (30-day load <2s, CSV/PDF export <10s, All-Time degradation) require running app + seeded data + browser DevTools; record per Performance Verification steps above during manual QA.
