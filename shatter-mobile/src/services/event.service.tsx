import {
    GetEventByCodeApi,
    GetEventByIdApi,
    GetUserEventsApi,
    JoinEventByIdGuestApi,
    JoinEventByIdUserApi,
} from "../api/events/event.api";
import EventJoinCodeResponse from "../interfaces/responses/GetEventByCodeResponse";
import EventIdResponse from "../interfaces/responses/GetEventByIdResponse";
import UserEventsResponse from "../interfaces/responses/GetUserEventsResponse";
import EventJoinIdResponse from "../interfaces/responses/JoinEventIdResponse";

export async function getEventByCode(
	joinCode: string,
): Promise<EventJoinCodeResponse | undefined> {
	const eventInfo = await GetEventByCodeApi(joinCode);
	return eventInfo;
}

export async function getEventById(
	eventId: string,
): Promise<EventIdResponse | undefined> {
	const eventInfo = await GetEventByIdApi(eventId);
	return eventInfo;
}

export async function getUserEvents(
	userId: string,
): Promise<UserEventsResponse | undefined> {
	const events = await GetUserEventsApi(userId);
	return events;
}

export async function JoinEventIdUser(
	eventId: string,
	userId: string,
	name: string,
	token: string,
): Promise<EventJoinIdResponse | undefined> {
	const response = await JoinEventByIdUserApi(eventId, userId, name, token);
	return response;
}

export async function JoinEventIdGuest(
	eventId: string,
	name: string,
): Promise<EventJoinIdResponse | undefined> {
	const response = await JoinEventByIdGuestApi(eventId, name);
	return response;
}
