// services/BingoGame.ts

const BASE_URL =
    import.meta.env.VITE_API_URL ??
    "https://techstart-shatter-backend.vercel.app/api";

// ✅ NEW TYPE
export interface BingoCell {
    question: string;
    shortQuestion: string;
}

// ✅ UPDATED TYPE
export interface BingoGame {
    _id: string;
    _eventId: string;
    description: string;
    grid: BingoCell[][];
}

// ✅ GET BINGO
export async function getBingo(eventId: string): Promise<BingoGame | null> {
    const res = await fetch(`${BASE_URL}/bingo/getBingo/${eventId}`);
    const data = await res.json();

    if (!res.ok || !data?.bingo) return null;

    return data.bingo;
}

// ✅ CREATE BINGO
export async function createBingoGame(
    eventId: string,
    description: string,
    grid: BingoCell[][],
    token: string
): Promise<BingoGame> {
    const res = await fetch(`${BASE_URL}/bingo/createBingo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            _eventId: eventId,
            description,
            grid,
        }),
    });

    const data = await res.json();

    if (!res.ok || !data?.bingo) {
        throw new Error(data?.message || "Failed to create bingo game");
    }

    return data.bingo;
}

// ✅ UPDATE BINGO
export async function updateBingoGame(
    eventId: string,
    description: string,
    grid: BingoCell[][],
    token: string
): Promise<BingoGame> {
    const res = await fetch(`${BASE_URL}/bingo/updateBingo`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            id: eventId, // ⚠️ backend expects this (based on your current code)
            description,
            grid,
        }),
    });

    const data = await res.json();

    if (!res.ok || !data?.bingo) {
        throw new Error(data?.message || "Failed to update bingo game");
    }

    return data.bingo;
}