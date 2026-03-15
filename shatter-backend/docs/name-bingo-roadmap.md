# Name Bingo Backend Roadmap

This roadmap outlines backend development tasks for the Name Bingo feature. Tasks are organized by priority and dependency order.

**Scope**: Backend API development only. Frontend (mobile/web) tasks are out of scope but noted as dependencies.

---

## Verification Report

This roadmap has been cross-referenced against:
- `feature_list.md` (MVP requirements)
- `bingo_walkthrough.md` (user flow requirements)
- Mobile app implementation (`mobile-guest-refactor` branch)

### Coverage Summary

| Category | Status |
|----------|--------|
| MVP Backend APIs | ~95% (minor gaps addressed below) |
| Bingo Walkthrough | ~90% (Section 10 gaps addressed below) |
| Data Models | Documented explicitly |
| Lifecycle | Fully covered |
| Real-time | Fully covered |
| Auth | Partially covered (LinkedIn OAuth complete, LinkedIn account linking for guests missing) |
| Participant Connections | Fully implemented (model, CRUD, routes — access control for guests missing) |
| Guest Account Upgrade | Partially covered (email/password upgrade works, LinkedIn linking missing) |
| Mobile Bingo Gameplay | Client-side implementation complete (see Mobile Bingo Implementation Status) |

### Gaps Addressed in This Version

| Gap | Resolution | Location |
|-----|------------|----------|
| GET /api/users/:userId (Get Profile) | Added | Phase 3.1 |
| GET /api/users/:userId/current-event | Added | Phase 3.5 |
| profilePhoto in participant search | Added | Phase 6.5 |
| Rate limiting middleware | Added | Phase 6.10 |
| allowFreeTextEntry config | Deferred to Phase 6 | Phase 6.6 |
| gridSize in Bingo model | Deferred to Phase 6 | Phase 6.6 |
| Input sanitization | Added to Phase 4.1 |
| Guest account upgrade via LinkedIn linking | Added | Phase 0.3 Task B |
| Connections access control for guest users | Added | Phase 0.3 Task C |
| Organizer Analytics endpoints (feature_list.md "Wants") | Added as future item | Phase 6.11 |
| `gameType` and `eventImg` fields on Event model | Added | Phase 1.1 |
| `currentState` enum matching mobile `EventState` | Added | Phase 1.2 |
| Event status transition API (priority raised) | Moved from Phase 2 to Phase 1 | Phase 1.3 |

---

## Current Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Authentication (signup/login) | Complete | `auth_controller.ts`, `auth_routes.ts` |
| JWT Middleware | Complete | `auth_middleware.ts`, `jwt_utils.ts` |
| User Model & CRUD | Complete | `user_model.ts`, `user_controller.ts` |
| Event Create/Join/Get | Complete | `event_controller.ts`, `event_model.ts` |
| Participant Model | Complete | `participant_model.ts` |
| Guest Join Flow (with User creation, `#XXX` name suffix on collision) | Complete | `event_controller.ts` |
| Profile Update Endpoint | Complete | `user_controller.ts`, `user_route.ts` |
| Pusher Real-time Setup | Complete | `pusher_websocket.ts` |
| Bingo CRUD (basic) | Complete | `bingo_controller.ts`, `bingo_model.ts` |
| LinkedIn OAuth | Complete | `linkedin_oauth.ts`, `auth_controller.ts` |
| Auth Code Exchange | Complete | `auth_code_model.ts`, `auth_controller.ts` |
| Quick Signup (Guest Join) | Complete | `event_controller.ts`, `user_model.ts` |
| ParticipantConnection Model | Complete | `participant_connection_model.ts` |
| ParticipantConnection CRUD | Complete | `participant_connections_controller.ts`, `participant_connections_routes.ts` |
| Guest Upgrade (Email/Password) | Complete | `user_controller.ts` (`updateUser` — sets password, upgrades authProvider) |
| Documentation (API, Real-time, Schema, Lifecycle) | Complete | `docs/API_REFERENCE.md`, `REALTIME_EVENTS_GUIDE.md`, `DATABASE_SCHEMA.md`, `EVENT_LIFECYCLE.md` |
| QR Code Generation | Complete (web client-side) | `shatter-web/src/components/QRCard.tsx` (uses `qrcode.react`, no backend needed) |
| Guest Upgrade (LinkedIn Linking) | Planned | Phase 0.3 Task B |
| Connections Access Control (Guests) | Planned | Phase 0.3 Task C |
| Event Model (`gameType`, `eventImg`) | Complete | Phase 1.1 |
| Event Status Enum (`currentState`) | Complete | Phase 1.2 |
| Event Status Transition API | Complete | Phase 1.3 |
| Player Game State | Deferred (mobile handles client-side) | Phase 6 |
| Participant Search | Deferred (mobile uses existing participant list) | Phase 6 |
| Event Lifecycle Transitions | Complete | Phase 1.3 |

