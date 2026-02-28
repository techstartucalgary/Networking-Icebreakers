import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";

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
				<Text style={styles.title}>Welcome, {user.name}!</Text>
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

				<TouchableOpacity style={styles.button} onPress={logout}>
					<Text style={styles.buttonText}>Log Out</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (user.isGuest) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Welcome, {user?.name || "Guest"}!</Text>
				<Text style={styles.subtitle}>
					You are logged in as a guest. Some features may be limited.
				</Text>

				<Text style={styles.subtitle}>
					To upgrade your account, join an event and then come back here to set
					it up!
				</Text>

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

				<TouchableOpacity style={styles.button} onPress={logout}>
					<Text style={styles.buttonText}>Log Out</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		backgroundColor: "#A1C9F6",
	},
	title: {
		fontSize: 28,
		fontWeight: "600",
		textAlign: "center",
		color: "#1B253A",
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		color: "#666",
		marginBottom: 20,
	},
	label: {
		fontWeight: "600",
		marginTop: 12,
	},
	input: {
		borderWidth: 1,
		borderColor: "#1B253A",
		color: "#000000",
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 10,
		marginTop: 5,
	},
	saveButton: {
		backgroundColor: "#4CAF50",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 15,
	},
	button: {
		backgroundColor: "#1C1DEF",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginTop: 20,
		marginBottom: 10,
	},
	linkContainer: {
		marginBottom: 15,
		padding: 10,
		backgroundColor: "#E6F0FF",
		borderRadius: 8,
	},
	addButton: {
		backgroundColor: "#1eb4f0",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	removeButton: {
		backgroundColor: "#F44336",
		padding: 10,
		borderRadius: 6,
		alignItems: "center",
		marginTop: 5,
	},
	emptyText: {
		textAlign: "center",
		color: "#444",
		marginTop: 10,
	},
	linkLabel: {
		fontWeight: "600",
		fontSize: 16,
	},
	linkUrl: {
		color: "#1C1DEF",
		marginTop: 4,
	},
	editButton: {
		backgroundColor: "#FF9800",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 15,
	},
	cancelButton: {
		backgroundColor: "#9E9E9E",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
});
