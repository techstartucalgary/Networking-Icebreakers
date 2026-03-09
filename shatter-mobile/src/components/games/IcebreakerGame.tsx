import { Participant } from "@/src/interfaces/Event";
import { createConnection } from "@/src/services/user.service";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { IcebreakerStyling as styles } from "../../styling/Icebreaker.styles";
import { getStoredAuth } from "../context/AsyncStorage";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NameBingo from "./NameBingo";

const IcebreakerGame = () => {
	const { user } = useAuth();
	const { gameState, currentParticipantId } = useGame();
	const router = useRouter();

	const [loading, setLoading] = useState(true);

	//Pick game-specific component
	const renderGame = () => {
		switch (gameState.gameType) {
			case "Name Bingo":
				return (
					<NameBingo
						eventId={gameState.eventId}
						onConnect={handleConnect}
						onLoaded={() => setLoading(false)}
					/>
				);
			default:
				return <Text>Game not found</Text>;
		}
	};

	const handleConnect = async (
		userToConnect: Participant,
		description: string | null,
	) => {
		if (!user || !currentParticipantId || !userToConnect?.participantId) return;
		if (!gameState?.eventId) return;

		try {
			const stored = await getStoredAuth();

			const res = await createConnection(
				gameState.eventId,
				currentParticipantId, //primaryParticipantId
				userToConnect.participantId, //secondaryParticipantId
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
