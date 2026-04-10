import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IcebreakerGame from "../../src/components/games/IcebreakerGame";
import FullPageLoader from "../../src/components/general/FullPageLoader";
import { getEventById } from "../../src/services/event.service";
import { GamePageStyling as styles } from "../../src/styling/GamePage.styles";

const GamePage = () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>(); //avoid race conditions with initializeGame
	const [event, setEvent] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const loadEvent = useCallback(async () => {
		if (!eventId) {
			setLoading(false);
			return;
		}

		try {
			const data = await getEventById(eventId);
			setEvent(data?.event || null);
		} catch (err) {
			console.log("Failed to load event:", err);
			setEvent(null);
		} finally {
			setLoading(false); //wait for children to load
		}
	}, [eventId]);

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
						<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
							{event.name}
						</Text>
						<Text
							style={styles.description}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{event.description}
						</Text>
					</View>

					<View style={styles.gameContainer}>
						<IcebreakerGame event={event} />
					</View>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
};

export default GamePage;
