import Event, { EventState, GameType } from "@/src/interfaces/Event";
import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import NamesByEventIdResponse from "@/src/interfaces/responses/GetNamesByEventIdResponse";

const API_BASE_URL: string = '/api/games'

const mockEvents: Event[] = [
  {
    eventId: "evt-001",
    name: "Tech Networking Night",
    description: "Meet professionals in software, product, and design.",
    joinCode: "2E5R",
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
    joinCode: "2W6T",
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

const mockCategories: string[] = [
  "Speaks 3 or more languages",
  "Has traveled to 5+ countries",
  "Works in the health sector",
  "Has run a marathon",
  "Plays a musical instrument",
  "Has started a side business",
  "Volunteers regularly",
  "Has met a celebrity",
  "Loves coffee more than tea",
];

export async function GetNamesByEventIdApi(eventId: string): Promise<NamesByEventIdResponse | undefined> {
    //TODO: Remove mock data call
    try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const foundEvent = mockEvents.find((event) => event.eventId === eventId);
    if (!foundEvent) return undefined;

    const names = foundEvent.participants.map((p) => p.username);

    return { success: true, names };
  } catch (error) {
    console.log("Error fetching names by event ID:", error);
    return undefined;
  }

  /*
  try{
      const response: AxiosResponse<NamesByEventIdResponse> = await axios.get(`${API_BASE_URL}/game/${eventId}`);
      return response.data;
  }catch(error){
      console.log('Error', error);
  }
  */
}

export async function GetBingoCategoriesApi(eventId: string): Promise<BingoCategoriesResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        return {
        success: true,
        categories: mockCategories,
        };
    } catch (error) {
        console.log("Error fetching bingo categories:", error);
        return undefined;
    }

    /*
    try{
        const response: AxiosResponse<BingoCategoriesResponse> = await axios.get(`${API_BASE_URL}/game/bingo/${eventId}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}