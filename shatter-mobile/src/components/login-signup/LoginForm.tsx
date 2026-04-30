//called by Profile.tsx for logging in
import { User } from "@/src/interfaces/User";
import { userFetch, userLogin } from "@/src/services/user.service";
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
	ActivityIndicator,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginFormStyling as styles } from "../../styling/LoginFormstyling.styles";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
	const { authenticate } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

	const handleLinkedIn = async () => {
		await WebBrowser.openBrowserAsync(
			`${process.env.EXPO_PUBLIC_API_BASE}/api/auth/linkedin`,
		);
	};

	const handleLogin = async () => {
		setError("");
		setLoading(true);

		if (!email || !password) {
			console.log("Error: All fields are required");
			setLoading(false);
			setError("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
		if (!emailRegex.test(email)) {
			console.log("Error: Invalid email format");
			setLoading(false);
			setError("Please enter a valid email.");
			return;
		}

		try {
			const userResponse = await userLogin(email, password);

			const userData = await userFetch(userResponse.userId, userResponse.token);

			const user: User = {
				_id: userResponse.userId,
				name: userData.user.name,
				email,
				socialLinks: userData.user.socialLinks ?? {},
				profilePhoto: userData.user.profilePhoto,
				organization: userData.user.organization,
				title: userData.user.title,
				isGuest: false,
			};

			await authenticate(user, userResponse.token, false);

			router.push("/JoinEventPage");
		} catch (err) {
			console.log("Login failed:", err);
			setError(
				(err as Error).message ||
					"Uh Oh! Please check your login info and try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Stack.Screen options={{ animation: "slide_from_right" }} />
			<ImageBackground
				source={require("../../images/getStartedImage.png")}
				style={styles.background}
				resizeMode="cover"
			>
				<SafeAreaView style={styles.safe}>
					<View style={styles.header}>
						<Text style={styles.logoTitle}>SHATTER</Text>
						<Text style={styles.brandSubtitle}>Break The Ice</Text>
					</View>
					<KeyboardAvoidingView
						style={{ flex: 1 }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
					>
						<View style={styles.formWrap}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								contentContainerStyle={{ paddingBottom: 40 }}
							>
								<Text style={styles.title}>Log In</Text>
								<Text style={styles.subtitle}>Welcome back!</Text>
								<Text style={styles.label}>Email</Text>
								<View style={styles.inputWrap}>
									<TextInput
										style={styles.input}
										placeholder="example@gmail.com"
										value={email}
										onChangeText={setEmail}
										placeholderTextColor="#bbb"
										keyboardType="email-address"
										autoCapitalize="none"
										returnKeyType="next"
									/>
								</View>
								<Text style={styles.label}>Password</Text>
								<View style={styles.inputWrap}>
									<TextInput
										style={styles.input}
										placeholder="••••••••••••"
										secureTextEntry
										value={password}
										onChangeText={setPassword}
										placeholderTextColor="#bbb"
										returnKeyType="done"
									/>
								</View>
								<View style={styles.rowBetween}>
									<View style={styles.rememberRow}>
										<Text style={styles.rememberText}>Remember me</Text>
									</View>
									<TouchableOpacity>
										<Text style={styles.forgotText}>Forgot your password?</Text>
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={[styles.button, loading && styles.buttonDisabled]}
									onPress={handleLogin}
									disabled={loading}
								>
									{loading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>Log In</Text>
									)}
								</TouchableOpacity>
								{err && <Text style={styles.err}>{err}</Text>}
								<View style={styles.dividerRow}>
									<View style={styles.dividerLine} />
									<Text style={styles.dividerText}>-OR-</Text>
									<View style={styles.dividerLine} />
								</View>
								<TouchableOpacity
									style={styles.socialButton}
									onPress={handleLinkedIn}
								>
									<Text
										style={{
											fontSize: 18,
											fontWeight: "900",
											color: "#0A66C2",
										}}
									>
										in
									</Text>
									<Text style={styles.socialButtonText}>
										Log in with LinkedIn
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => router.push("/UserPages/Signup")}
								>
									<Text style={styles.loginLinkText}>
										Don&apos;t have an account?{" "}
										<Text style={styles.loginLinkBold}>Sign Up</Text>
									</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</ImageBackground>
		</>
	);
}

// const styles = StyleSheet.create({
// 	title: {
// 		fontSize: 28,
// 		fontWeight: "600",
// 		marginBottom: 24,
// 		textAlign: "center",
// 		color: "#1B253A",
// 	},
// 	input: {
// 		borderWidth: 1,
// 		borderColor: "#ccc",
// 		borderRadius: 8,
// 		padding: 12,
// 		marginBottom: 16,
// 		backgroundColor: "#fff",
// 	},
// 	button: {
// 		backgroundColor: "#1C1DEF",
// 		padding: 14,
// 		borderRadius: 8,
// 		alignItems: "center",
// 	},
// 	buttonText: {
// 		color: "#fff",
// 		fontWeight: "600",
// 		fontSize: 16,
// 	},
// });
