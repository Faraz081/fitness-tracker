# Feature Specification: Notifications & Reminders (6.1)

**Feature Branch**: `009-notifications-reminders`  
**Created**: 2026-09-09  
**Status**: Draft  
**Input**: User description: "Create a detailed functional specification for the Notifications & Reminders system of the FitTrack application based on the constitution already defined. Overview: a complete notification system that keeps users informed about workout completions, goal progress, and important reminders, while giving them full control over what they receive. Dedicated Notifications page (sidebar), chronological list, title/timestamp/type/read-state per notification, unread visually distinct, mark-as-read per item and mark-all-as-read, empty state, six notification types (workout completion, goal progress, goal completed, workout reminder, meal reminder, goal reminder), persisted read/unread with sidebar unread count, per-type settings (default all enabled, saved and respected), behavior rules (no duplicates, respect settings, right moment, reminders only when relevant), strict UI consistency with the Dashboard (same sidebar, dark theme, green accents, card style, tight layout), and eight acceptance criteria."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and manage notifications in an inbox (Priority: P1)

A user opens the Notifications page from the left sidebar and sees a
chronological, most-recent-first list of everything the app has told them. Each
item shows a short title/message, when it happened, and which area it relates to
(Workout, Goal, Meal, Reminder). Items the user has not seen yet are clearly
distinguished from ones already read. The user can mark any single item as read,
mark everything as read at once, and a badge on the sidebar shows how many
unread items remain. When there is nothing to show, the page explains that
clearly instead of looking broken.

**Why this priority**: Without an inbox to surface and manage notifications,
none of the other notification capabilities have value. This is the container
that makes the entire feature usable and is the smallest slice that delivers
standalone value.

**Independent Test**: Fully testable by opening the Notifications page,
verifying the list renders with title, timestamp, and type on every item,
comparing read vs unread styling, marking items read individually and all at
once, checking the sidebar badge updates, and reloading the page to confirm the
read state and badge are remembered.

**Acceptance Scenarios**:

1. **Given** a user with several notifications, **When** they open the
   Notifications page from the left sidebar, **Then** items appear newest-first
   and every item shows a title, a timestamp, its type, and its read state.
2. **Given** the user has unread notifications, **When** the page loads, **Then**
   unread items are visually distinct from read items and the sidebar badge shows
   the unread count.
3. **Given** an unread notification, **When** the user marks it as read, **Then**
   its read state changes to read and the unread badge count decreases by one.
4. **Given** any notifications in the list, **When** the user chooses "Mark all
   as read", **Then** every item becomes read and the unread badge disappears.
5. **Given** a user with no notifications yet, **When** they open the page,
   **Then** a friendly empty state explains there are no notifications and hints
   at how to start (log a workout, set a goal).
6. **Given** a user who reads notifications, **When** they leave the page and
   return later, **Then** their read/unread state is still reflected exactly as
   they left it.

---

### User Story 2 - Get notified of meaningful events (Priority: P2)

When a user finishes a workout, when an active goal makes progress, and when a
goal is fully achieved, the app tells them immediately with a short,
understandable message. Users who do not want a specific type of event
notification can turn that type off in the Settings panel; the app then never
shows it again, anywhere. Exactly one notification is created for each event —
no duplicates regardless of how the event is observed.

**Why this priority**: Event notifications are the feedback loop that motivates
users to keep logging. This slice adds the three event-based notification types
plus the per-type settings that let users filter them, and is independently
valuable without the reminder features.

**Independent Test**: Fully testable by triggering a workout completion, a goal
progress update, and a goal completion, observing one notification appear for
each; then disabling each type one at a time in Settings and confirming a
disabled type never reappears on the page, in the badge, or in the marker
count.

**Acceptance Scenarios**:

1. **Given** a user finishes logging a workout, **When** the workout is recorded,
   **Then** exactly one "workout completion" notification is created referencing
   that workout.
2. **Given** an active goal whose progress increases, **When** the goal's target
   metric advances, **Then** exactly one "goal progress" notification is created
   naming the goal and its new progress.
3. **Given** a goal that reaches its target, **When** it becomes achieved, **Then**
   exactly one "goal completed" notification is created for it.
4. **Given** either the same event is observed repeatedly, **When** the app
   re-evaluates its notification list, **Then** the event still appears exactly
   once (never duplicated).
5. **Given** a user disables "Workout completion" in Settings, **When** they
   finish a workout afterwards, **Then** no workout-completion notification
   appears on the page, in the badge, or in any counter.
6. **Given** a user disables all three event types, **When** events occur, **Then**
   the notifications list gains no event notifications at all.

---

### User Story 3 - Receive timely, relevant reminders (Priority: P3)

When the user has a workout scheduled or habitual for today that they have not
logged yet, when a meal window is open and they have not logged that meal yet,
and when an active goal's target date is approaching, the app proactively
reminds them with a clear, actionable message. Reminders appear only when they
are actually relevant, respect the same per-type Settings switches as event
notifications, and never repeat for the same underlying situation within the
same day.

