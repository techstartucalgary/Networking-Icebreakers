import { BingoGame } from "../Game";

export default interface BingoDataResponse {
    success: boolean,
    bingoData: BingoGame,
}