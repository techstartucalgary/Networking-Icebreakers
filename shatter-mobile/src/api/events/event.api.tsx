import { mockEvents } from "@/src/api/mockDB";
import JoinEventByIdGuestRequest from "@/src/interfaces/requests/JoinEventByIdGuestRequest";
import JoinEventByIdUserRequest from "@/src/interfaces/requests/JoinEventByIdUserRequest";
import EventJoinCodeResponse from "@/src/interfaces/responses/GetEventByCodeResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import GetUserEventsResponse from "@/src/interfaces/responses/GetUserEventsResponse";
import EventJoinIdResponse from "@/src/interfaces/responses/JoinEventIdResponse";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL: string = '/api/events'

export async function GetEventByCodeApi(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    try{
        const response: AxiosResponse<EventJoinCodeResponse> = await axios.get(`${API_BASE_URL}/event/${joinCode}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
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
        const response: AxiosResponse<GetAllEventsResponse> = await axios.get(`${API_BASE_URL}/event/${joinCode}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
  */
}

export async function JoinEventByIdUserApi(eventId: string, userId: string, name: string, token: string): Promise<EventJoinIdResponse | undefined> {
    try{
        const body: JoinEventByIdUserRequest = {userId, name,};
        const response: AxiosResponse<EventJoinIdResponse> = await axios.post(`${API_BASE_URL}/${eventId}/join/user`, body, 
            {headers: {Authorization: `Bearer ${token}`, },});
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function JoinEventByIdGuestApi(eventId: string, name: string): Promise<EventJoinIdResponse | undefined> {
    try{
        const body: JoinEventByIdGuestRequest = {name,};
        const response: AxiosResponse<EventJoinIdResponse> = await axios.post(`${API_BASE_URL}/${eventId}/join/user`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}