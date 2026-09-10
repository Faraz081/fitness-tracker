---
id: PHR-011-TASKS-001
title: "Task Generation: Reports & Export (8.1)"
stage: tasks
date: 2026-09-10
surface: cli
model: opencode/big-pickle
feature: 011-reports-export
branch: 011-reports-export
user: user
command: /sp.tasks
labels: [tasks, reports-export, day-8-1]
links:
  spec: specs/011-reports-export/spec.md
  plan: specs/011-reports-export/plan.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/011-reports-export/tasks.md
  - specs/011-reports-export/task-001.md
  - specs/011-reports-export/task-002.md
  - specs/011-reports-export/task-003.md
  - specs/011-reports-export/task-004.md
  - specs/011-reports-export/task-005.md
  - specs/011-reports-export/task-006.md
  - specs/011-reports-export/task-007.md
  - specs/011-reports-export/task-008.md
  - specs/011-reports-export/task-009.md
  - specs/011-reports-export/task-010.md
  - specs/011-reports-export/task-011.md
  - specs/011-reports-export/task-012.md
  - specs/011-reports-export/task-013.md
  - specs/011-reports-export/task-014.md
  - specs/011-reports-export/task-015.md
  - specs/011-reports-export/task-016.md
  - specs/011-reports-export/task-017.md
  - specs/011-reports-export/task-018.md
  - specs/011-reports-export/task-019.md
  - specs/011-reports-export/task-020.md
  - specs/011-reports-export/task-021.md
  - specs/011-reports-export/task-022.md
  - specs/011-reports-export/task-023.md
  - specs/011-reports-export/task-024.md
  - specs/011-reports-export/task-025.md
tests: []
---

## Prompt

/sp.tasks

Generate an ordered, atomic task list for implementing the "8.1 — Reports & Export" feature, based on the existing spec.md and plan.md in this feature directory.

Context:
- Feature directory: `specs/008-1-reports-export/`
- Existing artifacts:
  - `constitution.md` (project-wide non-negotiable principles)
  - `spec.md` (functional & non-functional requirements, acceptance criteria)
  - `plan.md` (technical implementation plan, architecture, data models, APIs, frontend design, export pipeline, testing strategy, phased roadmap)
- Stack: typical modern web app (frontend + backend API + database). Use patterns consistent with the existing codebase; do not invent new frameworks or libraries unless clearly justified in `plan.md`.

Objectives:
- Break the implementation plan into small, independent, testable tasks that an AI coding agent can implement one by one.
- Preserve dependency, ordering, and alignment with the spec and constitution (data integrity, performance, accessibility, security, testing).
- Make each task self-contained, with clear verification criteria and minimal cross-task coupling.
- Organize tasks into logical phases that match the roadmap in `plan.md`.

Task list requirements:

1. Task structure
   For each task, define:
   - `task-XX.md` filename (e.g., `task-01.md`, `task-02.md`, …).
   - Title: short, action-oriented (e.g., "Implement date-range selector component").
   - Objective: 1–3 sentences describing what this task achieves and why it matters.
   - Scope:
     - Files/modules likely to be created or modified (paths can be approximate but consistent with `plan.md`).
     - APIs, components, or services involved.
   - Dependencies:
     - List any prior tasks that must be completed first (by task number).
     - Note any external dependencies (e.g., "requires PDF library configured").
   - Acceptance criteria:
     - Concrete, testable conditions that indicate the task is done and correct.
     - Tie back to specific requirements or acceptance criteria in `spec.md` where possible.
   - Verification approach:
     - Suggested tests (unit, integration, E2E) or manual checks.
     - Any example inputs/outputs or scenarios to validate.

2. Phasing & ordering
   - Group tasks into phases that reflect the implementation roadmap in `plan.md`, for example:
     - Phase 1: Foundation (data models, base queries, shared utilities)
     - Phase 2: Fitness report page + date-range component
     - Phase 3: Workout & nutrition reports
     - Phase 4: Progress report + charts
     - Phase 5: CSV export pipeline
     - Phase 6: PDF export pipeline
     - Phase 7: Accessibility, i18n, performance tuning, polish
   - Ensure tasks within each phase are ordered by dependency (e.g., data layer before API, API before UI).
   - Where possible, design tasks so they can be implemented and tested independently, even if the full feature is not complete.