**Why this priority**: Reminders are proactive nudges built on top of the
inbox and event system. They are valuable but depend on the same list, settings,
and read-state machinery, so they are the natural final slice.

**Independent Test**: Fully testable by creating a scheduled today's workout, an
unlogged breakfast within its window, and an active goal with a close target
date, then verifying one relevant reminder appears for each; turning each type
off in Settings removes its reminder; and with no scheduled workouts, no open
meal window, or no active goals, no corresponding reminder is produced.

**Acceptance Scenarios**:

1. **Given** a workout scheduled or habitual for today that has not been logged,
   **When** reminders are evaluated, **Then** exactly one "workout reminder" is
   created naming the workout with an action to log it.
2. **Given** a meal window that is currently open and no log for that meal today,
   **When** reminders are evaluated, **Then** exactly one "meal reminder" is
   created for that meal.
3. **Given** an active goal whose target date is approaching and is not yet
   achieved, **When** reminders are evaluated, **Then** exactly one "goal
   reminder" is created naming the goal and its time remaining.
4. **Given** a workout already logged today, **When** reminders are evaluated,
   **Then** no workout reminder is created for that instance.
5. **Given** today's target meal already logged, **When** reminders are
   evaluated, **Then** no meal reminder is created for that meal.
6. **Given** a user with no scheduled workouts, **When** reminders are evaluated,
   **Then** no workout reminder appears.
7. **Given** a user with no active goals, **When** reminders are evaluated, **Then**
   no goal reminder appears.
8. **Given** the same reminder-relevant situation persists all day, **When** the
   app re-evaluates reminders, **Then** the reminder is not duplicated for that
   situation that day.

---

### Edge Cases

- **No data at all**: user with no workouts, no goals, and no meal logs — the
  Notifications page shows the friendly empty state and NO reminder is created
  for a missing condition.
- **All types disabled**: user disables every notification type in Settings —
  no new notifications appear anywhere (page, badge, counters), but previously
  created notifications from before disabling remain visible and manageable.
- **Same event observed multiple times**: a workout completion or goal update
  is evaluated again (page reload, repeat visit, navigation) — it must still
  appear exactly once, never duplicated.
- **Disable then re-enable**: user re-enables a type afterwards — new
  notifications of that type resume; no backfill of disabled-period items.
- **Mark-all-with-nothing-unread**: user clicks "Mark all as read" when
  everything is already read — nothing changes and no error appears.
- **Unread badge count**: badge always matches the actual number of unread
  notifications on the page; resets to zero only when all are read; large
  counts display consistently (e.g. "99+").
- **Time display**: timestamps are human-friendly (e.g. "just now", "2h ago",
  "Sep 8"); when one occurrence happened "today" vs "yesterday" the label must
  not mislead.
- **Day boundary / stale reminders**: a reminder created for "today" stops
  being offered once the relevant window or day has passed (e.g., meal window
  closes, date rolls over) rather than lingering as a stale prompt.
- **Reload with remembered state**: after reloading, read markers, settings, and
  the badge all reflect the last state — nothing resets to unread by mistake.
- **Empty vs error**: transient failures show a friendly message, never blank
  content or technical output.

## Requirements *(mandatory)*

### Functional Requirements

**Notifications Page**

- **FR-001**: System MUST provide a dedicated Notifications page reachable from
  the left sidebar in one click.
- **FR-002**: The page MUST display the user's notifications as a chronological
  list, most-recent-first.
- **FR-003**: Each list item MUST show a short title/message, the time it
  occurred, and its notification type (Workout, Goal, Meal, Reminder).
- **FR-004**: Unread items MUST be visually distinct from read items so the
  difference is clear at a glance and not communicated by color alone.
- **FR-005**: Users MUST be able to mark a single notification as read.
- **FR-006**: Users MUST be able to mark all notifications as read with one
  action.
- **FR-007**: The sidebar MUST display an unread-count badge that equals the
  number of unread notifications, updating immediately when items are read.
- **FR-008**: When there are zero notifications, the page MUST show a friendly,
  helpful empty state (message + guidance), not blank or broken content.

**Notification Types**

- **FR-009**: System MUST create a workout-completion notification when a workout
  is surfaced as finished/logged, referencing that workout.
- **FR-010**: System MUST create a goal-progress notification when an active
  goal's progress increases, naming the goal and new progress.
- **FR-011**: System MUST create a goal-completed notification when a goal is
  fully achieved, naming the achieved goal.
- **FR-012**: System MUST create a workout reminder for a workout scheduled or
  habitual today that has not been logged yet, offering an action to log it.
- **FR-013**: System MUST create a meal reminder when a meal window is open and
  that meal has not been logged today, offering an action to log it.
- **FR-014**: System MUST create a goal reminder for an active goal whose target
  date is approaching and that is not yet achieved, stating the time remaining.
- **FR-015**: A reminder MUST NOT be created when its prerequisite is absent
  (no scheduled workout, no open meal window, no active/near goal).

**Read / Unread State**

- **FR-016**: Every notification MUST have a read or unread state.
- **FR-017**: Read/unread state MUST be persisted so it survives page reloads
  and returns unchanged.