---

## Mobile Bingo Implementation Status

The `mobile-guest-refactor` branch implements significant client-side bingo gameplay, which reduces the backend work needed for MVP. The following features are handled entirely on the mobile client:

| Feature | Mobile Implementation | Backend Dependency |
|---------|----------------------|-------------------|
| Bingo grid display | Renders grid from `GET /api/bingo/getBingo/:eventId` categories | Existing endpoint (works) |
| Name assignment to cards | Autocomplete modal using participant list from event data | Existing `participantIds` on event (works) |
| Duplicate name prevention | Client-side validation — can't assign same name to two cards | None |
| Win detection (rows, cols, diagonals) | Client-side logic checks all win conditions | None |
| Blackout detection & animation | Client-side check for all cells filled + animation | None |
| Game state persistence | AsyncStorage — survives app restart | None |
| Lobby → game transition | Polls event status, transitions when `currentState` changes | **Needs Phase 1.2 + 1.3** |
| Event image display | Renders `eventImg` from event data | **Needs Phase 1.1** |
| Game type display | Renders `gameType` from event data | **Needs Phase 1.1** |

### Mobile Enum Values (source of truth: `shatter-mobile/src/interfaces/Event.tsx`)

```typescript
export enum EventState {
    UPCOMING = "Upcoming",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
    INVALID = "Invalid",
}

export enum GameType {
    NAME_BINGO = "Name Bingo"
}
```

**Backend must use these exact string values** for `currentState` and `gameType` enums to maintain compatibility.

---

## Phase 0: Authentication Enhancements (Critical Priority)

These features are specified in `bingo_walkthrough.md` Section 3.1 as primary authentication methods.

### 0.1 LinkedIn OAuth Integration ✅ COMPLETE

**Endpoints**:
- `GET /api/auth/linkedin` - Initiates OAuth flow (redirects to LinkedIn)
- `GET /api/auth/linkedin/callback` - OAuth callback (creates/updates user, redirects with auth code)
- `POST /api/auth/exchange` - Exchange single-use auth code for JWT token

**Implementation** (custom, no Passport dependency):
- `src/utils/linkedin_oauth.ts` - LinkedIn API helpers (`getLinkedInAuthUrl`, `getLinkedInAccessToken`, `getLinkedInProfile`)
- `src/models/auth_code_model.ts` - Single-use auth code model (60s TTL, auto-expires)
- `src/controllers/auth_controller.ts` - `linkedinAuth`, `linkedinCallback`, `exchangeAuthCode`
- `src/routes/auth_routes.ts` - All routes registered

**User Model Fields** (in `user_model.ts`):
- `linkedinId` (String, unique, sparse) - LinkedIn subject ID
- `linkedinUrl` (String, unique, sparse) - LinkedIn profile URL
- `authProvider` (Enum: 'local' | 'linkedin', default 'local')
- `profilePhoto` (String) - populated from LinkedIn picture

**Security**:
- CSRF protection via JWT-encoded state token (5-minute expiry)
- Auth code is single-use (atomic `findOneAndDelete`) with 60-second TTL
- JWT token never exposed in redirect URLs
- Email conflict detection (prevents duplicate accounts)

