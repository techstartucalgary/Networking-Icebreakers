import { EventState, Participant } from "@/src/interfaces/Event";
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

const IcebreakerGame = () => {
	const { user } = useAuth();
	const { setGameProgress } = useGame();
	const { gameState, currentParticipantId } = useGame();
	const router = useRouter();

	//TODO: Websocket for event progress
	useEffect(() => {
		if (!gameState.eventId) return;

		const interval = setInterval(async () => {
			try {
				const res = await getEventById(gameState.eventId);

				if (res.event.currentState) {
					setGameProgress(res.event.currentState);
				}

				//when game is finised
				if (res?.event.currentState === EventState.COMPLETED) {
					clearInterval(interval);
					router.push("/EventPages/EventComplete");
				}
			} catch (err) {
				console.log("Polling error:", err);
			}
		}, POLL_INTERVAL);

		return () => clearInterval(interval);
	}, [gameState.eventId]);

	//Pick game-specific component
	const renderGame = () => {
		switch (gameState.gameType) {
			case "Name Bingo":
				return (
					<NameBingo eventId={gameState.eventId} onConnect={handleConnect} />
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
