import { getStoredAuth } from "@/src/components/context/AsyncStorage";
import { GameProvider } from "@/src/components/context/GameContext";
import { Poppins_600SemiBold, useFonts } from "@expo-google-fonts/poppins";
import { WorkSans_400Regular } from "@expo-google-fonts/work-sans";
import { Slot, SplashScreen, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "../src/components/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const redirectTo = useRef<string>("/GetStarted");

  const [fontsLoaded] = useFonts({
    "Poppins-SemiBold": Poppins_600SemiBold,
    "WorkSans-Regular": WorkSans_400Regular,
  });

  //check auth and store result
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

  //navigate and hide splash once both are ready
  useEffect(() => {
    if (!fontsLoaded || !authReady) return;

    router.replace(redirectTo.current as any);
    SplashScreen.hideAsync();
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) return null;

  return (
    <AuthProvider>
      <GameProvider>
        <Slot />
      </GameProvider>
    </AuthProvider>
  );
}