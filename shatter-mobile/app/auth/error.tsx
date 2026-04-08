import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function AuthError() {
    const { message } = useLocalSearchParams<{ message: string }>();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 }}>
                Login Failed
            </Text>
            <Text style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>
                {message || "Something went wrong with LinkedIn login."}
            </Text>
            <TouchableOpacity
                onPress={() => router.replace("/UserPages/Login")}
                style={{
                    backgroundColor: "#0A66C2",
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    borderRadius: 8,
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );
}