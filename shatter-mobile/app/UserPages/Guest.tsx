import { SocialLink } from "@/src/interfaces/User";
import { colors } from "@/src/styling/constants";
import { GuestStyling as styles } from "@/src/styling/Guest.styles";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ImageBackground,
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
	const [error, setError] = useState("");
	const router = useRouter();

	const handleContinue = async () => {
		//need name and social link
		if (!name.trim() || !contactLink) {
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
		await continueAsGuest(name.trim(), socialLink);
		router.replace("/JoinEventPage");
	};

	return (
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
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}
