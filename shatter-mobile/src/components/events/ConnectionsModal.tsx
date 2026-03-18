import EventIB from "@/src/interfaces/Event";
import { User } from "@/src/interfaces/User";
import { participantFetch, userFetch } from "@/src/services/user.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
	Text,
	View,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { ConnectionsModalStyling as styles } from "../../styling/ConnectionsModal.styles";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import UserModal from "./UserModal";

type ConnectionsModalProps = {
	event: EventIB;
	onRequestClose: () => void;
};

const ConnectionsModal = ({ event, onRequestClose }: ConnectionsModalProps) => {
	const router = useRouter();
	const { user, authStorage } = useAuth();
	const { currentParticipantId } = useGame();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [connections, setConnections] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

	useEffect(() => {
		loadConnections(event._id);
	}, []);

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
			const participantConnections =
				(await participantFetch(participantId, eventId, accessToken)) || [];

			if (participantConnections && participantConnections.length === 0) {
				setConnections([]);
				setError("");
				return;
			}

			const userPromises = participantConnections
				.filter((conn) => conn?.user?._id)
				.map(async (conn) => {
					if (!conn.user?._id) {
						throw new Error(
							`Missing userId for connection: ${conn.participantName}`,
						);
					}

					const res = await userFetch(conn.user?._id, accessToken);
					return res.user;
				});

			const detailedUsers = await Promise.all(userPromises);

			//hide duplicate connections
			const seen = new Set<string>();
			const uniqueUsers = detailedUsers.filter((u) => {
				if (!u?._id || seen.has(u._id)) return false;
				seen.add(u._id);
				return true;
			});

			setConnections(uniqueUsers);
		} catch (err) {
			console.log("Load connections error:", err);
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal transparent animationType="fade">
			<View style={styles.overlay}>
				<View style={styles.container}>
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" />
							<Text style={styles.loading}>Loading...</Text>
						</View>
					) : (
						<>
							<Text style={styles.connectionsTitle}>Connections</Text>

							{connections.length === 0 ? (
								<Text style={styles.noConnectionsText}>
									No connections yet! Go make some!
								</Text>
							) : (
								<FlatList
									data={connections.filter(Boolean)}
									keyExtractor={(item, index) => item._id ?? index.toString()}
									showsVerticalScrollIndicator={false}
									renderItem={({ item }) => (
										<Pressable
											style={styles.itemWrapper}
											onPress={() => {
												setSelectedUser(item);
											}}
										>
											<SvgUri
												style={{
													width: 30,
													height: 30,
													borderRadius: 20,
													overflow: "hidden",
													marginRight: 12,
												}}
												uri={
													item.profilePhoto ??
													`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(item.name || "Unknown")}`
												}
											/>

											<Text style={styles.item}>{item.name}</Text>
										</Pressable>
									)}
								/>
							)}

							<Pressable
								onPress={() => {
									router.push("/(tabs)/EventsPage");
									onRequestClose();
								}}
								style={styles.leaveConnectionsButton}
							>
								<Text style={styles.leaveConnectionsButtonText}>
									Back to Your Events
								</Text>
							</Pressable>

							{!!err && <Text style={styles.err}>{err}</Text>}
						</>
					)}
				</View>
				{selectedUser && (
					<UserModal
						onRequestClose={() => setSelectedUser(null)}
						user={selectedUser}
					></UserModal>
				)}
			</View>
		</Modal>
	);
};

export default ConnectionsModal;
