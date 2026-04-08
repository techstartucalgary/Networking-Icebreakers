import { useAuth } from "@/src/components/context/AuthContext";
import { User } from "@/src/interfaces/User";
import { exchangeLinkedInCode, userFetch } from "@/src/services/user.service";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const { authenticate } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        if (!code) {
            setError("No auth code received.");
            return;
        }

        const exchange = async () => {
            try {
                // Exchange single-use code for JWT — must happen within 60 seconds
                const response = await exchangeLinkedInCode(code);

                // Fetch full user profile using returned userId + token
                const userData = await userFetch(response.userId, response.token);

                const user: User = {
                    _id: response.userId,
                    name: userData.user.name,
                    email: userData.user.email,
                    socialLinks: userData.user.socialLinks ?? [],
                    profilePhoto: userData.user.profilePhoto,
                    isGuest: false,
                };

                // Store user + JWT in auth context
                await authenticate(user, response.token, false);
                router.replace("/JoinEventPage");
            } catch (err) {
                setError((err as Error).message || "Authentication failed.");
            }
        };

        exchange();
    }, [code]);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
                    {error}
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0A66C2" />
            <Text style={{ marginTop: 16, color: "#555" }}>Signing you in...</Text>
        </View>
    );
}