import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";
import QRScannerBox from "../../src/components/new-events/QRScannerBox";

export default function JoinEventPage() {
	const { user } = useAuth();
	const [showScanner, setShowScanner] = useState(false);

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
});
