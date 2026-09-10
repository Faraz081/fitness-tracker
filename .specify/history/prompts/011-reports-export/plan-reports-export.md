---
id: PHR-011-PLAN-001
title: "Plan Generation: Reports & Export (8.1)"
stage: plan
date: 2026-09-10
surface: cli
model: opencode/big-pickle
feature: 011-reports-export
branch: 011-reports-export
user: user
command: /sp.plan
labels: [plan, reports-export, day-8-1]
links:
  spec: specs/011-reports-export/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/011-reports-export/plan.md
  - specs/011-reports-export/research.md
  - specs/011-reports-export/data-model.md
  - specs/011-reports-export/quickstart.md
  - specs/011-reports-export/contracts/GET-reports-overview.md
  - specs/011-reports-export/contracts/GET-reports-workout.md
  - specs/011-reports-export/contracts/GET-reports-nutrition.md
  - specs/011-reports-export/contracts/GET-reports-progress.md
  - AGENTS.md
tests: []
---

## Prompt

/sp.plan

Create a technical implementation plan for the "8.1 — Reports & Export" feature, based on the existing spec and project constitution.

Context:
- Feature: "8.1 — Reports & Export" in a fitness-tracking application.
- Existing artifacts:
  - `constitution.md` with non-negotiable principles (data integrity, consistency, UX, performance, accessibility, security, testing, evolution).
  - `spec.md` describing:
    - Fitness report page (overview)
    - Workout report
    - Nutrition report
    - Progress report
    - Date-range selection (presets + custom)
    - Export CSV & PDF
    - Download/report button states and behaviors
- Assume a typical modern web stack (frontend + backend API + database), but do not assume specific frameworks unless already present in the codebase.

Objectives for this plan:
- Translate the spec into a concrete, ordered implementation plan.
- Define architecture choices, data models, API contracts, and UI components.
- Break the work into atomic, independently shippable tasks aligned with the constitution.
- Identify risks, unknowns, and migration considerations if this feature touches existing reporting or export code.

Plan structure to produce:

1. Technical overview
   - High-level architecture for the Reports & Export module:
     - Frontend module(s) / pages / components.
     - Backend services / endpoints / jobs for report generation and export.
     - Data flow from database → aggregation → report views → export files.
   - How this module fits into the existing project structure (folders, layers, boundaries).

2. Data model & schemas
   - Define or extend data models needed for:
     - Workouts
     - Nutrition entries
     - Body metrics / progress measurements
     - Report metadata (e.g., generated_at, filters used) if applicable.
   - Specify:
     - Field names, types, and relationships.
     - Indexes or query patterns to support efficient date-range filtering and aggregation.
   - Note any migrations required if these models already exist.

3. API design
   - Define REST or GraphQL endpoints (or equivalent) for:
     - Fetching fitness overview data.
     - Fetching workout, nutrition, and progress report data with date-range and filter parameters.
     - Triggering CSV and PDF exports (including how large exports are handled: streaming, background jobs, etc.).
   - For each endpoint, specify:
     - Method, path, auth requirements.
     - Request parameters (date range, filters, pagination).
     - Response shape (JSON structure, error formats).
   - Ensure alignment with existing API conventions in the codebase.

4. Frontend design
   - Page structure:
     - Fitness report page layout and sections.
     - Separate report views or tabs for Workout, Nutrition, Progress.
   - Shared components:
     - Date-range selector (presets + custom picker).
     - Report table component.
     - Chart components (for trends and progress).
     - Export buttons (CSV/PDF) with loading/success/error states.
   - State management:
     - How date range and filters are stored and shared across report views.
     - How export status (loading, success, error) is tracked.

5. Export pipeline
   - Describe the end-to-end flow for CSV and PDF generation:
     - Query → transform → format → stream/download.
   - Choices for:
     - Server-side vs client-side generation.
     - Libraries or services for PDF rendering (consistent with constitution constraints).
     - Streaming strategies for large datasets.
   - File naming, headers, content types, and error handling.

