# Quickstart: Final Testing & Requirements Check

**Feature**: 014-final-qa | **Date**: 2026-09-10

## Prerequisites

- Node.js 24 LTS (v24.18.0)
- MongoDB Atlas connection configured in `backend/.env`
- Both workspaces have dependencies installed (`npm install` in both `backend/` and `frontend/`)

## 1. Start the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Verify: Server starts on configured port (typically 5000 or as set in .env)

# Terminal 2: Frontend
cd frontend
npm run dev
# Verify: Vite dev server starts (typically http://localhost:5173)
```

## 2. Verify Build

```bash
cd frontend
npm run build
# Must succeed with zero errors before testing begins
```

## 3. Create Test Accounts

Open the frontend in Chrome. Create three accounts:

| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Primary | test-primary@example.com | (any valid) | Main testing — populated data |
| Secondary | test-secondary@example.com | (any valid) | Cross-user isolation testing |
| Fresh | test-fresh@example.com | (any valid) | Empty state testing |

## 4. Populate Primary Account

Log in as the primary account and create representative data:

**Workouts** (5+ across categories):
- "Push Day" — strength — today
- "Morning Run" — cardio — yesterday
- "Yoga Flow" — flexibility — 3 days ago
- "Full Body" — strength — 5 days ago
- "HIIT Session" — cardio — 1 week ago

**Nutrition entries** (across meal types, multiple days):
- Today: breakfast (oatmeal), lunch (chicken salad), dinner (salmon)
- Yesterday: breakfast (eggs), lunch (sandwich), snack (protein bar)

**Profile**: Set name, age, height, weight, goal, fitness level

**Goals**: Create 1-2 goals (e.g. "Run 5K", "Bench Press 80kg")

**Notifications**: Trigger at least one notification (complete a workout, etc.)

## 5. Open Browser DevTools

1. Open Chrome DevTools (F12)
2. Go to the **Console** tab
3. Keep it open throughout testing — any errors/warnings are logged as findings

## 6. Begin Testing

Follow the recommended order from the plan:

1. Authentication → 2. CRUD (Profile, Workouts, Nutrition, Goals) → 3. Dashboard → 4. Charts & Analytics → 5. Search & Filtering → 6. Notifications → 7. Settings → 8. Reports & Export → 9. Responsive Design → 10. Requirements Traceability → 11. Bug Fixing → 12. Final Sign-off

Record every test result immediately in `specs/014-final-qa/test-report.md`.

## 7. Responsive Testing Setup

For cross-device testing, resize the Chrome window (or use DevTools device toolbar):

| Breakpoint | Width | How to Test |
|-----------|-------|-------------|
| Mobile | 375px | Chrome DevTools → Toggle device toolbar → iPhone SE or custom 375px |
| Tablet | 768px | Chrome DevTools → Toggle device toolbar → iPad or custom 768px |
| Desktop | 1280px+ | Full browser window (maximize or resize to 1280px+) |

## Key Files

| File | Purpose |
|------|---------|
| `specs/014-final-qa/spec.md` | What to test (43 functional requirements, 11 user stories) |
| `specs/014-final-qa/plan.md` | How to test (execution workflow, severity levels, methodology) |
| `specs/014-final-qa/test-report.md` | Where to record results (created during testing) |
| `.specify/memory/constitution.md` | Governing principles (Day 9, T1-T6) |
