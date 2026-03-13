import { User } from "@/src/interfaces/User";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { UserModalStyling as styles } from "../../styling/UserModal.styles";

type UserModalProps = {
	user: User;
	onRequestClose: () => void;
};

const UserModal = ({ user, onRequestClose }: UserModalProps) => {
	return (
		<Modal transparent animationType="fade">
			<View style={styles.overlay}>
				<View style={styles.container}>
					<View style={styles.headerRow}>
						<Image
							source={{
								uri:
									user.profilePhoto ??
									`https://ui-avatars.com/api/?name=${encodeURIComponent(
										user.name,
									)}&background=random&format=png`,
							}}
							style={styles.userAvatar}
						/>

						<View style={styles.headerText}>
							<Text style={styles.userName}>{user.name}</Text>
						</View>
					</View>

					{user.bio && <Text style={styles.userBio}>{user.bio}</Text>}

					{user.socialLinks?.length > 0 && (
						<View>
							<Text style={styles.linkLabel}>{user.socialLinks[0].label}</Text>
							<Text style={styles.link}>{user.socialLinks[0].url}</Text>
						</View>
					)}

					<Pressable onPress={onRequestClose} style={styles.leaveUserButton}>
						<Text style={styles.leaveUserButtonText}>
							Back to Your Connections
						</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
};

export default UserModal;
