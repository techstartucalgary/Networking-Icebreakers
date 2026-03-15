import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
	const router = useRouter();

	//page mounted, set base page
	useEffect(() => {
		const checkAuth = async () => {
			try {
			const stored = await getStoredAuth();

			if (stored?.userId) {
				router.replace("/JoinEventPage"); //skip onboarding
			} else {
				router.replace("/GetStarted");
			}
			} catch (err) {
			console.error("Failed to load auth:", err);
			router.replace("/GetStarted"); 
			}
		};

		checkAuth();
	}, []);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
