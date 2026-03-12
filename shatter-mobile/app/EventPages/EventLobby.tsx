import { useGame } from "@/src/components/context/GameContext";
import { EventState } from "@/src/interfaces/Event";
import { getEventById } from "@/src/services/event.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventLobbyStyling as styles } from "../../src/styling/EventLobby.styles";

const POLL_INTERVAL = 3000; //3 seconds

export default function EventLobby() {
	const { gameState } = useGame();
	const [status, setStatus] = useState(EventState.UPCOMING);

	//TODO: Websocket for game loading
	useEffect(() => {
		const interval = setInterval(async () => {
			const res = await getEventById(gameState.eventId);
			const event = res?.event;
			if (!event) return;

			setStatus(event.currentState);

			if (event.currentState === EventState.IN_PROGRESS) {
				clearInterval(interval);

				router.replace({
					pathname: "/GamePages/Game",
				});
			}
		}, POLL_INTERVAL);

		return () => clearInterval(interval);
	}, [gameState.eventId]);

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.container}>
				<Text style={styles.title}>Successfully Joined!</Text>

				{status === EventState.UPCOMING && (
					<>
						<Text style={styles.text}>Waiting for the event to start...</Text>
						<ActivityIndicator size="large" style={styles.indicator} />
					</>
				)}

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
