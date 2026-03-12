import { useAuth } from "@/src/components/context/AuthContext";
import { useGame } from "@/src/components/context/GameContext";
import {
	participantFetch,
	userFetch
} from "@/src/services/user.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventCompletedStyling as styles } from "../../src/styling/EventCompleted.styles";

export default function EventComplete() {
	const { user, authStorage } = useAuth();
	const { gameState, currentParticipantId } = useGame();
	const [connections, setConnections] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");

	useEffect(() => {
		if (gameState.eventId && currentParticipantId) {
			loadConnections(gameState.eventId);
		}
	}, [gameState.eventId, currentParticipantId]);

	const loadConnections = async (eventId: string) => {
		try {
			setLoading(true);

			const userId = user?._id;
			const accessToken = authStorage.accessToken;
			const participantId = currentParticipantId;

			if (!userId) {
				throw new Error("No user logged in.");
			}

			if (!participantId) {
				throw new Error("No participant set.");
			}

			//fetch the connection  info
			const participantConnections = await participantFetch(
				participantId,
				eventId,
				accessToken,
			);

			if (participantConnections.length === 0) {
				setConnections([]);
				setErr("");
				return;
			}

			const userPromises = participantConnections.map(async (conn) => {
				if (!conn.user?._id) {
					throw new Error(
						`Missing userId for connection: ${conn.participantName}`,
					);
				}

				const res = await userFetch(conn.user?._id, accessToken);
				return res.user;
			});

			const detailedUsers = await Promise.all(userPromises);
			setConnections(detailedUsers);
		} catch (err) {
			console.log("Load connections error:", err);
			setErr((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.container}>
				<Text style={styles.title}>Way to Shatter those Boundaries!</Text>
				<Text style={styles.subtitle}>
					Want to keep networking? Check out who you connected with!
				</Text>

				{loading && <Text>Loading connections...</Text>}

				{!loading && (
					<>
						<Text style={styles.connectionsTitle}>Your Connections:</Text>
						<FlatList
							data={connections}
							keyExtractor={(item) => item._id ?? ""}
							renderItem={({ item }) => (
								<View style={styles.itemWrapper}>
									{item.profilePhoto && (
										<Image
											source={{ uri: item.profilePhoto }}
											style={styles.avatar}
										/>
									)}

									<Text style={styles.item}>{item.name}</Text>
								</View>
							)}
						/>
					</>
				)}

				{err ? <Text style={styles.err}>{err}</Text> : null}

				{/* Return to Events Button */}
				<TouchableOpacity
					style={styles.eventsButton}
					onPress={() => router.replace("/EventsPage")}
				>
					<Text style={styles.eventsButtonText}>Return to Events</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
