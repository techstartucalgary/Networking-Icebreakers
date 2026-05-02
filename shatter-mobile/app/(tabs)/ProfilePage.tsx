import { useRouter } from "expo-router";
import { useEffect } from "react";
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
import { ProfilePageStyling as styles } from "../../src/styling/ProfilePage.styles";
import { LinkRow } from "@/src/components/general/LinkRow";

export default function Profile() {
	const { user, logout } = useAuth();
	const router = useRouter();

	// not logged in
	useEffect(() => {
		if (!user) {
			router.replace("/UserPages/Login");
		}
	}, [user]);

	if (!user) {
		return null;
	}

	const social = user.socialLinks;

	const hasSocialLinks =
		!!social?.linkedin || !!social?.github || (social?.other?.length ?? 0) > 0;

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

						<View style={styles.container}>
							<ScrollView
								contentContainerStyle={{ alignItems: "center" }}
								showsVerticalScrollIndicator={false}
							>
								<Image
									source={{ uri: user.profilePhoto }}
									style={styles.avatar}
								/>

								<Text style={styles.subtitleText}>{user.email}</Text>

								{/* Empty */}
								{!hasSocialLinks && (
									<Text style={styles.emptyText}>
										No social links added yet.
									</Text>
								)}

								{/* Social Links */}
								{user.socialLinks && (
									<View>
										{social?.linkedin && (
											<LinkRow label="LinkedIn" url={social.linkedin} />
										)}
			
										{social?.github && (
											<LinkRow label="GitHub" url={social.github} />
										)}
			
										{social?.other?.map((link, index) => (
											<LinkRow key={index} label={link.label} url={link.url} />
										))}
									</View>
								)}

								<TouchableOpacity
									style={styles.editButton}
									onPress={() => router.push("/UserPages/UpdateProfile")}
								>
									<Text style={styles.buttonText}>Update Profile</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.logoutButton} onPress={logout}>
									<Text style={styles.buttonText}>Log Out</Text>
								</TouchableOpacity>
							</ScrollView>
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

						<View style={styles.container}>
							<ScrollView
								contentContainerStyle={{ alignItems: "center" }}
								showsVerticalScrollIndicator={false}
							>
								<SvgUri
									uri={
										user.profilePhoto ??
										`https://api.dicebear.com/9.1.1/initials/png?seed=${encodeURIComponent(
											user.name || "Unknown",
										)}&size=128`
									}
									style={styles.avatar}
								/>

								<Text style={styles.notice}>
									You are logged in as a guest. Some features may be limited.
								</Text>

								{!user._id && (
									<Text style={styles.notice}>
										To upgrade your account, join an event and then come back
										here to set it up!
									</Text>
								)}

								{/* Empty */}
								{!hasSocialLinks && (
									<Text style={styles.emptyText}>
										No social links added yet.
									</Text>
								)}

								{/* LinkedIn */}
								{social?.linkedin && (
									<View style={styles.linkContainer}>
										<Text style={styles.linkLabel}>LinkedIn</Text>
										<Text style={styles.linkUrl}>{social.linkedin}</Text>
									</View>
								)}

								{/* GitHub */}
								{social?.github && (
									<View style={styles.linkContainer}>
										<Text style={styles.linkLabel}>GitHub</Text>
										<Text style={styles.linkUrl}>{social.github}</Text>
									</View>
								)}

								{/* Other Links */}
								{social?.other?.map((link, index) => (
									<View key={index} style={styles.linkContainer}>
										<Text style={styles.linkLabel}>{link.label}</Text>
										<Text style={styles.linkUrl}>{link.url}</Text>
									</View>
								))}

								{user._id && (
									<View>
										<TouchableOpacity
											style={styles.editButton}
											onPress={() => router.push("/UserPages/UpdateProfile")}
										>
											<Text style={styles.buttonText}>Update Profile</Text>
										</TouchableOpacity>

										<Text style={styles.notice}>
											Go here to upgrade your account to a user!
										</Text>
									</View>
								)}

								<TouchableOpacity style={styles.logoutButton} onPress={logout}>
									<Text style={styles.buttonText}>Log Out</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>
					</SafeAreaView>
				</ImageBackground>
			</AnimatedTab>
		);
	}
}
