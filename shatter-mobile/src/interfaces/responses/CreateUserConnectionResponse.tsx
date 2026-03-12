//returns connection info when connection created
export default interface CreateUserConnectionResponse {
    _eventId: string,
    primaryParticipantId: string,
    secondaryParticipantId: string,
    description: string,
    _id: string,
}