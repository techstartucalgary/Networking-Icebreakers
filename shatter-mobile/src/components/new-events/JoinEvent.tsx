import AsyncStorage from "@react-native-async-storage/async-storage";
import EventIB from "@/src/interfaces/Event";
import {
	getEventByCode,
	JoinEventIdGuest,
	JoinEventIdUser,
} from "@/src/services/event.service";
import { useAuth } from "@/src/components/context/AuthContext";

export type JoinResult =
  | { status: "success"; eventId: string }
  | { status: "event-not-found" }
  | { status: "no-user" }
  | { status: "no-user-id" }
  | { status: "join-error" };

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

	const joinEvent = async (joinCode: string): Promise<JoinResult> => {
		const userId = user?.user_id;
		const name = user?.name;
		const isGuest = authStorage.isGuest;

		const normalizedCode = joinCode.trim().toUpperCase();
		const eventData = await getEventByCode(normalizedCode);
		const eventId = eventData?.event._id;

		if (!userId) return { status: "no-user-id" };
		if (!eventData || !eventId) return { status: "event-not-found"};
		if (!name) return { status: "no-user" };

		try {
			if (!isGuest) {
				await JoinEventIdUser(
					eventId,
					userId,
					name,
					authStorage.accessToken
				);
			} else {
				const result = await JoinEventIdGuest(eventId, name);
				if (result?.success) {
					await saveGuestEvent(eventData.event);
				}
			}
		} catch {
			return { status:  "join-error" };
		}

		return { status: "success", "eventId": eventId };
	};

	return { joinEvent };
}