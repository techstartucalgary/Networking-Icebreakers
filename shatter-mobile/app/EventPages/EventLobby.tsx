import { useGame } from "@/src/components/context/GameContext";
import { EventState } from "@/src/interfaces/Event";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventLobbyStyling as styles } from "../../src/styling/EventLobby.styles";

export default function EventLobby() {
	const { eventId } = useLocalSearchParams<{ eventId: string }>(); //avoid race conditions with initializeGame
	const { gameState } = useGame();

	useEffect(() => {
		if (!eventId) return;
		if (gameState.progress !== EventState.IN_PROGRESS) return;

		console.log(gameState);

		router.replace({
			pathname: "/GamePages/Game",
			params: { eventId },
		});
	}, [gameState.progress, eventId]);

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.container}>
				<Text style={styles.title}>Successfully Joined!</Text>
				<>
					<Text style={styles.text}>Waiting for the event to start...</Text>
					<ActivityIndicator size="large" style={styles.indicator} />
				</>

				{/* Leave Game Button */}
				<TouchableOpacity
					style={styles.leaveButton}
					onPress={() => router.replace("/EventsPage")}
				>
					<Text style={styles.leaveButtonText}>Leave Game</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
