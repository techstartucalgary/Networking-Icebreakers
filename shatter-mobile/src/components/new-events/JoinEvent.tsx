import {
	getEventByCode,
	JoinEventIdGuest,
	JoinEventIdUser,
} from "@/src/services/event.service";
import { useAuth } from "@/src/components/context/AuthContext";

export function useJoinEvent() {
	const { user, authStorage, authenticate } = useAuth();

	const joinEvent = async (joinCode: string): Promise<string> => {
		const normalizedCode = joinCode.trim().toUpperCase();
		const eventData = await getEventByCode(normalizedCode);

		if (!user) throw new Error("No user logged in.");
		if (!user.user_id) throw new Error("Missing user ID.");
		if (!user.name) throw new Error("Your profile is missing a name.");

		if (!eventData || !eventData.event?._id) {
			throw new Error("We couldn’t find that event. Double-check the code.");
		}

		const eventId = eventData.event._id;

		try {
			if (!authStorage.isGuest) {
				await JoinEventIdUser(eventId, user.user_id, user.name, authStorage.accessToken);
			} else {
				const guestInfo = await JoinEventIdGuest(eventId, user.name);
				user.user_id = guestInfo.userId //update local user ID
				authenticate(user, guestInfo.token, true) //update guest account in local context
			}
		} catch (err) {
			console.log("Join event error:", err);
			throw new Error("Something went wrong joining the event.");
		}

		return eventId; //success returns eventId
	}

	return { joinEvent };
}