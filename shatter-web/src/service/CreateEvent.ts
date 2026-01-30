export async function CreateEvent(eventData: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    maxParticipants: number;
    eventType?: string;
    keyInterest?: string;
    institution?: string;
}) {
    try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        // TODO: Uncomment this when authentication is ready
        // if (!token) {
        //     throw new Error('You must be logged in to create an event');
        // }

        // If endDate is not provided, set it to 3 hours after startDate
        let endDate = eventData.endDate;
        if (!endDate) {
            const start = new Date(eventData.startDate);
            start.setHours(start.getHours() + 3);
            endDate = start.toISOString();
        } else {
            // Convert to ISO string if it's just a date
            endDate = new Date(eventData.endDate).toISOString();
        }

        // Convert startDate to ISO string
        const startDate = new Date(eventData.startDate).toISOString();

        // Build headers - include Authorization only if token exists
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/events/event/createEvent`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    name: eventData.name,
                    description: eventData.description,
                    startDate: startDate,
                    endDate: endDate,
                    maxParticipant: eventData.maxParticipants,
                    currentState: 'upcoming'
                })
            }
        );

        // Log for debugging
        console.log('Response status:', response.status);
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Non-JSON response received:', textResponse.substring(0, 200));
            throw new Error(
                `Server returned HTML instead of JSON. This usually means:\n` +
                `1. The API endpoint URL is wrong\n` +
                `2. The backend server is not running\n` +
                `3. CORS is blocking the request\n` +
                `Status: ${response.status}`
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create event');
        }

        if (data.success && data.event) {
            return data.event.joinCode;
        } else {
            throw new Error('Event creation failed');
        }
    } catch (error: any) {
        console.error('Error creating event:', error);
        throw error;
    }
}
