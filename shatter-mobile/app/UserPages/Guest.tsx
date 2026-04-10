import SocialSpinner from "@/src/components/login-signup/SocialSpinner";
import { SocialLink } from "@/src/interfaces/User";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/components/context/AuthContext";

export default function GuestPage() {
	const { continueAsGuest } = useAuth();
	const [name, setName] = useState("");
	const [contactLink, setContactLink] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleContinue = async () => {
		//need name and social link
		if (!name.trim() || !contactLink.trim()) {
			setError("Name and Social Link Cannot Be Empty");
			return;
		}

		let socialLink: SocialLink | null = null;

		try {
			const validUrl = new URL(contactLink); //throws if invalid
			socialLink = { label: "Contact Link", url: validUrl.href };
		} catch {
			console.log("Invalid URL:", contactLink);
			setError("Please enter a valid contact link.");
			return;
		}

		setError("");
		await continueAsGuest(name.trim(), socialLink, ""); //no organization on this page, handled on GuestConfirm
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
						<TextInput
							style={styles.input}
							placeholder="LinkedIn, portfolio, etc."
							placeholderTextColor={colors.lightGrey2}
							value={contactLink}
							onChangeText={setContactLink}
							autoCapitalize="none"
							keyboardType="url"
						/>
						<Text style={styles.inputInfo}>
							Your contact link can be your LinkedIn profile URL, a portfolio
							link, or another relevant personal link.
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
