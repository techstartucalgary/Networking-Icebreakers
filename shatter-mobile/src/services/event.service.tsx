import { GetAllEventsApi, GetEventByCodeApi, GetEventByIdApi } from "../api/events/event.api";
import AllEventsResponse from "../interfaces/responses/GetAllEventsResponse";
import EventJoinCodeResponse from "../interfaces/responses/GetEventByCodeResponse";
import EventIdResponse from "../interfaces/responses/GetEventByIdResponse";

export async function getEventByCode(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    const eventInfo = await GetEventByCodeApi(joinCode);
    return eventInfo;
}

export async function getEventById(eventId: string): Promise<EventIdResponse | undefined> {
    const eventInfo = await GetEventByIdApi(eventId);
    return eventInfo;
}

export async function getAllEvents(): Promise<AllEventsResponse | undefined> {
    const events = await GetAllEventsApi();
    return events;
}