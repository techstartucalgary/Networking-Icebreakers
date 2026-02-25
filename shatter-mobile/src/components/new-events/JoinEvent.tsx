import AsyncStorage from "@react-native-async-storage/async-storage";
import EventIB from "@/src/interfaces/Event";
import {
	getEventByCode,
	JoinEventIdGuest,
	JoinEventIdUser,
} from "@/src/services/event.service";
import { useAuth } from "@/src/components/context/AuthContext";

export function useJoinEvent() {
	const { user, authStorage } = useAuth();

	const saveGuestEvent = async (event: EventIB) => {
		const stored = await AsyncStorage.getItem("guestEvents");
		const events: EventIB[] = stored ? JSON.parse(stored) : [];

		if (!events.some(e => e._id === event._id)) {
			events.push(event);
			await AsyncStorage.setItem("guestEvents", JSON.stringify(events));
		}
	};

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
			const result = await JoinEventIdGuest(eventId, user.name);
			if (!result?.success) {
				throw new Error("Something went wrong joining the event as a guest.");
			}
			await saveGuestEvent(eventData.event);
			}
		} catch (err) {
			console.log("Join event error:", err);
			throw new Error("Something went wrong joining the event.");
		}

		return eventId; //success returns eventId
		}

	return { joinEvent };
}