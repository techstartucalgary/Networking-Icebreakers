# Shatter Backend — Event Lifecycle Guide

**Last updated:** 2026-03-01

---

## Table of Contents

- [Event States](#event-states)
  - [State Enum](#state-enum)
  - [State Diagram](#state-diagram)
- [Transition Rules](#transition-rules)
  - [Valid Transitions](#valid-transitions)
  - [Transition Endpoint](#transition-endpoint-put-apieventseventidstatus)
  - [Side Effects Per Transition](#side-effects-per-transition)
- [Current Event Endpoints and State](#current-event-endpoints-and-state)
- [What's Allowed in Each State (Planned)](#whats-allowed-in-each-state-planned)
- [Frontend Integration Notes](#frontend-integration-notes)
  - [UI State Mapping](#ui-state-mapping)
  - [Subscribing to State Changes](#subscribing-to-state-changes)

---

## Event States

### State Enum

The `currentState` field on the Event model is a **validated enum** with three possible values:

```js
// event_model.ts
currentState: {
  type: String,
  enum: ['Upcoming', 'In Progress', 'Completed'],
  default: 'Upcoming',
  required: true
}
```

| State         | Description |
|---------------|-------------|
| `Upcoming`    | Event created, waiting for host to start. Participants can join. |
| `In Progress` | Event is live. Games/activities are in progress. Participants can still join (unless at capacity). |
| `Completed`   | Event is over. No new joins. Results are finalized. |

These values match the mobile app's `EventState` enum exactly (title case with spaces).

### State Diagram

```
Upcoming ──► In Progress ──► Completed
```

- Only forward transitions are allowed
- There is no way to revert a state (e.g., `Completed` cannot go back to `In Progress`)
- Events are created with `currentState: 'Upcoming'` by default

---

## Transition Rules

### Valid Transitions

| From          | To             | Who Can Trigger    | Endpoint |
|---------------|----------------|--------------------|----------|
| `Upcoming`    | `In Progress`  | Event creator only | `PUT /api/events/:eventId/status` |
| `In Progress` | `Completed`    | Event creator only | `PUT /api/events/:eventId/status` |

Invalid transitions (e.g., `Completed` → `In Progress`, `Upcoming` → `Completed`) are rejected with a `400` error.

### Transition Endpoint: `PUT /api/events/:eventId/status`

**Auth:** Protected (event creator only — `event.createdBy === req.user.userId`)

**Request Body:**

```json
{
  "status": "In Progress"
}
```

**Validation:**
- Only the user in `createdBy` can change the state (403 for non-host)
- Only valid transitions are allowed (400 for invalid transitions)
- The `status` field is required (400 if missing)

**Success Response (200):**

```json
{
  "success": true,
  "event": {
    "_id": "665a...",
    "name": "Tech Meetup",
    "currentState": "In Progress",
    ...
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Status is required"` |
| 400    | `"Invalid status transition from <current> to <target>"` |
| 403    | `"Only the event host can update the event status"` |
| 404    | `"Event not found"` |

### Side Effects Per Transition

#### `Upcoming` → `In Progress`
- Triggers Pusher event `event-started` on channel `event-{eventId}`
- Payload: `{ status: 'In Progress' }`
- Frontend should transition from lobby/waiting UI to active game UI

#### `In Progress` → `Completed`
- Triggers Pusher event `event-ended` on channel `event-{eventId}`
- Payload: `{ status: 'Completed' }`
- Frontend should show results/summary screen

#### Participant Leaves (`POST /api/events/:eventId/leave`)
- Only allowed when `currentState` is `Upcoming` or `In Progress`
- Removes participant from event, deletes Participant document, cleans up user history and connections
- Triggers Pusher event `participant-left` on channel `event-{eventId}`
- Payload: `{ participantId, name }`

#### Event Deleted (`DELETE /api/events/:eventId`)
- Only allowed when `currentState` is `Upcoming` or `In Progress` (host-only)
- Cascade deletes: all Participants, Bingo, ParticipantConnections, and the Event itself
- Removes event from all participants' `eventHistoryIds`
- Triggers Pusher event `event-deleted` on channel `event-{eventId}`
- Payload: `{ eventId, message }`
- Frontend should navigate participants away and show a cancellation notice

---

## Current Event Endpoints and State

| Endpoint | State Behavior |
|----------|---------------|
| `POST /api/events/createEvent` | Sets `currentState` to `'Upcoming'` by default (can be overridden with a valid enum value) |
| `GET /api/events/:eventId` | Returns `currentState` as-is |
| `GET /api/events/event/:joinCode` | Returns `currentState` as-is |
| `PUT /api/events/:eventId/status` | Validates and transitions `currentState` (host-only) |
| `POST /api/events/:eventId/join/user` | Does **not** check `currentState` |
| `POST /api/events/:eventId/join/guest` | Does **not** check `currentState` |
| `POST /api/events/:eventId/leave` | Blocked when `Completed`. Allowed in `Upcoming` and `In Progress`. |
| `DELETE /api/events/:eventId` | Blocked when `Completed`. Allowed in `Upcoming` and `In Progress`. Host-only. |
| `GET /api/users/:userId/current-event` | Returns events with `currentState` in `['Upcoming', 'In Progress']` |

---

## What's Allowed in Each State (Planned)

| Action | `Upcoming` | `In Progress` | `Completed` |
|--------|-----------|----------------|-------------|
| Join event | Yes | Yes (if not full) | No |
| Leave event | Yes | Yes | No |
| Delete/cancel event (host) | Yes | Yes | No |
| View participants | Yes | Yes | Yes |
| Play bingo / activities | No | Yes | No |
| Update bingo grid | No | Yes | No |
| View results | No | No | Yes |
| Create connections | No | Yes | No |

---

## Frontend Integration Notes

### UI State Mapping

| `currentState` | Suggested UI |
|----------------|-------------|
| `Upcoming`     | Lobby / waiting room. Show participant list, join code, QR code. "Waiting for host to start..." |
| `In Progress`  | Game screen. Show bingo grid, active activities, connection creation. |
| `Completed`    | Results screen. Show final scores, connections made, event summary. |

### Subscribing to State Changes

Subscribe to Pusher events on the event channel to react to state transitions in real time:

```js
const channel = pusher.subscribe(`event-${eventId}`);

channel.bind('event-started', (data) => {
  // data.status === 'In Progress'
  // Transition UI from lobby to active game
  setEventState('In Progress');
});

channel.bind('event-ended', (data) => {
  // data.status === 'Completed'
  // Transition UI from active game to results
  setEventState('Completed');
});
```
