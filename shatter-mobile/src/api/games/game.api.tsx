import { EventState, GameType } from "@/src/interfaces/Event";
import BingoCategoriesResponse from "@/src/interfaces/responses/GetBingoCategoriesResponse";
import BingoDataResponse from "@/src/interfaces/responses/GetBingoResponse";
import EventIdResponse from "@/src/interfaces/responses/GetEventByIdResponse";
import NamesByEventIdResponse from "@/src/interfaces/responses/GetNamesByEventIdResponse";
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const API_BASE_URL: string = `${API_BASE}/api`;
const API_BASE_URL_EVENTS: string = `${API_BASE}/api/events`;

const mockResponse: EventIdResponse = {
	success: true,
	event: {
		_id: "696ed1bd6076233164ad3f3c",
		name: "Hackathon",
		description: "24-hour coding event",
		joinCode: "55844267",
		startDate: "2025-12-01T09:00:00.000Z",
		endDate: "2025-12-02T09:00:00.000Z",
		maxParticipant: 50,
		participantIds: [
			{
				_id: "696f0b4fe0b724d870d57993",
				userId: null,
				name: "Minh 1",
			},
			{
				_id: "696f13b85d27d96c3344b071",
				userId: null,
				name: "Minh 2",
			},
			{
				_id: "696f141e8f96b4a10ed170e6",
				userId: null,
				name: "Minh 3",
			},
			{
				_id: "696f15931bf6d35e0e72f0c7",
				userId: null,
				name: "Minh 4",
			},
			{
				_id: "696f18f775cdd3328bb5a963",
				userId: null,
				name: "Minh 5",
			},
			{
				_id: "696f1cd32ae7f890205601a0",
				userId: null,
				name: "Minh 7",
			},
			{
				_id: "696f1ce52ae7f890205601ab",
				userId: null,
				name: "Minh 6",
			},
			{
				_id: "696f1db4751a84842b722161",
				userId: null,
				name: "Minh 8",
			},
			{
				_id: "69706ba97475a01bba4cd079",
				userId: null,
				name: "Minh 9",
			},
			{
				_id: "69706ba97475a01bba4cd079",
				userId: null,
				name: "Minh 10",
			},
			{
				_id: "697d1eebb839b5feb2b34086",
				userId: "6977fb70c480036d981cef04",
				name: "Keeryn",
			},
			{
				_id: "697d2b5ab839b5feb2b34102",
				userId: null,
				name: "Aldsajd",
			},
			{
				_id: "697d2cbbb839b5feb2b34112",
				userId: null,
				name: "Guy",
			},
			{
				_id: "69861ad7ef45eda9612a7b54",
				userId: "696c28fd708cc10be0a183f2",
				name: "Minh Le",
			},
			{
				_id: "69964aa55c28370b04e74a3f",
				userId: null,
				name: "Albert",
			},
			{
				_id: "69964cfe5c28370b04e74ab5",
				userId: null,
				name: "Test",
			},
			{
				_id: "69964ebd5c28370b04e74ade",
				userId: null,
				name: "Andrew",
			},
			{
				_id: "69a23d57def09851316116b1",
				userId: "69a23d3edef09851316116ab",
				name: "Paul",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Ahhh",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 11",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 12",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 13",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 14",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 15",
			},
			{
				_id: "69a23d97def09851316116c4",
				userId: "69a23d8fdef09851316116bd",
				name: "Minh 16",
			},
		],
		currentState: EventState.IN_PROGRESS,
		createdBy: "696c28fd708cc10be0a183f2",
		createdAt: "2026-01-20T00:52:13.980Z",
		updatedAt: "2026-02-28T00:57:59.686Z",
		eventImg: "",
		gameType: GameType.NAME_BINGO,
	},
};

export async function GetNamesByEventIdApi(
	eventId: string,
): Promise<NamesByEventIdResponse> {
	try {
		/*
		const response: AxiosResponse<EventIdResponse> = await axios.get(
			`${API_BASE_URL_EVENTS}/${eventId}`,
		);

		const participantsList = response.data.event.participantIds;
		*/
		const response: EventIdResponse = mockResponse;

		const participantsList = response.event.participantIds;
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
