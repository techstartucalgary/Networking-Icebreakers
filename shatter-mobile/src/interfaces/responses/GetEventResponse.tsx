import EventIB from '../Event'

//returned event for when it is fetched (joinCode, eventId, etc.)
export default interface EventResponse {
    success: boolean,
    event: EventIB
}