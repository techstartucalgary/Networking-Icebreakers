import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import EventCard from "../../src/components/events/EventCard";
import EventIB from "../../src/interfaces/Event";
import { getUserEvents } from "../../src/services/event.service";

const NewEvents = () => {
	const [events, setEvents] = useState<EventIB[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

	//reload event list
	const loadEvents = useCallback(async () => {
		setLoading(true);

		try {
			const stored = await getStoredAuth();
			if (stored.userId !== "GUEST") { //guest user that hasn't joined event
				const data = await getUserEvents(stored.userId, stored.accessToken);
				setEvents(data?.events || []);
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
	const handlePress = (eventId: string) => {
		setExpandedEventId((prev) => (prev === eventId ? null : eventId));
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading events...</Text>
			</View>
		);
	}

	if (events.length === 0) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<Text>No events joined</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={events}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<EventCard
						event={item}
						expanded={expandedEventId === item._id}
						onPress={() => handlePress(item._id)}
						onJoinGame={() => {
							router.push({
								pathname: "/GamePages/Game",
								params: { eventId: item._id },
							});
						}}
					/>
				)}
			/>
		</View>
	);
};

export default NewEvents;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f8f8",
		padding: 20,
	},
});
