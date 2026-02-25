import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import BingoDataResponse from "@/src/interfaces/responses/GetBingoResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import NamesByEventIdResponse from "@/src/interfaces/responses/GetNamesByEventIdResponse";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL: string = `${API_BASE}/api`;
const API_BASE_URL_EVENTS: string = `${API_BASE}/api/events`;

export async function GetNamesByEventIdApi(
	eventId: string,
): Promise<NamesByEventIdResponse> {
	try {
		const response: AxiosResponse<EventIdResponse> = await axios.get(
			`${API_BASE_URL_EVENTS}/${eventId}`,
		);

		const participantsList = response.data.event.participantIds;
		const namesList = participantsList.map((p) => p.name);

		return { success: true, names: namesList };
	} catch (error) {
		const err = error as AxiosError;

		if (err.response) {
			switch (err.response.status) {
				case 409:
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

export async function GetBingoCategoriesApi(
	eventId: string,
): Promise<BingoCategoriesResponse> {
	try {
		const response: AxiosResponse<BingoDataResponse> = await axios.get(
			`${API_BASE_URL}/bingo/getBingo/${eventId}`,
		);

		const grid = response.data.bingo.grid;
		const categoriesList: string[][] =
			response.data.success && grid ? grid : [];

		return { success: true, categories: categoriesList };
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
