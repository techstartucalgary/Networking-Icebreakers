import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Image,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import { useAuth } from "../../src/components/context/AuthContext";
import AnimatedTab from "../../src/components/general/AnimatedTab";
import { ProfilePageStyling as styles, AVATAR_TOP, AVATAR_SIZE } from "../../src/styling/ProfilePage.styles";

export default function Profile() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [socialLinks, setSocialLinks] = useState(user?.socialLinks || []);

	//update local form
	useFocusEffect(
		useCallback(() => {
			setSocialLinks(user?.socialLinks || []);
		}, [user]),
	);

	//not logged in
	useEffect(() => {
		if (!user) {
			router.replace("/UserPages/Login");
		}
	}, [user]);

	if (!user) {
		return null; //don't render profile content while redirecting
	}

	//logged in
	if (user && !user.isGuest) {
		return (
			<AnimatedTab>
				<ImageBackground
					source={require("../../src/images/getStartedImage.png")}
					style={styles.background}
					resizeMode="cover"
				>
					<SafeAreaView style={styles.safe}>
						<View style={styles.header}>
							<Text style={styles.pageTitle}>Your Profile</Text>
							<Text style={styles.subtitle}>
								Welcome back, {user.name || "Networker"}!
							</Text>
						</View>

						{/* scrollable part */}
						<View style={styles.container}>
							<ScrollView
								contentContainerStyle={styles.scrollContent}
								showsVerticalScrollIndicator={false}
							>
								<Text style={styles.userName}>{user.name || "Networker"}</Text>
								<Text style={styles.subtitleText}>{user.email}</Text>

								{user.bio ? (
									<Text style={styles.bioText}>{user.bio}</Text>
								) : null}

								{socialLinks.length === 0 && (
									<Text style={styles.emptyText}>No social links added yet.</Text>
								)}
								{socialLinks.map((link, index) => (
									<View key={index} style={styles.linkContainer}>
										<Text style={styles.linkLabel}>{link.label}</Text>
										<Text style={styles.linkUrl}>{link.url}</Text>
									</View>
								))}

								<TouchableOpacity
									style={styles.editButton}
									onPress={() => router.push("/UserPages/UpdateProfile")}
								>
									<Text style={styles.buttonText}>Update Profile</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.logoutButton} onPress={logout}>
									<Text style={[styles.buttonText, { color: "#B91C1C" }]}>
										Log Out
									</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>

						{/* Avatar straddling the card edge */}
						<View style={styles.avatarWrapper}>
							{user.profilePhoto ? (
								<Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
							) : (
								<SvgUri
									uri={`https://api.dicebear.com/9.1.1/initials/svg?seed=${encodeURIComponent(user.name || "Unknown")}&size=128`}
									style={styles.avatar}
								/>
							)}
						</View>
					</SafeAreaView>
				</ImageBackground>
			</AnimatedTab>
		);
	}

	//guest user
	if (user.isGuest) {
		return (
			<AnimatedTab>
				<ImageBackground
					source={require("../../src/images/getStartedImage.png")}
					style={styles.background}
					resizeMode="cover"
				>
					<SafeAreaView style={styles.safe}>
						<View style={styles.header}>
							<Text style={styles.pageTitle}>Your Profile</Text>
							<Text style={styles.subtitle}>
								Welcome, {user.name || "Networker"}!
							</Text>
						</View>

						{/* White card */}
						<View style={styles.container}>
							<ScrollView
								contentContainerStyle={styles.scrollContent}
								showsVerticalScrollIndicator={false}
							>
								<Text style={styles.userName}>{user.name || "Networker"}</Text>

								<Text style={styles.notice}>
									You are logged in as a guest. Some features may be limited.
								</Text>
								{!user._id && (
									<Text style={styles.notice}>
										To upgrade your account, join an event and then come back here to set it up!
									</Text>
								)}

								{socialLinks.length === 0 && (
									<Text style={styles.emptyText}>No social links added yet.</Text>
								)}
								{socialLinks.map((link, index) => (
									<View key={index} style={styles.linkContainer}>
										<Text style={styles.linkLabel}>{link.label}</Text>
										<Text style={styles.linkUrl}>{link.url}</Text>
									</View>
								))}

								{user._id && (
									<>
										<Text style={styles.notice}>
											Go here to upgrade your account to a user!
										</Text>
										<TouchableOpacity
											style={styles.editButton}
											onPress={() => router.push("/UserPages/UpdateProfile")}
										>
											<Text style={styles.buttonText}>Update Profile</Text>
										</TouchableOpacity>
									</>
								)}

								<TouchableOpacity style={styles.logoutButton} onPress={logout}>
									<Text style={[styles.buttonText, { color: "#B91C1C" }]}>
										Log Out
									</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>

						{/* Avatar straddling the card edge */}
						<View style={styles.avatarWrapper}>
							{user.profilePhoto ? (
								<Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
							) : (
								<SvgUri
									uri={`https://api.dicebear.com/9.1.1/initials/svg?seed=${encodeURIComponent(user.name || "Unknown")}&size=128`}
									style={styles.avatar}
								/>
							)}
						</View>
					</SafeAreaView>
				</ImageBackground>
			</AnimatedTab>
		);
	}
}