**Env Vars**: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_CALLBACK_URL`, `FRONTEND_URL`

**Frontend Integration**:
1. Open browser to `GET /api/auth/linkedin`
2. User authenticates with LinkedIn
3. Backend redirects to `{FRONTEND_URL}/auth/callback?code=<auth-code>`
4. Frontend calls `POST /api/auth/exchange` with `{ "code": "<auth-code>" }`
5. Response: `{ "message": "Authentication successful", "userId": "...", "token": "..." }`

---

### 0.2 Quick Signup via Guest Join ✅ COMPLETE

**Approach**: Instead of a separate signup endpoint, guest users are created automatically when joining an event.

**Endpoint**: `POST /api/events/:eventId/join/guest`
- Takes `{ name, email?, socialLinks? }` in request body
- **Requires at least one contact method**: either `email` or at least one non-empty social link (`linkedin`, `github`, `other`)
- Validates email format if provided; rejects duplicate emails
- Creates a User record with `authProvider: 'guest'` and the provided contact info
- Returns `{ success, participant, userId, token }` — guest gets a JWT immediately

**Profile Completion**: `PUT /api/users/:userId` (protected, self-only)
- Guests can add email, password, bio, profilePhoto, socialLinks later
- Setting a password upgrades `authProvider` from `'guest'` to `'local'`
- Email validated for format and uniqueness, password must be >= 8 chars

**Model Changes** (`user_model.ts`):
- `email` is now optional with `sparse: true` (allows multiple guest users without email)
- `authProvider` enum: `'local' | 'linkedin' | 'guest'`
- Added `bio` (String) and `socialLinks` (linkedin, github, other) fields

**Implementation**:
- `src/controllers/event_controller.ts` — upgraded `joinEventAsGuest`
- `src/controllers/user_controller.ts` — added `updateUser`
- `src/routes/user_route.ts` — added `PUT /:userId` route

**Frontend Dependency**: Mobile app guest join flow + profile completion screen.

---

### 0.3 Guest Account Upgrade Flow (High Priority)

**Reference**: `bingo_walkthrough.md` Section 10 — Guest Account Completion Flow

Guest users can join events and play games without interruption, but they cannot access saved connections until they upgrade their account. The backend must support two upgrade paths and enforce connections access control.

#### Task A: Email/Password Upgrade ✅ COMPLETE

**Endpoint**: `PUT /api/users/:userId` (existing, protected, self-only)

Already implemented in `user_controller.ts` (`updateUser`):
- Guest sets `email` + `password` via profile update
- Setting a password automatically upgrades `authProvider` from `'guest'` to `'local'`
- Email validated for format and uniqueness, password must be >= 8 chars

No additional backend work required.

#### Task B: LinkedIn Account Linking for Guest Users

**Endpoint**: `POST /api/auth/linkedin/link` (new, protected)

**Purpose**: Allow an authenticated guest user to attach their LinkedIn account, upgrading their `authProvider` from `'guest'` to `'linkedin'`.

**Current gap**: The existing `linkedinCallback` in `auth_controller.ts` rejects requests when an email already exists (duplicate account prevention). It has no logic to link LinkedIn credentials to an existing guest account.

**Implementation**:
- New endpoint that accepts an authenticated guest user's JWT
- Initiates or completes LinkedIn OAuth and attaches `linkedinId`, `linkedinUrl`, and `profilePhoto` to the existing user
- Updates `authProvider` from `'guest'` to `'linkedin'`
- Alternative approach: Modify the existing `linkedinCallback` to detect when the authenticated user is a guest and link instead of rejecting

**Request flow**:
1. Authenticated guest user calls `POST /api/auth/linkedin/link` (or is redirected through a linking-specific OAuth flow)
2. Backend exchanges LinkedIn auth code for profile data
3. Backend attaches LinkedIn fields to existing guest user document
4. Returns updated user profile + existing JWT remains valid

**Security**:
- Only users with `authProvider: 'guest'` can use this endpoint
- LinkedIn account must not already be linked to another user
- Validate JWT and confirm `req.user.userId` matches the account being linked

**Files to modify/create**:
- `src/controllers/auth_controller.ts` — add `linkLinkedIn` handler (or modify `linkedinCallback`)
- `src/routes/auth_routes.ts` — register new route
- `src/utils/linkedin_oauth.ts` — reuse existing LinkedIn API helpers

#### Task C: Connections Access Control for Guest Users

**Purpose**: Enforce that guest users cannot access their connections until they upgrade their account (walkthrough Sections 10.2, 10.5, 10.6).

**Options** (choose one):

**Option 1 — Backend enforcement (recommended)**:
- Add middleware or guard check on ParticipantConnection query routes
- If `req.user.authProvider === 'guest'`, return `403 Forbidden` with message: `"Upgrade your account to access connections"`
- Affected routes:
  - `GET /api/participantConnections/getByParticipantAndEvent`
  - `GET /api/participantConnections/getByUserEmailAndEvent`
- Creating connections is still allowed (connections are made during gameplay), only reading is restricted

**Option 2 — Frontend-only enforcement**:
- The user profile response already includes `authProvider`
- Frontend checks `authProvider === 'guest'` and shows the upgrade screen instead of connections
- No backend changes needed, but less secure (API still returns data if called directly)

**Implementation** (Option 1):
- Add a helper function `requireUpgradedAccount` in `src/middleware/` or inline in the controller
- Check user's `authProvider` field from the database (or from JWT payload if added)
- Return 403 with a descriptive error message for guest users

**Frontend Dependency**: Mobile app "Locked Connections" screen (walkthrough Section 10.5) routes to Account Upgrade Screen.

---

## Phase 1: Event Model Updates & Status API (Critical Priority)

These features are required for the mobile app to work without mock data. The mobile client depends on `gameType`, `eventImg`, and `currentState` enum values from the Event model, and polls for status transitions in the lobby.

### 1.1 Add `gameType` and `eventImg` to Event Model ✅ COMPLETE

**File**: `src/models/event_model.ts`

**Changes**:
```typescript
gameType: {
  type: String,
  enum: ['Name Bingo'],
  required: true
},
eventImg: {
  type: String,
  required: false
}
```

**Why**: Mobile renders `gameType` and `eventImg` from event data. Without these fields, the mobile app uses hardcoded fallbacks.

**Impact on existing endpoints**:
- `POST /api/events/createEvent` — accepts `gameType` (required) and `eventImg` (optional) in request body
- `GET /api/events/:eventId` and `GET /api/events/event/:joinCode` — automatically included in response

**Frontend Dependency**: Mobile event cards display game type badge and event image.

---

### 1.2 Add Event Status Enum to Event Model ✅ COMPLETE

**File**: `src/models/event_model.ts`

**Change**:
```typescript
// Before
currentState: { type: String, required: true }

