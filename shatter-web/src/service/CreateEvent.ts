export async function CreateEvent(eventData: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    maxParticipants: number;
}) {
    try {
        const token = localStorage.getItem('token');

        // Build startDate and endDate as ISO strings
        const startDate = new Date(eventData.startDate).toISOString();
        const endDate = eventData.endDate
            ? new Date(eventData.endDate).toISOString()
            : new Date(new Date(eventData.startDate).getTime() + 3 * 60 * 60 * 1000).toISOString();

        // Build headers
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Build the request payload exactly as backend expects
        const bodyPayload = {
            name: eventData.name,
            description: eventData.description,
            startDate,
            endDate,
            maxParticipant: eventData.maxParticipants,
            currentState: 'upcoming',
        };

        const apiUrl = `${import.meta.env.VITE_API_URL}/events/createEvent`;
        console.log("POST URL:", apiUrl);
        console.log("Payload:", JSON.stringify(bodyPayload));

        // Send POST request
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyPayload),
        });

        console.log("HTTP status:", response.status);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data: any;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response:", text);
            throw new Error("Server did not return JSON.");
        }

        console.log("Backend response:", data);

        // Handle backend error
        if (!response.ok || !data.success) {
            console.error("Event creation failed:", data);
            throw new Error(data.message || 'Failed to create event.');
        }

        console.log("Event created successfully:", data.event);
        return data.event.joinCode;

    } catch (error: any) {
        console.error("Error caught in CreateEvent:", error);
        throw error;
    }
}
