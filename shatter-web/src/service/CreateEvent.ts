export function CreateEvent(eventData: {
    name: string;
    description: string;
    startDate: string;
    maxParticipants: number;
}) {
    console.log("Creating event with:", eventData);

    //Random fake join code, replace later
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    return joinCode;
}