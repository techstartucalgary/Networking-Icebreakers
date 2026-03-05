//called by Profile.tsx for logging in
import { userFetch, userLogin } from "@/src/services/user.service";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, AuthUser } from "../context/AuthContext";
import { LoginFormStyling as styles } from "../../styling/LoginFormstyling.styles";

export default function LoginForm() {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

	const handleLinkedIn = () => {
		// wire linkedin from backend 
		console.log("LinkedIn login pressed");
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

		//TODO: Social Link storing?
		try {
			const userResponse = await userLogin(email, password);

			if (!userResponse) {
				throw new Error("No response from server");
			}

			if (!userResponse.userId) {
				throw new Error("No user found.");
			}

			if (!userResponse.token) {
				throw new Error("No access token passed.");
			}

			const userData = await userFetch(userResponse.userId, userResponse.token);

			if (!userData) {
				throw new Error("No response from server");
			}

			const user: AuthUser = {
				user_id: userResponse.userId,
				name: userData?.name,
				email,
				linkedin: "",
				github: "",
				isGuest: false,
			};

			await login(user, userResponse.token);
		} catch (e) {
			console.log("Login failed:", e);
			setError("Login Failure: " + e);
		} finally {
			setLoading(false);
			router.push("/JoinEvent")
		}

	};

	return (
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
								placeholder="exemple@gmail.com"
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
								{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
							</TouchableOpacity>
							<View style={styles.dividerRow}>
								<View style={styles.dividerLine} />
								<Text style={styles.dividerText}>-OR-</Text>
								<View style={styles.dividerLine} />
							</View>
							<TouchableOpacity style={styles.socialButton} onPress={handleLinkedIn}>
								<Text style={{ fontSize: 18, fontWeight: "900", color: "#0A66C2" }}>in</Text>
								<Text style={styles.socialButtonText}>Log in with LinkedIn</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => router.push("/UserPages/Signup")}>
								<Text style={styles.signupLinkText}>
								Don't have an account?{" "}
								<Text style={styles.signupLinkBold}>Sign Up</Text>
								</Text>
							</TouchableOpacity>




						
						
						</ScrollView>
					</View>



				</KeyboardAvoidingView>

			</SafeAreaView>
		
		</ImageBackground>
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
