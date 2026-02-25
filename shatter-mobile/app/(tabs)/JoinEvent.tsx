import { useJoinEvent } from "@/src/components/new-events/JoinEvent";
import { router } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";
import QRScannerBox from "../../src/components/new-events/QRScannerBox";

export default function JoinEventPage() {
	const { user } = useAuth();
	const [showScanner, setShowScanner] = useState(false);
	const [eventCode, setEventCode] = useState("");
	const { joinEvent } = useJoinEvent();
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleJoinEvent = async () => {
		setLoading(true);
		try {
			const eventId = await joinEvent(eventCode);
			setErrorMessage("");
			router.push({
				pathname: "/EventPages/EventLobby",
				params: { eventId },
			});
		} catch (err) {
			setErrorMessage((err as Error).message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			{user ? (
				<Text style={styles.title}>Welcome {user.name}! Join an Event</Text>
			) : (
				<Text style={styles.title}>Welcome! Join an Event</Text>
			)}

			{!showScanner && (
				<Button title="Scan QR Code" onPress={() => setShowScanner(true)} />
			)}

			{showScanner && <QRScannerBox onClose={() => setShowScanner(false)} />}

			{/* Manual code entry */}
			<View style={styles.codeContainer}>
				<TextInput
					style={styles.input}
					placeholder="Enter event code"
					value={eventCode}
					onChangeText={(text) => {
						setEventCode(text);
						setErrorMessage("");
					}}
					autoCapitalize="characters"
					autoCorrect={false}
				/>

				<Button
					title="Join Event"
					onPress={() => handleJoinEvent()}
					disabled={!eventCode.trim()}
				/>

				{errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		marginBottom: 20,
	},
	codeContainer: {
		width: "100%",
		marginTop: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		fontSize: 16,
	},
	errorText: {
		color: "#d32f2f",
		marginTop: 8,
		fontSize: 14,
		justifyContent: "center",
	},
});
