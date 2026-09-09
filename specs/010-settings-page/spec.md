# Feature Specification: Settings (7.1)

**Feature Branch**: `010-settings-page`
**Created**: 2026-09-09
**Status**: Draft
**Input**: User description: "A centralized Settings page for FitTrack allowing users to manage account, profile preferences, units (kg/lb), theme, notification preferences, password, logout, and account deletion — clearly, securely, and with full design consistency."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile, Units & Theme Preferences (Priority: P1)

As a user, I want to open a single Settings page and update my profile details,
my preferred unit system (kg or lb), and my app theme, so that the whole app
reflects my choices immediately and remembers them next time I sign in.

**Why this priority**: This is the core "settings" value — preferences that
personalize the app. It delivers a complete, independently useful slice
(profile editing + preferences) without needing destructive or sensitive flows.

**Independent Test**: Can be fully tested by opening the Settings page from the
sidebar, editing any profile field, switching units between kg and lb, and
switching theme — then reloading and signing out/in and confirming every choice
persisted and is applied across the app's screens.

**Acceptance Scenarios**:

1. **Given** the user is signed in and on the Dashboard, **When** they click the
   "Settings" sidebar entry, **Then** the Settings page opens inside the same
   layout shell with the "Settings" entry highlighted as active.
2. **Given** the user edits a profile field (e.g., weight or fitness goal),
   **When** they save, **Then** a clear success confirmation appears and the
   updated value shows on the page and in the rest of the app.
3. **Given** the user selects "lb" for weight units, **When** they save, **Then**
   every weight measurement displayed anywhere in the app (dashboard, progress,
   history, analytics) switches to pounds, and stored values are unchanged.
4. **Given** the user switches the theme from dark to light, **When** they
   confirm, **Then** the choice applies and remains applied after a reload.
5. **Given** the session has expired, **When** the user attempts to save a
   preference, **Then** they see a clear, friendly error and a path to sign in
   again — never a blank failure.

---

### User Story 2 - Notification Preferences, Password & Logout (Priority: P2)

As a user, I want to control which notifications I receive, change my password
securely, and sign out cleanly from Settings, so that my account stays private
and I am only notified about what I care about.

**Why this priority**: Confirms and secures the account. It reuses the existing
notification preference system (no new data store), so it builds value on top of
User Story 1 without requiring the destructive flow.

**Independent Test**: Can be fully tested by toggling each of the six
notification types and confirming the notification system respects each toggle,
changing the password (correct and incorrect current password), and logging out
and confirming the session is cleared.

**Acceptance Scenarios**:

1. **Given** the user opens Notification Settings, **When** they toggle any of
   the six notification types on or off, **Then** the choice is saved and the
   notification system stops sending / resumes sending that type, and the choice
   survives a reload.
2. **Given** the user changes their password, **When** they provide the correct
   current password and a valid new password (plus confirmation), **Then** the
   password is updated and the user is signed out and must sign in with the new
   password.
3. **Given** the user enters an incorrect current password, **When** they submit
   the password change, **Then** they receive a clear error and nothing changes.
4. **Given** the user clicks Logout, **When** they confirm, **Then** the session
   is cleared, there is no access to protected content, and they land on the
   sign-in page.

---

### User Story 3 - Danger Zone: Delete Account (Priority: P3)

As a user, I want to be able to permanently delete my account, but only through
an explicit, deliberate confirmation, so that my data is fully removed and I can
never lose it by accident.

**Why this priority**: Highest consequence, lowest frequency. It must exist
(capability requirement) but is deliberately last and gated by strong
confirmation.

**Independent Test**: Can be fully tested by attempting to delete the account and
confirming it is blocked at every step unless the exact confirmation is provided,
then completing the flow and verifying the data is gone and the user is signed
out.

**Acceptance Scenarios**:

1. **Given** the user is in the Danger Zone section and clicks "Delete Account",
   **When** the confirmation flow opens, **Then** they are warned in clear
   language that this action is permanent and cannot be undone.
2. **Given** the confirmation flow is open, **When** the user has not provided
   the exact required confirmation, **Then** the delete action remains disabled
   and no data is removed.
3. **Given** the user provides the exact required confirmation, **When** they
   confirm, **Then** the account and all of its data are permanently removed, the
   session is cleared, and the user is redirected to the sign-in page.
4. **Given** the user deletes their account, **When** any of their data is
   checked afterwards, **Then** none of it remains and no other user's data is
   affected.

---

### Edge Cases

- Email address is displayed but locked for editing (email changes are out of
  scope; shown read-only) — the UI communicates why it cannot be changed.
- Current password is wrong, or new password is too weak, too short, or the same
  as the current one, or the confirmation field does not match — the form shows a
  clear, specific error and does not submit.
- Delete-account confirmation text is mistyped or partial — the button stays
  disabled and a hint shows what is expected.
- A save fails because the session expired or the server is unreachable — the UI
  shows a friendly error, keeps the user's values visible, and never shows a raw
  failure; the state is not silently saved.
- A user has no notification preferences yet (new account) — all six toggles show
  as enabled by default.
