import { colors } from "@/src/styling/constants";
import { GuestStyling as styles } from "@/src/styling/Guest.styles";
import { Stack, useRouter } from "expo-router";
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

export default function GuestConfirm() {
	const { continueAsGuest } = useAuth();
	const [name, setName] = useState("");
	const [organization, setOrganization] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleContinue = async () => {
		if (!name.trim() || !organization.trim()) {
			setError("Name and Organization cannot be empty");
			return;
		}

		setError("");

		await continueAsGuest(
			name.trim(),
			{},
			organization.trim(),
		);

		router.replace("/JoinEventPage");
	};

	return (
		<>
			<Stack.Screen options={{ animation: "fade" }} />
			<ImageBackground
				source={require("../../src/images/getStartedImage.png")}
				style={styles.background}
				resizeMode="cover"
			>
				<SafeAreaView style={styles.safe}>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Guest Access</Text>
						<Text style={styles.subtitle}>Continue without a contact link</Text>
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

						<Text style={styles.label}>Organization</Text>
						<TextInput
							style={styles.input}
							placeholder="Your Organization"
							placeholderTextColor={colors.lightGrey2}
							value={organization}
							onChangeText={setOrganization}
						/>

						{error ? <Text style={styles.error}>{error}</Text> : null}

						<TouchableOpacity
							style={styles.primaryButton}
							onPress={handleContinue}
						>
							<Text style={styles.buttonText}>Continue</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButton}
							onPress={() => router.back()}
						>
							<Text style={styles.buttonText}>Back</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</ImageBackground>
		</>
	);
}
