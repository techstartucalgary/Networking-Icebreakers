import EventIB from "@/src/interfaces/Event";
import { User } from "@/src/interfaces/User";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";
import { UserModalStyling as styles } from "../../styling/UserModal.styles";

type UserModalProps = {
	event: EventIB;
	user: User;
	visible: boolean;
	onRequestClose: () => void;
};

const UserModal = ({ user, event, onRequestClose }: UserModalProps) => {
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

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
							<Image
								source={{
									uri: user.profilePhoto ?? "https://i.pravatar.cc/150",
								}}
								style={styles.userAvatar}
							/>

							<Text style={styles.userName}>{user.name}</Text>

							{user.bio && <Text style={styles.userBio}>{user.bio}</Text>}

							{user.socialLinks?.length > 0 && (
								<View>
									<Text style={styles.userName}>
										{user.socialLinks[0].label}
									</Text>
									<Text style={styles.link}>{user.socialLinks[0].url}</Text>
								</View>
							)}

							<Pressable
								onPress={onRequestClose}
								style={styles.leaveUserButton}
							>
								<Text style={styles.leaveUserButtonText}>
									Back to Your Connections
								</Text>
							</Pressable>

							{!!err && <Text style={styles.err}>{err}</Text>}
						</>
					)}
				</View>
			</View>
		</Modal>
	);
};

export default UserModal;