// After
currentState: {
  type: String,
  enum: ['Upcoming', 'In Progress', 'Completed'],
  default: 'Upcoming',
  required: true
}
```

**Important**: These enum values match the mobile app's `EventState` enum exactly (title case with spaces):
- `"Upcoming"` — event created but not started
- `"In Progress"` — event is live, bingo game active
- `"Completed"` — event has ended

**Migration consideration**: Any existing events with free-form `currentState` values (e.g., `"pending"`, `"active"`) will need to be updated to match the new enum values. Check existing data before applying.

---

### 1.3 Event Status Transition API ✅ COMPLETE

**Endpoint**: `PUT /api/events/:eventId/status`

**Request Body**: `{ "status": "In Progress" }` or `{ "status": "Completed" }`

**Valid Transitions**:
- `Upcoming` → `In Progress` (host starts event)
- `In Progress` → `Completed` (host ends event)

**Security**:
- Protected route (requires auth)
- Verifies `event.createdBy === req.user.userId` (host only)

**Side Effects**:
- Emits Pusher `event-started` on channel `event-${eventId}` when transitioning to `In Progress` (payload: `{ status: 'In Progress' }`)
- Emits Pusher `event-ended` on channel `event-${eventId}` when transitioning to `Completed` (payload: `{ status: 'Completed' }`)

**Implementation**:
- Handler in `src/controllers/event_controller.ts` (`updateEventStatus`)
- Route in `src/routes/event_routes.ts`
- Validates transition is allowed (rejects invalid transitions with 400)
- Returns updated event

**Frontend Dependency**: Web dashboard Start/End buttons; mobile lobby polls for status change to transition into game.

---

## Phase 2: Real-time Game Events (High Priority)

### 2.1 Pusher Events for Game State

| Event | Channel | Payload | Trigger | Status |
|-------|---------|---------|---------|--------|
| `event-started` | `event-${eventId}` | `{ status: 'In Progress' }` | Host starts event (Phase 1.3) | ✅ Complete |
| `event-ended` | `event-${eventId}` | `{ status: 'Completed' }` | Host ends event (Phase 1.3) | ✅ Complete |
| `bingo-achieved` | `event-${eventId}` | `{ participantId, name, type: 'line' \| 'blackout' }` | Player completes line/blackout (future, if server-side game state is added) | Planned |

**Note**: `event-started` and `event-ended` were implemented as part of Phase 1.3. The `bingo-achieved` event is deferred until server-side game state tracking is implemented (Phase 6), since mobile currently handles win detection client-side.

---

## Phase 3: User & Event Management (Medium Priority)

### 3.1 User Profile APIs ✅ COMPLETE

**GET Endpoint**: `GET /api/users/:userId` ✅
- Returns user profile excluding `passwordHash`
- Protected route (requires auth)
- Located in `user_controller.ts` (`getUserById`)

**PUT Endpoint**: `PUT /api/users/:userId` ✅
- **Updatable Fields**: `name`, `email`, `password`, `bio`, `profilePhoto`, `socialLinks`
- **Security**: Protected, self-only (`req.user.userId === req.params.userId` → 403 otherwise)
- **Guest upgrade**: Setting a password upgrades `authProvider` from `'guest'` to `'local'`
- **Validation**: Email format + uniqueness, password >= 8 chars, name cannot be empty
- Located in `user_controller.ts` (`updateUser`), route in `user_route.ts`

---

### 3.2 Leave Event API

**Endpoint**: `POST /api/events/:eventId/leave`

**Logic**:
1. Find participant for `req.user.userId` + `eventId`
2. Verify user is not the host (hosts must delete, not leave)
3. Remove participant from `Event.participantIds`
4. Delete `Participant` document
5. Remove event from `User.eventHistoryIds`
6. Emit Pusher `participant-left` event

---

### 3.3 Delete/Cancel Event API

**Endpoint**: `DELETE /api/events/:eventId`

**Constraints**:
- Host only (`event.createdBy === req.user.userId`)
- Only when `status === 'Upcoming'` (before event starts)

**Cascade**:
- Delete all `Participant` documents for this event
- Delete the `Bingo` document
- Remove event from all users' `eventHistoryIds`

---

### 3.4 Event History API ✅ COMPLETE

**Endpoint**: `GET /api/users/:userId/events` (protected)

**Purpose**: MVP requirement from `feature_list.md` - "View Previous Events (static list of past events)"

**Response**:
```json
{
  "success": true,
  "events": [
    {
      "_id": "665a...",
      "name": "Tech Mixer",
      "description": "Monthly networking event",
      "joinCode": "12345678",
      "startDate": "2025-02-01T18:00:00.000Z",
      "endDate": "2025-02-01T21:00:00.000Z",
      "currentState": "Completed",
      "participantIds": [
        { "_id": "666b...", "name": "John Doe", "userId": "664f..." },
        { "_id": "666c...", "name": "Jane Smith", "userId": "664e..." }
      ]
    }
  ]
}
```

**Implementation**:
- Populates `eventHistoryIds` from the User document with nested populate on `participantIds`
- Each event includes participant data (`name`, `userId`) to enable loading participant connections
- Located in `user_controller.ts` (`getUserEvents`)

**Frontend Dependency**: Mobile app "Previous Events" tab (right navigation tab).

---

### 3.5 Get Current Event API

**Endpoint**: `GET /api/users/:userId/current-event`

**Purpose**: MVP requirement - "View Current Event" feature

**Response** (if user is in an active event):
```json
{
  "hasActiveEvent": true,
  "event": {
    "_id": "...",
    "eventName": "Tech Mixer",
    "status": "In Progress",
    "joinCode": "ABC123",
    "participantCount": 25,
    "role": "participant"
  }
}
```

**Response** (if no active event):
```json
{
  "hasActiveEvent": false,
  "event": null
}
```

**Logic**:
1. Query `Participant` collection for user's participation
2. Join with `Event` collection
3. Filter for `status` in ['Upcoming', 'In Progress']
4. Return most recent if multiple (edge case)

**Security**: Protected route, user can only query their own current event

**Frontend Dependency**: Mobile app needs this to determine if user should see event lobby or join screen.

---

## Phase 4: Validation (Medium Priority)

### 4.1 Zod Validation Schemas with Sanitization

**File**: `src/validation/schemas.ts`

**Schemas to Create**:
- `SignupSchema`, `LoginSchema`
- `CreateEventSchema`, `JoinEventSchema`
- `CreateBingoSchema`
- `UpdateProfileSchema`

**Input Sanitization** (add to all string fields):
```typescript
import { z } from 'zod';

