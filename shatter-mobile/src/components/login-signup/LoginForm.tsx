//called by Profile.tsx for logging in
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth, User } from "../context/AuthContext";

//used in profile to swap page
type Props = {
  switchToSignUp: () => void;
};

export default function LoginForm({ switchToSignUp }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    if (!email || !password) {
        console.log("Error: All fields are required");
        setLoading(false)
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        console.log("Error: Invalid email format");
        setLoading(false)
        return;
    }

    if (password.length < 8) {
        console.log("Error: Password must be at least 8 characters");
        setLoading(false)
        return;
    }

    //TODO: Backend logic --> auth for access-token, then load user details from backend based on userId
    setTimeout(async () => {
      const user: User = {
        user_id: "user123",
        name: "John Doe",
        email,
        linkedin: "",
        github: ""
      };

      try {
        await login(user, "access-token", Date.now() + 3600 * 1000);
      } catch (e) {
        console.log("Login failed:", e);
      } finally {
        setLoading(false);
      }
    }, 1000);
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
      </TouchableOpacity>
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