3. Coverage
   Ensure tasks cover at least:
   - Data layer:
     - Creating/extending models for workouts, nutrition, body metrics.
     - Adding indexes/query helpers for date-range filtering and aggregation.
   - Backend:
     - Report endpoints (fitness overview, workout, nutrition, progress).
     - Export endpoints (CSV/PDF) with streaming and error handling.
     - Aggregation logic and date-range handling.
   - Frontend:
     - Date-range selector component (presets + custom).
     - Fitness report page layout and sections.
     - Workout, nutrition, and progress report views (tables, charts).
     - Export buttons with loading/success/error states.
   - Export pipeline:
     - CSV generation (formatting, headers, streaming).
     - PDF generation (layout, pagination, branding, timestamp).
   - Non-functional:
     - Performance optimizations (caching, query tuning).
     - Accessibility checks and fixes.
     - i18n for dates, numbers, units.
     - Security: auth checks, per-user data isolation.
   - Testing:
     - Unit tests for aggregation and export logic.
     - Integration tests for API endpoints.
     - E2E tests for key user flows (viewing reports, exporting CSV/PDF, handling empty data and errors).

4. Alignment with constitution
   - Ensure tasks explicitly enforce:
     - Data integrity (read-only report views, correct date handling).
     - Consistency & reusability (shared components, shared export pipeline).
     - UX requirements (preview, progress indicators, clear errors).
     - Performance targets (2-second load for typical ranges, streaming for large exports).
     - Accessibility & i18n (keyboard nav, screen reader support, locale-aware formatting).
     - Security (auth on all endpoints, no leakage of internal IDs).
     - Testing (contract tests for CSV/PDF structure, edge-case tests).

5. Output format
   - Produce a `tasks.md` file under `specs/008-1-reports-export/` that:
     - Starts with a brief overview of the feature and link to `spec.md` and `plan.md`.
     - Lists phases with short descriptions.
     - For each task, includes:
       - Task number and title.
       - Objective.
       - Scope (files/modules).
       - Dependencies.
       - Acceptance criteria.
       - Verification approach.
   - Also generate individual `task-XX.md` files (one per task) in the same directory, each containing the full details for that task in a consistent template.

6. Risks & unknowns
   - If `plan.md` or `spec.md` leaves important details unspecified (e.g., exact chart library, PDF branding rules, whether background jobs exist), mark these as "NEEDS CLARIFICATION" within the relevant tasks.
   - Suggest small, time-boxed investigation tasks (spikes) where needed to resolve architectural or library choices before heavy implementation.

Deliverables:
- `tasks.md`: ordered, phased task list with summaries.
- `task-01.md` … `task-NN.md`: detailed, atomic task specs ready for `/sp.implement`. 

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to the user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

## Response snapshot

Generated 25 tasks organized in 5 phases:

**Phase 1 — Backend Foundation (T001–T008)**:
- Date-range validation schema
- 4 report services (workout, nutrition, progress, overview)
- Reports controller
- Reports routes
- Router registration

**Phase 2 — Frontend Foundation (T009–T013)**:
- Reports API layer
- ReportTabs, DateRangeSelector, ReportCard, KpiCard components

**Phase 3 — Report Views (T014–T019)**:
- OverviewReport, WorkoutReport, NutritionReport, ProgressReport
- Reports page shell with tab navigation and data fetching
- Route and nav entry registration

**Phase 4 — Export Pipeline (T020–T022)**:
- CSV export utility (4 report types)
- PDF export utility (jsPDF, 4 report types)
- ExportButtons component with loading/success/error states

**Phase 5 — Integration & Polish (T023–T025)**:
- Empty states, loading skeletons, error/retry states
- Accessibility pass (keyboard nav, aria-labels, aria-live)
- Performance verification (2s load, 10s export targets)

**Parallel opportunities identified**: 10 tasks marked [P] (T002–T005, T010–T013, T020–T021)

## Outcome

- ✅ Impact: Complete task breakdown ready for /sp.implement
- 🧪 Tests: N/A (tasks only, tests optional per spec)
- 📁 Files: tasks.md + 25 individual task-XX.md files
- 🔁 Next prompts: /sp.implement (task-by-task implementation)
- 🧠 Reflection: Tasks aligned with 7 user stories (US-001–US-007), 5 phases, constitution principles R1-R9

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell execution policy blocking scripts (manual workaround applied); feature directory path mismatch (user input said `specs/008-1-reports-export/` but actual directory is `specs/011-reports-export/`)
- Graders run and results: N/A (tasks only)
- Prompt variant: N/A
- Next experiment: N/A
