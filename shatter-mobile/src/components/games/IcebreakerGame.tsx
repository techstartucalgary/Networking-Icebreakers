import EventIB, { EventState, Participant } from "@/src/interfaces/Event";
import { getEventById } from "@/src/services/event.service";
import { createConnection } from "@/src/services/user.service";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { IcebreakerStyling as styles } from "../../styling/Icebreaker.styles";
import { getStoredAuth } from "../context/AsyncStorage";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NameBingo from "./NameBingo";

const POLL_INTERVAL = 4000; //4 seconds

type IcebreakerGameProps = {
	event: EventIB;
};

const IcebreakerGame = ({ event }: IcebreakerGameProps) => {
	const { user } = useAuth();
	const { gameState, currentParticipantId } = useGame();
	const router = useRouter();

	useEffect(() => {
		if (!event._id) return;
		if (gameState.progress !== EventState.COMPLETED) return;
		if (!gameState.viewingGame) return; //if user is looking at game from Events page

		router.push("/EventPages/EventComplete");
	}, [gameState.progress, event._id]);

	//Pick game-specific component
	const renderGame = () => {
		switch (event.gameType) {
			case "Name Bingo":
				return (
					<NameBingo eventId={event._id} onConnect={handleConnect} />
				);
			default:
				return <Text>Game not found</Text>;
		}
	};

	const handleConnect = async (
		userToConnect: Participant,
		description: string | null,
	) => {
		if (!user || !currentParticipantId || !userToConnect?._id) return;
		if (!gameState?.eventId) return;

		try {
			const stored = await getStoredAuth();

			const res = await createConnection(
				gameState.eventId,
				currentParticipantId, //primaryParticipantId
				userToConnect._id, //secondaryParticipantId
				stored.accessToken,
				description,
			);

			if (!res) {
				Alert.alert("Error", "Failed to connect. Please try again later.");
				return;
			}
		} catch (err) {
			console.log("Connection error:", err);
			Alert.alert("Error", "Failed to connect.");
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.gameCard}>
				<View style={styles.gameArea}>{renderGame()}</View>

				<TouchableOpacity
					style={styles.leaveButton}
					onPress={() => router.replace("/EventsPage")}
				>
					<Text style={styles.leaveButtonText}>Leave Game</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default IcebreakerGame;
