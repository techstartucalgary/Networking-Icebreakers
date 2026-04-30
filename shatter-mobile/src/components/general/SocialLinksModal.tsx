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
import { OtherLink, SocialLinks } from "@/src/interfaces/User";

type SocialLinkModalProps = {
	socialModalVisible: boolean;
	setSocialModalVisible: (visible: boolean) => void;
	socialLinks: SocialLinks;
	setSocialLinks: (links: SocialLinks) => void;
};

export function SocialLinksModal({
	socialModalVisible,
	setSocialModalVisible,
	socialLinks,
	setSocialLinks,
}: SocialLinkModalProps) {
	//fixed fields
	const updateField = (
		field: "linkedin" | "github",
		value: string
	) => {
		setSocialLinks({
			...socialLinks,
			[field]: value,
		});
	};

	//other links
	const updateOtherLink = (
		index: number,
		field: keyof OtherLink,
		value: string
	) => {
		const updated = [...(socialLinks.other || [])];
		updated[index] = {
			...updated[index],
			[field]: value,
		};

		setSocialLinks({
			...socialLinks,
			other: updated,
		});
	};

	const addOtherLink = () => {
		setSocialLinks({
			...socialLinks,
			other: [
				...(socialLinks.other || []),
				{ label: "", url: "" },
			],
		});
	};

	const removeOtherLink = (index: number) => {
		const updated = (socialLinks.other || []).filter(
			(_, i) => i !== index
		);

		setSocialLinks({
			...socialLinks,
			other: updated,
		});
	};

	return (
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
						maxHeight: "85%",
					}}
				>
					<Text style={{ color: colors.darkNavy, fontSize: 18 }}>
						Manage Social Links
					</Text>

					<ScrollView>

						{/* LinkedIn */}
						<Text style={styles.label}>LinkedIn</Text>
						<TextInput
							style={styles.input}
							placeholder="LinkedIn URL"
							value={socialLinks.linkedin ?? ""}
							onChangeText={(text) =>
								updateField("linkedin", text)
							}
							autoCapitalize="none"
							keyboardType="url"
						/>

						{/* GitHub */}
						<Text style={styles.label}>GitHub</Text>
						<TextInput
							style={styles.input}
							placeholder="GitHub URL"
							value={socialLinks.github ?? ""}
							onChangeText={(text) =>
								updateField("github", text)
							}
							autoCapitalize="none"
							keyboardType="url"
						/>

						{/* Other */}
						<Text style={[styles.label, { marginTop: 12 }]}>
							Other Links
						</Text>

						{(socialLinks.other || []).map((link, index) => (
							<View key={index} style={styles.linkContainer}>
								<TextInput
									style={styles.input}
									placeholder="Label (e.g. Portfolio)"
									value={link.label}
									onChangeText={(text) =>
										updateOtherLink(index, "label", text)
									}
								/>

								<TextInput
									style={styles.input}
									placeholder="URL"
									value={link.url}
									onChangeText={(text) =>
										updateOtherLink(index, "url", text)
									}
									autoCapitalize="none"
									keyboardType="url"
								/>

								<TouchableOpacity
									style={styles.removeButton}
									onPress={() => removeOtherLink(index)}
								>
									<Text style={styles.buttonText}>
										Remove
									</Text>
								</TouchableOpacity>
							</View>
						))}

						<TouchableOpacity
							style={styles.addButton}
							onPress={addOtherLink}
						>
							<Text style={styles.buttonText}>
								+ Add Other Link
							</Text>
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
	);
}
