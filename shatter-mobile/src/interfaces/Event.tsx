export default interface Event{
    eventId: String,
    eventName: String,
    description: String,
    status: EventState,
    startTime: String,
    endTime: String,
    location: String,
    activities: Activities[],
    participants: Participants[],
    currentState: EventState,
    eventImg: String
}

export interface Participants{
    userId: String,
    username: String
}

export interface Activities{
    activityId: String,
    activityName: String
}

export enum EventState{
    UPCOMING = "Upcoming",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed"
}
