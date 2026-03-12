import { BingoGame } from "../Game";

//returns bingo data for event
export default interface BingoDataResponse {
    success: boolean,
    bingo: BingoGame,
}