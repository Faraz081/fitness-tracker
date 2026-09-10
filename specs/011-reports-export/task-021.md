# Task T021: Create PDF Export Utility

**Feature**: 011-reports-export
**Phase**: 4 — Export Pipeline
**Story**: US-007
**Priority**: Medium

## Objective
Install jsPDF and implement client-side PDF generation for all 4 report types. Each function produces a clean, print-ready PDF with header, KPIs, tables, and chart placeholders.

## Scope
- **Modify**: `frontend/package.json` — add `jspdf` and `jspdf-autotable` dependencies
- **Create**: `frontend/src/utils/pdfExport.js`
- **Exports**: `exportOverviewPdf(data, dateRange, userName)`, `exportWorkoutPdf(...)`, `exportNutritionPdf(...)`, `exportProgressPdf(...)`

## Dependencies
None (pure utility functions, but requires npm install)

## Acceptance Criteria
1. `jspdf` and `jspdf-autotable` installed in frontend (`npm ls jspdf` shows installed)
2. All 4 export functions are named exports
3. Each function accepts `(data, dateRange, userName)` and triggers a PDF download
4. PDF header contains: "Fitness Tracker", user name, report title, date range, generation timestamp
5. Body shows KPI/summary values, section headings, and data tables
6. Tables use `jspdf-autotable` for structured rendering
7. Empty sections show "No data" note (not empty space)
8. Empty range: valid one-page "No records" PDF with title and timestamp
9. Filename format: `<report-type>-<from>_<to>.pdf`
10. PDF is print-ready (proper margins, readable fonts)
11. Charts: for MVP, render as text summary (e.g., "Volume: 15,400 kg") — chart image embedding is a future enhancement
12. `npm run build` in frontend passes

## Verification Approach
- Run `npm run build` in frontend — no build errors
- Manual test: export each report type, open in PDF reader, verify header/content
- Empty range test: export with no data, verify valid one-page PDF
- Print test: verify PDF prints cleanly
