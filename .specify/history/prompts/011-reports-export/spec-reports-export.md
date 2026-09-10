---
id: PHR-011-SPEC-001
title: "Spec Generation: Reports & Export (8.1)"
stage: spec
date: 2026-09-10
surface: cli
model: opencode/big-pickle
feature: 011-reports-export
branch: 011-reports-export
user: user
command: /sp.specify
labels: [spec, reports-export, day-8-1]
links:
  spec: specs/011-reports-export/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/011-reports-export/spec.md
  - specs/011-reports-export/user-stories.md
  - specs/011-reports-export/checklists/requirements.md
tests: []
---

## Prompt

/sp.specify

## 8.1 — Reports & Export

### Context
We are building the Reports & Export module as defined in the constitution.
Create a precise, implementation-ready specification for:

- Fitness Report page (overview)
- Workout Report
- Nutrition Report
- Progress Report
- Date-range selection
- Export CSV
- Export PDF
- Download / Generate Report buttons

### Specification Requirements

Produce a complete specification that includes:

1. **User Stories** — clear user stories for each major capability (viewing each report type, changing date range, exporting CSV, exporting PDF).
2. **Detailed Functional Specification** — screen-by-screen / component-level behavior for: Fitness Report (overview dashboard), Workout Report, Nutrition Report, Progress Report; exact metrics, tables, and charts that must appear on each report; date-range selector behavior (presets + custom range), default value, and how it affects data; Export CSV exact columns/data per report type; Export PDF required structure, content, and layout guidelines (title, date range, summary cards, tables, charts as images, branding, timestamp).
3. **UI/UX Specification** — layout structure for the reports section (navigation between reports, placement of date range + export buttons); loading, empty, and error states for every report and both export actions; responsive behavior (desktop vs mobile); accessibility requirements.
4. **Data & Calculation Rules** — how each key metric is calculated (total volume, consistency score, calorie adherence, weight change, strength progress); data sources and aggregation rules; timezone handling for date ranges.
5. **API / Backend Expectations** (high-level) — endpoints or data contracts needed to support the reports and exports; performance expectations for data fetching and file generation.
6. **Acceptance Criteria** — testable acceptance criteria for every major feature (including edge cases such as no data, very large date ranges, failed exports, etc.).
7. **Edge Cases & Error Handling** — no data in selected range, partial data, export failures / timeouts, very large date ranges, missing goals or incomplete user profile data.

### Output Format
Structure the specification clearly with headings and sub-headings so it can be directly used by developers and designers. Be precise and unambiguous. Prefer concrete definitions over vague statements.

## Response snapshot

Generated comprehensive feature specification with:
- 7 user stories (P1-P3) with acceptance scenarios
- 39 functional requirements (FR-001 to FR-039)
- 14 success criteria (SC-001 to SC-014)
- Detailed metric definitions, data sources, and calculation rules
- Export content specifications (CSV columns, PDF structure)
- Edge cases and error handling
- Quality checklist passed on first validation

## Outcome

- ✅ Impact: Complete spec ready for planning phase
- 🧪 Tests: N/A (spec only)
- 📁 Files: specs/011-reports-export/spec.md, specs/011-reports-export/user-stories.md, specs/011-reports-export/checklists/requirements.md
- 🔁 Next prompts: /sp.clarify or /sp.plan
- 🧠 Reflection: Spec aligned with Day 8.1 constitution (R1-R9), resolved all ambiguities via informed defaults

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results: requirements.md checklist - PASS
- Prompt variant: N/A
- Next experiment: N/A
