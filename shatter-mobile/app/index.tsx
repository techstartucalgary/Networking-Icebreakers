import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getStoredAuth } from "@/src/components/general/AsyncStorage";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();

  //page mounted, set base page
  useEffect(() => {
    const checkAuth = async () => {
      const stored = await getStoredAuth();

      if (stored?.userId) {
        router.replace("/JoinEvent"); //skip onboarding
      } else {
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