export default interface Event {
    eventId: string;
    name: string;
    description: string;
    joinCode: string | null;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    participants: Participant[];
    currentState: EventState;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    eventImg: string;
}

export interface Participant{
    userId: string,
    username: string
}

export enum EventState{
    UPCOMING = "Upcoming",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
    INVALID = "Invalid",
}
