import JoinEventByIdGuestRequest from "@/src/interfaces/requests/JoinEventByIdGuestRequest";
import JoinEventByIdUserRequest from "@/src/interfaces/requests/JoinEventByIdUserRequest";
import EventResponse from "@/src/interfaces/responses/GetEventByCodeResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import EventJoinIdResponse from "@/src/interfaces/responses/JoinEventIdResponse";
import axios, { AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE
const API_BASE_URL: string = `${API_BASE}/api/events`

export async function GetEventByCodeApi(joinCode: string): Promise<EventResponse | undefined> {
    try{
        const response: AxiosResponse<EventResponse> = await axios.get(`${API_BASE_URL}/event/${joinCode}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function GetEventByIdApi(eventId: string): Promise<EventResponse | undefined> {
    try{
        const response: AxiosResponse<EventIdResponse> = await axios.get(`${API_BASE_URL}/${eventId}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
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
        const response: AxiosResponse<EventJoinIdResponse> = await axios.post(`${API_BASE_URL}/${eventId}/join/guest`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}