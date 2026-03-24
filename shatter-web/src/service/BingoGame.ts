// services/BingoGame.ts

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://techstart-shatter-backend.vercel.app/api";

export interface BingoGame {
  _id: string;
  _eventId: string;
  description: string;
  grid: string[][];
}

export async function getBingo(eventId: string): Promise<BingoGame | null> {
  const res = await fetch(`${BASE_URL}/bingo/getBingo/${eventId}`);
  const data = await res.json();
  if (!res.ok || !data?.bingo) return null;
  return data.bingo;
}

export async function createBingoGame(
  eventId: string,
  token: string
): Promise<BingoGame> {
  const res = await fetch(`${BASE_URL}/bingo/createBingo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      _eventId: eventId, // ✅ THIS IS REQUIRED
      description: "Name Bingo",
      grid: [
        ["A1", "B1", "C1"],
        ["A2", "B2", "C2"],
        ["A3", "B3", "C3"]
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok || !data?.bingo) {
    throw new Error("Failed to create bingo game");
  }

  return data.bingo;
}
