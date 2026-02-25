import { GameType } from "@/src/interfaces/Event";
import JoinEventByIdGuestRequest from "@/src/interfaces/requests/JoinEventByIdGuestRequest";
import JoinEventByIdUserRequest from "@/src/interfaces/requests/JoinEventByIdUserRequest";
import EventResponse from "@/src/interfaces/responses/GetEventByCodeResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import EventJoinIdResponse from "@/src/interfaces/responses/JoinEventIdResponse";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL: string = `${API_BASE}/api/events`;

export async function GetEventByCodeApi(
	joinCode: string,
): Promise<EventResponse> {
	try {
		const response: AxiosResponse<EventResponse> = await axios.get(
			`${API_BASE_URL}/event/${joinCode}`,
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 404:
					throw new Error("No event with this code exists.");
				case 400:
					throw new Error("Invalid join code.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Event Join failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function GetEventByIdApi(eventId: string): Promise<EventResponse> {
	try {
		const response: AxiosResponse<EventIdResponse> = await axios.get(
			`${API_BASE_URL}/${eventId}`,
		);
		response.data.event.gameType = GameType.NAME_BINGO; //TODO: Remove hard coded game type
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 400:
					throw new Error("The event ID is missing. Please try again later.");
				case 404:
					throw new Error("The event cannot be found. Please try again later.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Signup failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function JoinEventByIdUserApi(
	eventId: string,
	userId: string,
	name: string,
	token: string,
): Promise<EventJoinIdResponse> {
	try {
		const body: JoinEventByIdUserRequest = { userId, name };
		const response: AxiosResponse<EventJoinIdResponse> = await axios.post(
			`${API_BASE_URL}/${eventId}/join/user`,
			body,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 400:
					throw new Error("A required field is missing, or the event is full. Please try again later.");
				case 404:
					throw new Error("The event cannot be found. Please try again later.");
                case 409:
					throw new Error("You're already signed up for this event!");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Signup failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function JoinEventByIdGuestApi(
	eventId: string,
	name: string,
): Promise<EventJoinIdResponse> {
	try {
		const body: JoinEventByIdGuestRequest = { name };
		const response: AxiosResponse<EventJoinIdResponse> = await axios.post(
			`${API_BASE_URL}/${eventId}/join/guest`,
			body,
		);
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 400:
					throw new Error("A required field is missing, or the event is full. Please try again later.");
				case 404:
					throw new Error("The event cannot be found. Please try again later.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Signup failed.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}
