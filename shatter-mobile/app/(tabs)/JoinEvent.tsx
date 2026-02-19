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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
						setErrorMessage(null);
					}}
					autoCapitalize="characters"
					autoCorrect={false}
				/>

				<Button
					title="Join Event"
					onPress={async () => {
						const joinRes = await joinEvent(eventCode);

						switch (joinRes.status) {
							case "event-not-found":
								setErrorMessage("We couldn’t find an event with that code.");
								break;
							case "no-user":
								setErrorMessage("Your profile is missing a name.");
								break;
							case "no-user-id":
								setErrorMessage("Please sign in again and retry.");
								break;
							case "join-error":
								setErrorMessage("Something went wrong joining the event.");
								break;
							case "success":
								setErrorMessage(null);
								router.push({ pathname: "/Events" });
								break;
						}
					}}
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
