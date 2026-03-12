import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";
import { ProfilePageStyling as styles } from "../../src/styling/ProfilePage.styles";

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
			<View style={styles.container}>
				<Image
					source={{ uri: user.profilePhoto }}
					style={styles.avatar}
					onError={(e) => console.log("Image error:", e.nativeEvent.error)}
				/>
				<Text style={styles.title}>Hey, {user.name}!</Text>
				<Text style={styles.subtitle}>{user.email}</Text>

				{socialLinks.length === 0 && (
					<Text style={styles.emptyText}>No social links added yet.</Text>
				)}

				{socialLinks.map((link, index) => (
					<View key={index} style={styles.linkContainer}>
						<>
							<Text style={styles.linkLabel}>{link.label}</Text>
							<Text style={styles.linkUrl}>{link.url}</Text>
						</>
					</View>
				))}

				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push("/UserPages/UpdateProfile")}
				>
					<Text style={styles.buttonText}>Update Profile</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.logoutButton} onPress={logout}>
					<Text style={styles.buttonText}>Log Out</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (user.isGuest) {
		return (
			<View style={styles.container}>
				<Image
					source={{ uri: user.profilePhoto }}
					style={styles.avatar}
				/>
				<Text style={styles.title}>Welcome, {user.name || "Guest"}!</Text>
				<Text style={styles.subtitle}>
					You are logged in as a guest. Some features may be limited.
				</Text>
				{!user._id && (
					<Text style={styles.subtitle}>
						To upgrade your account, join an event and then come back here to
						set it up!
					</Text>
				)}

				{socialLinks.length === 0 && (
					<Text style={styles.emptyText}>No social links added yet.</Text>
				)}

				{socialLinks.map((link, index) => (
					<View key={index} style={styles.linkContainer}>
						<>
							<Text style={styles.linkLabel}>{link.label}</Text>
							<Text style={styles.linkUrl}>{link.url}</Text>
						</>
					</View>
				))}

				{/* Guest user who has joined event / has userId */}
				{user._id && (
					<View>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => router.push("/UserPages/UpdateProfile")}
						>
							<Text style={styles.buttonText}>Update Profile</Text>
						</TouchableOpacity>

						<Text style={styles.subtitle}>
							Go here to upgrade your account to a user!
						</Text>
					</View>
				)}

				<TouchableOpacity style={styles.logoutButton} onPress={logout}>
					<Text style={styles.buttonText}>Log Out</Text>
				</TouchableOpacity>
			</View>
		);
	}
}
