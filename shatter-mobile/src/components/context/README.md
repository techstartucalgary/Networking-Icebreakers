# Overview

The app uses two global providers:

- **AuthProvider** → Manages user authentication and guest state.
- **GameProvider** → Manages per-event game state and participant tracking.

---

# AuthContext

`AuthContext` is the single source of truth for:

- Logged-in users
- Guest users
- Access tokens
- Persisted authentication state

It allows any component in the app to access authentication data using:

```ts
import { useAuth } from "@/src/context/AuthContext";

const { user, authenticate, logout } = useAuth();
```

## What It Stores

`user: User | undefined`: Represents the currently active user (authenticated or guest).If undefined, no user is currently authenticated.

- _id
- name
- email (if registered)
- isGuest
- socialLinks

`authStorage: AuthDataStorage`: Represents the persisted authentication data stored in AsyncStorage. This is the raw storage representation separate from the User object.

```ts
type AuthDataStorage = {
  userId: string | null;
  accessToken: string;
  isGuest: boolean;
  guestInfo: {
    name: string;
    socialLinks: SocialLink[];
  };
};
```

## AuthContext Lifecycle

### App Startup

On mount:
- getStoredAuth() loads persisted authentication data.
- **If the user is registered**: Fetches latest user info from backend via userFetch.
- **If the user is a guest**: Reconstructs the user from stored guest info.
- Sets in-memory user state.

This ensures:
- Registered users stay logged in.
- Guests remain guests across sessions.
- Fresh backend data is loaded for authenticated users.

## AuthContext Methods

`authenticate(user, accessToken, isGuest)`: Sets in-memory user, storing the userId, accessToken, isGuest, Guest fallback info, and persists that to AsyncStorage. This ensures authentication survives app reloads.

Used when:
- User signs up
- User logs in
- User joins an event as a registered account

`continueAsGuest(name, socialLink)`: Used when a user creates a guest profile. Guests do not receive access tokens, so cannot use authenticate.

What it does:
- Creates a temporary guest User
- Stores minimal identity info
- Saves guest data in AsyncStorage
- Sets isGuest = true

This allows:
- Event participation without registration
- Profile persistence between sessions

`updateUser(updates)`: Used on the Profile page.

What it does:

- Updates only the in-memory `user`
- Merges partial updates
- Returns updated user object

`logout()`: Used when a user logs out.

What it does:
- Clears `user`
- Resets `authStorage` to defaults
- Calls `AsyncStorage.clear()`

After logout
- No local user data can be restored
- User must authenticate again

---

# GameContext

## Purpose

`GameContext` manages:

- Active event game state
- Participant ID tracking
- Game progress
- Persistent per-event game data

Accessed via:

```ts
import { useGame } from "@/src/context/GameContext";

const { gameState, setGameData } = useGame();
```

---

# Game State Structure

```ts
type GameState = {
  gameType: GameType;
  eventId: string;
  loading: boolean;
  data: any;
  status: string | null;
  progress: EventState;
};
```

### Fields

- `gameType` → The type of game (e.g., `NAME_BINGO`)
- `eventId` → Event associated with the game
- `loading` → True while restoring from storage
- `data` → Game-specific data (cards, prompts, scores, etc.)
- `status` → Optional state like `"Bingo!"` or `"Completed"`
- `progress` → EventState (`UPCOMING`, `ACTIVE`, `COMPLETED`)

---

# GameContext Persistence Model

Each game state is stored using a unique key:

```
game-{gameType}-{eventId}
```

Example:

```
game-NAME_BINGO-12345
```

This ensures:

- Multiple events do not conflict
- Multiple game types per event can coexist
- Progress is restored per specific event + game combination

Additionally, the current participant ID is stored under:

```
current-participant-id
```

---

# GameContext Methods

`initializeGame(gameType, eventId, eventProgress, initialData?)`: Called when entering a game.

What it does:

1. Sets initial state.
2. Attempts to load persisted game state.
3. Overrides initial state if saved data exists.
4. Sets `loading = false` when complete.

This ensures players can refresh the app without losing progress.

---

`setCurrentParticipantId(id)`: Used to track the active participant within an event.

- Updates in-memory participant ID
- Persists it to AsyncStorage

---

`setGameData(data)`

- Updates `gameState.data`
- Persists full game state to AsyncStorage

Used for:
- Updating bingo cards
- Saving scores
- Tracking prompts
- Any game-specific content

---

`setGameStatus(status)`

- Updates `gameState.status`
- Persists state

Used for:

- `"Bingo!"`
- `"Completed"`
- Any terminal state indicator

---

`setGameProgress(progress)`: Ensures UI remains consistent across reloads.

- Updates event progress (`UPCOMING`, `ACTIVE`, `COMPLETED`)
- Persists state

---

`resetGame()`
- Removes stored game state for current event/game
- Clears `data`
- Clears `status`

Used when:

- Restarting a game
- Leaving an event
- Clearing progress intentionally

---