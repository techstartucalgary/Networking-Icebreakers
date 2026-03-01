# Shatter Backend — API Reference

**Last updated:** 2026-03-01
**Base URL:** `http://localhost:4000/api`

---

## General Information

### Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/signup`, `/api/auth/login`, `/api/auth/exchange`, or the guest join flow.

Token payload: `{ userId, iat, exp }` — expires in 30 days by default.

### Standard Error Format

Most endpoints return errors as:

```json
{ "error": "Description of the error" }
```

Some endpoints use an alternative format:

```json
{ "success": false, "error": "Description" }
```

or:

```json
{ "success": false, "msg": "Description" }
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad request / validation error |
| 401  | Unauthorized / invalid credentials |
| 403  | Forbidden (e.g., updating another user's profile) |
| 404  | Resource not found |
| 409  | Conflict (duplicate resource) |
| 500  | Internal server error |

---

## Authentication (`/api/auth`)

### POST `/api/auth/signup`

Create a new user account.

- **Auth:** Public

**Request Body:**

| Field      | Type   | Required | Notes |
|------------|--------|----------|-------|
| `name`     | string | Yes      | Display name |
| `email`    | string | Yes      | Must be valid email format |
| `password` | string | Yes      | Minimum 8 characters |

**Success Response (201):**

```json
{
  "message": "User created successfully",
  "userId": "664f1a2b3c4d5e6f7a8b9c0d",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"name, email and password are required"` |
| 400    | `"Invalid email format"` |
| 400    | `"Password must be at least 8 characters long"` |
| 409    | `"Email already exists"` |

---

### POST `/api/auth/login`

Authenticate a user and return a JWT.

- **Auth:** Public

**Request Body:**

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Success Response (200):**

```json
{
  "message": "Login successful",
  "userId": "664f1a2b3c4d5e6f7a8b9c0d",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Email and password are required"` |
| 400    | `"Invalid email format"` |
| 401    | `"Invalid credentials"` (wrong email or password — same message for security) |
| 401    | `"This account uses LinkedIn login. Please sign in with LinkedIn."` |

**Special Behavior:** Updates `lastLogin` timestamp on successful login.

---

### GET `/api/auth/linkedin`

Initiate LinkedIn OAuth flow. Redirects the browser to LinkedIn's authorization page.

- **Auth:** Public
- **Response:** 302 redirect to LinkedIn

---

### GET `/api/auth/linkedin/callback`

LinkedIn OAuth callback. Not called directly by frontend — LinkedIn redirects here after user authorization.

- **Auth:** Public (called by LinkedIn)
- **Flow:** Verifies CSRF state → exchanges code for access token → fetches LinkedIn profile → upserts user → creates single-use auth code → redirects to frontend with `?code=<authCode>`

**Redirect on success:** `{FRONTEND_URL}/auth/callback?code=<authCode>`
**Redirect on error:** `{FRONTEND_URL}/auth/error?message=<error>`

---

### POST `/api/auth/exchange`

Exchange a single-use auth code (from LinkedIn OAuth callback) for a JWT token.

- **Auth:** Public

**Request Body:**

| Field  | Type   | Required | Notes |
|--------|--------|----------|-------|
| `code` | string | Yes      | Single-use auth code from OAuth redirect |

**Success Response (200):**

```json
{
  "message": "Authentication successful",
  "userId": "664f1a2b3c4d5e6f7a8b9c0d",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Auth code is required"` |
| 401    | `"Invalid or expired auth code"` |

**Special Behavior:** Auth code is atomically deleted after use (single-use). Codes expire after 60 seconds via MongoDB TTL.

---

## Users (`/api/users`)

### GET `/api/users`

List all users.

- **Auth:** Public

**Success Response (200):**

```json
[
  {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "John Doe",
    "email": "john@example.com",
    "authProvider": "local",
    "eventHistoryIds": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

**Note:** `passwordHash` is excluded from results by default.

---

### POST `/api/users`

Create a basic user (name + email only, no password).

- **Auth:** Public

**Request Body:**

| Field   | Type   | Required |
|---------|--------|----------|
| `name`  | string | Yes      |
| `email` | string | Yes      |

**Success Response (201):**

```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0d",
  "name": "John Doe",
  "email": "john@example.com",
  "authProvider": "local",
  "eventHistoryIds": [],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"name and email required"` |
| 409    | `"email already exists"` |

---

### GET `/api/users/me`

Get the currently authenticated user's profile.

- **Auth:** Protected

**Success Response (200):**

```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0d",
  "name": "John Doe",
  "email": "john@example.com",
  "authProvider": "local",
  "bio": "Software developer",
  "socialLinks": { "github": "https://github.com/johndoe" },
  "eventHistoryIds": ["665a..."],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 401    | Unauthorized (missing/invalid token) |
| 404    | `"User not found"` |

---

### GET `/api/users/:userId`

Get a user by their ID.

- **Auth:** Protected

**URL Params:**

| Param    | Type     | Required |
|----------|----------|----------|
| `userId` | ObjectId | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "John Doe",
    "email": "john@example.com",
    "authProvider": "local",
    "eventHistoryIds": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"User not found"` |

---

### GET `/api/users/:userId/events`

Get all events a user has joined (populates event details).

- **Auth:** Protected

**URL Params:**

| Param    | Type     | Required |
|----------|----------|----------|
| `userId` | ObjectId | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "events": [
    {
      "_id": "665a...",
      "name": "Tech Meetup",
      "description": "Monthly networking event",
      "joinCode": "12345678",
      "startDate": "2025-02-01T18:00:00.000Z",
      "endDate": "2025-02-01T21:00:00.000Z",
      "currentState": "active"
    }
  ]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"User not found"` |

---

### PUT `/api/users/:userId`

Update a user's profile. Users can only update their own profile.

- **Auth:** Protected (self-only)

**URL Params:**

| Param    | Type     | Required |
|----------|----------|----------|
| `userId` | ObjectId | Yes      |

**Request Body (all optional):**

| Field          | Type   | Notes |
|----------------|--------|-------|
| `name`         | string | Cannot be empty |
| `email`        | string | Must be valid format, checked for uniqueness |
| `password`     | string | Minimum 8 characters |
| `bio`          | string | |
| `profilePhoto` | string | URL |
| `socialLinks`  | object | `{ linkedin?, github?, other? }` |

**Success Response (200):**

```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"No fields to update"` |
| 400    | `"Name cannot be empty"` |
| 400    | `"Invalid email format"` |
| 400    | `"Password must be at least 8 characters long"` |
| 403    | `"You can only update your own profile"` |
| 404    | `"User not found"` |
| 409    | `"Email already in use"` |

**Special Behavior:** Guest users who set a password are automatically upgraded to `authProvider: 'local'`.

---

## Events (`/api/events`)

### POST `/api/events/createEvent`

Create a new event.

- **Auth:** Protected

**Request Body:**

| Field            | Type   | Required | Notes |
|------------------|--------|----------|-------|
| `name`           | string | Yes      | |
| `description`    | string | Yes      | Required by schema |
| `startDate`      | string | Yes      | ISO 8601 date |
| `endDate`        | string | Yes      | Must be after `startDate` |
| `maxParticipant` | number | Yes      | |
| `currentState`   | string | Yes      | Free-form string (no enum) |

**Success Response (201):**

```json
{
  "success": true,
  "event": {
    "_id": "665a...",
    "name": "Tech Meetup",
    "description": "Monthly networking event",
    "joinCode": "48291037",
    "startDate": "2025-02-01T18:00:00.000Z",
    "endDate": "2025-02-01T21:00:00.000Z",
    "maxParticipant": 50,
    "participantIds": [],
    "currentState": "pending",
    "createdBy": "664f...",
    "createdAt": "2025-01-20T12:00:00.000Z",
    "updatedAt": "2025-01-20T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Event name is required"` |
| 404    | `"User not found"` |

**Special Behavior:** An 8-digit `joinCode` is auto-generated.

---

### GET `/api/events/event/:joinCode`

Get event details by join code.

- **Auth:** Public

**URL Params:**

| Param      | Type   | Required |
|------------|--------|----------|
| `joinCode` | string | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "event": {
    "_id": "665a...",
    "name": "Tech Meetup",
    "description": "Monthly networking event",
    "joinCode": "48291037",
    "participantIds": [
      { "_id": "666b...", "name": "John Doe", "userId": "664f..." }
    ],
    "currentState": "active",
    "createdBy": "664f...",
    ...
  }
}
```

**Note:** `participantIds` is populated with `name` and `userId` fields.

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"Event not found"` |

---

### GET `/api/events/:eventId`

Get event details by event ID.

- **Auth:** Public

**URL Params:**

| Param     | Type     | Required |
|-----------|----------|----------|
| `eventId` | ObjectId | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "event": {
    "_id": "665a...",
    "name": "Tech Meetup",
    "participantIds": [
      { "_id": "666b...", "name": "John Doe", "userId": "664f..." }
    ],
    ...
  }
}
```

**Note:** `participantIds` is populated with `name` and `userId` fields.

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"Event not found"` |