- **FR-018**: The system MUST NOT create duplicate notifications for the same
  event; each event yields exactly one notification no matter how often it is
  re-evaluated.

**Settings**

- **FR-019**: System MUST provide a notification Settings panel giving per-type
  enable/disable control for all six types: Workout completion, Goal progress,
  Goal completed, Workout reminder, Meal reminder, and Goal reminder.
- **FR-020**: By default, ALL six types MUST be enabled for a new user.
- **FR-021**: Settings MUST be saved, and a disabled type MUST NOT produce any
  new notification on any surface (page, badge, counters).
- **FR-022**: Settings MUST persist across reloads.

**Behavior & Experience**

- **FR-023**: Notification messages MUST be short, concrete, and plain-language —
  stating what happened and, for reminders, what the user can do next.
- **FR-024**: Notifications MUST NOT interrupt the user's current task (no
  blocking interruptions); they surface in the page/badge and lightweight
  alerts only.
- **FR-025**: The Notifications page and its Settings MUST match the app's
  existing design system exactly: same sidebar, same dark theme and green
  accents, same card style, and the same tight, minimal-gap layout.
- **FR-026**: All interactive controls on the page and in Settings MUST be
  keyboard-operable and announced to assistive technology.

### Key Entities *(include if feature involves data)*

- **Notification**: An individual message shown to the user. Carries a type
  (Workout completion, Goal progress, Goal completed, Workout reminder, Meal
  reminder, Goal reminder), a short title/message, the time it occurred, a
  reference to the thing it concerns (a specific workout, goal, or meal), and a
  read/unread state. Its uniqueness is guaranteed per event so it never appears
  twice.
- **Notification Settings**: The user's per-type enable/disable preferences.
  Governs whether each of the six notification types may produce new
  notifications across every surface. Defaults to all enabled and persists
  across visits.
- **Unread count**: The live number of notifications the user has not read yet,
  surfaced in the sidebar and derived from the notification list; zero when
  everything is read.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user reaches the Notifications page from the left sidebar in
  at most one click.
- **SC-002**: 100% of qualifying events (workout finished, goal progress, goal
  achieved) and reminder conditions produce exactly one notification each —
  zero duplicates, verified across repeated evaluations and reloads.
- **SC-003**: 100% of disabled notification types produce zero new notifications
  on every surface once disabled.
- **SC-004**: After reloading, the user's read/unread state, unread badge, and
  notification settings match their last saved state in all cases.
- **SC-005**: The unread badge count matches the actual number of unread items
  on the Notifications page at all times (difference of zero).
- **SC-006**: Reminders appear only while relevant: no workout reminder when the
  workout is logged or none scheduled, no meal reminder when the meal is logged
  or the window closed, no goal reminder when no active goal is near its date.
- **SC-007**: With no workouts, goals, or meal data available, the page renders
  the friendly empty state and produces no reminders from empty prerequisites.
- **SC-008**: The Notifications page is visually consistent with the existing
  Dashboard: identical sidebar, dark theme, green accents, card style, and tight
  layout, verified against the current Dashboard screens at three screen sizes.
- **SC-009**: An inbox with up to 50 notifications renders its full list without
  noticeable delay and remains scrollable without layout issues.
- **SC-010**: All page and Settings controls (mark read, mark all read, toggle
  switches) are operable by keyboard alone and announced to screen readers.

## Assumptions

- **In-app only**: All notifications and reminders are shown inside the app (page,
  sidebar badge, lightweight alerts). Push, email, and SMS delivery are out of
  scope for this feature per the governing constitution.
- **Settings location**: The Settings panel is part of the Notifications page
  (an inline section) so users do not need to hunt for a second page; the exact
  layout is left to the plan.
- **Reminders are internal, not scheduled externally**: Reminders are offered
  while the user is in the app (e.g., when they open a page), based on today's
  data. They are not delivered outside the app, and no background scheduling is
  required.
- **"Significant progress" definition**: A goal-progress notification is created
  whenever an active goal's progress advances, regardless of the size of the
  change. A goal is "fully achieved" when it reaches its target measure.
- **Reminder relevance defaults**: A workout reminder applies to a workout whose
  planned day is today and that is not yet logged; a meal reminder applies within
  the meal's usual window when that meal is still unlogged today; a goal reminder
  applies to an active goal whose target date is within about 3 days and is not
  yet achieved.
- **Retention**: Notification history shown reflects events the app has observed
  during the user's usage; historical backfill from before this feature exists is
  out of scope.
- **Single-device persistence**: Read/unread and settings persistence applies on
  the device the user is using; cross-device or cross-browser sync is out of
  scope.

## Out of Scope

- Push, email, or SMS notification delivery.
- Backend or server-side notification storage and scheduling.
- Notifications about other users, social features, or AI-generated motivational
  messages.
- Time-based quiet hours or snooze scheduling beyond a simple "mute all".
- Notification preferences beyond per-type on/off (e.g., per-entity rules,
  custom delivery times, repeat intervals).
- Cross-device badge sync, real-time live updates, or notification history
  export/import.