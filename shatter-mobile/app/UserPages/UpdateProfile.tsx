import { getStoredAuth } from "@/src/components/context/AsyncStorage";
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
	const [bio, setBio] = useState(user?.bio || "");
	const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
	const [socialLinks, setSocialLinks] = useState<
		{ label: string; url: string }[]
	>(user?.socialLinks || []);

	useEffect(() => {
		if (!user) router.replace("/UserPages/Login");
	}, [user]);

	const handleLinkChange = (
		index: number,
		field: "label" | "url",
		value: string,
	) => {
		const updated = [...socialLinks];
		updated[index] = { ...updated[index], [field]: value };
		setSocialLinks(updated);
	};

	const addNewLink = () =>
		setSocialLinks([...socialLinks, { label: "", url: "" }]);

	const removeLink = (index: number) =>
		setSocialLinks(socialLinks.filter((_, i) => i !== index));

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
		}); //local update
		const res = await userUpdate(
			user._id,
			{ name, email, bio, profilePhoto, socialLinks },
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

									<Text style={styles.label}>Profile Photo</Text>

									{/* Current selection preview */}
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
								</>
							)}

							{/* Social Links */}
							<Text style={[styles.label, { marginTop: 20 }]}>
								Social Links
							</Text>
							{socialLinks.map((link, index) => (
								<View key={index} style={styles.linkContainer}>
									<TextInput
										style={styles.input}
										placeholder="Label (e.g. LinkedIn)"
										placeholderTextColor={colors.lightGrey2}
										value={link.label}
										onChangeText={(text) =>
											handleLinkChange(index, "label", text)
										}
									/>
									<TextInput
										style={styles.input}
										placeholder="URL"
										placeholderTextColor={colors.lightGrey2}
										value={link.url}
										onChangeText={(text) =>
											handleLinkChange(index, "url", text)
										}
									/>
									<TouchableOpacity
										style={styles.removeButton}
										onPress={() => removeLink(index)}
									>
										<Text style={styles.buttonText}>Remove</Text>
									</TouchableOpacity>
								</View>
							))}

							<TouchableOpacity style={styles.addButton} onPress={addNewLink}>
								<Text style={styles.buttonText}>+ Add Social Link</Text>
							</TouchableOpacity>

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
