import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import { GameProvider } from "@/src/components/context/GameContext";
import FullPageLoader from "@/src/components/general/FullPageLoader";
import { Poppins_600SemiBold, useFonts } from "@expo-google-fonts/poppins";
import { WorkSans_400Regular } from "@expo-google-fonts/work-sans";
import { Asset } from "expo-asset";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/components/context/AuthContext";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

const BG_IMAGE = require("../src/images/getStartedImage.png");

export default function RootLayout() {
	const router = useRouter();
	const [authReady, setAuthReady] = useState(false);
	const [assetReady, setAssetReady] = useState(false);
	const redirectTo = useRef<string>("/GetStarted");

	//preload fonts
	const [fontsLoaded] = useFonts({
		"Poppins-SemiBold": Poppins_600SemiBold,
		"WorkSans-Regular": WorkSans_400Regular,
	});

	//preload background image
	useEffect(() => {
		Asset.loadAsync([BG_IMAGE]).finally(() => setAssetReady(true));
	}, []);

	//check if user is logged in
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const stored = await getStoredAuth();
				redirectTo.current = stored?.userId ? "/JoinEventPage" : "/GetStarted";
			} catch {
				redirectTo.current = "/GetStarted";
			} finally {
				setAuthReady(true);
			}
		};
		checkAuth();
	}, []);

	//hold user if not loaded yet
	useEffect(() => {
		if (!fontsLoaded || !authReady || !assetReady) return;
		router.replace(redirectTo.current as any);
		SplashScreen.hideAsync();
	}, [fontsLoaded, authReady, assetReady]);

	//user isn't loaded yet
	if (!fontsLoaded || !authReady || !assetReady) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#fff",
				}}
			>
				<FullPageLoader message={"Ready to Shatter?"} />
			</View>
		);
	}

	const stack = (
		<Stack screenOptions={{ headerShown: false, animation: "fade" }} />
	);

	const content =
		Platform.OS !== "web" ? (
			<View
				style={{
					width: "100%",
					maxWidth: windowWidth,
					flex: 1,
					maxHeight: windowHeight,
					overflow: "hidden",
					alignSelf: "center",
				}}
			>
				<View style={{ width: "100%", maxWidth: windowWidth, flex: 1 }}>
					{stack}
				</View>
			</View>
		) : (
			stack
		);

	return (
		<SafeAreaProvider>
			<View style={{ flex: 1 }}>
				<AuthProvider>
					<GameProvider>{content}</GameProvider>
				</AuthProvider>
			</View>
		</SafeAreaProvider>
	);
}
