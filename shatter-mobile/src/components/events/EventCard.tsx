import { User } from "@/src/interfaces/User";
import { participantFetch, userFetch } from "@/src/services/user.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	LayoutAnimation,
	Platform,
	Pressable,
	Text,
	UIManager,
	View,
} from "react-native";
import EventIB, { EventState, GameType } from "../../interfaces/Event";
import { EventCardStyling as styles } from "../../styling/EventCard.styles";
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

	const upcoming = event.currentState === EventState.UPCOMING;
	const live = event.currentState === EventState.IN_PROGRESS;
	const completed = event.currentState === EventState.COMPLETED;

	useEffect(() => {
		if (expanded) {
			loadConnections(event._id);
		}

		if (Platform.OS === "android") {
			UIManager.setLayoutAnimationEnabledExperimental?.(true);
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

			//fetch the connection  info
			const participantConnections = await participantFetch(
				participantId,
				eventId,
				accessToken,
			);

			if (participantConnections.length === 0) {
				setConnections([]);
				setError("");
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
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Pressable
			onPress={() => {
				LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
				onPress();
			}}
			style={styles.card}
		>
			<View style={styles.imageWrapper}>
				<Image source={{ uri: event.eventImg }} style={styles.image} />

				{/* Badges */}
				{upcoming && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>Starting Soon...</Text>
					</View>
				)}

				{live && (
					<View style={styles.badgeLive}>
						<Text style={styles.badgeText}>Currently Shattering!</Text>
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

					{/* Game Buttons */}
					{upcoming && (
						<Pressable
							onPress={() => {
								if (event.currentState !== EventState.UPCOMING) {
									//TODO: REMOVE hard-coded event data
									event.currentState = EventState.UPCOMING;
									event.gameType = GameType.NAME_BINGO;
								}
								initializeGame(event.gameType, event._id, event.currentState);
								router.push(`/EventPages/EventLobby`);
							}}
							style={styles.upcomingButton}
						>
							<Text style={styles.upcomingButtonText}>Wait to Start</Text>
						</Pressable>
					)}

					{live && (
						<Pressable
							onPress={() => {
								if (event.currentState !== EventState.IN_PROGRESS) {
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
								if (event.currentState !== EventState.COMPLETED) {
									//TODO: REMOVE hard-coded event data
									event.currentState = EventState.COMPLETED;
									event.gameType = GameType.NAME_BINGO;
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
						<>
							<Text style={styles.connectionsTitle}>Connections:</Text>
							{connections.length === 0 ? (
								<Text style={styles.noConnectionsText}>
									No connections yet! Go make some!
								</Text>
							) : (
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
							)}
						</>
					)}

					<Text style={styles.err}>{err}</Text>
				</View>
			)}
		</Pressable>
	);
};

export default EventCard;
