import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import { useAuth } from "@/src/components/context/AuthContext";
import { useGame } from "@/src/components/context/GameContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	ImageBackground,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../../src/components/events/EventCard";
import EventIB from "../../src/interfaces/Event";
import { getUserEvents } from "../../src/services/event.service";
import { EventPageStyling as styles } from "../../src/styling/EventPage.styles";

export default function EventsPage() {
	const { user } = useAuth();
	const { setCurrentParticipantId } = useGame();
	const [events, setEvents] = useState<EventIB[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

	//reload event list
	const loadEvents = useCallback(async () => {
		setLoading(true);

		try {
			const stored = await getStoredAuth();
			if (stored.userId) {
				//guest that has joined event or user with account
				const data = await getUserEvents(stored.userId, stored.accessToken);
				setEvents(data.events || []);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	//load list on page mount
	useFocusEffect(
		useCallback(() => {
			loadEvents();
		}, [loadEvents]),
	);

	//dropdown of event
	const handlePress = async (event: EventIB) => {
		//set participantId based on event pressed
		const myParticipantId = event.participantIds?.find(
			(p) => p.userId === user?._id,
		)?._id;

		if (myParticipantId) {
			await setCurrentParticipantId(myParticipantId); //update context for participantId for tapped event
		} else {
			console.log("No participantId found for current user in this event.");
			await setCurrentParticipantId(""); //reset if not found
		}

		//expand event based on ID
		setExpandedEventId((prev) => (prev === event._id ? null : event._id));
	};

	return (
		<ImageBackground
			source={require("../../src/images/getStartedImage.png")}
			style={styles.background}
			resizeMode="cover"
		>
			<SafeAreaView style={styles.safe}>
				<View style={styles.header}>
					<Text style={styles.pageTitle}>Upcoming Events</Text>
				</View>
				<View style={styles.container}>
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#1e3a8a" />
							<Text style={styles.loading}>Loading events...</Text>
						</View>
					) : events.length === 0 ? (
						<View style={styles.loadingContainer}>
							<Text style={styles.loading}>No events joined</Text>
						</View>
					) : (
						<FlatList
							data={events}
							keyExtractor={(item) => item._id}
							renderItem={({ item }) => (
								<EventCard
									event={item}
									expanded={expandedEventId === item._id}
									onPress={() => handlePress(item)}
								/>
							)}
						/>
					)}
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}