// Sanitization helper
const sanitizeString = (str: string) => str.trim();

// Example schema with sanitization
const SignupSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeString),
  email: z.string().email().transform(s => s.toLowerCase().trim()),
  password: z.string().min(8).max(128)
});
```

**Middleware**: `src/middleware/validate.ts`
```typescript
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.issues });
  req.body = result.data;  // Use sanitized data
  next();
};
```

---

## Phase 5: Documentation Tasks ✅ COMPLETE

All documentation has been created and is located in `shatter-backend/docs/`.

### 5.1 API_REFERENCE.md ✅ COMPLETE
- Comprehensive endpoint documentation (1,164 lines)
- Covers all implemented endpoints with request/response examples, error codes, and auth requirements
- Located at `docs/API_REFERENCE.md`

### 5.2 REALTIME_EVENTS_GUIDE.md ✅ COMPLETE
- Pusher setup, channel naming, event payloads, client-side examples
- Located at `docs/REALTIME_EVENTS_GUIDE.md`

### 5.3 DATABASE_SCHEMA.md ✅ COMPLETE
- All collections with field definitions, indexes, relationships, and pre-save hooks
- Located at `docs/DATABASE_SCHEMA.md`

### 5.4 EVENT_LIFECYCLE.md ✅ COMPLETE
- State diagram, transition rules, side effects, frontend integration notes
- Located at `docs/EVENT_LIFECYCLE.md`

---

## Phase 6: Polish & Production Ready (Low Priority)

These are P3 tasks that improve UX and performance but aren't blocking for MVP. Includes tasks deferred from earlier phases because mobile handles them client-side.

### 6.1 Edit Bingo Square API

**Endpoint**: Extend `POST /api/bingo/:bingoId/fill-cell`

**Purpose**: Allow users to change already-filled cells (fix mistakes).

**Logic**:
- If cell already filled, allow changing the assigned person
- Re-run line detection after change
- Could decrease `completedLines` if editing breaks a line
- Optional: Add event config `allowCellEditing: boolean`

**Frontend Dependency**: Mobile app cell tap on filled cell shows edit option.

---

### 6.2 Prevent Duplicate Person Assignments (Server-side)

**Purpose**: Game rule validation (configurable per event). Mobile already handles this client-side for MVP.

**Implementation**:
- Add to Bingo model: `allowDuplicateAssignments: boolean` (default: true)
- If false, validate `matchedParticipantId` not already used in another cell
- Return 400 error: "You've already assigned {name} to another square"

---

### 6.3 Bingo Leaderboard API

**Endpoint**: `GET /api/events/:eventId/bingo/leaderboard`

**Purpose**: Show who completed lines/blackout first. Requires server-side game state (Phase 6.6).

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "participantId": "...",
      "name": "Alice",
      "linesCompleted": 3,
      "blackoutAchieved": true,
      "blackoutAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**Logic**:
- Aggregate all `PlayerBingoState` for the event
- Sort by: `blackoutAchieved` (true first), then `blackoutAt` (earliest first), then `completedLines` (most first)

**Frontend Dependency**: Optional leaderboard display during/after game.

---

### 6.4 Database Indexes for Performance

**Purpose**: Optimize queries for scale.

**Indexes to Create**:

| Collection | Index | Type |
|------------|-------|------|
| `events` | `joinCode` | unique |
| `events` | `currentState` | regular |
| `events` | `createdBy` | regular |
| `participants` | `(eventId, name)` | compound, unique (case-insensitive collation) |
| `participants` | `eventId` | regular |
| `users` | `email` | unique |
| `users` | `contactLink` | unique, sparse |
| `users` | `linkedinUrl` | unique, sparse |

**Implementation**: Add to model definitions or create migration script.

---

### 6.5 Participant Search API (Deferred from Phase 1)

**Note**: Deferred because the mobile app gets participant names from the event's `participantIds` array (populated on `GET /api/events/:eventId`). A dedicated search endpoint is a nice-to-have for large events but not required for MVP.

**Endpoint**: `GET /api/events/:eventId/participants/search`

**Query Params**: `?name=<partial_name>`

**Purpose**: Enable fuzzy name matching for the bingo cell-filling modal (see `bingo_walkthrough.md` Section 7.1).

**Requirements**:
- Case-insensitive search on `Participant.name`
- Support partial matches (e.g., "joh" matches "John", "Johnny")
- Return max 10 results
- **Include profilePhoto in response** (per bingo_walkthrough 7.1)
- Response: `{ participants: [{ _id, name, profilePhoto }] }`

**Implementation**:
- Create `src/controllers/participant_controller.ts`
- Create `src/routes/participant_routes.ts`
- Mount at `/api/participants` in `app.ts`
- Use MongoDB `$regex` with `'i'` flag for case-insensitive matching
- Join with User collection to get `profilePhoto`

**Frontend Dependency**: Mobile app "Who did you find?" modal — currently uses in-memory filtering of participant list.

---

### 6.6 PlayerBingoState Model (Deferred from Phase 1)

**Note**: Deferred because mobile handles all bingo game state client-side via AsyncStorage for MVP. Server-side state tracking becomes important post-MVP for leaderboards, analytics, and cross-device sync.

**File**: `src/models/player_bingo_state_model.ts`

**Schema**:
```typescript
{
  eventId: ObjectId,           // ref: Event
  bingoId: string,             // ref: Bingo
  participantId: ObjectId,     // ref: Participant (the player)
  filledCells: [{
    row: number,
    col: number,
    matchedParticipantId: ObjectId | null,  // null for free-text entries
    matchedName: string,
    filledAt: Date
  }],
  completedLines: number,
  firstBingoAt: Date | null,
  blackoutAt: Date | null,
  isLocked: boolean
}
```

**Bingo Model Enhancements** (add to existing `bingo_model.ts`):
```typescript
{
  // Existing fields...
  gridSize: {
    type: Number,
    enum: [3, 4, 5],
    default: 5,
    required: true
  },
  prompts: [{
    text: String,        // Full prompt text
    shortText: String    // Abbreviated version (e.g., "Has dog")
  }],
  allowFreeTextEntry: {
    type: Boolean,
    default: false      // Allow typing names not in participant list
  },
  allowDuplicateAssignments: {
    type: Boolean,
    default: true
  }
}
```

**Indexes**:
- Compound unique index on `(eventId, participantId)`

---

### 6.7 Cell Fill API (Deferred from Phase 1)

**Note**: Deferred because mobile manages cell fills locally via AsyncStorage for MVP.

**Endpoint**: `POST /api/bingo/:bingoId/fill-cell`

**Request Body**:
```json
{
  "participantId": "player's participant ID",
  "row": 0,
  "col": 2,
  "matchedParticipantId": "matched person's participant ID",
  "matchedName": "John Doe"
}
```

**Logic**:
1. Validate player is in the event
2. If `matchedParticipantId` provided, validate matched participant exists in event
3. If `matchedParticipantId` is null, verify `allowFreeTextEntry` is true
4. Check cell not already filled
5. Update `PlayerBingoState.filledCells`
6. Run line detection (rows, columns, diagonals)
7. Check for blackout (all cells filled)
8. Record `firstBingoAt` on first line completion
9. Record `blackoutAt` on blackout
10. Emit Pusher event `bingo-achieved` if line/blackout

---

### 6.8 Get Player Bingo State API (Deferred from Phase 1)

**Note**: Deferred because mobile uses AsyncStorage for game state persistence for MVP.

**Endpoint**: `GET /api/bingo/:bingoId/state/:participantId`

**Response**:
```json
{
  "gridSize": 5,
  "grid": [
    [{"text": "Has a dog", "shortText": "Has dog"}]
  ],
  "filledCells": [{ "row": 0, "col": 1, "matchedName": "John", "matchedParticipantId": "..." }],
  "completedLines": 0,
  "firstBingoAt": null,
  "blackoutAt": null,
  "isLocked": false,
  "allowFreeTextEntry": false
}
```

---

### 6.9 Error Handling Middleware

**File**: `src/middleware/error_handler.ts`

**Purpose**: Consistent error responses across all endpoints.

**Implementation**:
```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default
  res.status(500).json({ error: 'Internal server error' });
};
```

**Mount in `app.ts`**: `app.use(errorHandler)` after all routes.

---

### 6.10 Rate Limiting Middleware

**File**: `src/middleware/rate_limiter.ts`

**Purpose**: Protect against brute force attacks and API abuse (feature_list.md "Wants")

**Implementation**:
```typescript
import rateLimit from 'express-rate-limit';

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,                   // 100 requests per minute
  message: { error: 'Too many requests, please slow down' }
});
```

**Installation**:
```bash
npm install express-rate-limit
npm install -D @types/express-rate-limit
```

---

### 6.11 Organizer Analytics Endpoints (Low Priority / Future)

**Reference**: `feature_list.md` "Wants" section — "Organizer Analytics endpoints"

**Purpose**: Provide organizers with event analytics such as attendance count, average engagement, and participation stats.

**Potential Endpoints**:
- `GET /api/events/:eventId/analytics` — Returns event-level analytics (protected, host only)
  - Participant count, bingo completion rates, average lines completed, blackout count
  - Connection counts, most-connected participants
  - Time-based metrics (average time to first bingo, event duration)

**Implementation Notes**:
- Aggregate data from `Participant`, `PlayerBingoState`, and `ParticipantConnection` collections
- Consider caching analytics results for ended events (data won't change)
- Low priority — not blocking MVP

**Frontend Dependency**: Web organizer dashboard "Event Summary Page" and analytics views.

---

## Sprint Recommendations

### Sprint 1: Event Model Updates & Status API ✅ COMPLETE
- ~~Task 1.1: Add `gameType` and `eventImg` to Event model~~ ✅
- ~~Task 1.2: Add `currentState` enum (`Upcoming`, `In Progress`, `Completed`)~~ ✅
- ~~Task 1.3: Event Status Transition API (`PUT /api/events/:eventId/status`)~~ ✅

### Sprint 2: Guest Account Upgrades & Real-time
- Task 0.3B: LinkedIn Account Linking for Guest Users
- Task 0.3C: Connections Access Control for Guests
- ~~Task 2.1: Pusher game events (`event-started`, `event-ended`)~~ ✅ Implemented as part of Phase 1.3

### Sprint 3: Event Management
- ~~Task 3.1: User Profile APIs (GET and PUT)~~ ✅ Complete
- Task 3.2: Leave Event API
- Task 3.3: Delete/Cancel Event API
- ~~Task 3.4: Event History API~~ ✅ Complete
- Task 3.5: Get Current Event API

### Sprint 4: Validation
- Task 4.1: Zod Validation Schemas with Sanitization
- ~~Documentation tasks (5.1-5.4)~~ ✅ Complete

### Sprint 5: Server-side Game State & Polish (if needed post-MVP)
- Task 6.5: Participant Search API
- Task 6.6: PlayerBingoState Model
- Task 6.7: Cell Fill API
- Task 6.8: Get Player Bingo State API
- Task 6.1: Edit Bingo Square
- Task 6.2: Prevent Duplicate Assignments (server-side)
- Task 6.3: Bingo Leaderboard
- Task 6.4: Database Indexes
- Task 6.9: Error Handling Middleware
- Task 6.10: Rate Limiting Middleware
- Task 6.11: Organizer Analytics Endpoints

---

## Dependencies to Install

```bash
# Authentication - Already installed: bcryptjs, jsonwebtoken, axios (for LinkedIn OAuth)
# No passport needed - LinkedIn OAuth uses custom implementation with axios

