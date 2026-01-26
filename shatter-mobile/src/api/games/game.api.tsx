import { mockEvents } from "@/src/api/mockDB";
import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import NamesByEventIdResponse from "@/src/interfaces/responses/GetNamesByEventIdResponse";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE
const API_BASE_URL: string = `${API_BASE}/api/games`

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