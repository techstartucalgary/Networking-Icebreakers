import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function GetStarted() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SHATTER</Text>

      <Text style={styles.tagline}>
        Turn events into games
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/UserPages/Signup")}
      >
        <Text style={styles.primaryText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/UserPages/Login")}
      >
        <Text style={styles.link}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 20,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    color: "#000",
    textDecorationLine: "underline",
  },
});