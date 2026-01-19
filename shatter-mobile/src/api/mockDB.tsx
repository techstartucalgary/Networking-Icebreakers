import EventIB, { EventState, GameType } from "@/src/interfaces/Event";


export const mockEvents: EventIB[] = [
  {
    eventId: "evt-001",
    name: "Tech Networking Night",
    description: "Meet professionals in software, product, and design.",
    joinCode: "12345678",
    startDate: "2025-01-20T18:00:00Z",
    endDate: "2025-01-20T20:00:00Z",
    maxParticipants: 50,
    participants: [
      { userId: "u001", username: "Alice" },
      { userId: "u002", username: "Bob" },
      { userId: "u003", username: "Charlie" },
    ],
    currentState: EventState.IN_PROGRESS,
    createdBy: "user-001",
    createdAt: "2025-01-01T12:00:00Z",
    updatedAt: "2025-01-05T09:30:00Z",
    eventImg: "https://images.unsplash.com/photo-1675716921224-e087a0cca69a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gameType: GameType.NAME_BINGO,
  },
  {
    eventId: "evt-002",
    name: "Startup Pitch Mixer",
    description: "Founders pitch ideas and connect with investors.",
    joinCode: "87654321",
    startDate: "2025-02-02T17:30:00Z",
    endDate: "2025-02-02T19:30:00Z",
    maxParticipants: 100,
    participants: [
      { userId: "u004", username: "David" },
      { userId: "u005", username: "Eve" },
    ],
    currentState: EventState.UPCOMING,
    createdBy: "user-002",
    createdAt: "2025-01-10T15:45:00Z",
    updatedAt: "2025-01-10T15:45:00Z",
    eventImg: "https://images.unsplash.com/photo-1580894732930-0babd100d356?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gameType: GameType.NAME_BINGO,
  },
];