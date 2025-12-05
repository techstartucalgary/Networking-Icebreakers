import GetAllEventsResponse from "@/src/interfaces/responses/GetAllEventsResponse";
import EventJoinCodeResponse from "@/src/interfaces/responses/GetEventByCodeResponse";
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

export async function GetAllEventsApi(): Promise<GetAllEventsResponse | undefined> {
    try{
        const response: AxiosResponse<GetAllEventsResponse> = await axios.get(`${API_BASE_URL}`);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}