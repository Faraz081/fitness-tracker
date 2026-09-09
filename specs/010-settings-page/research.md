# Research: Settings (7.1)

**Created**: 2026-09-09 | **Branch**: `010-settings-page`

## Scope

Resolves every technical unknown from the plan's Technical Context before design.
Sources: Day 7.1 constitution section, feature spec, live repo map (backend models/routes/
controllers/services, frontend pages/contexts/constants/api, tokens).

---

## DEC-1 — Preferences storage location

- **Decision**: Store `units` and `theme` as an embedded `preferences` subdocument on the
  existing `User` document, with defaults `{ units: 'kg', theme: 'dark' }`.
- **Rationale**: The User/profile document is the user's single preference store; it avoids
  a new collection, an extra join, and keeps ownership trivial (`user.preferences` can never
  leak to another user). `PATCH /api/users/me` already does a generic `$set` pass-through
  with a strict zod schema, so extending the same document is the least invasive addition
  and matches the "one store" rule (constitution ST8, "e.g. a `preferences` field on the
  User/profile document — plan decides").
- **Alternatives considered**: (a) a dedicated `preferences` collection keyed by `owner` —
  rejected: unnecessary collection, more code, risks second-store drift; (b) localStorage
  — rejected: not per-user/owner-scoped and contradicts the Amendment 2026-09-09 backend
  pattern (no localStorage for Day 7.1).

## DEC-2 — Preferences endpoint shape

- **Decision**: New auth-scoped `GET /api/users/me/preferences` and
  `PATCH /api/users/me/preferences` (body `{ units?, theme? }`, strict zod, ≥1 field),
  added to the existing `profileRouter`/`profileService`/`profileController` (already
  `router.use(authenticate)`), mirroring the notification-settings pattern.
- **Rationale**: Owner-scoped, `authenticate`-gated, mirrors the existing
  route/controller/service layering; the zod `.strict()` + "at least one field" refinement
  matches `profileUpdateSchema`/`notificationSettingsPatchSchema` exactly. The frontend can
  hydrate preferences at session start and update with optimistic revert.
- **Alternatives considered**: (a) write prefs through `PATCH /api/users/me` — rejected:
  would loosen the strict zod contract and blur profile vs. preference semantics; (b)
  embed prefs in the profile GET response only — rejected as the *only* read path because
  `SettingsContext` should load preferences independently of the profile form.

## DEC-3 — Theme representation

- **Decision**: A root `data-theme` attribute on `<html>` (`"dark"` default | `"light"`),
  applied by `SettingsContext` via `document.documentElement.dataset.theme`, with a
  `[data-theme="light"] { ... }` block in `frontend/src/index.css` overriding the existing
  `--color-*` tokens (bg/panel/panel-soft/line/ink/ink-soft/ink-muted/text-*; surface*/
  dark-* as needed). Components change nothing because they already reference tokens.
- **Rationale**: The app's token system is `--color-*` vars consumed through
  `var(--color-*)` and Tailwind v4 utilities. Overriding the variables at the root is the
  smallest change that keeps every existing component theme-consistent (ST3). Exactly two
  themes, no third, no per-control palettes (constitution Theme Rule).
- **Alternatives considered**: (a) a `.light` class on `<body>` — functionally equivalent
  but `data-theme` is what the constitution prescribes; (b) Tailwind `dark:` variant
  strategy — rejected: requires touching every utility site; (c) separate `light.css` import
  with overrides — same effect but split the file for no benefit.
- **Follow-up requirement**: audit `index.css`/components for raw color literals (e.g.
  `#0F0F0F` fallbacks) that would break light contrast and tokenize them before landing
  (constitution: "Any component using a raw color literal MUST be tokenized").

## DEC-4 — Units (kg/lb) conversion strategy

- **Decision**: A single display-edge utility `formatWeight(weightKg, units)` in
  `frontend/src/utils/units.js`: `kg → kg` (1 dp), `kg → lb` (× 2.20462, 1 dp). Applied at
  every weight-rendering site: `ExerciseRow`, `PersonalRecords` (PR_FIELDS), `WeightTracker`,
  `WeightChart`, Dashboard weight card, weight deltas in `analyticsUtils`, Workout form and
  Profile form input labels/conversion. Canonical fields (`weightKg`, `heightCm`) are never
  rewritten. Height stays `cm` (constitution Units Rule covers weights; height conversion not
  required — documented scope limit).
- **Rationale**: One conversion function = one rounding rule (consistent, predictable), and
  confining it to the display edge guarantees canonical values stay untouched (ST8). Mock-
  data pages (Progress/Analytics/Goals/History/Dashboard) are re-rendered through the same
  util so the preference reaches every consuming surface (ST1).
- **Alternatives considered**: (a) backend-side conversion — rejected: pollutes canonical
  API responses and disagrees with ST8; (b) per-component conversion helpers — rejected:
  divergent rounding, duplicated logic; (c) localStorage conversion cache — rejected (no
  localStorage for settings).

## DEC-5 — Password strength & change flow

- **Decision**: `POST /api/auth/change-password` with `{ currentPassword, newPassword }`.
  Zod rejects `newPassword.length < 6` (the exact register rule), and the service:
  `User.findById(userId).select('+password')` → `bcrypt.compare(currentPassword, hash)` →
  reject as `401 INVALID_PASSWORD` on mismatch → reject if `bcrypt.compare(newPassword,
  hash)` is true (same password) as `400 VALIDATION_ERROR` → set `password` and `save()`
  (existing pre-save hook bcrypt-hashes) → controller clears the cookie (same call as
  `logoutHandler`) → client re-authenticates. No hash is ever returned.
- **Rationale**: Matches constitution Password Change Rules verbatim and reuses the existing
  bcrypt compare/hash infrastructure — no new dependency (no zxcvbn/validator packages).
- **Alternatives considered**: (a) zxcvbn-style strength meter — rejected: new dependency
  forbidden (G2); (b) keep the session across a password change — rejected: constitution
  ST4 requires clearing the cookie.

## DEC-6 — Account deletion flow (cascade + no transactions)

- **Decision**: `DELETE /api/auth/account` (auth-scoped, body `{ email }`). Server:
  resolves user; if `user.email !== email` → `403 CONFIRMATION_MISMATCH`. Then, in order,
  `Notification.deleteMany({ owner })`, `NotificationSettings.deleteMany({ owner })`,
  `Workout.deleteMany({ owner })`, `Nutrition.deleteMany({ owner })`, then
  `User.findByIdAndDelete(userId)`; controller clears the cookie. All queries are scoped to
  `owner: req.userId` (Principle VII — literally impossible to touch others' rows).
- **Rationale**: Matches constitution Delete Account Rules (confirmation payload  = email,
  the minimum; plan may add password — kept minimal). Cascade-first ordering guarantees
  owned children are gone before the owner. Sequential `deleteMany` avoids MongoDB
  multi-document transactions because (a) Atlas free/shared tiers do not support them,
  (b) the app has no transaction precedent, (c) a partial failure leaves no deletion of the
  user document itself (idempotent re-run safety: children are filtered by `owner`).
- **Alternatives considered**: (a) Mongo session + `withTransaction` — rejected (tier
  support + no deps + no precedent); (b) adding current password to the confirmation
  payload — rejected for minimality (UI already requires typing the email; ST4 satisfied
  without extra friction, ST6).

## DEC-7 — Notification preferences reuse (single source)

- **Decision**: The Settings → Notifications section renders the existing
  `components/notifications/NotificationSettings.jsx` bound to `NotificationsContext`
  (which already reads/writes `GET/PATCH /api/notifications/settings`). No new controls,
  keys, or storage.
- **Rationale**: Constitution Notification Preference Rules mandate reuse of the Day 6.1
  single source of truth; this also satisfies ST7 (reuse surfaces rather than duplicate).
- **Alternatives considered**: (a) duplicate toggle controls in Settings — rejected: second
  store risk (ST8/G7); (b) new endpoint — rejected: would split the store.

## DEC-8 — Logout reuse

- **Decision**: Settings → Account "Logout" button calls the same
  `useAuth().logout()`/`api.logout()` (`POST /api/auth/logout` → cookie clear) used by the
  sidebar, then `navigate('/login', { replace: true })`.
- **Rationale**: ST6 mandates reuse of the existing auth logout path; exactly one logout
  implementation.
- **Alternatives considered**: a Settings-specific logout endpoint — rejected (duplication).

## Open items handed to design

- Exact token values for the `[data-theme="light"]` palette (no raw-literal breakage) —
  decided during implementation against `index.css`; contrast audited per DoD 11.
- Raw-color audit list for tokenization (components + `index.css` fallbacks) — enumerated
  at implementation start (DEC-3 follow-up).