# Validation
npm install zod

# Rate Limiting
npm install express-rate-limit
npm install -D @types/express-rate-limit
```

---

## Data Model Summary

### User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email?: string (unique, sparse index),       // optional for guest users
  passwordHash?: string (select: false),
  linkedinId?: string (unique, sparse index),   // LinkedIn subject ID
  linkedinUrl?: string (unique, sparse index),
  authProvider: 'local' | 'linkedin' | 'guest' (default: 'local'),
  bio?: string,
  profilePhoto?: string,
  socialLinks?: {
    linkedin?: string,
    github?: string,
    other?: string
  },
  lastLogin?: Date,
  passwordChangedAt?: Date,
  eventHistoryIds: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### AuthCode Collection (temporary, auto-expiring)
```typescript
{
  _id: ObjectId,
  code: string (unique, indexed),
  userId: ObjectId (ref: User),
  createdAt: Date (TTL: 60 seconds)
}
```

### Event Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  createdBy: ObjectId (ref: User),
  joinCode: string (unique),
  currentState: 'Upcoming' | 'In Progress' | 'Completed' (default: 'Upcoming'),
  gameType: 'Name Bingo' (required),
  eventImg?: string,
  startDate: Date,
  endDate: Date,
  maxParticipant: number,
  participantIds: ObjectId[] (ref: Participant),
  createdAt: Date,
  updatedAt: Date
}
```

