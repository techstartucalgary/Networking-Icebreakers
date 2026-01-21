import { Participant } from '../Event';

export default interface EventJoinIdResponse {
    success: boolean,
    participant: Participant
}