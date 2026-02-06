type BingoGrid = string[][];

export async function bingoGame(eventData: {
    _eventId: string;
    description: string;
    grid: BingoGrid;
}) {
    try {
        const token = localStorage.getItem('token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const bodyPayload = {
            _eventId: eventData._eventId,
            description: eventData.description,
            grid: eventData.grid,
        };

        const apiUrl = "https://techstart-shatter-backend.vercel.app/api/bingo/createBingo";

        console.log("POST URL:", apiUrl);
        console.log("Payload:", JSON.stringify(bodyPayload));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyPayload),
        });

        console.log("HTTP status:", response.status);

        const contentType = response.headers.get('content-type');
        let data: any;

        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            throw new Error("Server did not return JSON.");
        }

        console.log("Backend response:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create bingo game.');
        }

        return data;

    } catch (error) {
        console.error("Error caught in BingoGame:", error);
        throw error;
    }
}