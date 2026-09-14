# Data Model: AI-Powered Nutrition Page (017-ai-nutrition)

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13
**Scope**: One **additive, non-breaking** change to the existing `Nutrition` Mongoose model (an optional `source` provenance marker), plus the transient **AI analysis result** entity. No new Mongoose models; no schema rewrites; no changes to summary math or any existing consumer.

## Overview

Day 12 reuses the existing owner-scoped `Nutrition` collection as the single source of truth (P30). The only persistence-level addition is an **optional `source` field** (`'ai' | 'manual'`) for provenance/traceability of AI-saved entries (constitution Day 12: "MAY be added by the plan for provenance/traceability only — MUST NOT change validation, summary math, or any existing behaviour"). All totals, filters, meal sections, and Dashboard nutrition aggregates continue to aggregate over all entries regardless of `source`.

## Entities

### 1. Nutrition entry (existing model — additive change only)

Schema: `backend/src/models/Nutrition.js` (index `{ owner, date, mealType }`; `timestamps: true`).

| Field | Type | Required | Constraints | Change |
|-------|------|----------|-------------|--------|
| `_id` | ObjectId | auto | | unchanged |
| `owner` | ObjectId → `User` | yes | indexed; owner-scoping for every query | unchanged |
| `foodName` | String | yes | 1–100 chars, trimmed | unchanged |
| `quantity` | Number | no | 0.01–1000; default 1 | unchanged |
| `unit` | String | no | 1–20 chars (may be missing/blank) | unchanged |
| `calories` | Number | yes | 0–2000 | unchanged |
| `protein` | Number | no | 0–500; default 0 | unchanged |
| `carbs` | Number | no | 0–500; default 0 | unchanged |
| `fat` | Number | no | 0–500; default 0 | unchanged |
| `mealType` | String | yes | enum `breakfast\|lunch\|dinner\|snack` | unchanged |
| `date` | Date | yes | calendar day; range queries via `toDayRange` | unchanged |
| `createdAt` / `updatedAt` | Date | auto | `timestamps: true` | unchanged |
| **`source`** | **String** | **no** | **enum `['ai','manual']`; default `'manual'`; NOT indexed** | **ADDED (optional, additive)** |

Rules that keep the addition non-breaking:

- **`source` is never required** by the model, the create zod schema is extended with an **optional** `source: z.enum(['ai','manual'])`, and existing clients that omit it store `'manual'` by default — every pre-existing record and request path is unaffected.
- The **PATCH/update schema does NOT accept `source`** — provenance is write-once at creation; edits to value/nutrition/meal/date never flip it.
- `nutritionService.createNutritionEntry` maps `source: input.source === 'ai' ? 'ai' : 'manual'` and `toNutrition` serializes it (`source: n.source ?? 'manual'`) — additive to the response envelope; no other service/aggregation reads it.
- All existing consumers (`dashboardService`, `reports/*`, `notificationService`, `authService` cascade) aggregate **all** entries per owner/date/mealType and are **unchanged** — `source` never participates in math. P30 holds by construction.

### 2. AI analysis result (transient — NOT persisted)

Produced by `POST /api/nutrition/analyze`; lives only in the frontend preview until the user confirms a save (P25).

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `foodName` | String | yes | 1–100 chars |
| `quantity` | Number | yes | 0.01–1000 (default serving when no quantity supplied) |
| `unit` | String | no | 1–20 chars; blank/`""` normalized to `undefined` |
| `calories` | Number | yes | 0–2000 |
| `protein` | Number | yes | 0–500 |
| `carbs` | Number | yes | 0–500 |
| `fat` | Number | yes | 0–500 |

No `mealType`, `date`, `owner`, `id`, or `source` — those are chosen/applied by the user at save time. On save the result is submitted as a normal `POST /api/nutrition` payload plus `source: 'ai'`; the transient result is then discarded.

### 3. User (reused, immutable)

The authenticated `User` owns zero or more Nutrition entries; the analysis endpoint is `authenticate`-gated but writes nothing. No `User` schema change.

## Relationships and Isolation

- **User 1—N Nutrition entries** via `owner` (existing index `{ owner, date, mealType }`).
- Every query — list, get, update, delete, summary, and any dashboard/report aggregate — filters `{ owner: req.userId }`. Cross-user access returns `404 NOT_FOUND` (never `403`, never foreign data) — P28/VII.
- The analyze endpoint touches **no persistence**: it reads request auth only to gate the call, then returns parsed, zod-validated JSON. No relationship to store.

## State Transitions

| Transition | Trigger | Effect |
|------------|---------|--------|
| (none) → AI preview | user submits description + "Analyze with AI" | transient result rendered in editable `MealForm` via `initialEntry` (source pending `'ai'`) |
| AI preview → saved entry | user confirms Save | existing `POST /api/nutrition` with `source: 'ai'`; entry appears in meal section; totals + Dashboard refresh via existing `refreshDashboard()` + `load()` |
| AI preview → discarded | user cancels / closes modal | nothing persisted; preview state cleared |
| saved entry → edited | user edits + Save | `PATCH /api/nutrition/:id`; `source` unchanged; totals + Dashboard refresh |
| saved entry → deleted | user confirms Delete | `DELETE /api/nutrition/:id`; totals + Dashboard refresh |

## Validation Rules

- Request to analyze: `nutritionAnalyzeSchema` — `query` string trimmed 1–200; optional `quantity` 0.01–1000; optional `unit` 1–20; `.strict()` (rejects unknown keys).
- Model output: `nutritionAnalyzeResultSchema` — mirrors create-caps above; missing/malformed/out-of-range → rejected server-side (never passed to the client for parsing — P27) with `502 AI_UNAVAILABLE` or `422 AI_NOT_FOOD` per research.md.
- Create (unchanged): `nutritionEntrySchema` + optional `source`.

## What Does NOT Change

- No new Mongoose model or collection.
- No change to the `{ owner, date, mealType }` index, timestamps, or validation caps.
- No change to `getNutritionSummary`, `dashboardService` Nutrition aggregates, or any `reports/*` consumer.
- No change to existing responses beyond the additive `source` key on entry/created/updated payloads (and `getNutritionEntry` on the entry object).