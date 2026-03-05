//create a connection in a game
export default interface CreateUserConnectionRequest {
	eventId: string;
	primaryParticipantId: string;
	secondaryParticipantId: string;
	description?: string | null;
}
