import SocialSpinner from "@/src/components/login-signup/SocialSpinner";
import { colors } from "@/src/styling/constants";
import { GuestStyling as styles } from "@/src/styling/Guest.styles";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
	ImageBackground,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { FontAwesome, Feather, Entypo } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/components/context/AuthContext";
import { SocialLinks } from "@/src/interfaces/User";

export default function GuestPage() {
	const { continueAsGuest } = useAuth();
	const [name, setName] = useState("");
	const [selectedType, setSelectedType] = useState<"linkedin" | "github" | "other" | null>(null);
	const [linkedin, setLinkedin] = useState("");
	const [github, setGithub] = useState("");
	const [other, setOther] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleContinue = async () => {
		if (!name.trim()) {
			setError("Name cannot be empty");
			return;
		}

		//ensure at least one link exists
		if (!linkedin.trim() && !github.trim() && !other.trim()) {
			setError("Please provide at least one contact link.");
			return;
		}

		const validateUrl = (url: string) => {
			try {
				return new URL(url).href;
			} catch {
				return null;
			}
		};

		const socialLinks: SocialLinks = {};

		if (linkedin.trim()) {
			const valid = validateUrl(linkedin);
			if (!valid) {
				setError("Invalid LinkedIn URL");
				return;
			}
			socialLinks.linkedin = valid;
		}

		if (github.trim()) {
			const valid = validateUrl(github);
			if (!valid) {
				setError("Invalid GitHub URL");
				return;
			}
			socialLinks.github = valid;
		}

		if (other.trim()) {
			const valid = validateUrl(other);
			if (!valid) {
				setError("Invalid Other URL");
				return;
			}
			socialLinks.other?.push({ label: "Contact Link", url: valid });
		}

		setError("");

		await continueAsGuest(name.trim(), socialLinks, "");
		router.replace("/JoinEventPage");
	};

	return (
		<>
			<Stack.Screen options={{ animation: "slide_from_left" }} />
			<ImageBackground
				source={require("../../src/images/getStartedImage.png")}
				style={styles.background}
				resizeMode="cover"
			>
				<SafeAreaView style={styles.safe}>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Guest Access</Text>
						<Text style={styles.subtitle}>Enter your details to continue</Text>
					</View>

					<View style={styles.container}>
						<Text style={styles.label}>Your Name</Text>
						<TextInput
							style={styles.input}
							placeholder="Your Name"
							placeholderTextColor={colors.lightGrey2}
							value={name}
							onChangeText={setName}
						/>

						<Text style={styles.label}>Contact Link</Text>

						<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
							<TouchableOpacity
								onPress={() => setSelectedType("linkedin")}
								style={{
									padding: 12,
									borderRadius: 12,
									backgroundColor: selectedType === "linkedin" ? "#0A66C2" : colors.lightGrey2,
									flex: 1,
									marginRight: 8,
									alignItems: "center",
								}}
							>
								<FontAwesome name="linkedin" size={22} color="white" />
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setSelectedType("github")}
								style={{
									padding: 12,
									borderRadius: 12,
									backgroundColor: selectedType === "github" ? "#24292e" : colors.lightGrey2,
									flex: 1,
									marginRight: 8,
									alignItems: "center",
								}}
							>
								<FontAwesome name="github" size={22} color="white" />
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setSelectedType("other")}
								style={{
									padding: 12,
									borderRadius: 12,
									backgroundColor: selectedType === "other" ? "#6c63ff" : colors.lightGrey2,
									flex: 1,
									alignItems: "center",
								}}
							>
								<Feather name="link" size={22} color="white" />
							</TouchableOpacity>
						</View>

						{selectedType && (
							<TextInput
								style={styles.input}
								placeholder={
									selectedType === "linkedin"
										? "LinkedIn URL"
										: selectedType === "github"
										? "GitHub URL"
										: "Portfolio / Other URL"
								}
								placeholderTextColor={colors.lightGrey2}
								value={
									selectedType === "linkedin"
										? linkedin
										: selectedType === "github"
										? github
										: other
								}
								onChangeText={(text) => {
									if (selectedType === "linkedin") setLinkedin(text);
									else if (selectedType === "github") setGithub(text);
									else setOther(text);
								}}
								autoCapitalize="none"
								keyboardType="url"
							/>
						)}

						<Text style={styles.inputInfo}>
							Select a platform above, then enter your profile link.
						</Text>

						{error ? <Text style={styles.error}>{error}</Text> : null}

						<TouchableOpacity
							style={styles.primaryButton}
							onPress={handleContinue}
						>
							<Text style={styles.buttonText}>Continue</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButton}
							onPress={() => router.push("/UserPages/Signup")}
						>
							<Text style={styles.buttonText}>Back</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButtonNoBack}
							onPress={() => {
								setShowConfirmModal(true);
							}}
						>
							<Text style={styles.buttonTextWarning}>No Contact Link?</Text>
						</TouchableOpacity>
					</View>

					<Modal visible={showConfirmModal} transparent animationType="slide">
						<View
							style={{
								flex: 1,
								backgroundColor: "rgba(0,0,0,0.6)",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<View
								style={{
									width: "85%",
									backgroundColor: colors.lightGrey,
									borderRadius: 16,
									padding: 20,
								}}
							>
								<Text style={styles.confirmTitle}>
									Continue Without a Contact Link?
								</Text>

								<SocialSpinner />

								<Text style={styles.confirmSubtitle}>
									Users tend to connect better when you include a contact link
									like LinkedIn or a portfolio.
								</Text>

								<Text style={styles.inputInfo}>
									Adding a contact link helps others learn more about you and
									improves networking during events.
								</Text>

								{/* Add link */}
								<TouchableOpacity
									style={styles.primaryButton}
									onPress={() => setShowConfirmModal(false)}
								>
									<Text style={styles.buttonText}>Add Contact Link</Text>
								</TouchableOpacity>

								{/* Continue anyway */}
								<TouchableOpacity
									style={styles.secondaryButtonNoBack}
									onPress={() => {
										setShowConfirmModal(false);
										router.push("/UserPages/GuestNoLink");
									}}
								>
									<Text style={styles.buttonTextWarning}>
										Continue Without Link
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Modal>
				</SafeAreaView>
			</ImageBackground>
		</>
	);
}