---

### POST `/api/events/:eventId/join/user`

Join an event as a registered (authenticated) user.

- **Auth:** Protected

**URL Params:**

| Param     | Type     | Required |
|-----------|----------|----------|
| `eventId` | ObjectId | Yes      |

**Request Body:**

| Field    | Type     | Required | Notes |
|----------|----------|----------|-------|
| `userId` | ObjectId | Yes      | |
| `name`   | string   | Yes      | Display name in this event |

**Success Response (200):**

```json
{
  "success": true,
  "participant": {
    "_id": "666b...",
    "userId": "664f...",
    "name": "John Doe",
    "eventId": "665a..."
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Missing fields: userId, name, and eventId are required"` |
| 400    | `"Event is full"` |
| 400    | `"Already joined this event"` |
| 404    | `"User not found"` |
| 404    | `"Event not found"` |
| 409    | `"User already joined"` |
| 409    | `"This name is already taken in this event"` |

**Special Behavior:**
- Creates a Participant record linking user to event
- Adds participant to event's `participantIds` array
- Adds event to user's `eventHistoryIds` array
- Triggers Pusher event `participant-joined` on channel `event-{eventId}` with payload `{ participantId, name }`

---

### POST `/api/events/:eventId/join/guest`

Join an event as a guest (no account required).

