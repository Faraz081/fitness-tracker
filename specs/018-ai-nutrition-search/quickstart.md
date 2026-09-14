# Quickstart — Nutrition Search (AI-Powered Food Logging) — 018-ai-nutrition-search

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13
**Goal**: Verify the AI food search flow end-to-end per the Day 12 Definition of Done (DoD-12), following the existing project conventions (backend `node --check`, clean vite build, no automated suite).

## 1. Prerequisites

```bash
# backend .env (already has the placeholder; add a real key ONLY for live checks)
GEMINI_API_KEY=            # optional at boot; leave blank to test graceful failure
MONGO_URI=...
JWT_SECRET=...
CLIENT_ORIGIN=...
```

- A real Gemini key is OPTIONAL. The full matrix below runs with or without it —
  missing-key rows verify the `503 AI_UNCONFIGURED` path.
- Manual logging, CRUD, filters, and the Dashboard must keep working without a key.

## 2. Build gates

```bash
# From repo root
cd backend  && node --check src/services/aiFoodService.js && node --check src/utils/validators.js && cd ..
npm run build --prefix frontend          # vite build MUST be clean
```

## 3. P27 static audit (no key in client surfaces)

- [ ] `git grep -i "gemini\|AIza" -- frontend/` returns nothing
- [ ] `git grep -in "GEMINI_API_KEY" -- frontend/` returns nothing
- [ ] `git grep "generateContent" -- frontend/` returns nothing
- [ ] `backend/.env` is git-ignored; `backend/.env.example` contains only an empty placeholder
- [ ] No Gemini/auth payload with nutrition data contains an API key

## 4. Manual browser matrix (record results)

Prereqs: start backend + frontend, log in as **User A** (and create **User B** for the isolation check).

| # | Check | Expectation | Pass? |
|---|-------|-------------|-------|
| 1 | Type a food name in the search bar (e.g. "grilled chicken sandwich with cheese") and submit | Live Gemini result card: food name + "AI" badge, "Per {X}g serving", Calories \| Protein \| Carbs \| Fat | |
| 2 | Result card second row | Fiber \| Sugar \| Sodium shown when the AI provided them; muted "not available" when absent (never stale zeros) | |
| 3 | Click "+" on the result card | Add-to-Log modal opens: Close (X), food name + AI badge, breakdown, Quantity (g) pre-filled, Add To dropdown, Cancel / "+ Add Food" | |
| 4 | Change Quantity (g) in the modal | "For [X]g: [Y] kcal \| P \| C \| F" recalculates live and matches the AI ratio (values = AI value × X/serving) | |
| 5 | Choose Add To = Lunch, click "+ Add Food" | Entry appears under **Lunch** immediately, no refresh | |
| 6 | After save | Summary cards + Dashboard reflect the added entry; open Nutrition again after refresh — entry persisted (`source` marker present in API response) | |
| 7 | Repeat save for Breakfast / Dinner / Snack | Each lands under the correct section; sections always render | |
| 8 | Empty meal sections (no foods today, or clear one meal) | Show **"No food logged for [Meal]"** + hint **"Use AI search above to find and add foods."** | |
| 9 | Empty/whitespace search submitted | Submission blocked; inline validation; no AI call | |
| 10 | Search a non-food ("hello") | "Food could not be identified. Please try another search." — no values generated | |
| 11 | Search while `GEMINI_API_KEY` is blank (or forced) | Retryable `503` guidance; manual logging still works | |
| 12 | Stop/expire Gemini (502 path) | Clear retryable error; no fabricated numbers | |
| 13 | Two users (A, B) | A's entries invisible to B and vice-versa; A fetching B's entry id → `404` | |
| 14 | Network tab while searching | No request to generativelanguage.googleapis.com from the client; only `/api/nutrition/analyze` | |
| 15 | Responsive 360 / 768 / 1440 | Search card, result card, modal usable; no horizontal scroll; focus-visible rings visible | |
| 16 | Regression | Existing Nutrition filters, summary cards, manual Add-entry modal, edit/delete, and Dashboard unchanged | |

## 5. Definition of Done summary

- [ ] Food-name-only searches hit Gemini live every time (SC-002)
- [ ] Result card + modal show dynamic AI nutrition data (FR-003/FR-005/FR-006)
- [ ] Quantity recalculations derive strictly from the AI data (SC-004)
- [ ] "+ Add Food" persists to the real DB, owner-scoped (SC-003/SC-008)
- [ ] Entry + totals + Dashboard reflect instantly without refresh (SC-003)
- [ ] Per-meal empty states exact (SC-005)
- [ ] No static/placeholder source remains as source of truth (SC-002)
- [ ] Gemini key in 0 client-facing artifacts (SC-007)

## Record

| Date | Checked by | Key present? | Build pass? | Audit pass? | Matrix pass rate |
|------|------------|--------------|-------------|-------------|------------------|
|      |            |              |             |             |                  |