import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import IcebreakerGame from "../../src/components/games/IcebreakerGame";
import { getEventById } from "../../src/services/event.service";
import { useGame } from "@/src/components/context/GameContext";

const GamePage = () => {
	const router = useRouter();
	const { gameState } = useGame();
	const [event, setEvent] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const loadGameData = useCallback(async () => {
		setLoading(true);

		if (!gameState?.eventId) {
			router.replace("/(tabs)/EventsPage");
			return;
		}

		//fetch the event data
		getEventById(gameState?.eventId)
			.then((data) => {
				setEvent(data?.event);
			})
			.finally(() => setLoading(false));
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadGameData();
		}, [loadGameData]),
	);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#000" />
				<Text>Loading event...</Text>
			</View>
		);
	}

	if (!event) {
		return (
			<View style={styles.center}>
				<Text>Event not found.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{event.name}</Text>
			<Text style={styles.description}>{event.description}</Text>

			{/* Game Rendering */}
			<IcebreakerGame/>
		</View>
	);
};

export default GamePage;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f8f8f8",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	description: {
		fontSize: 16,
		marginBottom: 20,
	},
});