- A user has no profile extras (age, height, weight, goal) — fields render empty
  and saving an empty optional field is allowed.
- Switching units or theme occurs while some screens are open — the change must
  apply to every screen immediately, with no stale displays.
- Logout is triggered while another browser tab holds protected content — after
  logout, protected content is not accessible in any tab.
- The user deletes their account from one device while other devices/sessions
  exist — other sessions are invalidated (the session is cleared everywhere).
- Network drops half-way through the delete-account flow — no partial deletion;
  the user is told the flow did not complete and can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Settings page reachable from the left
  sidebar, and the "Settings" sidebar entry MUST be highlighted as active while
  the page is open.
- **FR-002**: The Settings page MUST be organized into clearly labeled sections:
  Profile, Units, Theme, Notifications, Account (password + logout), and a
  visually distinct Danger Zone.
- **FR-003**: Users MUST be able to edit their profile details (name, age,
  height, weight, fitness goal, experience level) and save with clear success
  feedback.
- **FR-004**: The account email MUST be shown read-only; it cannot be changed in
  this feature.
- **FR-005**: Users MUST be able to choose weight units between kg and lb; the
  choice MUST be saved and applied to every weight display across the entire app,
  while stored weight records stay unchanged.
- **FR-006**: Users MUST be able to switch the app theme between the supported
  options (dark, the default, and light); the change MUST apply and persist.
- **FR-007**: Users MUST be able to individually enable/disable each of the six
  notification types (workout completion, goal progress, goal completed, workout
  reminder, meal reminder, goal reminder).
- **FR-008**: Notification preferences MUST be saved and respected by the
  notification system; a disabled type MUST produce no notification on any
  surface, and enabled defaults MUST apply for new users.
- **FR-009**: Users MUST be able to change their password by providing their
  current password, a new password meeting basic strength rules, and a
  confirmation of the new password.
- **FR-010**: A password change MUST fail (with a clear error) when the current
  password is incorrect, the new password is not strong enough, or the new and
  confirmation values differ.
- **FR-011**: On a successful password change the user MUST be signed out and
  required to sign in again with the new password.
- **FR-012**: Users MUST be able to log out from the Settings page; logging out
  MUST clear the session and redirect to the sign-in page.
- **FR-013**: Delete Account MUST live only in the Danger Zone, MUST be visually
  distinct from all other controls, and MUST warn the user in plain language that
  the action is permanent.
- **FR-014**: Delete Account MUST require an explicit two-step confirmation
  (including typing the required confirmation text) before any data is removed;
  it MUST NEVER be a single click.
- **FR-015**: Once confirmed, deleting the account MUST permanently remove the
  user's account and all of their data and clear their session everywhere.
- **FR-016**: Deleting an account MUST NOT affect any other user's data.
- **FR-017**: ALL preference changes (profile, units, theme, notifications)
  MUST be persisted for the signed-in user and load correctly on their next
  session.
- **FR-018**: When a save fails, the system MUST show a clear, friendly error and
  MUST NOT leave the user believing the change succeeded.
- **FR-019**: Every control, form, and confirmation on the Settings page MUST
  match the app's existing design system (same sidebar, dark theme, green
  accents, card/section styling, tight layout) with no deviation.

### Key Entities *(include if feature involves data)*

- **User Account**: The signed-in person's identity and authenticating
  credentials. Deleting it permanently removes the identity and every record
  owned by it.
- **Profile**: The user's editable personal details (name, age, height, weight,
  fitness goal, experience level) plus their read-only email address.
- **User Preferences**: The user's persisted choices — weight unit (kg or lb)
  and theme (dark or light). Applied app-wide without altering stored records.
- **Notification Preferences**: The six per-type on/off choices for the
  notification system. One set exists per user and is the single source of truth.
- **Session**: A signed-in state. Cleared on logout, after a password change, and
  after account deletion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can find the Settings page from the left sidebar and open it
  with the entry correctly highlighted — verified in every navigation path.
- **SC-002**: 100% of profile, units, theme, and notification preference changes
  persist across a page reload and are still present on the next sign-in.
- **SC-003**: A units (kg/lb) change is applied to 100% of weight displays app-
  wide with no stale values left on open screens, and stored records remain
  unchanged.
- **SC-004**: A user can complete a preference change (profile, units, or theme)
  in under 1 minute, with clear success feedback.
- **SC-005**: 100% of password-change attempts with an incorrect current password
  are rejected with a clear error; 100% of attempts with a valid new password
  succeed and require re-authentication.
- **SC-006**: 0% of accounts can be deleted without full, exact two-step
  confirmation; after confirmation, the account and all its data are removed and
  no other user's data is impacted.
- **SC-007**: Logout works on every attempt: the session is cleared, protected
  content is inaccessible, and the user is redirected to the sign-in page.
- **SC-008**: All six notification types are independently toggleable and a
  disabled type produces no notification anywhere in the app.
- **SC-009**: A visual consistency review finds no Settings control, section, or
  screen that deviates from the app's design system (same sidebar, dark theme,
  green accents, card/section styling, tight content layout).