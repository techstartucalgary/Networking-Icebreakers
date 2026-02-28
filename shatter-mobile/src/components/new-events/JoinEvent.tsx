import { useAuth } from "@/src/components/context/AuthContext";
import {
	getEventByCode,
	JoinEventIdGuest,
	JoinEventIdUser,
} from "@/src/services/event.service";
import { useGame } from "../context/GameContext";
import { EventState, GameType } from "@/src/interfaces/Event";

export function useJoinEvent() {
	const { user, authStorage, authenticate } = useAuth();
	const { initializeGame } = useGame();

	const joinEvent = async (joinCode: string): Promise<string> => {
		const normalizedCode = joinCode.trim().toUpperCase();
		const eventData = await getEventByCode(normalizedCode);

		if (!user) throw new Error("No user logged in.");
		if (!user.name) throw new Error("Your profile is missing a name.");

		if (!eventData || !eventData.event?._id) {
			throw new Error("We couldn’t find that event. Double-check the code.");
		}

		const event = eventData.event;

		try {
			if (!authStorage.isGuest && user._id) {
				//first time joining event as guest
				await JoinEventIdUser(
					event._id,
					user._id,
					user.name,
					authStorage.accessToken,
				);
			} else {
				//guest joining event
				if (!user._id) {
					//first time joining event
					const guestInfo = await JoinEventIdGuest(event._id, user.name);
					user._id = guestInfo.userId;
					await authenticate(user, guestInfo.token, true);
				} else {
					//returning guest joining another event
					await JoinEventIdUser(
						event._id,
						user._id,
						user.name,
						authStorage.accessToken,
					);
				}
			}

			if (!event.gameType) {
				//REMOVE hard-coded event data
				event.currentState = EventState.IN_PROGRESS;
				event.gameType = GameType.NAME_BINGO;
			}
			initializeGame(event.gameType, event._id, event.currentState);
		} catch (err: any) {
			console.log(err);
			throw new Error(err);
		}

		return event._id; //success returns eventId
	};

	return { joinEvent };
}
