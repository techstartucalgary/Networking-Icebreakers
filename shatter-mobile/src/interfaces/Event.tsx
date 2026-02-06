//TODO: Remove hardcoded Bingo
export default interface EventIB {
    _id: string;
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
    gameType: GameType;
}

export interface Participant{
    userId: string,
    eventId: string,
    name: string
}

export enum EventState{
    UPCOMING = "Upcoming",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
    INVALID = "Invalid",
}

export enum GameType{
    NAME_BINGO = "Name Bingo"
}
