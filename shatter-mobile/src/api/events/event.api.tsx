import { mockEvents } from "@/src/api/mockDB";
import EventJoinCodeResponse from "@/src/interfaces/responses/GetEventByCodeResponse";
import GetUserEventsResponse from "@/src/interfaces/responses/GetUserEventsResponse";
import EventJoinIdResponse from "@/src/interfaces/responses/JoinEventIdResponse";

const API_BASE_URL: string = '/api/events'

export async function GetEventByCodeApi(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const foundEvent = mockEvents.find((event) => event.joinCode?.toLowerCase() === joinCode.toLowerCase());

        if (!foundEvent) return undefined;

        return { success: true, event: foundEvent };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<EventJoinCodeResponse> = await axios.get(`${API_BASE_URL}/${joinCode}`);
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
        const response: AxiosResponse<EventIdResponse> = await axios.get(`${API_BASE_URL}/id/${eventId}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}

export async function GetUserEventsApi(userId: string): Promise<GetUserEventsResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userEvents = mockEvents.filter((event) => event.participants?.some((p) => p.userId === userId));

        return { events: userEvents };
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

export async function JoinEventByIdUserApi(eventId: string, userId: string, name: string): Promise<EventJoinIdResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        //Find event based on eventId
        const event = mockEvents.find((e) => e.eventId === eventId);
        if (!event) {
            return { success: false };
        }

        //Check if user is already a participant
        const exists = event.participants.some((p) => p.userId === userId);
        if (!exists) {
            event.participants.push({ userId, username: name });
        }

        return { success: true, event: event };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<EventIdResponse> = await axios.post(`${API_BASE_URL}/user/${eventId}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}

export async function JoinEventByIdGuestApi(eventId: string, userId: string, name: string): Promise<EventJoinIdResponse | undefined> {
    //TODO: Remove mock data call
    try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        //Find event based on eventId
        const event = mockEvents.find((e) => e.eventId === eventId);
        if (!event) {
            return { success: false };
        }

        //Check if user is already a participant
        const exists = event.participants.some((p) => p.userId === userId);
        if (!exists) {
            event.participants.push({ userId: userId, username: name });
        }

        console.log(event.participants)

        return { success: true, event: event };
    } catch (error) {
        console.log("Error", error);
    }
    /*
    try{
        const response: AxiosResponse<EventIdResponse> = await axios.post(`${API_BASE_URL}/guest/${eventId}`, eventId);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
    */
}