6. Performance & scalability
   - Strategies to meet the 2-second load target for typical ranges:
     - Caching (query results, aggregated metrics).
     - Pagination and incremental loading.
     - Database query optimization (indexes, materialized views if needed).
   - Approach for large exports:
     - Streaming responses.
     - Optional background job + notification/download link pattern (if appropriate).

7. Accessibility, i18n, and security
   - Concrete steps to ensure:
     - Keyboard navigation and screen-reader support for all interactive elements.
     - Locale-aware formatting for dates, numbers, and units.
     - Authentication and per-user data isolation on all report/export endpoints.
   - Any audits or checks to perform before release.

8. Testing strategy
   - Unit tests:
     - For aggregation logic, date-range handling, and export formatting.
   - Integration tests:
     - For API endpoints (request/response shapes, error cases).
     - For export endpoints (headers, streaming behavior).
   - End-to-end tests:
     - For key user flows:
       - Selecting date ranges and viewing reports.
       - Exporting CSV and PDF for each report type.
       - Handling empty data and error scenarios.
   - Contract tests for CSV/PDF structure per report type.

9. Phased implementation roadmap
   - Break the work into ordered phases, for example:
     - Phase 1: Data models + base API queries for workouts/nutrition/metrics.
     - Phase 2: Fitness report page + date-range component.
     - Phase 3: Workout and nutrition report views.
     - Phase 4: Progress report with charts.
     - Phase 5: CSV export pipeline.
     - Phase 6: PDF export pipeline.
     - Phase 7: Accessibility, i18n, performance tuning, and polish.
   - For each phase, list:
     - Goals.
     - Key tasks.
     - Dependencies on previous phases.

10. Task breakdown (for /tasks)
    - Propose a set of atomic tasks that can be turned into `task-XX.md` files, such as:
      - "Implement date-range selector component with presets and custom picker."
      - "Create GET /api/reports/fitness endpoint with aggregation logic."
      - "Implement Workout report table with sorting and grouping."
      - "Implement CSV export for Workout report with streaming."
      - "Implement PDF export for Progress report with charts."
      - "Add accessibility audits and fixes for report pages."
    - For each task, outline:
      - Objective.
      - Files/modules likely to change.
      - Verification criteria (how to know it's done and correct).
      - Dependencies on other tasks.

11. Risks & unknowns
    - Identify technical risks (e.g., large dataset performance, PDF rendering complexity).
    - Mark any "NEEDS CLARIFICATION" items (e.g., exact chart library, branding requirements for PDFs, whether background jobs exist).
    - Suggest mitigation strategies or spikes (time-boxed investigations) where appropriate.

Output:
- A `plan.md` under `specs/008-1-reports-export/` containing all sections above, written clearly for both human reviewers and AI implementers.
- Ensure the plan strictly adheres to the project constitution (no new runtime dependencies without justification, strong testing, accessibility, security, and performance requirements).

## Response snapshot

Generated comprehensive implementation plan with:
- Technical context (Language/Version, Dependencies, Storage, Testing, Performance Goals)
- Constitution check (all 15 principles PASS)
- Project structure (additive MERN phase)
- Complexity tracking (1 new dependency: jsPDF; server-side aggregation)
- Phase 0 research (8 unknowns resolved)
- Phase 1 design (data model, API contracts, frontend design, quickstart)
- 22 task breakdown organized in 5 parallel groups
- Risks & unknowns (6 identified, all mitigated/accepted)

## Outcome

- ✅ Impact: Complete plan ready for /sp.tasks command
- 🧪 Tests: N/A (plan only)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/ (4 files), AGENTS.md
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Plan aligned with Day 8.1 constitution (R1-R9), resolved all ambiguities via informed defaults, one new dependency (jsPDF) documented in Complexity Tracking

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell execution policy blocking scripts (manual workaround applied)
- Graders run and results: Constitution check PASS, all gates pass
- Prompt variant: N/A
- Next experiment: N/A
