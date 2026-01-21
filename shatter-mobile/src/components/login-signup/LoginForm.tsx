//called by Profile.tsx for logging in
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth, User } from "../context/AuthContext";
import { userLogin } from "@/src/services/user.service";

//used in profile to swap page
type Props = {
  switchToSignUp: () => void;
};

export default function LoginForm({ switchToSignUp }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);

    if (!email || !password) {
        console.log("Error: All fields are required");
        setLoading(false)
        setError("Please fill in all fields.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        console.log("Error: Invalid email format");
        setLoading(false)
        setError("Please enter a valid email.");
        return;
    }

    //TODO: Backend logic -->  user details from backend based on userId
    try {
      const userResponse = await userLogin(email, password);

      if (!userResponse) {
        throw new Error("No response from server");
      }

      const user: User = {
        user_id: userResponse.userId,
        name: "",
        email,
        linkedin: "",
        github: "",
        isGuest: false,
      };

      await login(user, userResponse.token); 
    } catch (e) {
      console.log("Login failed:", e);
      setError("Login Failure");
    } finally {
      setLoading(false);
      setError("");
    }
  };

  return (
    <View>
      <Text style={styles.title}>Log In</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#888"/>
      <TouchableOpacity style={[styles.button, loading && { backgroundColor: "#ccc" }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={switchToSignUp} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: "center", color: "#1C1DEF" }}>Don't have an account? Sign Up</Text>
        <Button
          title="Continue as Guest"
          onPress={() => router.push("/(tabs)/Guest")}
        />
      </TouchableOpacity>
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
