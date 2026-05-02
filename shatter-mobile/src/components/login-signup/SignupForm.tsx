//called by Profile.tsx for signing up
import { User } from "@/src/interfaces/User";
import { SocialLinks } from "@/src/interfaces/User";
import { userSignup, userUpdate } from "@/src/services/user.service";
import { FontAwesome, Feather } from "@expo/vector-icons";
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
import { SignUpFormStyling as styles } from "../../styling/SignUpFormStyling.styles";
import { useAuth } from "../context/AuthContext";
import { colors } from "@/src/styling/constants";

export default function SignUpForm() {
	const { authenticate } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");
	const [selectedType, setSelectedType] = useState<"linkedin" | "github" | "other" | null>(null);
	const [linkedin, setLinkedin] = useState("");
	const [github, setGithub] = useState("");
	const [other, setOther] = useState("");

	const handleLinkedIn = async () => {
		await WebBrowser.openBrowserAsync(
			`${process.env.EXPO_PUBLIC_API_BASE}/api/auth/linkedin`,
		);
	};

	const handleSignup = async () => {
		setError("");
		setLoading(true);

		if (!email || !password) {
			console.log("Error: All fields are required");
			setLoading(false);
			setError("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.log("Error: Invalid email format");
			setLoading(false);
			setError("Please enter a valid email.");
			return;
		}

		if (password.length < 8) {
			console.log("Error: Password must be at least 8 characters");
			setError("Password must be at least 8 characters.");
			setLoading(false);
			return;
		}

		try {
			const userResponse = await userSignup(name, email, password);

			//create default photo for profile and update user account
			const encodedName = encodeURIComponent(name ?? "Unknown");
			const profilePhoto = `https://api.dicebear.com/9.x/initials/svg?seed=${encodedName}`;

			const res = await userUpdate(
				userResponse.userId,
				{ profilePhoto },
				userResponse.token,
			);

			if (!res) {
				setError("User info could not be created. Please try again later.");
			}

			const socialLinks: SocialLinks = {};
			if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();
			if (github.trim()) socialLinks.github = github.trim();
			if (other.trim()) socialLinks.other = [{ label: "Contact Link", url: other.trim() }];

			const user: User = {
				_id: userResponse.userId,
				name,
				email,
				socialLinks,
				profilePhoto: profilePhoto,
				isGuest: false,
			};

			await authenticate(user, userResponse.token, false);

			router.push("/(tabs)/JoinEventPage");
		} catch (err) {
			console.log("Signup failed:", err);
			setError(
				(err as Error).message ||
					"Uh Oh! Please check your signup info and try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Stack.Screen options={{ animation: "slide_from_left" }} />
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
						style={{ flex: 1, justifyContent: "flex-end" }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
					>
						<View style={styles.formWrap}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								contentContainerStyle={{ flexGrow: 1 }}
							>
								<Text style={styles.title}>Sign Up</Text>
								<TextInput
									style={styles.input}
									placeholder="Name"
									value={name}
									onChangeText={setName}
									placeholderTextColor="#888"
								/>
								<TextInput
									style={styles.input}
									placeholder="Email"
									value={email}
									onChangeText={setEmail}
									placeholderTextColor="#888"
								/>
								<TextInput
									style={styles.input}
									placeholder="Password"
									secureTextEntry
									value={password}
									onChangeText={setPassword}
									placeholderTextColor="#888"
								/>

								<Text style={styles.input && { color: colors.darkNavy, fontWeight: "600", fontSize: 14, marginBottom: 8 }}>Contact Link</Text>
								<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
									<TouchableOpacity
										onPress={() => setSelectedType("linkedin")}
										style={{ padding: 12, borderRadius: 12, backgroundColor: selectedType === "linkedin" ? "#0A66C2" : colors.lightGrey2, flex: 1, marginRight: 8, alignItems: "center" }}
									>
										<FontAwesome name="linkedin" size={22} color="white" />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setSelectedType("github")}
										style={{ padding: 12, borderRadius: 12, backgroundColor: selectedType === "github" ? "#24292e" : colors.lightGrey2, flex: 1, marginRight: 8, alignItems: "center" }}
									>
										<FontAwesome name="github" size={22} color="white" />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => setSelectedType("other")}
										style={{ padding: 12, borderRadius: 12, backgroundColor: selectedType === "other" ? "#6c63ff" : colors.lightGrey2, flex: 1, alignItems: "center" }}
									>
										<Feather name="link" size={22} color="white" />
									</TouchableOpacity>
								</View>

								{selectedType && (
									<TextInput
										style={styles.input}
										placeholder={
											selectedType === "linkedin" ? "LinkedIn URL"
											: selectedType === "github" ? "GitHub URL"
											: "Portfolio / Other URL"
										}
										placeholderTextColor="#888"
										value={selectedType === "linkedin" ? linkedin : selectedType === "github" ? github : other}
										onChangeText={(text) => {
											if (selectedType === "linkedin") setLinkedin(text);
											else if (selectedType === "github") setGithub(text);
											else setOther(text);
										}}
										autoCapitalize="none"
										keyboardType="url"
									/>
								)}

								<Text style={{ color: "#888", fontSize: 13, fontStyle: "italic", marginBottom: 12 }}>
									Select a platform above, then enter your profile link.
								</Text>

								<TouchableOpacity
									style={[
										styles.button,
										loading && { backgroundColor: "#ccc" },
									]}
									onPress={handleSignup}
									disabled={loading}
								>
									{loading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>Sign Up</Text>
									)}
								</TouchableOpacity>

								{err && <Text style={styles.err}>{err}</Text>}
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
										Sign up with LinkedIn
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => router.push("/UserPages/Login")}
									style={{ marginTop: 16 }}
								>
									<Text style={styles.signupLinkText}>
										Already have an Account?{" "}
										<Text style={styles.signupLinkBold}>Log In</Text>
									</Text>
								</TouchableOpacity>

								<View style={styles.divider}>
									<Text style={styles.dividerText}>OR</Text>
								</View>

								<TouchableOpacity
									style={styles.button}
									onPress={() => router.push("/UserPages/Guest")}
								>
									<Text style={styles.buttonText}>Continue as Guest</Text>
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
//   title: {
//     fontSize: 28,
//     fontWeight: "600",
//     marginBottom: 24,
//     textAlign: "center",
//     color: "#1B253A" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: "#fff" },
//   button: {
//     backgroundColor: "#1C1DEF",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center" },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16 },
// });
