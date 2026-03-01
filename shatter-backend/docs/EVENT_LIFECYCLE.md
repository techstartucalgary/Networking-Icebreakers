# Shatter Backend — Event Lifecycle Guide

**Last updated:** 2026-03-01

---

## Table of Contents

- [Current State](#current-state-)
  - [How `currentState` Works Today](#how-currentstate-works-today)
  - [Current Event Endpoints and State](#current-event-endpoints-and-state)
- [Planned State Machine](#planned-state-machine-)
  - [States](#states)
  - [Transition Rules](#transition-rules)
  - [Planned Endpoint](#planned-endpoint-put-apieventseventidstatus)
  - [Side Effects Per Transition](#side-effects-per-transition)
- [What's Allowed in Each State (Planned)](#whats-allowed-in-each-state-planned)
- [Frontend Integration Notes](#frontend-integration-notes)
  - [UI State Mapping](#ui-state-mapping)
  - [Subscribing to State Changes](#subscribing-to-state-changes)
  - [Polling Fallback](#polling-fallback-current-workaround)

---

## Current State ✅

### How `currentState` Works Today

The `currentState` field on the Event model is a **free-form string** with no enum, no validation, and no transition enforcement.

```js
// event_model.ts
currentState: { type: String, required: true }
```

- Any string value is accepted when creating an event
- There is no endpoint to update the state after creation
- No logic gates behavior based on state (joining, games, etc. work regardless of state value)
- The backend does not enforce any state machine — the frontend can pass whatever string it wants

### Current Event Endpoints and State

| Endpoint | State Behavior |
|----------|---------------|
| `POST /api/events/createEvent` | Sets `currentState` from request body (any string) |
| `GET /api/events/:eventId` | Returns `currentState` as-is |
| `GET /api/events/event/:joinCode` | Returns `currentState` as-is |
| `POST /api/events/:eventId/join/user` | Does **not** check `currentState` |
| `POST /api/events/:eventId/join/guest` | Does **not** check `currentState` |

**In practice**, frontends have been passing values like `"pending"`, `"active"`, or similar, but the backend does not enforce these.

---

## Planned State Machine ⏳

> **This section describes planned functionality that is NOT yet implemented.**

### States

```
pending ──► active ──► ended
```

| State     | Description |
|-----------|-------------|
| `pending` | Event created, waiting for host to start. Participants can join. |
| `active`  | Event is live. Games/activities are in progress. Participants can still join (unless at capacity). |
| `ended`   | Event is over. No new joins. Results are finalized. |

### Transition Rules

| From      | To       | Who Can Trigger | Endpoint |
|-----------|----------|-----------------|----------|
| `pending` | `active` | Event creator only | `PUT /api/events/:eventId/status` |
| `active`  | `ended`  | Event creator only | `PUT /api/events/:eventId/status` |

Invalid transitions (e.g., `ended` → `active`, `pending` → `ended`) will be rejected.

### Planned Endpoint: `PUT /api/events/:eventId/status`

**Auth:** Protected (event creator only)

**Request Body:**

```json
{
  "status": "active"
}
```

**Validation:**
- Only the user in `createdBy` can change the state
- Only valid transitions are allowed (`pending` → `active`, `active` → `ended`)

### Side Effects Per Transition

#### `pending` → `active`
- Trigger Pusher event `event-started` on channel `event-{eventId}`
- Payload: `{ eventId, state: "active", startedAt: <timestamp> }`
- Frontend should transition from lobby/waiting UI to active game UI

#### `active` → `ended`
- Trigger Pusher event `event-ended` on channel `event-{eventId}`
- Payload: `{ eventId, state: "ended", endedAt: <timestamp> }`
- Lock bingo state (no more updates to player grids)
- Frontend should show results/summary screen

---

## What's Allowed in Each State (Planned)

| Action | `pending` | `active` | `ended` |
|--------|-----------|----------|---------|
| Join event | Yes | Yes (if not full) | No |
| Leave event | Yes | Yes | No |
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
| `pending`      | Lobby / waiting room. Show participant list, join code, QR code. "Waiting for host to start..." |
| `active`       | Game screen. Show bingo grid, active activities, connection creation. |
| `ended`        | Results screen. Show final scores, connections made, event summary. |

### Subscribing to State Changes

Once the state transition endpoint and Pusher events are implemented, subscribe to state changes:

```js
const channel = pusher.subscribe(`event-${eventId}`);

channel.bind('event-started', (data) => {
  // Transition UI from lobby to active game
  setEventState('active');
});

channel.bind('event-ended', (data) => {
  // Transition UI from active game to results
  setEventState('ended');
});
```

### Polling Fallback (Current Workaround)

Since state change events are not yet implemented, frontends can poll the event endpoint:

```js
// Poll every 5 seconds for state changes
const interval = setInterval(async () => {
  const res = await fetch(`/api/events/${eventId}`);
  const { event } = await res.json();
  if (event.currentState !== currentState) {
    setCurrentState(event.currentState);
  }
}, 5000);
```

This is a temporary approach and should be replaced with Pusher events once implemented.
