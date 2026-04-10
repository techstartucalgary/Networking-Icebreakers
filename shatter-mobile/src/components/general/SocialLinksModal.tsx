import { colors } from "@/src/styling/constants";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { UpdateProfileStyling as styles } from "../../styling/UpdateProfile.styles";

type SocialLinkModalProps = {
	socialModalVisible: boolean;
	setSocialModalVisible: (visible: boolean) => void;
	socialLinks: { label: string; url: string }[];
	setSocialLinks: (links: { label: string; url: string }[]) => void;
};

export function SocialLinksModal({
	socialModalVisible,
	setSocialModalVisible,
	socialLinks,
	setSocialLinks,
}: SocialLinkModalProps) {
	const handleLinkChange = (
		index: number,
		field: "label" | "url",
		value: string,
	) => {
		const updated = [...socialLinks];
		updated[index] = { ...updated[index], [field]: value };
		setSocialLinks(updated);
	};

	const addNewLink = () =>
		setSocialLinks([...socialLinks, { label: "", url: "" }]);

	const removeLink = (index: number) =>
		setSocialLinks(socialLinks.filter((_, i) => i !== index));
	return (
		<>
			<Modal
				visible={socialModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setSocialModalVisible(false)}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: "rgba(0,0,0,0.5)",
						justifyContent: "center",
						alignItems: "center",
						padding: 20,
					}}
				>
					<View
						style={{
							width: "100%",
							backgroundColor: colors.lightGrey,
							borderRadius: 16,
							padding: 20,
							maxHeight: "80%",
						}}
					>
						<Text style={{ color: colors.darkNavy, fontSize: 18 }}>
							Manage Social Links
						</Text>
						<ScrollView>
							{socialLinks.map((link, index) => (
								<View key={index} style={styles.linkContainer}>
									<TextInput
										style={styles.input}
										placeholder="Label (e.g. LinkedIn)"
										placeholderTextColor={colors.lightGrey2}
										value={link.label}
										onChangeText={(text) =>
											handleLinkChange(index, "label", text)
										}
									/>
									<TextInput
										style={styles.input}
										placeholder="URL"
										placeholderTextColor={colors.lightGrey2}
										value={link.url}
										onChangeText={(text) =>
											handleLinkChange(index, "url", text)
										}
									/>
									<TouchableOpacity
										style={styles.removeButton}
										onPress={() => removeLink(index)}
									>
										<Text style={styles.buttonText}>Remove</Text>
									</TouchableOpacity>
								</View>
							))}
							<TouchableOpacity style={styles.addButton} onPress={addNewLink}>
								<Text style={styles.buttonText}>+ Add Social Link</Text>
							</TouchableOpacity>
						</ScrollView>

						<TouchableOpacity
							style={[styles.saveButton, { marginTop: 15 }]}
							onPress={() => setSocialModalVisible(false)}
						>
							<Text style={styles.buttonText}>Done</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
}
