import { Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (user) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome, {user.name}!</Text>
        <Text>Join an Event Here</Text>
        </View>
    );
  } else {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Welcome!</Text>
        <Text>Join an Event Here</Text>
        </View>
    );
  }
}