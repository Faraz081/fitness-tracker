---
id: phr-const-011-001
title: Reports & Export Constitution
stage: constitution
date: 2026-09-10
surface: cli
model: opencode/big-pickle
feature: 011-reports-export
branch: 011-reports-export
user: user
command: /sp.constitution
labels: [constitution, reports-export, day-8.1, amendment]
links:
  spec: specs/011-reports-export/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/011-reports-export/constitution.md
  - specs/011-reports-export/mission.md
  - specs/011-reports-export/roadmap.md
  - .specify/memory/constitution.md
tests: []
---

## Prompt

Create a project constitution for the "Reports & Export" module (8.1) of a fitness-tracking application.

Mission:
Enable users to view and export structured reports about their fitness activity, workouts, nutrition, and progress over selectable date ranges, in both CSV and PDF formats.

Scope:
- Fitness report page (overview dashboard)
- Workout report (per-session and aggregated)
- Nutrition report (macros, calories, meals)
- Progress report (weight, body measurements, performance trends)
- Export functionality: CSV and PDF
- Date-range selection (preset ranges + custom)
- Download/report buttons with clear affordances and states (idle, loading, success, error)

Non-negotiable principles:
1. Data integrity
   - All report data must be derived from validated, time-stamped records.
   - No data mutation occurs in the reporting layer; reports are read-only views.
   - Date ranges are inclusive of start date 00:00 and end date 23:59 in the user's timezone.

2. Consistency & reusability
   - Use a shared report data model and shared date-range component across all report types.
   - Common export pipeline: query → transform → format (CSV/PDF) → stream/download.
   - Reuse UI components for tables, charts, filters, and download buttons.

3. User experience
   - Default to a sensible recent range (e.g., last 30 days) with clear override.
   - Provide preview before export; show row counts and date range in the preview.
   - Export actions must show progress and clear error messages if generation fails.
   - PDFs must be paginated, printable, and include report title, date range, and generation timestamp.

4. Performance & scalability
   - Reports must load within 2 seconds for up to 6 months of data on typical connections.
   - Use server-side pagination and aggregation for large datasets.
   - CSV/PDF generation must stream for large exports instead of buffering entire files in memory.

5. Accessibility & internationalization
   - All interactive elements (date picker, filters, download buttons) must be keyboard-accessible and screen-reader friendly.
   - Numeric formats, date formats, and units must respect user locale settings.
   - Provide text alternatives for charts and visual summaries.

6. Security & privacy
   - Reports are private to the authenticated user; enforce authorization on every report endpoint.
   - Exported files must not include internal IDs or debug information.
   - Log export events (type, date range, format) for audit, but never log raw personal data.

7. Testing & reliability
   - Define contract tests for each report type: given sample data, assert exact CSV/PDF structure and content.
   - Include edge-case tests: empty data, single-day range, very large ranges, missing fields.
   - All export endpoints must have integration tests verifying headers, content-type, and streaming behavior.

8. Evolution & governance
   - New report types must conform to the shared report model and export pipeline.
   - Any change to the report schema requires a migration plan and backward-compatible export behavior for at least one major version.
   - This constitution can be amended via a documented proposal that includes impact analysis on existing reports and exports.

Generate:
- A `constitution.md` capturing these principles in the project's spec directory.
- A short `mission.md` summarizing the purpose and users of the Reports & Export module.
- A high-level `roadmap.md` with phased implementation: 
  Phase 1: data models + fitness report page 
  Phase 2: workout & nutrition reports 
  Phase 3: progress report + charts 
  Phase 4: CSV/PDF export pipeline 
  Phase 5: polish, accessibility, and performance tuning.

## Response snapshot

Created three files in `specs/011-reports-export/`:
1. `constitution.md` — 8 non-negotiable principles (Data Integrity, Consistency & Reusability, User Experience, Performance & Scalability, Accessibility & Internationalization, Security & Privacy, Testing & Reliability, Evolution & Governance) with rationale, scope, and governance sections.
2. `mission.md` — concise purpose statement, primary/secondary users, what the module delivers, and what it does NOT do.
3. `roadmap.md` — 5-phase implementation plan with deliverables, key decisions, gates, dependencies, risk register, and success criteria summary.

Updated main constitution (`.specify/memory/constitution.md`):
- Added R7 (Accessibility & Internationalization), R8 (Testing & Reliability), R9 (Evolution & Governance) as new non-negotiable principles for Day 8.1.
- Updated heading from "Core Principles (R1-R6)" to "Core Principles (R1-R9)".
- Updated version from 3.8.0 to 3.9.0 (MINOR bump for new principles).
- Updated sync impact report to reflect the amendment.
- Updated governance version history to document the addition.

Validated templates:
- `plan-template.md` — Constitution Check gate stays generic; no changes needed.
- `spec-template.md` — user-story grouping + acceptance scenarios align; no changes needed.
- `tasks-template.md` — [P] parallel labelling and [US#] user-story grouping remain valid.
- No `commands/*.md` directory exists; non-blocking, left as-is.
- `AGENTS.md` — will be refreshed via `update-agent-context.ps1` when the Day 8.1 plan lands.

## Outcome

- ✅ Impact: Constitution updated to v3.9.0 with 3 new principles; 3 module-level files created.
- 🧪 Tests: N/A (constitution work; no code tests).
- 🁠 Files: `specs/011-reports-export/constitution.md`, `specs/011-reports-export/mission.md`, `specs/011-reports-export/roadmap.md`, `.specify/memory/constitution.md`.
- 🔁 Next prompts: `/sp.specify` (spec refinement), `/sp.plan` (implementation plan), `/sp.tasks` (task breakdown).
- 🧠 Reflection: The 8 user-provided principles align well with the existing R1-R6 framework; R7-R9 fill gaps in accessibility, testing, and governance that were implicit but not explicitly codified.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): N/A.
- Prompt variant (if applicable): N/A.
- Next experiment (smallest change to try): N/A.
