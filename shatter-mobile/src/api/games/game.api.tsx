import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import BingoDataResponse from "@/src/interfaces/responses/GetBingoResponse";
import EventResponse from "@/src/interfaces/responses/GetEventResponse";
import ParticipantsByEventIdResponse from "@/src/interfaces/responses/GetParticipantsByEventIdResponse";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL: string = `${API_BASE}/api`;
const API_BASE_URL_EVENTS: string = `${API_BASE}/api/events`;

export async function GetParticipantsByEventIdApi(
	eventId: string,
): Promise<ParticipantsByEventIdResponse> {
	try {
		const response: AxiosResponse<EventResponse> = await axios.get(
			`${API_BASE_URL_EVENTS}/${eventId}`,
		);

		const participantsList = response.data.event.participantIds;

		return { success: true, participants: participantsList };
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 409:
					throw new Error("A game for this event cannot be found.");
				case 400:
					throw new Error("Invalid game data.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Game info cannot be fetched at this time.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}

export async function UpdateLeaderboardScoreApi(
	eventId: string,
	body: { linesCompleted?: number; completed?: boolean },
	token: string,
): Promise<void> {
	await axios.put(
		`${API_BASE_URL_EVENTS}/${eventId}/leaderboard/score`,
		body,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
}

export async function GetBingoCategoriesApi(
	eventId: string,
): Promise<BingoCategoriesResponse> {
	try {

		const response: AxiosResponse<BingoDataResponse> = await axios.get(
			`${API_BASE_URL}/bingo/getBingo/${eventId}`,
		);

		const grid = response.data.bingo.grid;

		return { success: true, tiles: grid };

	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 404:
					throw new Error("A bingo game for this event cannot be found.");
				case 400:
					throw new Error("Invalid game data.");
				case 500:
					throw new Error("Server error. Please try again later.");
				default:
					throw new Error("Game info cannot be fetched at this time.");
			}
		}

		throw new Error("Network error. Check your connection.");
	}
}
