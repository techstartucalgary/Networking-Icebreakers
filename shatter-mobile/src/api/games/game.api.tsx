import BingoDataRequest from "@/src/interfaces/requests/GetBingoDataRequest";
import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import BingoDataResponse from "@/src/interfaces/responses/GetBingoResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import NamesByEventIdResponse from "@/src/interfaces/responses/GetNamesByEventIdResponse";
import axios, { AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL: string = `${API_BASE}/api`;
const API_BASE_URL_EVENTS: string = `${API_BASE}/api/events`;

export async function GetNamesByEventIdApi(
	eventId: string,
): Promise<NamesByEventIdResponse | undefined> {
	try {
		const response: AxiosResponse<EventIdResponse> = await axios.get(
			`${API_BASE_URL_EVENTS}/${eventId}`,
		);

		const participantsList = response.data.event.participantIds;
		const namesList = participantsList.map((p) => p.name);

		return { success: true, names: namesList };
	} catch (error) {
		console.log("Error", error);
	}
}

export async function GetBingoCategoriesApi(
	eventId: string,
): Promise<BingoCategoriesResponse | undefined> {
	try {
		const body: BingoDataRequest = { id: eventId };

		const response: AxiosResponse<BingoDataResponse> = await axios.post(
			`${API_BASE_URL}/bingo/getBingo`,
			body,
		);

		const grid = response.data.bingo.grid;
		const categoriesList: string[][] =
			response.data.success && grid ? grid : [];

		return { success: true, categories: categoriesList };
	} catch (error) {
		console.log("Error", error);
	}
}
