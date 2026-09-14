# API Contract: POST /api/nutrition/analyze

**Date**: 2026-09-13
**Feature**: 017-ai-nutrition (Day 12 — AI-Powered Nutrition Logging)

## Endpoint

```
POST /api/nutrition/analyze
```

Auth-scoped stateless proxy: accepts a natural-language food description (+
optional quantity/unit), calls Gemini (server-side key only), zod-validates the
model's JSON, and returns a structured estimate. **Writes nothing.** P27 / P28.

## Authentication

Required. All requests must include a valid JWT via the `access_token` httpOnly cookie.

## Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `query` | string | Yes | trimmed natural-language food description, 1–200 chars (whitespace-only rejected) |
| `quantity` | number | No | 0.01–1000 (scale the estimate to this serving) |
| `unit` | string | No | 1–20 chars (e.g. `g`, `cups`, `bowl`); only valid with `quantity` |

```json
{ "query": "200g grilled chicken with rice" }
```
```json
{ "query": "1 bowl chicken biryani", "quantity": 1, "unit": "bowl" }
```

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "foodName": "Grilled chicken with rice",
    "quantity": 200,
    "unit": "g",
    "calories": 420,
    "protein": 42,
    "carbs": 38,
    "fat": 9
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.foodName` | string | 1–100 chars; estimated food/dish name |
| `data.quantity` | number | Serving quantity (0.01–1000); user-supplied quantity when provided, otherwise a sensible default serving |
| `data.unit` | string | Unit label (1–20 chars) or absent when not applicable |
| `data.calories` | number | 0–2000 kcal, **scaled to `quantity`** |
| `data.protein` | number | 0–500 g, scaled to `quantity` |
| `data.carbs` | number | 0–500 g, scaled to `quantity` |
| `data.fat` | number | 0–500 g, scaled to `quantity` |

No `mealType`, `date`, `owner`, `id`, or `source` are returned — those are
chosen by the user at save time through the existing `POST /api/nutrition`.

### Validation Error (400 BAD REQUEST)

Empty/whitespace query, query > 200 chars, `quantity` out of range, `unit`
without `quantity`/too long, or unknown keys (schema is `.strict()`).

```json
{
  "success": false,
  "error": { "message": "Validation failed", "code": "VALIDATION_ERROR" }
}
```

### Unauthorized (401)

```json
{ "success": false, "error": { "message": "Unauthorized", "code": "UNAUTHORIZED" } }
```

### Food Not Identified (422)

Model signalled the description is not food/drink, or the estimate was
incomplete/malformed. The user is told to rephrase — no values are fabricated.

```json
{
  "success": false,
  "error": {
    "message": "Food could not be identified. Please try another search.",
    "code": "AI_NOT_FOOD"
  }
}
```

### AI Unavailable (502)

Gemini network failure, HTTP 5xx/4xx from Gemini, timeout, or model output that
fails the server-side zod schema (non-JSON, missing/out-of-range fields). The
request can be retried as-is.

```json
{
  "success": false,
  "error": {
    "message": "AI analysis is temporarily unavailable. Please try again.",
    "code": "AI_UNAVAILABLE"
  }
}
```

### AI Not Configured (503)

`GEMINI_API_KEY` is absent/unset on the server. The app still boots; manual
logging works. Request can be retried once configured.

```json
{
  "success": false,
  "error": {
    "message": "AI analysis is not configured. Contact the administrator.",
    "code": "AI_UNCONFIGURED"
  }
}
```

## Implementation Notes

- Route registered **before** `GET/PATCH/DELETE /:id` in `routes/nutrition.js` (no verb conflict — `POST /analyze` cannot collide, registered early for robustness).
- Stateless: no DB reads/writes; `req.userId` used only by `authenticate`, never persisted from this endpoint.
- Server prompt embeds `query` (+ `quantity`/`unit` when present) with explicit instructions: scale to the given serving; else suggest a sensible default; if not food/drink return `{"foodName": null}` → 422; output STRICT JSON per the schema.
- Gemini call: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=<GEMINI_API_KEY>` with `contents[{role:'user', parts:[{text}]}]`, `generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 400 }`, wrapped in `AbortSignal.timeout(10_000)`. Key read from optional config (`process.env.GEMINI_API_KEY`), never logged, never in any response.
- Parse `candidates[0].content.parts[0].text` → `JSON.parse` → zod `nutritionAnalyzeResultSchema`; any failure maps to 422/502 above. Never passes raw model text to the client (P27).
- Empty `"unit": ""` in model output is normalized to `undefined` before zod validation.