import { Participant } from "../Event";

//used by name bingo
export default interface ParticipantsByEventIdResponse {
    success: boolean,
    participants: Participant[],
}