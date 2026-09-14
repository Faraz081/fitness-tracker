# Data Model: Nutrition Search (AI-Powered Food Logging) — 018-ai-nutrition-search

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13
**Scope**: **No persistence changes.** The existing `Nutrition` Mongoose model already carries the additive optional `source` provenance marker (landed with the uncommitted 017 work). Fiber / Sugar / Sodium exist only as **transient** fields on the AI analysis result — never persisted (P30). No new Mongoose models or collections; no schema rewrites; no change to summary math or any existing consumer.

## Overview

Day 12 reuses the existing owner-scoped `Nutrition` collection as the single source of truth (P30). The AI path contributes exactly one additive persistence trait — the already-shipped optional `source` field (`'ai' | 'manual'`, default `'manual'`, unindexed) — for provenance/traceability only. It MUST NOT change validation, summary math, or any existing behaviour. Micronutrients returned by Gemini (Fiber/Sugar/Sodium) are transient display values shown on the result card and modal; they are discarded on save (the persisted entry stores only the macro fields the `Nutrition` model defines).

## Entities

### 1. Nutrition entry (existing model — UNCHANGED)

Schema: `backend/src/models/Nutrition.js` (index `{ owner, date, mealType }`; `timestamps: true`).

| Field | Type | Required | Constraints | Change |
|-------|------|----------|-------------|--------|
| `_id` | ObjectId | auto | | unchanged |
| `owner` | ObjectId → `User` | yes | indexed; owner-scoping for every query | unchanged |
| `foodName` | String | yes | 1–100 chars, trimmed | unchanged |
| `quantity` | Number | no | 0.01–1000; default 1 (grams for AI saves) | unchanged |
| `unit` | String | no | 1–20 chars (`'g'` for AI saves) | unchanged |
| `calories` | Number | yes | 0–2000 | unchanged |
| `protein` | Number | no | 0–500; default 0 | unchanged |
| `carbs` | Number | no | 0–500; default 0 | unchanged |
| `fat` | Number | no | 0–500; default 0 | unchanged |
| `mealType` | String | yes | enum `breakfast\|lunch\|dinner\|snack` | unchanged |
| `source` | String | no | enum `['ai','manual']`; default `'manual'`; NOT indexed | unchanged (already present) |
| `date` | Date | yes | calendar day; range queries via `toDayRange` | unchanged |
| `createdAt` / `updatedAt` | Date | auto | `timestamps: true` | unchanged |

Save-time rules for AI entries:

- The frontend submits `{ foodName, quantity, unit: 'g', calories, protein, carbs, fat, mealType, source: 'ai' }` (scaled values) to the existing create endpoint.
- `quantity` = the user-chosen grams; `unit = 'g'` always for AI saves.
- `source: 'ai'` marks provenance. `PATCH`/update schema does NOT accept `source` — provenance is write-once (unchanged).
- No fiber/sugar/sodium column exists or is added.

### 2. AI analysis result (transient — NOT persisted)

Produced by `POST /api/nutrition/analyze`; lives only in the frontend from search until the user confirms a save (P25).

| Field | Type | Required | Constraints | Note |
|-------|------|----------|-------------|------|
| `foodName` | String | yes | 1–100 chars | AI recognized name |
| `quantity` | Number | yes | 0.01–1000 | **gram serving basis** (e.g. `100` = "Per 100g serving") |
| `unit` | String | no | `'g'` for the 018 flow | gram-denominated serving contract |
| `calories` | Number | yes | 0–2000 | per the gram serving |
| `protein` | Number | yes | 0–500 | per the gram serving |
| `carbs` | Number | yes | 0–500 | per the gram serving |
| `fat` | Number | yes | 0–500 | per the gram serving |
| `fiber` | Number | no | 0–500 | OPTIONAL — render only when present |
| `sugar` | Number | no | 0–500 | OPTIONAL |
| `sodium` | Number | no | 0–500 | OPTIONAL |

No `mealType`, `date`, `owner`, `id`, or `source` — those are chosen/applied by the user at save time. Fiber/Sugar/Sodium are display-only; the save payload deliberately excludes them.

### 3. User (reused, immutable)

The authenticated `User` owns zero or more Nutrition entries; the analyze endpoint is `authenticate`-gated but writes nothing. No `User` schema change.

## Relationships and Isolation

- **User 1—N Nutrition entries** via `owner` (existing index `{ owner, date, mealType }`).
- Every query — list, get, update, delete, summary, and any dashboard/report aggregate — filters `{ owner: req.userId }`. Cross-user access returns `404 NOT_FOUND` (never `403`, never foreign data) — P28/VII.
- The analyze endpoint touches **no persistence**: it reads request auth only to gate the call, then returns parsed, zod-validated JSON. No relationship to store.

## State Transitions

| Transition | Trigger | Effect |
|------------|---------|--------|
| (none) → AI result | user submits a natural-language food name in the search bar | transient result rendered in the result card (AI badge, Per Xg serving, macros, Fiber/Sugar/Sodium when provided) |
| AI result → modal preview | user clicks "+" on the result card | Add-to-Log modal opens with scaled-to-editable `quantity` (pre-filled = AI serving grams); meal defaults to Breakfast |
| preview → recalculation | user edits Quantity (g) | `scaleServing` recomputes live: "For [X]g: [Y] kcal \| P \| C \| F" from the real AI per-serving data |
| preview → saved entry | user chooses meal + confirms "+ Add Food" | `POST /api/nutrition` with scaled values + `source: 'ai'`; entry appears under the meal section; totals + Dashboard refresh via existing `load()`/`refreshDashboard()` |
| preview → discarded | user clicks Cancel / closes (Esc/backdrop) | nothing persisted; preview state cleared |
| saved entry → edited | user edits + Save (manual path) | `PATCH /api/nutrition/:id`; `source` unchanged |
| saved entry → deleted | user confirms Delete | `DELETE /api/nutrition/:id`; totals + Dashboard refresh |

## Validation Rules

- Request to analyze: `nutritionAnalyzeSchema` (unchanged) — `query` string trimmed 1–200; optional `quantity` 0.01–1000; optional `unit` 1–20; `.strict()`. The 018 UI sends `{ query }` only.
- Model output: `nutritionAnalyzeResultSchema` (extended) — mirrors create caps; `quantity`/`unit` gram basis; **new optional** `fiber`/`sugar`/`sodium` `0–500`; missing/malformed/out-of-range → rejected server-side (never passed to the client for parsing — P27) with `502 AI_UNAVAILABLE` or `422 AI_NOT_FOOD`.
- Create (unchanged): `nutritionEntrySchema` — scaled values must satisfy calories ≤ 2000, macros ≤ 500, quantity 0.01–1000; the frontend modal pre-validates the same caps to block unsaveable over-scaled quantities honestly.

## What Does NOT Change

- No new Mongoose model or collection.
- No change to the `Nutrition` schema, the `{ owner, date, mealType }` index, timestamps, or validation caps.
- No change to `getNutritionSummary`, `dashboardService` Nutrition aggregates, or any `reports/*` consumer.
- No change to the create/update/delete/list endpoints or their semantics.
- No fiber/sugar/sodium persistence anywhere.