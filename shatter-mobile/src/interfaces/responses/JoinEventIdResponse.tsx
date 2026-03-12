import { Participant } from '../Event';

//event joined, returns new info if the user is a guest
export default interface EventJoinIdResponse {
    success: boolean,
    participant: Participant,
    userId: string,
    token: string,
}