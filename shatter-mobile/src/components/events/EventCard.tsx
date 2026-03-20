import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, LayoutAnimation, Pressable, Text, View } from "react-native";
import EventIB, { EventState } from "../../interfaces/Event";
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
	const [imageLoaded, setImageLoaded] = useState(false);
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
			style={[styles.card, { opacity: imageLoaded ? 1 : 0 }]}
		>
			{/* TODO: Swap to dynamic event image */}
			<View style={styles.imageWrapper}>
				<Image
					source={
						event.eventImg
							? { uri: event.eventImg }
							: require("../../images/EventDrinksDark.png")
					}
					style={styles.image}
					onLoad={() => setImageLoaded(true)}
				/>

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

			{/* Date + Time */}
			<Text style={styles.date}>
				{new Date(event.startDate).toLocaleDateString(undefined, {
					weekday: "short",
					year: "numeric",
					month: "short",
					day: "numeric",
				})}
				{" • "}
				{new Date(event.startDate).toLocaleTimeString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</Text>

			{expanded && (
				<View style={styles.expandedContent}>
					<Text>{event.description}</Text>

					{/* Game Buttons */}
					{upcoming && (
						<Pressable
							onPress={() => {
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