- **Auth:** Public

**URL Params:**

| Param     | Type     | Required |
|-----------|----------|----------|
| `eventId` | ObjectId | Yes      |

**Request Body:**

| Field  | Type   | Required |
|--------|--------|----------|
| `name` | string | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "participant": {
    "_id": "666b...",
    "userId": "664f...",
    "name": "Guest User",
    "eventId": "665a..."
  },
  "userId": "664f...",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Missing fields: guest name and eventId are required"` |
| 400    | `"Event is full"` |
| 404    | `"Event not found"` |
| 409    | `"This name is already taken in this event"` |

**Special Behavior:**
- Creates a guest User (`authProvider: 'guest'`, no email/password)
- Returns a JWT so the guest can make authenticated requests
- Guest can later upgrade to a full account via `PUT /api/users/:userId`
- Triggers Pusher event `participant-joined` on channel `event-{eventId}` with payload `{ participantId, name }`

---

### GET `/api/events/createdEvents/user/:userId`

Get all events created by a specific user.

- **Auth:** Protected

**URL Params:**

| Param    | Type     | Required |
|----------|----------|----------|
| `userId` | ObjectId | Yes      |

**Success Response (200):**

```json
{
  "success": true,
  "events": [
    {
      "_id": "665a...",
      "name": "Tech Meetup",
      "description": "Monthly networking event",
      "joinCode": "48291037",
      "createdBy": "664f...",
      ...
    }
  ]
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"No events found for this user"` |

---

## Bingo (`/api/bingo`)

### POST `/api/bingo/createBingo`

Create a bingo game for an event.

- **Auth:** Protected

**Request Body:**

| Field         | Type       | Required | Notes |
|---------------|------------|----------|-------|
| `_eventId`    | ObjectId   | Yes      | Must reference an existing event |
| `description` | string     | No       | |
| `grid`        | string[][] | No       | 2D array of strings |

**Success Response (201):**

