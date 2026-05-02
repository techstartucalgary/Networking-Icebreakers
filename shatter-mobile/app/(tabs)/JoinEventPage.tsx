import { useJoinEvent } from "@/src/components/new-events/JoinEvent";
import { colors } from "@/src/styling/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/components/context/AuthContext";
import AnimatedTab from "../../src/components/general/AnimatedTab";
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
				<SafeAreaView style={styles.safe} edges={["top"]}>
					<KeyboardAvoidingView
						style={{ flex: 1, width: "100%" }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						keyboardVerticalOffset={80}
					>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Start Shattering</Text>
						<Text style={styles.subtitleName}>
							Hey {user?.name || "there"},
						</Text>
						<Text style={styles.subtitle}>
							Ready to Start Shattering Some Boundaries?
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
											<View style={styles.scannerButton}>
												<Ionicons name="scan-outline" color={colors.white} />
												<Text style={styles.buttonText}>Open Scanner</Text>
											</View>
										</TouchableOpacity>
									) : (
										<>
											<QRScannerBox onClose={() => setShowScanner(false)} />
											<TouchableOpacity
												style={styles.buttonSecondary}
												onPress={() => setShowScanner(false)}
											>
												<View style={styles.scannerButton}>
													<Text style={styles.buttonText}>Close Scanner</Text>
												</View>
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
										<View style={styles.scannerButton}>
											<Ionicons name="search-outline" color={colors.white} />
											<Text style={styles.buttonText}>Join Event</Text>
										</View>
									</TouchableOpacity>

									{errorMessage && (
										<Text style={styles.errorText}>{errorMessage}</Text>
									)}
								</View>
							</>
						)}
					</View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</ImageBackground>
		</AnimatedTab>
	);
}
