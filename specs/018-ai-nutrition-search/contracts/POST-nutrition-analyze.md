# Contract — POST /api/nutrition/analyze

**Feature**: 018-ai-nutrition-search | **Auth**: Required (`authenticate` middleware) | **Writes**: None (stateless proxy)

Live AI food nutrition analysis for a natural-language food name. Proxies the
request to Gemini on the backend with the server-side `GEMINI_API_KEY` and
returns a structured, zod-validated estimate. The estimate is **transient** — it
is never persisted by this endpoint; persistence happens via the existing
`POST /api/nutrition` create endpoint with `source: 'ai'`.

## Request

```
POST /api/nutrition/analyze
Content-Type: application/json
Cookie: access_token=<jwt>
```

### Body (zod: `nutritionAnalyzeSchema`, `.strict()`)

```json
{
  "query": "grilled chicken sandwich with cheese"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `query` | string | yes | trimmed, 1–200 chars; natural-language food name/description only |
| `quantity` | number | no | 0.01–1000 (kept for backward compatibility; the 018 UI sends only `query`) |
| `unit` | string | no | 1–20 chars, requires `quantity` |

Unknown keys → `400 VALIDATION_ERROR`.

## Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "foodName": "Grilled chicken sandwich with cheese",
    "quantity": 200,
    "unit": "g",
    "calories": 540,
    "protein": 42,
    "carbs": 45,
    "fat": 22,
    "fiber": 3.5,
    "sugar": 4,
    "sodium": 780
  }
}
```

### Data fields (zod: `nutritionAnalyzeResultSchema`)

| Field | Type | Required | Constraints | Note |
|-------|------|----------|-------------|------|
| `foodName` | string | yes | 1–100 chars | AI-recognized name |
| `quantity` | number | yes | 0.01–1000 | **gram serving basis** e.g. `200` |
| `unit` | string | no | `'g'` for the 018 flow | gram-denominated serving |
| `calories` | number | yes | 0–2000 | per the gram serving |
| `protein` | number | yes | 0–500 | per the gram serving |
| `carbs` | number | yes | 0–500 | per the gram serving |
| `fat` | number | yes | 0–500 | per the gram serving |
| `fiber` | number | no | 0–500 | **NEW optional**; render only when present |
| `sugar` | number | no | 0–500 | **NEW optional**; render only when present |
| `sodium` | number | no | 0–500 | **NEW optional**; render only when present |

Client behavior:

- Result card label = "Per {quantity}g serving" (uses `data.quantity`).
- Live recalculation = pure ratio: each macro × (user grams / `data.quantity`).
- Absent optional micronutrients render as "not available" — never zeros.
- Save payload excludes `fiber`/`sugar`/`sodium` (transient display only, P30).

## Error Responses (`{ success: false, error: { message, code } }`)

| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | `VALIDATION_ERROR` | default validation message | malformed body / unknown keys |
| 401 | `UNAUTHORIZED` | — | missing/invalid token |
| 422 | `AI_NOT_FOOD` | "Food could not be identified. Please try another search." | model signals non-food input (`foodName: null`) |
| 502 | `AI_UNAVAILABLE` | "AI analysis is temporarily unavailable. Please try again." | network error, timeout (>10s), Gemini 5xx, non-JSON, or out-of-schema output |
| 503 | `AI_UNCONFIGURED` | "AI analysis is not configured. Contact the administrator." | missing `GEMINI_API_KEY` |

All paths are retry-safe: re-running the same request is a fresh Gemini call.
Never fabricate or pre-fill values on any failure (P26).

## Implementation Notes (Gemini)

- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=<GEMINI_API_KEY>`
- Body: `{ contents: [{ role: "user", parts: [{ text: <prompt> }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 500 } }`
- Timeout: `AbortSignal.timeout(10_000)` (server constant)
- Parse: `candidates[0].content.parts[0].text` → JSON → zod-validate; non-food → `{"foodName": null}`.
- Prompt (018 extension): instruct "serve the estimate **in grams** (`quantity` grams, `unit: 'g'`), pick a sensible default gram serving for the described food; include `fiber`, `sugar`, `sodium` in grams **when known** and omit them when unknown — never invent values."
- The AI key is used only server-side; never in client code, responses, bundles, or logs (P27).