import { GetAllEventsApi, GetEventByCodeApi } from "../api/events/event.api";
import GetAllEventsResponse from "../interfaces/responses/GetAllEventsResponse";
import EventJoinCodeResponse from "../interfaces/responses/GetEventByCodeResponse";

export async function getEventByCode(joinCode: string): Promise<EventJoinCodeResponse | undefined> {
    const eventInfo = await GetEventByCodeApi(joinCode);
    return eventInfo;
}

export async function getAllEvents(): Promise<GetAllEventsResponse | undefined> {
    const events = await GetAllEventsApi();
    return events;
}