### Participant Collection
```typescript
{
  _id: ObjectId,
  eventId: ObjectId (ref: Event, required),
  userId: ObjectId | null (ref: User, default: null),  // nullable, not required
  name: string (required)
}
// Index: (eventId, name) compound unique with case-insensitive collation
// Note: duplicate names get an automatic #XXX suffix (e.g., "John#472") instead of being rejected
// Note: no role or joinedAt fields in current model
```

### Bingo Collection
```typescript
{
  _id: string (auto-generated, e.g. "bingo_xxxxxxxx"),
  _eventId: ObjectId (ref: Event, required),
  description?: string,
  grid?: string[][] (2D string array)
}
// Note: gridSize, prompts, allowFreeTextEntry, allowDuplicateAssignments are planned for Phase 6
```

### ParticipantConnection Collection ✅ IMPLEMENTED
```typescript
{
  _id: string (auto-generated, e.g. "participantConnection_xxxxxxxx"),
  _eventId: ObjectId (ref: Event, required),
  primaryParticipantId: ObjectId (ref: Participant, required),
  secondaryParticipantId: ObjectId (ref: Participant, required),
  description?: string
}
// Duplicate prevention: checked via query on (_eventId, primaryParticipantId, secondaryParticipantId)
```

### PlayerBingoState Collection (Planned — Phase 6)
```typescript
{
  _id: ObjectId,
  eventId: ObjectId (ref: Event),
  bingoId: ObjectId (ref: Bingo),
  participantId: ObjectId (ref: Participant),
  filledCells: [{
    row: number,
    col: number,
    matchedParticipantId: ObjectId | null,
    matchedName: string,
    filledAt: Date
  }],
  completedLines: number,
  firstBingoAt: Date | null,
  blackoutAt: Date | null,
  isLocked: boolean
}
// Index: (eventId, participantId) compound unique
```

