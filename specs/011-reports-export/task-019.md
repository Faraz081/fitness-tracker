# Task T019: Add Reports Route and Nav Entry

**Feature**: 011-reports-export
**Phase**: 5 — Integration & Polish
**Priority**: High

## Objective
Register the Reports page in the React Router and add a navigation entry to the Sidebar so users can access the Reports section.

## Scope
- **Modify**: `frontend/src/App.jsx` — add `/reports` route
- **Modify**: Sidebar component (wherever nav entries are defined) — add "Reports" link

## Dependencies
- T018 (Reports page must exist)

## Acceptance Criteria
1. `/reports` route added to `App.jsx` inside a `ProtectedRoute` wrapper
2. Route renders the `Reports` page component
3. "Reports" nav entry added to Sidebar with appropriate icon (e.g., `BarChart3` or `FileText` from lucide-react)
4. Nav entry highlights when on `/reports` route
5. Clicking nav entry navigates to `/reports`
6. Existing routes and nav entries are untouched (regression check)
7. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend
- Navigate to `/reports` via URL — page loads
- Click "Reports" in sidebar — navigates to `/reports`
- Verify existing nav entries still work (Dashboard, Progress, Analytics, etc.)
