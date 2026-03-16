import { GameProvider } from "@/src/components/context/GameContext";
import { colors } from "@/src/styling/constants";
import { Poppins_600SemiBold, useFonts } from "@expo-google-fonts/poppins";
import { WorkSans_400Regular } from "@expo-google-fonts/work-sans";
import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "../src/components/context/AuthContext";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		"Poppins-SemiBold": Poppins_600SemiBold,
		"WorkSans-Regular": WorkSans_400Regular,
	});

	if (!fontsLoaded) {
		//loader while fonts load
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color={colors.darkNavy} />
			</View>
		);
	}

	return (
		<AuthProvider>
			<GameProvider>
				<Slot />
			</GameProvider>
		</AuthProvider>
	);
}
