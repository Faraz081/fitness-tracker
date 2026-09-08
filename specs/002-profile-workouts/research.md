# Research: User Profile & Workout Management (Day 2)

**Branch**: `002-profile-workouts` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

Phase 0 output of `/sp.plan`. All "NEEDS CLARIFICATION" from the plan's
Technical Context are resolved here. Day 2 adds **no new runtime or dev
dependencies** and **no new environment variables** — every decision either
follows the Day 2 constitution (v2.1.0) or reuses the Day 1 pinned set.

## 0.1 Dependency & Version Decision (No Change)

**Decision**: Keep the exact Day 1 pinned versions (see research.md §0.2 of
`001-setup-auth`). No `npm install` of new packages for profile/workout
features.

**Rationale**: Profile editing and workout CRUD are served by the existing
React 19 + Vite 8 + Router 7, Express 5 + Mongoose 9, Zod 4, and JWT set already
installed and pinned. The constitution Principle II explicitly states Day 2
"requires NO new runtime or dev dependencies" and treats any would-be new
library as a signal for a simpler design.

**Alternatives considered**:
- *Form library (react-hook-form)*: rejected — Day 2 forms are small and the
  constitution forbids needless new deps; plain controlled `useState` suffices.
- *Client state/cache library (React Query, Zustand)*: rejected — pages fetch
  their own data and refetch after each mutation; no global cache needed and no
  library is justified.
- *Dedicated per-exercise REST resource*: rejected — exercises are embedded
  subdocuments edited via the parent workout's full-array payload (constitution
  API contracts). Simpler, atomic, and ownership-coercion friendly.

## 0.2 Data Modeling Decision (Embedded Exercises)

**Decision**: Exercises are **embedded** Mongoose subdocuments inside the
Workout document (not a separate collection).

**Rationale**:
- A workout's exercises are only ever meaningful with their parent workout; they
  have no standalone identity in Day 2 scope.
- Full-array updates make the CRUD contract simple (`PATCH /api/workouts/:id`
  replaces the `exercises` array), keep reads single-document (no joins/populate),
  and make owner-scoping trivially correct (the parent query is `findOne({_id,
  owner})`).
- Atomicity: a workout + its exercises persist/validate/update as one document.

**Alternatives considered**:
- *Referenced exercises in a separate `Exercise` collection*: adds a resource,
  populate calls, per-exercise ownership checks, and per-exercise endpoints —
  all explicitly deferred and higher complexity. Rejected for Day 2.

## 0.3 Category Handling Decision (Fixed Enum + Dropdown)

**Decision**: `category` is a fixed enum, stored lowercase:
`strength`, `cardio`, `flexibility`, `hybrid`, `other`. The UI uses a `<select>`
dropdown; no free text or user-managed tags on Day 2.

**Rationale**: A closed enum gives deterministic filtering/summary later,
guarantees valid categorical data, and is trivially validated with
`zod.z.enum([...])`. The spec assumed this and the constitution suggested the
same set.

**Alternatives considered**: free-text categories, tags, auto-suggest — all
higher scope and deferred (constitution Deferred Scope: "Category
creation/management by the user"). Rejected for Day 2.

## 0.4 Ownership & Authorization Decision (Owner-Scoped 404)

**Decision**: Every workout stores `owner` from `req.userId` on create. All
queries filter by `{ owner: req.userId }`. A read/update/delete for a workout
that is missing OR owned by another user returns **404 NOT_FOUND** (identical
body), never 403 and never another user's data.

**Rationale**: Constitution Principle VII (non-negotiable). 404 avoids
confirming the existence of another user's record (no enumeration). Returning
the resource's own data would be a data-leak; 403 would leak existence.

**Alternatives considered**: 403 Forbidden for cross-user access — rejected
(existence leak); returning partial data — rejected (security violation).

## 0.5 Profile Update Semantics Decision (PATCH, Partial)

**Decision**: `PATCH /api/users/me` accepts a partial body of any subset of the
editable fields; omitted or `null` fields are left unchanged. `email` is NOT
editable on Day 2 (shown read-only; server ignores/rejects it as decided in
plan).

**Rationale**: The spec requires partial updates ("updates MUST accept partial
bodies and only save provided fields"). PATCH is the natural verb. Because all
new fields are optional and Mongoose only merges provided paths, this avoids
overwriting unsubmitted fields.

**Alternatives considered**: PUT (full replacement) — risks wiping profile
fields the client didn't send; rejected.

## 0.6 Numeric Validation Bounds Decision

**Decision**: Enforce these `zod` bounds (sanction ranges from the spec):
`age` int 13–120; `weightKg` 20–400; `heightCm` 60–280; exercise `sets` int 1–50,
`reps` int 1–500, `weightKg` >= 0 (0/omitted = bodyweight), `restTimeSec` int
0–600.

**Rationale**: Bounded ints prevent nonsense data, guarantee integer field
integrity, and mirror client-side checks. Values are advisory-sanctioned and a
plan MAY relax them via Complexity Tracking, but Day 2 keeps them.

## 0.7 Security Recap (from constitution; no new research)

- `authenticate` middleware + httpOnly-cookie JWT reused unchanged (Principle
  III; spec §6).
- Ownership isolation at the data-access layer (Principle VII; see 0.4).
- `zod` validation before any DB access on every profile/workout body.
- Profile endpoints MUST never return `password` (keep `select:false`, project
  out).
- No `dangerouslySetInnerHTML`; React escaping handles rendered user input.
- Error middleware reused: 400 validation, 401 unauthorized, 404 not-found /
  not-owned, 500 internal with detail to server log only.

## 0.8 Unresolved / Out of Scope (registered, not blockers)

- Charts, templates, social features, profile-picture upload, email change,
  per-exercise endpoints, user-managed categories — deferred (spec §8).
- Automated test suite / CI — deferred to a later day.
- `update-agent-context.ps1` / `create-new-feature.ps1` run under a restricted
  PowerShell execution policy; agent context update relies on the plan.md
  already being present and will be attempted; if blocked, AGENTS.md recent
  changes are updated manually.
