import { GetBingoCategoriesApi, GetNamesByEventIdApi } from "../api/games/game.api";
import BingoCategoriesResponse from "../interfaces/responses/GetBingoCategoriesResponse";
import NamesByEventIdResponse from "../interfaces/responses/GetNamesByEventIdResponse";


export async function getBingoNamesByEventId(eventId: string): Promise<NamesByEventIdResponse | undefined> {
    const eventInfo = await GetNamesByEventIdApi(eventId);
    return eventInfo;
}

export async function getBingoCategories(eventId: string): Promise<BingoCategoriesResponse | undefined> {
    const categories = await GetBingoCategoriesApi(eventId);
    return categories;
}