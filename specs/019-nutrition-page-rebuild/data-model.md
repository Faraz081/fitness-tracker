# Data Model: Nutrition Page Rebuild (AI Food Search)

**Feature**: `019-nutrition-page-rebuild` | **Date**: 2026-09-13
**Source of truth**: existing committed `backend/src/models/Nutrition.js` + `backend/src/utils/validators.js` — **no schema changes**. The rebuild persists through the existing owner-scoped API and reuses the already-shipped additive `source` field (constitution Day 13 AF5 / P30).

## Entities

### Food Log Entry (persisted)

One saved food in a user's nutrition log. Represents a single "+" add at a moment in time; the AI-derived macro values are frozen into the entry at save time (assistant-not-authority, P26 carry-forward).

| Field | Type | Required | Constraints / Notes |
|-------|------|----------|---------------------|
| `owner` | ObjectId (User ref) | yes | Set server-side from `req.userId` — never client input (Principle VII). Indexed. |
| `foodName` | string | yes | trimmed, 1–100 chars (from live Analyze response). |
| `quantity` | number | no (API), set by feature | 0.01–1000; from Analyze response (standard serving, typically grams). |
| `unit` | string | no | trimmed, 1–20 chars; typically `"g"`. |
| `calories` | number | yes | 0–2000 kcal. |
| `protein` | number | no* | 0–500 g; sent by this feature. |
| `carbs` | number | no* | 0–500 g; sent by this feature. |
| `fat` | number | no* | 0–500 g; sent by this feature. |
| `mealType` | enum | yes | `breakfast \| lunch \| dinner \| snack` (label "Snacks" maps to value `snack`). |
| `source` | enum | no | `ai \| manual`, default `manual`; this feature always sends `'ai'` (additive provenance marker only — no math/query change, P30). |
| `date` | Date | no | Server default `Date.now()`; feature omits it so entries land on "today". Indexed with `owner` + `mealType`. |

*Marked "no" on the model because they have defaults of 0; the feature always provides all four from the Analyze response.

**Relationships**: A `Food Log Entry` belongs to exactly one `User` (`owner`). The entry is the unit shown in the Meal Section; no other entities are created or related by this feature.

**State transitions**: None within this feature — entries are created by "+" and only ever displayed (no update/delete/manual-edit UI by design, AF3/AF6). Backend `PATCH/DELETE` routes remain available for other consumers/backward compatibility but are not used by the rebuilt page.

**Validation rules (server authoritative, client mirrors display)**: calories ≤ 2000; protein/carbs/fat ≤ 500 g each; quantity ≤ 1000; foodName ≤ 100 chars. A create with any over-cap value is rejected with a 4xx via `nutritionEntrySchema` — the UI must not pre-scale values beyond these caps (it persists Analyze values verbatim).

### Search Result (transient, NOT persisted)

The per-search outcome of `POST /api/nutrition/analyze`. Exists only as page state from submit until the user clicks "+" (persists → becomes a Food Log Entry) or "Clear" (discarded). Also carries optional `fiber`/`sugar`/`sodium` — **frozen in display only, never persisted** (P26/P30).

| Field | Type | Source |
|-------|------|--------|
| `foodName` | string | zod-validated Gemini response |
| `quantity` | number | Gemini standard serving weight (or user-supplied) |
| `unit` | string (opt) | usually `"g"` |
| `calories` | number | per serving, 0–2000 |
| `protein` / `carbs` / `fat` | number | per serving, 0–500 g each |
| `fiber` / `sugar` / `sodium` | number (opt) | display-only; not saved |

## Validation flow summary

1. Frontend: `analyzeNutrition({ query })` → backend zod-validates request (`nutritionAnalyzeSchema`, 1–200 chars).
2. Backend: `aiFoodService.analyzeFood` → Gemini → `nutritionAnalyzeResultSchema.safeParse` → typed estimate or the three error codes.
3. Frontend "+": `createNutritionEntry({ foodName, quantity, unit, calories, protein, carbs, fat, mealType, source: 'ai' })` → `nutritionEntrySchema` validates → persisted with `owner` from session.