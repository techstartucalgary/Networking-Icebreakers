# Shatter Backend

Backend API for **Shatter**, a networking and icebreaker platform that helps facilitate engaging social interactions at events. Participants join events via QR code or join code and play icebreaker games, while organizers manage events through a web dashboard.

**Built with:** Node.js &middot; TypeScript &middot; Express &middot; MongoDB &middot; Pusher

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- npm

### Setup

```bash
git clone https://github.com/techstartucalgary/Networking-Icebreakers.git
cd Networking-Icebreakers/shatter-backend
npm i
```

Create a `.env` file in `shatter-backend/` with the following variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random 32-character string for signing tokens |
| `JWT_EXPIRATION` | Token expiry duration (default: `30d`) |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth app client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth app client secret |
| `LINKEDIN_CALLBACK_URL` | LinkedIn OAuth callback URL |
| `CORS_ORIGINS` | Comma-separated allowed origins (optional, allows all if unset) |
| `PUSHER_APP_ID` | Pusher app ID for real-time events |
| `PUSHER_KEY` | Pusher key |
| `PUSHER_SECRET` | Pusher secret |
| `PUSHER_CLUSTER` | Pusher cluster (e.g. `us2`) |

### Run

```bash
npm run dev
```

The server starts at `http://localhost:4000`.

## Project Structure

```
src/
├── server.ts          # Entry point: env validation, DB connection, server start
├── app.ts             # Express config, CORS, route mounting
├── controllers/       # Route handlers (auth, users, events, bingo, connections, leaderboard)
├── middleware/         # JWT auth middleware
├── models/            # Mongoose schemas (User, Event, Participant, Bingo, etc.)
├── routes/            # Express route definitions
├── utils/             # JWT, password hashing, Pusher client, LinkedIn OAuth
└── types/             # TypeScript type declarations
```

All routes are prefixed with `/api`. See the [API Reference](docs/API_REFERENCE.md) for full endpoint documentation.

## Documentation

| Guide | Description |
|---|---|
| [API Reference](docs/API_REFERENCE.md) | Full endpoint documentation with request/response examples |
| [Database Schema](docs/DATABASE_SCHEMA.md) | MongoDB collections, fields, indexes, and relationships |
| [Event Lifecycle](docs/EVENT_LIFECYCLE.md) | Event state machine and transition rules |
| [Real-Time Events](docs/REALTIME_EVENTS_GUIDE.md) | Pusher channel and event reference |
| [Route Protection](docs/ROUTE_PROTECTION_GUIDE.md) | How to add JWT auth to new routes |
| [Bingo Walkthrough](docs/bingo_walkthrough.md) | Bingo game implementation details |
| [Feature List](docs/feature_list.md) | Feature overview and status |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload (port 4000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the production build |

## Contributing

- Don't push directly to `main`. Create a feature branch and open a pull request
- Use [Postman](https://www.postman.com/) to test API endpoints locally
