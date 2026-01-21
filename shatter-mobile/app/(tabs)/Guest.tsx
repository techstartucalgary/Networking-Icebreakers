import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";

export default function GuestPage() {
  const { continueAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const router = useRouter();

  const handleContinue = async () => {
    if (!name.trim()) return;
    await continueAsGuest(name.trim(), linkedin);
    router.replace("/JoinEvent"); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue as Guest</Text>
      <Text style={styles.subtitle}>
        Enter your name so others can identify you.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Your Linkedin"
        value={linkedin}
        onChangeText={setLinkedin}
      />

      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
});