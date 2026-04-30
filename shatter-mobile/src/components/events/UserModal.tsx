import { User } from "@/src/interfaces/User";
import { Linking, Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { UserModalStyling as styles } from "../../styling/UserModal.styles";
import { LinkRow } from "../general/LinkRow";

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
							{user.socialLinks.linkedin && (
								<LinkRow label="LinkedIn" url={user.socialLinks.linkedin} />
							)}

							{user.socialLinks.github && (
								<LinkRow label="GitHub" url={user.socialLinks.github} />
							)}

							{user.socialLinks.other?.map((link, index) => (
								<LinkRow key={index} label={link.label} url={link.url} />
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
