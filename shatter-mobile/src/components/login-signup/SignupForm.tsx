//called by Profile.tsx for signing up
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth, User } from "../context/AuthContext";

//used in profile to swap page
type Props = {
  switchToLogin: () => void;
};

export default function SignUpForm({ switchToLogin }: Props) {
  const { login, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  const handleSignup = () => {
    setLoading(true);

    if (!email || !password) {
        console.log("Error: All fields are required");
        setLoading(false)
        setError("Please fill in all fields.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log("Error: Invalid email format");
        setLoading(false)
        setError("Please enter a valid email.");
        return;
    }

    if (password.length < 8) {
        console.log("Error: Password must be at least 8 characters");
        setError("Password must be at least 8 characters.");
        setLoading(false)
        return;
    }

    //TODO: Backend logic --> auth for access-token, then create new user for backend based on user details
    setTimeout(async () => {
      const newId = "user1234"; //backend-generated user ID
      const user: User = {
        user_id: newId,
        name,
        email,
        linkedin: "",
        github: "",
        isGuest: false
      };

      try {
        await login(user, "new-access-token", Date.now() + 3600 * 1000); //1hr
      } catch (e) {
        console.log("Signup failed:", e);
        setError("Login Failure");
      } finally {
        setLoading(false);
        setError("");
      }
    }, 1000);
  };

  return (
    <View>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#888"/>

      <TouchableOpacity style={[styles.button, loading && { backgroundColor: "#ccc" }]} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={switchToLogin} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: "center", color: "#1C1DEF" }}>Already have an account? Log In</Text>
        {!user?.isGuest && (
          <Button
            title="Continue as Guest"
            onPress={() => router.push("/(tabs)/Guest")}
          />
        )}
      </TouchableOpacity>
      <Text style={{ textAlign: "center", color: "#afafaf" }}>Password must be at least 8 characters long</Text>
      {err && <Text style={{ textAlign: "center", color: "#e63232" }}>{err}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { 
    fontSize: 28, 
    fontWeight: "600", 
    marginBottom: 24, 
    textAlign: "center", 
    color: "#1B253A" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    backgroundColor: "#fff" },
  button: { 
    backgroundColor: "#1C1DEF", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center" },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 },
});