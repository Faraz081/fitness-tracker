# Research: Reports & Export (8.1)

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Unknowns Resolved

### 1. PDF Library Selection

**Decision**: `jspdf` (v3.x) — client-side PDF generation
**Rationale**: 
- Lightweight (~200KB gzipped), well-maintained, MIT license
- Client-side generation matches constitution R5 (client-side export from pre-aggregated data)
- Supports tables via `jspdf-autotable` plugin
- Supports canvas-to-image for chart embedding
- No server-side rendering needed

**Alternatives Considered**:
- `pdfmake`: Heavier, more complex API, less suitable for programmatic chart embedding
- `pdf-lib`: Lower-level, more manual work required
- `html2canvas` + `jspdf`: Adds unnecessary complexity; we can embed charts directly via canvas

**Implementation Notes**:
- Import `jsPDF` from `jspdf`
- Import `autoTable` from `jspdf-autotable` for structured tables
- Use `doc.autoTable()` for report tables
- Use `doc.text()` for headings and KPI values
- Use `doc.addImage()` for chart images (canvas-to-DataURL)

### 2. Chart Rendering for PDF

**Decision**: Canvas-based rendering of hand-rolled SVG charts → `canvas.toDataURL()` → embed in PDF
**Rationale**:
- Constitution A7 forbids external charting libraries
- Existing hand-rolled SVG charts can be rendered to canvas via DOM manipulation
- Canvas produces high-quality raster images suitable for PDF embedding
- No new dependency needed (canvas API is built into browsers)

**Implementation Notes**:
- Create offscreen `<canvas>` element
- Draw SVG content to canvas using `drawImage()` with SVG blob URLs
- Convert canvas to PNG data URL via `canvas.toDataURL('image/png')`
- Embed in PDF via `doc.addImage(dataUrl, 'PNG', x, y, width, height)`
- For simple charts (bars, lines), use jsPDF drawing API directly for vector quality

### 3. Date Range Persistence

**Decision**: URL query params via `useSearchParams` (React Router 7)
**Rationale**:
- Constitution Day 5.1 S5 convention: filter state reflected in URL params
- Survives page refresh
- Shareable via URL
- No localStorage needed

**Implementation Notes**:
- Default range: Last 30 days (computed from current date)
- URL format: `?from=2026-08-11&to=2026-09-10`
- `useSearchParams` reads/writes params
- On mount, initialize state from URL params
- On range change, update URL params

### 4. Consistency Score Formula

**Decision**: `(days with ≥1 workout OR ≥1 nutrition entry) ÷ range days × 100`, rounded to whole percent
**Rationale**:
- Simple, understandable metric
- Reflects actual activity across both workout and nutrition tracking
- Whole percent avoids false precision
- "No data" when no activity exists (never 0%)

**Implementation Notes**:
- Server computes from real data
- Client receives pre-computed score
- Hide as "No data in this range" when active days = 0
- Display as "43%" when 30 of 70 days have activity

### 5. PR Definition

**Decision**: A PR is a range-best weight that exceeds the same exercise's best weight across the user's full previous logged history
**Rationale**:
- Most meaningful PR definition: personal best across entire history, not just the range
- Encourages progressive overload
- Pure function over real data (no fabrication)

**Implementation Notes**:
- For each exercise in range, find best weight
- Compare against best weight for same exercise in all workouts before range start
- If range best > historical best, it's a PR
- PR count = number of exercises meeting this rule

### 6. Backend Aggregation Pattern

**Decision**: Single endpoint `GET /api/reports/:type` with `from` and `to` query params
**Rationale**:
- Consistent with existing route patterns (e.g., `GET /api/nutrition/summary/daily`)
- Server computes all metrics server-side
- Returns pre-aggregated summary
- Client renders without re-aggregating

**Implementation Notes**:
- `:type` = `overview` | `workout` | `nutrition` | `progress`
- Server validates `from`/`to` (inclusive, `YYYY-MM-DD`)
- Invalid/inverted ranges return `400 VALIDATION_ERROR`
- All queries filtered by `{ owner: req.userId }`
- MongoDB aggregation pipeline: `$match` (owner + date range) → `$group` (aggregation) → `$project` (reshape)

### 7. CSV Generation

**Decision**: Client-side pure function from pre-aggregated data
**Rationale**:
- Constitution R5: CSV built from same pre-aggregated data as page
- No server-side file generation needed
- Pure function in `reportUtils.js`
- UTF-8 BOM for spreadsheet compatibility

**Implementation Notes**:
- UTF-8 BOM: `\uFEFF` prefix
- Header row with report title and date range
- Data rows with proper quoting/escaping
- Filename: `<report-type>-<from>_<to>.csv`
- Empty range: valid file with headers + "No records" line

### 8. Performance Verification

**Decision**: Manual timing during implementation; record results in quickstart.md
**Rationale**:
- Constitution R8 requires performance verification
- Manual timing is sufficient for MVP
- Automated performance tests are out of scope

**Implementation Notes**:
- Time 30-day report load (server + client)
- Time CSV export generation
- Time PDF export generation
- Record All-Time range behavior
- Document results in quickstart.md

## Technology Choices

| Choice | Selected | Alternatives | Rationale |
|--------|----------|--------------|-----------|
| PDF Library | jsPDF | pdfmake, pdf-lib | Lightweight, client-side, table support via autoTable |
| Chart for PDF | Canvas rendering | html2canvas, SVG export | Built-in browser API, no new dependency |
| Date Range Persistence | URL params (useSearchParams) | localStorage, Context | Constitution S5 convention, shareable, refresh-safe |
| CSV Generation | Client-side pure function | Server-side generation | Constitution R5: same pre-aggregated data |

## Integration Points

1. **Existing Workout Model**: Reports aggregate from `workouts` collection with `{ owner, date }` queries
2. **Existing Nutrition Model**: Reports aggregate from `nutrition` collection with `{ owner, date }` queries
3. **Existing User Profile**: Reports read `weightKg`, `goal`, `preferences.units` from user document
4. **Existing DashboardLayout**: Reports page renders inside existing shell
5. **Existing ui/ primitives**: Reports reuse Card, Button, Badge, EmptyState, Spinner, Skeleton
6. **Existing auth middleware**: All report endpoints protected by `authenticate`
