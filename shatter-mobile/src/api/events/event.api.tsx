import Event, { EventState } from "@/src/interfaces/Event";
import GetAllEventsResponse from "@/src/interfaces/responses/GetAllEventsResponse";
import EventJoinCodeResponse from "@/src/interfaces/responses/GetEventByCodeResponse";

const API_BASE_URL: string = '/api/events'

export async function GetEventByCodeApi(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    //TODO: Remove mock data call
    try {
        const mockEvents: Event[] = [
        {
            eventId: "evt-001",
            name: "Tech Networking Night",
            description: "Meet professionals in software, product, and design.",
            joinCode: "2E5R",
            startDate: "2025-01-20T18:00:00Z",
            endDate: "2025-01-20T20:00:00Z",
            maxParticipants: 50,
            participants: [],
            currentState: EventState.IN_PROGRESS,
            createdBy: "user-001",
            createdAt: "2025-01-01T12:00:00Z",
            updatedAt: "2025-01-05T09:30:00Z",
            eventImg: "https://placehold.co/600x400",
        },
        {
            eventId: "evt-002",
            name: "Startup Pitch Mixer",
            description: "Founders pitch ideas and connect with investors.",
            joinCode: "2W6T",
            startDate: "2025-02-02T17:30:00Z",
            endDate: "2025-02-02T19:30:00Z",
            maxParticipants: 100,
            participants: [],
            currentState: EventState.UPCOMING,
            createdBy: "user-002",
            createdAt: "2025-01-10T15:45:00Z",
            updatedAt: "2025-01-10T15:45:00Z",
            eventImg: "https://placehold.co/600x400",
        },
        ];

        await new Promise((resolve) => setTimeout(resolve, 400));

        const foundEvent = mockEvents.find(
        (event) => event.joinCode?.toLowerCase() === joinCode.toLowerCase()
        );

        if (!foundEvent) {
            return undefined;
        }

        return {
            success: true,
            event: foundEvent,
        };
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

export async function GetAllEventsApi(): Promise<GetAllEventsResponse | undefined> {
    try {
    //TODO: Remove mock data call
    const mockResponse: GetAllEventsResponse = {
      events: [
        {
          eventId: "evt-001",
          name: "Tech Networking Night",
          description: "Meet professionals in software, product, and design.",
          joinCode: "2E5R",
          startDate: "2025-01-20T18:00:00Z",
          endDate: "2025-01-20T20:00:00Z",
          maxParticipants: 50,
          participants: [],
          currentState: EventState.IN_PROGRESS,
          createdBy: "user-001",
          createdAt: "2025-01-01T12:00:00Z",
          updatedAt: "2025-01-05T09:30:00Z",
          eventImg: "https://placehold.co/600x400",
        },
        {
          eventId: "evt-002",
          name: "Startup Pitch Mixer",
          description: "Founders pitch ideas and connect with investors.",
          joinCode: "2W6T",
          startDate: "2025-02-02T17:30:00Z",
          endDate: "2025-02-02T19:30:00Z",
          maxParticipants: 100,
          participants: [],
          currentState: EventState.UPCOMING,
          createdBy: "user-002",
          createdAt: "2025-01-10T15:45:00Z",
          updatedAt: "2025-01-10T15:45:00Z",
          eventImg: "https://placehold.co/600x400",
        },
      ],
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockResponse;
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