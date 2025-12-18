import Event, { EventState, GameType } from "@/src/interfaces/Event";
import GetAllEventsResponse from "@/src/interfaces/responses/GetAllEventsResponse";
import EventJoinCodeResponse from "@/src/interfaces/responses/GetEventByCodeResponse";

const API_BASE_URL: string = '/api/events'

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

export async function GetEventByCodeApi(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const foundEvent = mockEvents.find(
        (event) => event.joinCode?.toLowerCase() === joinCode.toLowerCase()
        );

        if (!foundEvent) return undefined;

        return { success: true, event: foundEvent };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<EventJoinCodeResponse> = await axios.get(`${API_BASE_URL}/event/${joinCode}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}

export async function GetEventByIdApi(eventId: string): Promise<EventJoinCodeResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const foundEvent = mockEvents.find((event) => event.eventId === eventId);

        if (!foundEvent) return undefined;

        return { success: true, event: foundEvent };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<EventIdResponse> = await axios.get(`${API_BASE_URL}/event/id/${eventId}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}

export async function GetAllEventsApi(): Promise<GetAllEventsResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        return { events: mockEvents };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<GetAllEventsResponse> = await axios.get(`${API_BASE_URL}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
  */
}