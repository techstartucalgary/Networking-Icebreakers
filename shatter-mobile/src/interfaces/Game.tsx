export interface BingoTile {
  question: string;
  shortQuestion: string;
}

export interface BingoGame {
  _id: string;
  _eventId: string;
  description: string;
  grid: BingoTile[][];
}
