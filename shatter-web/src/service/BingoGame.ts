// services/BingoGame.ts

const CREATE_BINGO_URL =
  "https://techstart-shatter-backend.vercel.app/api/bingo/createBingo";

export interface BingoGame {
  _id: string;
  _eventId: string;
  description: string;
  grid: string[][];
}

export async function createBingoGame(
  eventId: string,
  token: string
): Promise<BingoGame> {
  const res = await fetch(CREATE_BINGO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      _eventId: eventId, // ✅ THIS IS REQUIRED
      description: "Name Bingo",
      grid: [
        ["A1", "B1", "C1", "D1", "E1"],
        ["A2", "B2", "C2", "D2", "E2"],
        ["A3", "B3", "C3", "D3", "E3"],
        ["A4", "B4", "C4", "D4", "E4"],
        ["A5", "B5", "C5", "D5", "E5"],
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok || !data?.bingo) {
    throw new Error("Failed to create bingo game");
  }

  return data.bingo;
}
