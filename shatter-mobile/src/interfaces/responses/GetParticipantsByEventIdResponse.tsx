import { Participant } from "../Event";

//used by name bingo, returns participants of event
export default interface ParticipantsByEventIdResponse {
    success: boolean,
    participants: Participant[],
}