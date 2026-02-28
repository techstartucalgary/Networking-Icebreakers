import { useAuth } from "@/src/components/context/AuthContext";
import {
	getEventByCode,
	JoinEventIdGuest,
	JoinEventIdUser,
} from "@/src/services/event.service";

export function useJoinEvent() {
	const { user, authStorage, authenticate } = useAuth();

	const joinEvent = async (joinCode: string): Promise<string> => {
		const normalizedCode = joinCode.trim().toUpperCase();
		const eventData = await getEventByCode(normalizedCode);

		if (!user) throw new Error("No user logged in.");
		if (!user.name) throw new Error("Your profile is missing a name.");

		if (!eventData || !eventData.event?._id) {
			throw new Error("We couldn’t find that event. Double-check the code.");
		}

		const eventId = eventData.event._id;

		try {
			if (!authStorage.isGuest && user._id) {
				//first time joining event as guest
				await JoinEventIdUser(
					eventId,
					user._id,
					user.name,
					authStorage.accessToken,
				);
			} else {
				//guest joining event
				if (!user._id) {
					//first time joining event
					const guestInfo = await JoinEventIdGuest(eventId, user.name);
					user._id = guestInfo.userId;
					await authenticate(user, guestInfo.token, true);
				} else {
					//returning guest joining another event
					await JoinEventIdUser(
						eventId,
						user._id,
						user.name,
						authStorage.accessToken,
					);
				}
			}
		} catch (err: any) {
			console.log(err);
			throw new Error(err);
		}

		return eventId; //success returns eventId
	};

	return { joinEvent };
}
