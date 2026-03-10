import { EventState } from "@/src/interfaces/Event";
import { getEventById } from "@/src/services/event.service";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventLobbyStyling as styles } from "../../src/styling/EventLobby.styles";

export default function EventLobby() {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const [status, setStatus] = useState(EventState.UPCOMING);

	//TODO: Websocket for game loading
	useEffect(() => {
		const interval = setInterval(async () => {
			const res = await getEventById(eventId);
			const event = res?.event;
			if (!event) return;

			setStatus(event.currentState);

			if (event.currentState === EventState.IN_PROGRESS) {
				clearInterval(interval);

				router.replace({
					pathname: "/GamePages/Game",
				});
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [eventId]);

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
