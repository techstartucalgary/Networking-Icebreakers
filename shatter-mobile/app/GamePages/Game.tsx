import { useGame } from "@/src/components/context/GameContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FullPageLoader from "../../src/components/FullPageLoader";
import IcebreakerGame from "../../src/components/games/IcebreakerGame";
import { getEventById } from "../../src/services/event.service";
import { GamePageStyling as styles } from "../../src/styling/GamePage.styles";

const GamePage = () => {
	const router = useRouter();
	const { gameState } = useGame();
	const [event, setEvent] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [childLoading, setChildLoading] = useState(true);

	const loadEvent = useCallback(async () => {
		if (!gameState?.eventId) {
			router.replace("/(tabs)/EventsPage");
			return;
		}

		try {
			const data = await getEventById(gameState.eventId);
			setEvent(data?.event || null);
		} catch (err) {
			console.log("Failed to load event:", err);
			setEvent(null);
		} finally {
			setLoading(false); //wait for children to load
		}
	}, [gameState?.eventId]);

	useFocusEffect(
		useCallback(() => {
			loadEvent();
		}, [loadEvent]),
	);

	if (loading) return <FullPageLoader message="Loading game..." />;
	if (!event) return <FullPageLoader message="Event not found." />;

	return (
		<ImageBackground
			source={require("../../src/images/getStartedImage.png")}
			style={styles.background}
			resizeMode="cover"
		>
			<SafeAreaView style={styles.safe}>
				<View style={styles.page}>
					<View style={styles.eventCard}>
						<Text style={styles.title}>{event.name}</Text>
						<Text style={styles.description}>{event.description}</Text>
					</View>

					<View style={styles.gameContainer}>
						<IcebreakerGame />
					</View>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
};

export default GamePage;
