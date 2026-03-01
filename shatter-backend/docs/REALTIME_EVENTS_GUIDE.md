# Shatter Backend — Real-Time Events Guide

**Last updated:** 2026-03-01

---

## Why Pusher?

Shatter's backend is deployed on Vercel, which runs serverless functions. Serverless functions freeze between requests and cannot maintain persistent WebSocket connections (ruling out Socket.IO or raw WebSockets).

**Pusher** provides a managed WebSocket service where:
- The **backend** sends events to Pusher's servers via HTTP (works from serverless)
- **Clients** (mobile/web) maintain WebSocket connections to Pusher directly
- No long-lived server process needed

---

## Setup

### Client-Side Configuration

Install the Pusher client library:

```bash
# Web (React)
npm install pusher-js

# React Native (Expo)
npx expo install pusher-js
```

Initialize the Pusher client with your credentials:

```js
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.PUSHER_KEY, {
  cluster: process.env.PUSHER_CLUSTER,  // e.g., 'us2'
});
```

**Required environment variables** (get these from the backend team or Pusher dashboard):
- `PUSHER_KEY` — Your Pusher app key (public, safe for client-side)
- `PUSHER_CLUSTER` — Your Pusher cluster region (e.g., `us2`, `eu`, `ap1`)

> **Note:** The `PUSHER_SECRET` is only used server-side and must never be exposed to clients.

---

## Channel Naming Convention

All real-time channels follow this pattern:

```
event-{eventId}
```

Where `eventId` is the MongoDB ObjectId of the event. For example:

```
event-665a1b2c3d4e5f6a7b8c9d0e
```

Each event has its own channel. Subscribe when a user enters an event, unsubscribe when they leave.

---

## Implemented Events ✅

### `participant-joined`

**Channel:** `event-{eventId}`

**Triggered when:**
- A registered user joins an event (`POST /api/events/:eventId/join/user`)
- A guest joins an event (`POST /api/events/:eventId/join/guest`)

**Payload:**

```json
{
  "participantId": "666b1a2b3c4d5e6f7a8b9c0d",
  "name": "John Doe"
}
```

| Field           | Type     | Description |
|-----------------|----------|-------------|
| `participantId` | ObjectId | The new participant's ID |
| `name`          | string   | The participant's display name |

**Use case:** Update the live participant list in the event lobby/dashboard without polling.

---

## Planned Events ⏳

These events are **not yet implemented**. Do not depend on them.

### `event-started`

**Channel:** `event-{eventId}`

Triggered when the host starts the event (transitions state to `active`).

**Expected payload:**

```json
{
  "eventId": "665a...",
  "state": "active",
  "startedAt": "2025-02-01T18:00:00.000Z"
}
```

### `event-ended`

**Channel:** `event-{eventId}`

Triggered when the host ends the event (transitions state to `ended`).

**Expected payload:**

```json
{
  "eventId": "665a...",
  "state": "ended",
  "endedAt": "2025-02-01T21:00:00.000Z"
}
```

### `bingo-achieved`

**Channel:** `event-{eventId}`

Triggered when a participant completes a bingo line/card.

**Expected payload:**

```json
{
  "participantId": "666b...",
  "participantName": "Jane Doe",
  "achievementType": "line"
}
```

---

## Client Integration Examples

### React (Web Dashboard)

```jsx
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

function EventLobby({ eventId }) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('participant-joined', (data) => {
      setParticipants((prev) => [
        ...prev,
        { participantId: data.participantId, name: data.name },
      ]);
    });

    // Clean up on unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`event-${eventId}`);
      pusher.disconnect();
    };
  }, [eventId]);

  return (
    <ul>
      {participants.map((p) => (
        <li key={p.participantId}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### React Native (Mobile App)

```jsx
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js/react-native';
import { FlatList, Text } from 'react-native';

function EventLobby({ eventId }) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('participant-joined', (data) => {
      setParticipants((prev) => [
        ...prev,
        { participantId: data.participantId, name: data.name },
      ]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`event-${eventId}`);
      pusher.disconnect();
    };
  }, [eventId]);

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.participantId}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Error Handling

```js
// Connection state monitoring
pusher.connection.bind('state_change', (states) => {
  console.log('Pusher state:', states.previous, '->', states.current);
});

pusher.connection.bind('error', (err) => {
  console.error('Pusher connection error:', err);
});

// Subscription error handling
const channel = pusher.subscribe(`event-${eventId}`);
channel.bind('pusher:subscription_error', (error) => {
  console.error('Subscription failed:', error);
});
```

---

## Testing Tips

1. **Pusher Dashboard Debug Console:** Go to your Pusher app dashboard → "Debug Console" to see events in real-time as they're triggered by the backend.

2. **Trigger a test event manually:** Join an event via the API and watch the debug console for `participant-joined` events.

3. **Check channel subscriptions:** The Pusher dashboard shows active connections and subscriptions, useful for debugging client-side issues.

4. **Local development:** Both the backend and frontend can use the same Pusher credentials locally. The backend triggers events via HTTP (no WebSocket needed server-side), so it works even without Pusher's client SDK.
