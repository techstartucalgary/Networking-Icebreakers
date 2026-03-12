import { SocialLink } from "@/src/interfaces/User";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
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
		<View style={styles.container}>
			<Text style={styles.title}>Continue as Guest</Text>
			<Text style={styles.subtitle}>
				Enter your name so others can identify you.
			</Text>

			<TextInput
				style={styles.input}
				placeholder="Your Name"
				value={name}
				onChangeText={setName}
			/>

			<TextInput
				style={styles.input}
				placeholder="Contact Link"
				value={contactLink}
				onChangeText={setContactLink}
			/>

			<Button title="Continue" onPress={handleContinue} />
			<Button title="Back" onPress={() => router.push("/UserPages/Signup")} />
			<Text style={styles.inputInfo}>
				Your contact link can be your LinkedIn profile URL, a portfolio link, or
				another relevant personal link.
			</Text>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		backgroundColor: "rgba(255, 255, 255, 0.97)",
	},
	title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
	subtitle: { fontSize: 16, marginBottom: 20 },
	input: {
		borderWidth: 1,
		borderColor: "#aaa",
		padding: 10,
		borderRadius: 8,
		marginBottom: 20,
	},
	error: {
		textAlign: "center",
		color: "#e63232",
	},
	inputInfo: {
		textAlign: "center",
		color: "#afafaf",
	},
});
