import { Connection, User } from "@/src/interfaces/User";
import { fetchConnections, userFetch } from "@/src/services/user.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import EventIB, { EventState, GameType } from "../../interfaces/Event";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";

type EventCardProps = {
	event: EventIB;
	expanded: boolean;
	onPress: () => void; //if tapped
};

const EventCard = ({ event, expanded, onPress }: EventCardProps) => {
	const router = useRouter();
	const { user, authStorage } = useAuth();
	const { initializeGame, currentParticipantId } = useGame();
	const [connections, setConnections] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

	const live = event.currentState === EventState.IN_PROGRESS; //TODO: Remove hard coded live status
	const completed = true; //event.currentState === EventState.COMPLETED; //TODO: Remove hard coded completed status

	useEffect(() => {
		if (expanded) {
			loadConnections(event._id);
		}
	}, [expanded]);

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

			const res = await fetchConnections(participantId, eventId, accessToken);

			if (!res || !res.connections) {
				throw new Error("Unable to load connections for this event.");
			}

			const connectionList: Connection[] = res.connections;

			const userPromises = connectionList.map(async (conn) => {
				//decide which participant is secondary
				const otherUserId =
					conn.primaryParticipantId === participantId
						? conn.secondaryParticipantId
						: conn.primaryParticipantId;

				//TODO: fetch the full user info
				const userRes = await userFetch(otherUserId, accessToken);
				return userRes.user;
			});

			const detailedUsers = await Promise.all(userPromises);
			setConnections(detailedUsers);
		} catch (err) {
			console.log("Load connections error:", err);
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Pressable onPress={onPress} style={styles.card}>
			<View style={styles.imageWrapper}>
				<Image source={{ uri: event.eventImg }} style={styles.image} />

				{/* LIVE badge */}
				{live && (
					<View style={styles.liveBadge}>
						<Text style={styles.liveText}>Currently Shattering!</Text>
					</View>
				)}
			</View>
			<Text style={styles.title}>{event.name}</Text>

			<Text style={styles.date}>
				{new Date(event.startDate).toLocaleString()}
			</Text>

			{expanded && (
				<View style={styles.expandedContent}>
					<Text>{event.description}</Text>

					{/* Join and View Game Buttons */}
					{live && (
						<Pressable
							onPress={() => {
								if (!event.gameType) {
									//TODO: REMOVE hard-coded event data
									event.currentState = EventState.IN_PROGRESS;
									event.gameType = GameType.NAME_BINGO;
								}
								initializeGame(event.gameType, event._id, event.currentState);
								router.push(`/GamePages/Game`);
							}}
							style={styles.joinButton}
						>
							<Text style={styles.joinButtonText}>Join Game</Text>
						</Pressable>
					)}

					{completed && (
						<Pressable
							onPress={() => {
								if (!event.gameType) {
									//TODO: REMOVE hard-coded event data
									event.gameType = GameType.NAME_BINGO;
									event.currentState = EventState.COMPLETED;
								}
								initializeGame(event.gameType, event._id, event.currentState);
								router.push(`/GamePages/Game`);
							}}
							style={styles.viewButton}
						>
							<Text style={styles.viewButtonText}>View Game</Text>
						</Pressable>
					)}

					{loading && <Text>Loading connections...</Text>}

					{/* Connection List */}
					{!loading && (
						<Text style={styles.connectionsTitle}>Connections:</Text>
					)}
					<FlatList
						data={connections}
						keyExtractor={(item) => item._id!}
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

					<Text style={styles.err}>{err}</Text>
				</View>
			)}
		</Pressable>
	);
};

export default EventCard;

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 5,
		elevation: 3,
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		borderRadius: 10,
		overflow: "hidden",
		marginBottom: 10,
	},
	image: {
		width: "100%",
		height: 150,
		borderRadius: 10,
		marginBottom: 10,
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
	},
	date: {
		fontSize: 14,
		color: "#555",
	},
	expandedContent: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#eee",
		paddingTop: 12,
	},
	description: {
		fontSize: 14,
		color: "#777",
		marginVertical: 5,
	},
	liveBadge: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "#ef4444",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	joinButton: {
		marginTop: 12,
		backgroundColor: "#22c55e",
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	joinButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 15,
	},
	viewButton: {
		marginTop: 12,
		backgroundColor: "#e5cd15",
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	viewButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 15,
	},
	connectionsTitle: {
		fontSize: 13,
		color: "#777",
		fontWeight: "bold",
	},
	item: {
		fontSize: 12,
		color: "#777",
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
	},
	itemWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 2,
	},
	liveText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 12,
		zIndex: 1,
	},
	err: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#ef4444",
	},
});
