import { useJoinEvent } from "@/src/components/new-events/JoinEvent";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Button,
	ImageBackground,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedTab from "../../src/components/AnimatedTab";
import { useAuth } from "../../src/components/context/AuthContext";
import QRScannerBox from "../../src/components/new-events/QRScannerBox";
import { JoinEventStyling as styles } from "../../src/styling/JoinEventPage.styles";

export default function JoinEventPage() {
	const { user } = useAuth();
	const [showScanner, setShowScanner] = useState(false);
	const [eventCode, setEventCode] = useState("");
	const { joinEvent } = useJoinEvent();
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	//for manual code entry
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
	};

	return (
		<AnimatedTab>
			<ImageBackground
				source={require("../../src/images/getStartedImage.png")}
				style={styles.background}
				resizeMode="cover"
			>
				<SafeAreaView style={styles.safe}>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Start Shattering</Text>
						<Text style={styles.subtitle}>
							Hey {user?.name || "there"}, Ready to Start Shattering Some
							Boundaries?
						</Text>
					</View>

					<View style={styles.container}>
						{loading && (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#1e3a8a" />
								<Text style={styles.loading}>Joining event...</Text>
							</View>
						)}

						{!loading && (
							<>
								{!showScanner && (
									<Button
										title="Scan QR Code"
										onPress={() => setShowScanner(true)}
									/>
								)}

								{showScanner && (
									<QRScannerBox onClose={() => setShowScanner(false)} />
								)}

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
										onPress={handleJoinEvent}
										disabled={!eventCode.trim()}
									/>

									{errorMessage && (
										<Text style={styles.errorText}>{errorMessage}</Text>
									)}
								</View>
							</>
						)}
					</View>
				</SafeAreaView>
			</ImageBackground>
		</AnimatedTab>
	);
}
