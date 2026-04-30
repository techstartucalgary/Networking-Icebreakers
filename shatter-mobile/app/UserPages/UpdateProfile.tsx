import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import { SocialLinksModal } from "@/src/components/general/SocialLinksModal";
import { userUpdate } from "@/src/services/user.service";
import { colors } from "@/src/styling/constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	Image,
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
import { useAuth } from "../../src/components/context/AuthContext";
import { UpdateProfileStyling as styles } from "../../src/styling/UpdateProfile.styles";

const AVATAR_URL_BASE = process.env.EXPO_PUBLIC_AVATAR_URL || "";

const AVATAR_OPTIONS = [
	`${AVATAR_URL_BASE}/avatar1.png`,
	`${AVATAR_URL_BASE}/avatar2.png`,
	`${AVATAR_URL_BASE}/avatar3.png`,
	`${AVATAR_URL_BASE}/avatar4.png`,
	`${AVATAR_URL_BASE}/avatar5.png`,
];

export default function UpdateProfile() {
	const { user, updateUser } = useAuth();
	const router = useRouter();

	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [password, setPassword] = useState("");
	const [title, setTitle] = useState(user?.title || "");
	const [organization, setOrganization] = useState(user?.organization || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
	const [socialLinks, setSocialLinks] = useState<
		{ label: string; url: string }[]
	>(user?.socialLinks || []);
	const [socialModalVisible, setSocialModalVisible] = useState(false);

	useEffect(() => {
		if (!user) router.replace("/UserPages/Login");
	}, [user]);

	const handleSave = async () => {
		if (!user || !user._id) return;
		if ((!email && password) || (email && !password && user.isGuest)) {
			alert(
				"Both email and password must be filled to create an account based on guest info.",
			);
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (email && !emailRegex.test(email)) {
			console.log("Error: Invalid email format");
			alert("Please enter a valid email.");
			return;
		}

		if (password && password.length < 8 && password.length > 0) {
			console.log("Error: Password must be at least 8 characters");
			alert("Password must be at least 8 characters.");
			return;
		}

		const stored = await getStoredAuth();
		const updatedUser = await updateUser({
			name,
			email,
			bio,
			profilePhoto,
			socialLinks,
			organization,
			title,
		}); //local update
		const res = await userUpdate(
			user._id,
			{ name, email, bio, profilePhoto, socialLinks, organization, title },
			stored.accessToken,
		); //remote update

		if (updatedUser && res) {
			router.push("/(tabs)/ProfilePage");
		} else {
			alert("Failed to update profile");
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, justifyContent: "flex-end" }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
		>
			<ImageBackground
				source={require("../../src/images/getStartedImage.png")}
				style={styles.background}
				resizeMode="cover"
			>
				<SafeAreaView style={styles.safe}>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Update Profile</Text>
						<Text style={styles.subtitle}>Edit your details below</Text>
					</View>

					<View style={styles.container}>
						<ScrollView
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingBottom: 40 }}
						>
							{/* Profile Photo Section */}
							{!user?.isGuest && (
								<View>
									<Text style={styles.label}>Profile Photo</Text>

									{/* Preview */}
									{profilePhoto && profilePhoto.length > 0 ? (
										<Image
											source={{ uri: profilePhoto }}
											style={styles.avatarPreview}
										/>
									) : (
										<View style={styles.avatarPlaceholder}>
											<Text style={styles.avatarPlaceholderText}>
												No photo selected
											</Text>
										</View>
									)}

									{/* Avatar grid */}
									<View style={styles.avatarGrid}>
										{AVATAR_OPTIONS.filter(Boolean).map((url) => (
											<TouchableOpacity
												key={url}
												onPress={() => setProfilePhoto(url)}
												style={[
													styles.avatarOption,
													profilePhoto === url && styles.avatarOptionSelected,
												]}
											>
												<Image
													source={{ uri: url }}
													style={styles.avatarOptionImage}
												/>
											</TouchableOpacity>
										))}
									</View>
								</View>
							)}
							
							{/* Name */}
							<Text style={styles.label}>Name</Text>
							<TextInput
								style={styles.input}
								value={name}
								onChangeText={setName}
								placeholder="Your Name"
								placeholderTextColor={colors.lightGrey2}
							/>

							{/* Email */}
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								value={email}
								onChangeText={setEmail}
								placeholder="Your Email"
								placeholderTextColor={colors.lightGrey2}
								keyboardType="email-address"
							/>
							{user?.isGuest && (
								<Text style={styles.inputInfo}>
									By entering your email and password, Shatter will create an
									account for you!
								</Text>
							)}

							{/* Password */}
							<Text style={styles.label}>Update Password</Text>
							<TextInput
								style={styles.input}
								value={password}
								onChangeText={setPassword}
								placeholder="Update your Password"
								placeholderTextColor={colors.lightGrey2}
								secureTextEntry
							/>
							<Text style={styles.inputInfo}>
								Password must be at least 8 characters
							</Text>

							{/* Title */}
							<Text style={styles.label}>Title</Text>
							<TextInput
								style={styles.input}
								value={title}
								onChangeText={setTitle}
								placeholder="Your Title"
								placeholderTextColor={colors.lightGrey2}
							/>
							<Text style={styles.inputInfo}>
								Your title at your organization, like Project Manager
							</Text>

							{/* Organization */}
							<Text style={styles.label}>Organization</Text>
							<TextInput
								style={styles.input}
								value={organization}
								onChangeText={setOrganization}
								placeholder="Your Organization"
								placeholderTextColor={colors.lightGrey2}
							/>

							{/* Non-guest only */}
							{!user?.isGuest && (
								<>
									<Text style={styles.label}>Bio</Text>
									<TextInput
										style={[
											styles.input,
											{ height: 100, textAlignVertical: "top" },
										]}
										value={bio}
										onChangeText={setBio}
										placeholder="Short bio"
										placeholderTextColor={colors.lightGrey2}
										multiline
									/>	
								</>
							)}

							{/* Social link modal */}
							<TouchableOpacity
								style={[styles.addButton, { marginTop: 20 }]}
								onPress={() => setSocialModalVisible(true)}
							>
								<Text style={styles.buttonText}>Manage Social Links</Text>
							</TouchableOpacity>

							<SocialLinksModal
								socialModalVisible={socialModalVisible}
								setSocialModalVisible={setSocialModalVisible}
								socialLinks={socialLinks}
								setSocialLinks={setSocialLinks}
							/>

							<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
								<Text style={styles.buttonText}>Save Changes</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => router.push("/(tabs)/ProfilePage")}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</SafeAreaView>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
}
