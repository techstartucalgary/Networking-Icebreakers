import { User } from "@/src/interfaces/User";
import { Linking, Modal, Pressable, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";
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
						<SvgUri
							style={{
								width: 40,
								height: 40,
								borderRadius: 20,
								overflow: "hidden",
								marginRight: 12,
							}}
							uri={
								user.profilePhoto ??
								`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || "Unknown")}`
							}
						/>

						<View style={styles.headerText}>
							<Text style={styles.userName}>
								{user.name}
								{user.title ? ` - ${user.title}` : ""}
							</Text>
						</View>
					</View>

					{user.organization && <Text style={styles.userOrganization}>{user.organization}</Text>}

					{user.bio && <Text style={styles.userBio}>{user.bio}</Text>}

					{user.socialLinks && (
						<View>
							{/* LinkedIn */}
							{user.socialLinks.linkedin && (
								<Pressable
									onPress={() => {
										Linking.openURL(user.socialLinks?.linkedin!).catch((err) =>
											console.log("Failed to open URL:", err),
										);
									}}
									style={{ marginBottom: 8 }}
								>
									<Text style={styles.linkLabel}>LinkedIn</Text>
									<Text style={styles.link}>{user.socialLinks.linkedin}</Text>
								</Pressable>
							)}

							{/* GitHub */}
							{user.socialLinks.github && (
								<Pressable
									onPress={() => {
										Linking.openURL(user.socialLinks?.github!).catch((err) =>
											console.log("Failed to open URL:", err),
										);
									}}
									style={{ marginBottom: 8 }}
								>
									<Text style={styles.linkLabel}>GitHub</Text>
									<Text style={styles.link}>{user.socialLinks.github}</Text>
								</Pressable>
							)}

							{/* Other links */}
							{user.socialLinks.other?.map((link, index) => (
								<Pressable
									key={index}
									onPress={() => {
										if (link.url) {
											Linking.openURL(link.url).catch((err) =>
												console.log("Failed to open URL:", err),
											);
										}
									}}
									style={{ marginBottom: 8 }}
								>
									<Text style={styles.linkLabel}>{link.label}</Text>
									<Text style={styles.link}>{link.url}</Text>
								</Pressable>
							))}
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
