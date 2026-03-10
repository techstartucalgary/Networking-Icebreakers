import { Connection, User } from "@/src/interfaces/User";
import {
	fetchConnections,
	participantFetch,
} from "@/src/services/user.service";
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

	//TODO: Remove hard coded statuses
	const upcoming = false;//event.currentState === EventState.UPCOMING;
	const live = true; //event.currentState === EventState.IN_PROGRESS;
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

			const res = await fetchConnections(participantId, eventId, accessToken);

			if (!res || !res.connections) {
				throw new Error("Unable to load connections for this event.");
			}

			const connectionList: Connection[] = res.connections;

			const userPromises = connectionList.map(async (conn) => {
				//decide which participant is secondary
				const otherParticipantId =
					conn.primaryParticipantId === participantId
						? conn.secondaryParticipantId
						: conn.primaryParticipantId;

				//TODO: fetch the full user info
				const userRes = await participantFetch(
					otherParticipantId,
					eventId,
					accessToken,
				);
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

					{/* Join and View Game Buttons */}
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
