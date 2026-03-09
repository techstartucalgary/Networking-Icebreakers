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

	const live = true; //event.currentState === EventState.IN_PROGRESS; //TODO: Remove hard coded live status
	const completed = event.currentState === EventState.COMPLETED; //TODO: Remove hard coded completed status

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
