# Shatter Backend — Database Schema Reference

**Last updated:** 2026-03-01
**Database:** MongoDB with Mongoose ODM
**Collections:** 6

---

## Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│  Users   │◄──────│ Participant │──────►│  Events  │
│          │ userId│  (junction) │eventId│          │
└──────────┘       └──────┬──────┘       └────┬─────┘
     │                    │                   │
     │ eventHistoryIds    │ participantIds     │
     │ (refs Event)       │ (refs Participant) │
     │                    │                   │
     │              ┌─────┴──────────┐   ┌────┴─────┐
     │              │ Participant    │   │  Bingo   │
     │              │ Connection     │   │          │
     │              └────────────────┘   └──────────┘
     │
     │              ┌────────────────┐
     └──────────────│   AuthCode     │
       userId       │  (TTL: 60s)   │
                    └────────────────┘
```

- **User ↔ Event** is a many-to-many relationship via the **Participant** junction table
- Each **Event** can have one **Bingo** game
- **ParticipantConnection** links two participants within the same event
- **AuthCode** is a temporary, single-use token linking to a User (auto-deleted after 60s)

---

## 1. Users Collection

**Model name:** `User`
**Collection:** `users`
**Source:** `src/models/user_model.ts`

### Fields

| Field              | Type              | Required | Default    | Notes |
|--------------------|-------------------|----------|------------|-------|
| `_id`              | ObjectId          | Auto     | Auto       | MongoDB default |
| `name`             | String            | Yes      | —          | Trimmed |
| `email`            | String            | No       | —          | Unique (sparse), lowercase, trimmed, regex-validated |
| `passwordHash`     | String            | No       | —          | `select: false` — excluded from queries by default |
| `linkedinId`       | String            | No       | —          | Unique (sparse) |
| `linkedinUrl`      | String            | No       | —          | Unique (sparse) |
| `bio`              | String            | No       | —          | Trimmed |
| `profilePhoto`     | String            | No       | —          | |
| `socialLinks`      | Object            | No       | —          | `{ linkedin?: String, github?: String, other?: String }` |
| `authProvider`     | String (enum)     | Yes      | `'local'`  | One of: `'local'`, `'linkedin'`, `'guest'` |
| `lastLogin`        | Date              | No       | `null`     | |
| `passwordChangedAt`| Date              | No       | `null`     | |
| `eventHistoryIds`  | [ObjectId]        | No       | `[]`       | Refs `Event` |
| `createdAt`        | Date              | Auto     | Auto       | Mongoose timestamps |
| `updatedAt`        | Date              | Auto     | Auto       | Mongoose timestamps |

### Indexes

| Fields            | Type           | Notes |
|-------------------|----------------|-------|
| `email`           | Unique, sparse | Allows multiple `null` values (guests) |
| `linkedinId`      | Unique, sparse | |
| `linkedinUrl`     | Unique, sparse | |

### Pre-Save Hooks

1. **Password requirement check:** If `authProvider` is `'local'` and `passwordHash` is missing, throws `"Password required for local authentication"`
2. **Password change tracking:** If `passwordHash` is modified on an existing document, auto-sets `passwordChangedAt` to current date

### Key Behaviors

- `passwordHash` is excluded from all queries by default. Use `.select('+passwordHash')` only when verifying passwords.
- Email uses a sparse unique index, allowing multiple users with `null` email (guest accounts).
- Guest users can upgrade to `local` auth by setting a password via the update endpoint.

---

## 2. Events Collection

**Model name:** `Event`
**Collection:** `events`
**Source:** `src/models/event_model.ts`

### Fields

| Field            | Type       | Required | Default | Notes |
|------------------|------------|----------|---------|-------|
| `_id`            | ObjectId   | Auto     | Auto    | |
| `name`           | String     | Yes      | —       | |
| `description`    | String     | Yes      | —       | |
| `joinCode`       | String     | Yes      | —       | Unique, auto-generated 8-digit number |
| `startDate`      | Date       | Yes      | —       | |
| `endDate`        | Date       | Yes      | —       | Must be after `startDate` |
| `maxParticipant` | Number     | Yes      | —       | |
| `participantIds` | [ObjectId] | No       | `[]`    | Refs `Participant` |
| `currentState`   | String     | Yes      | —       | Free-form string (no enum validation) |
| `createdBy`      | ObjectId   | Yes      | —       | User who created the event (no ref set) |
| `createdAt`      | Date       | Auto     | Auto    | Mongoose timestamps |
| `updatedAt`      | Date       | Auto     | Auto    | Mongoose timestamps |

### Indexes

| Fields     | Type   | Notes |
|------------|--------|-------|
| `joinCode` | Unique | |

### Pre-Save Hooks

1. **Date validation:** If `endDate <= startDate`, throws `"endDate must be after startDate"`

---

## 3. Participants Collection

**Model name:** `Participant`
**Collection:** `participants`
**Source:** `src/models/participant_model.ts`

**Purpose:** Junction table linking Users to Events (many-to-many).

### Fields

| Field     | Type     | Required | Default | Notes |
|-----------|----------|----------|---------|-------|
| `_id`     | ObjectId | Auto     | Auto    | |
| `userId`  | ObjectId | No       | `null`  | Refs `User`. Nullable for legacy reasons |
| `name`    | String   | Yes      | —       | Display name in the event |
| `eventId` | ObjectId | Yes      | —       | Refs `Event` |

### Indexes

| Fields             | Type   | Notes |
|--------------------|--------|-------|
| `(eventId, name)`  | Unique | Case-insensitive collation (`locale: "en", strength: 2`) |

### Key Behaviors

- The compound unique index on `(eventId, name)` is case-insensitive, so "John" and "john" are treated as the same name within an event.
- No timestamps are enabled on this model.

---

## 4. Bingo Collection

**Model name:** `Bingo`
**Collection:** `bingos`
**Source:** `src/models/bingo_model.ts`

### Fields

| Field         | Type       | Required | Default | Notes |
|---------------|------------|----------|---------|-------|
| `_id`         | String     | Auto     | Auto    | Custom: `bingo_<8 random chars>` |
| `_eventId`    | ObjectId   | Yes      | —       | Refs `Event` |
| `description` | String     | No       | —       | |
| `grid`        | [[String]] | No       | —       | 2D array of strings |

### Pre-Save Hooks

1. **ID generation:** If `_id` is not set, generates `bingo_` + 8 random alphanumeric characters

### Options

- `versionKey: false` — no `__v` field on documents

---

## 5. ParticipantConnection Collection

**Model name:** `ParticipantConnection`
**Collection:** `participantconnections`
**Source:** `src/models/participant_connection_model.ts`

### Fields

| Field                    | Type     | Required | Default | Notes |
|--------------------------|----------|----------|---------|-------|
| `_id`                    | String   | Auto     | Auto    | Custom: `participantConnection_<8 random chars>` |
| `_eventId`               | ObjectId | Yes      | —       | Refs `Event` |
| `primaryParticipantId`   | ObjectId | Yes      | —       | Refs `Participant` |
| `secondaryParticipantId` | ObjectId | Yes      | —       | Refs `Participant` |
| `description`            | String   | No       | —       | e.g., the bingo question they connected with |

### Pre-Save Hooks

1. **ID generation:** If `_id` is not set, generates `participantConnection_` + 8 random alphanumeric characters

### Options

- `versionKey: false` — no `__v` field on documents

### Key Behaviors

- Duplicate prevention is handled at the application level (controller checks for existing connection with same `_eventId` + `primaryParticipantId` + `secondaryParticipantId`), not via a database index.

---

## 6. AuthCode Collection

**Model name:** `AuthCode`
**Collection:** `authcodes`
**Source:** `src/models/auth_code_model.ts`

**Purpose:** Single-use authorization codes for the LinkedIn OAuth flow.

### Fields

| Field       | Type     | Required | Default    | Notes |
|-------------|----------|----------|------------|-------|
| `_id`       | ObjectId | Auto     | Auto       | |
| `code`      | String   | Yes      | —          | Unique, indexed |
| `userId`    | ObjectId | Yes      | —          | Refs `User` |
| `createdAt` | Date     | Auto     | `Date.now` | TTL: auto-deleted after 60 seconds |

### Indexes

| Fields | Type   | Notes |
|--------|--------|-------|
| `code` | Unique | Also has explicit index |

### Key Behaviors

- **TTL (Time-To-Live):** Documents are automatically deleted by MongoDB 60 seconds after `createdAt`. This ensures auth codes are short-lived.
- **Single-use:** The exchange endpoint uses `findOneAndDelete` to atomically consume the code.
- No timestamps option — uses manual `createdAt` for TTL.
