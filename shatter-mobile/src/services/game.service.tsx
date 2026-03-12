import { GetBingoCategoriesApi, GetParticipantsByEventIdApi } from "../api/games/game.api";
import BingoCategoriesResponse from "../interfaces/responses/GetBingoCategoriesResponse";
import ParticipantsByEventIdResponse from "../interfaces/responses/GetParticipantsByEventIdResponse";


export async function getParticipantsByEventId(eventId: string): Promise<ParticipantsByEventIdResponse> {
    const participantInfo = await GetParticipantsByEventIdApi(eventId);
    return participantInfo;
}

export async function getBingoCategories(eventId: string): Promise<BingoCategoriesResponse> {
    const categories = await GetBingoCategoriesApi(eventId);
    return categories;
}