import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, LayoutAnimation, Pressable, Text, View } from "react-native";
import EventIB, { EventState, GameType } from "../../interfaces/Event";
import { EventCardStyling as styles } from "../../styling/EventCard.styles";
import { useGame } from "../context/GameContext";
import ConnectionsModal from "./ConnectionsModal";

type EventCardProps = {
	event: EventIB;
	expanded: boolean;
	onPress: () => void; //if tapped
};

const EventCard = ({ event, expanded, onPress }: EventCardProps) => {
	const router = useRouter();
	const { initializeGame } = useGame();
	const [modalVisible, setModalVisible] = useState(false);

	const upcoming = event.currentState === EventState.UPCOMING;
	const live = event.currentState === EventState.IN_PROGRESS;
	const completed = event.currentState === EventState.COMPLETED;

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
							<Text style={styles.upcomingButtonText}>Wait to Start...</Text>
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

					{/* Connections Button */}
					<Pressable
						onPress={() => setModalVisible(true)}
						style={styles.connectionsButton}
					>
						<Text style={styles.connectionsButtonText}>
							See Your Connections
						</Text>
					</Pressable>

					{/* Connections Modal */}
					{modalVisible && (
						<ConnectionsModal
							onRequestClose={() => setModalVisible(false)}
							event={event}
						></ConnectionsModal>
					)}
				</View>
			)}
		</Pressable>
	);
};

export default EventCard;
