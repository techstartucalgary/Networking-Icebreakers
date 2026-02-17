import { BingoGame } from "../Game";

export default interface BingoDataResponse {
    success: boolean,
    bingo: BingoGame,
}