---

## API Summary

### Authentication
```
POST   /api/auth/signup               - Email/password OR contact link signup
POST   /api/auth/login                - Email/password login
GET    /api/auth/linkedin             - Initiate LinkedIn OAuth ✅
GET    /api/auth/linkedin/callback    - LinkedIn OAuth callback ✅
POST   /api/auth/exchange             - Exchange auth code for JWT ✅
POST   /api/auth/linkedin/link        - Link LinkedIn to existing guest account (protected, guest only)
GET    /api/users/me                  - Get current user (protected)
```

### Users
```
GET    /api/users/:userId             - Get user profile ✅
PUT    /api/users/:userId             - Update user profile (protected, self only) ✅
GET    /api/users/:userId/events      - Get user's event history (protected) ✅
GET    /api/users/:userId/current-event - Get user's active event (protected)
```

### Events
```
POST   /api/events                    - Create event (protected)
POST   /api/events/join               - Join event with joinCode (protected)
GET    /api/events/:eventId           - Get event details
PUT    /api/events/:eventId/status    - Update event status (protected, host only)
POST   /api/events/:eventId/leave     - Leave event (protected)
DELETE /api/events/:eventId           - Cancel event (protected, host only, Upcoming only)
GET    /api/events/:eventId/participants/search - Search participants (protected, Phase 6)
```

### Participant Connections ✅ IMPLEMENTED
```
POST   /api/participantConnections                        - Create connection by participant IDs (protected) ✅
POST   /api/participantConnections/by-emails              - Create connection by user emails (protected) ✅
DELETE /api/participantConnections/delete                  - Delete connection (protected) ✅
GET    /api/participantConnections/getByParticipantAndEvent - Get connections by participant & event (protected) ✅
GET    /api/participantConnections/getByUserEmailAndEvent   - Get connections by user email & event (protected) ✅
```

### Name Bingo (Phase 6 — server-side game state)
```
GET    /api/bingo/:bingoId/state/:participantId - Get player's board state (protected)
POST   /api/bingo/:bingoId/fill-cell            - Fill a cell (protected)
GET    /api/events/:eventId/bingo/leaderboard   - Get leaderboard (protected)
```

----------------
personal notes from last meeting

0.3 - Task B - Linkedin Account linking for guest users
0.3 - Task C - Connection acess control for gues users 
after conversation with minh and keeryn, this would only be done on frontend

--------
leave event
delete/cancel event
get current event api

---------
speak with Jason about web implementation of event status on web
