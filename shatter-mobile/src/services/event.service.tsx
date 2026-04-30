import {
	GetEventByCodeApi,
	GetEventByIdApi,
	JoinEventByIdGuestApi,
	JoinEventByIdUserApi,
} from "../api/events/event.api";
import { GetUserEventsApi } from "../api/users/user.api";
import EventResponse from "../interfaces/responses/GetEventResponse";
import UserEventsResponse from "../interfaces/responses/GetUserEventsResponse";
import EventJoinIdResponse from "../interfaces/responses/JoinEventIdResponse";
import { SocialLinks } from "../interfaces/User";

export async function getEventByCode(
	joinCode: string,
): Promise<EventResponse> {
	return await GetEventByCodeApi(joinCode);
}

export async function getEventById(
	eventId: string,
): Promise<EventResponse> {
	return await GetEventByIdApi(eventId);
}

export async function getUserEvents(
	userId: string,
	token: string
): Promise<UserEventsResponse> {
	return await GetUserEventsApi(userId, token);
}

export async function JoinEventIdUser(
	eventId: string,
	userId: string,
	name: string,
	token: string,
): Promise<EventJoinIdResponse> {
	return await JoinEventByIdUserApi(eventId, userId, name, token);
}

export async function JoinEventIdGuest(
	eventId: string,
	name: string,
	socialLinks: SocialLinks,
	organization: string,
): Promise<EventJoinIdResponse> {
	return await JoinEventByIdGuestApi(eventId, name, socialLinks, organization);
}