```json
{
  "success": true,
  "bingoId": "bingo_a1b2c3d4",
  "bingo": {
    "_id": "bingo_a1b2c3d4",
    "_eventId": "665a...",
    "description": "Networking Bingo",
    "grid": [
      ["Has a pet", "Speaks 3 languages", "Loves hiking"],
      ["Works remotely", "Free space", "Plays guitar"],
      ["From another country", "Has a blog", "Codes in Rust"]
    ]
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"_eventId is required"` |
| 400    | `"_eventId must be a valid ObjectId"` |
| 400    | `"grid must be a 2D array of strings"` |
| 404    | `"Event not found"` |

---

### GET `/api/bingo/getBingo/:eventId`

Get bingo by event ID (or bingo ID).

- **Auth:** Public

**URL Params:**

| Param     | Type   | Required | Notes |
|-----------|--------|----------|-------|
| `eventId` | string | Yes      | Tries as bingo `_id` first, then as `_eventId` |

**Success Response (200):**

```json
{
  "success": true,
  "bingo": {
    "_id": "bingo_a1b2c3d4",
    "_eventId": "665a...",
    "description": "Networking Bingo",
    "grid": [["Has a pet", "Speaks 3 languages", ...], ...]
  }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 404    | `"Bingo not found"` |

---

### PUT `/api/bingo/updateBingo`

Update a bingo game.

- **Auth:** Protected

**Request Body:**

| Field         | Type       | Required | Notes |
|---------------|------------|----------|-------|
| `id`          | string     | Yes      | Bingo `_id` or event `_eventId` |
| `description` | string     | No       | |
| `grid`        | string[][] | No       | 2D array of strings |

**Success Response (200):**

```json
{
  "success": true,
  "bingo": { /* updated bingo object */ }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"id is required"` |
| 400    | `"description must be a string"` |
| 400    | `"grid must be a 2D array of strings"` |
| 400    | `"Nothing to update: provide description and/or grid"` |
| 404    | `"Bingo not found"` |

**Special Behavior:** Tries to find by `_id` first, then falls back to `_eventId`.

---

## Participant Connections (`/api/participantConnections`)

### POST `/api/participantConnections/`

Create a connection between two participants by their IDs.

- **Auth:** Protected

**Request Body:**

| Field                    | Type     | Required | Notes |
|--------------------------|----------|----------|-------|
| `_eventId`               | ObjectId | Yes      | |
| `primaryParticipantId`   | ObjectId | Yes      | Must belong to the event |
| `secondaryParticipantId` | ObjectId | Yes      | Must belong to the event |
| `description`            | string   | No       | e.g., bingo question they connected with |

**Success Response (201):**

```json
{
  "_id": "participantConnection_a1b2c3d4",
  "_eventId": "665a...",
  "primaryParticipantId": "666b...",
  "secondaryParticipantId": "666c...",
  "description": "Both love hiking"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Missing required fields"` |
| 400    | `"Invalid _eventId"` / `"Invalid primaryParticipantId"` / etc. |
| 404    | `"Primary participant not found for this event"` |
| 404    | `"Secondary participant not found for this event"` |
| 409    | `"ParticipantConnection already exists for this event and participants"` |

---

### POST `/api/participantConnections/by-emails`

Create a connection between two participants by their user emails.

- **Auth:** Protected

**Request Body:**

| Field                | Type     | Required | Notes |
|----------------------|----------|----------|-------|
| `_eventId`           | ObjectId | Yes      | |
| `primaryUserEmail`   | string   | Yes      | Email of primary user |
| `secondaryUserEmail` | string   | Yes      | Email of secondary user, must differ from primary |
| `description`        | string   | No       | |

**Success Response (201):**

```json
{
  "_id": "participantConnection_a1b2c3d4",
  "_eventId": "665a...",
  "primaryParticipantId": "666b...",
  "secondaryParticipantId": "666c...",
  "description": "Both love hiking"
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Missing required fields"` |
| 400    | `"Invalid _eventId"` |
| 400    | `"Invalid primaryUserEmail"` / `"Invalid secondaryUserEmail"` |
| 400    | `"primaryUserEmail and secondaryUserEmail must be different"` |
| 404    | `"Primary user not found"` / `"Secondary user not found"` |
| 404    | `"Primary participant not found for this event (by user email)"` |
| 404    | `"Secondary participant not found for this event (by user email)"` |
| 409    | `"ParticipantConnection already exists for this event and participants"` |

---

### DELETE `/api/participantConnections/delete`

Delete a participant connection.

- **Auth:** Protected

**Request Body:**

| Field          | Type     | Required | Notes |
|----------------|----------|----------|-------|
| `eventId`      | ObjectId | Yes      | |
| `connectionId` | string   | Yes      | The connection's `_id` |

**Success Response (200):**

```json
{
  "message": "ParticipantConnection deleted successfully",
  "deletedConnection": { /* deleted connection object */ }
}
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Invalid eventId"` |
| 400    | `"Invalid connectionId"` |
| 404    | `"ParticipantConnection not found for this event"` |

---

### GET `/api/participantConnections/getByParticipantAndEvent`

Get all connections for a participant in an event.

- **Auth:** Protected

**Query Params:**

| Param           | Type     | Required |
|-----------------|----------|----------|
| `eventId`       | ObjectId | Yes      |
| `participantId` | ObjectId | Yes      |

**Success Response (200):**

```json
[
  {
    "_id": "participantConnection_a1b2c3d4",
    "_eventId": "665a...",
    "primaryParticipantId": "666b...",
    "secondaryParticipantId": "666c...",
    "description": "Both love hiking"
  }
]
```

Returns connections where the participant is either `primaryParticipantId` or `secondaryParticipantId`.

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Invalid eventId"` |
| 400    | `"Invalid participantId"` |

---

### GET `/api/participantConnections/getByUserEmailAndEvent`

Get all connections for a user (by email) in an event.

- **Auth:** Protected

**Query Params:**

| Param       | Type     | Required |
|-------------|----------|----------|
| `eventId`   | ObjectId | Yes      |
| `userEmail` | string   | Yes      |

**Success Response (200):**

```json
[
  {
    "_id": "participantConnection_a1b2c3d4",
    "_eventId": "665a...",
    "primaryParticipantId": "666b...",
    "secondaryParticipantId": "666c..."
  }
]
```

**Error Responses:**

| Status | Error |
|--------|-------|
| 400    | `"Invalid eventId"` |
| 400    | `"Invalid userEmail"` |
| 404    | `"Participant not found for this event (by user email)"` |

---

## Planned Endpoints ⏳

These endpoints are **not yet implemented**. Do not depend on them.

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT    | `/api/events/:eventId/status` | Update event lifecycle state (host-only) |
| POST   | `/api/events/:eventId/leave` | Leave an event |
| DELETE | `/api/events/:eventId` | Cancel/delete an event |
| GET    | `/api/events/:eventId/participants` | Search/list participants |
| GET    | `/api/events/:eventId/qrcode` | Get event QR code image |
| —      | `/api/activities/*` | Activity/icebreaker game endpoints |
| —      | `/api/bingo/player-state/*` | Player bingo state endpoints |

---

## Quick Start Examples

### 1. Sign up

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

### 2. Log in

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

Save the `token` from the response for subsequent requests.

### 3. Create an event

```bash
curl -X POST http://localhost:4000/api/events/createEvent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Tech Meetup",
    "description": "Monthly networking event",
    "startDate": "2025-02-01T18:00:00.000Z",
    "endDate": "2025-02-01T21:00:00.000Z",
    "maxParticipant": 50,
    "currentState": "pending"
  }'
```

### 4. Join the event (as authenticated user)

```bash
curl -X POST http://localhost:4000/api/events/<eventId>/join/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "<userId>",
    "name": "Jane Doe"
  }'
```

### 5. Join the event (as guest)

```bash
curl -X POST http://localhost:4000/api/events/<eventId>/join/guest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guest User"
  }'
```

### 6. Create a bingo game for the event

```bash
curl -X POST http://localhost:4000/api/bingo/createBingo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "_eventId": "<eventId>",
    "description": "Networking Bingo",
    "grid": [
      ["Has a pet", "Speaks 3 languages", "Loves hiking"],
      ["Works remotely", "Free space", "Plays guitar"],
      ["From another country", "Has a blog", "Codes in Rust"]
    ]
  }'
```

### 7. Get the bingo game

```bash
curl http://localhost:4000/api/bingo/getBingo/<eventId>
```
