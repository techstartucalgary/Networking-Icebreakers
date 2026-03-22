import { useJoinEvent } from "@/src/components/new-events/JoinEvent";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	ImageBackground,
	Text,
	TextInput,
	TouchableOpacity,
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
								{/* QR Section */}
								<View style={styles.section}>
									<Text style={styles.label}>Scan QR Code</Text>

									{!showScanner ? (
										<TouchableOpacity
											style={styles.buttonSecondary}
											onPress={() => setShowScanner(true)}
										>
											<Text style={styles.buttonText}>Open Scanner</Text>
										</TouchableOpacity>
									) : (
										<>
											<QRScannerBox onClose={() => setShowScanner(false)} />
											<TouchableOpacity
												style={styles.buttonSecondary}
												onPress={() => setShowScanner(false)}
											>
												<Text style={styles.buttonText}>Close Scanner</Text>
											</TouchableOpacity>
										</>
									)}
								</View>

								{/* Divider */}
								<View style={styles.divider}>
									<Text style={styles.dividerText}>OR</Text>
								</View>

								{/* Code Entry */}
								<View>
									<Text style={styles.label}>Enter Event Code</Text>

									<TextInput
										style={styles.input}
										placeholder="ABC123"
										value={eventCode}
										onChangeText={(text) => {
											setEventCode(text);
											setErrorMessage("");
										}}
										autoCapitalize="characters"
									/>

									<TouchableOpacity
										style={styles.button}
										onPress={handleJoinEvent}
										disabled={!eventCode.trim()}
									>
										<Text style={styles.buttonText}>Join Event</Text>
									</TouchableOpacity>

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
