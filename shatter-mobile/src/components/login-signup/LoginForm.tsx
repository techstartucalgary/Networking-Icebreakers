//called by Profile.tsx for logging in
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth, User } from "../context/AuthContext";
// Importing styling, image logo and saferaeavie and logo view
import { ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginFormStyles as styles } from "@/src/styles/loginForm.styles";
const ShatterLogo = require("@/src/images/Shatter-logo-white.png");




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
        linkedin: "https://linkedin.com/john-doe",
        github: "https://github.com/john-doe",
        isGuest: false
      };

      try {
        await login(user, "access-token", Date.now() + 3600 * 1000); //1hr
      } catch (e) {
        console.log("Login failed:", e);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style= {styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} 
      keyboardShouldPersistTaps="handled" 
      showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <View style={styles.header}>
          <Image source={ShatterLogo} style={styles.headerLogoBg} />
          <Image source={ShatterLogo} style={styles.headerLogoTopRight} />
          <Text style={styles.brandTitle}>Shatter</Text>
          <Text style={styles.brandSubtitle}>Break the ice.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Log In</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={switchToSignUp} style={{ marginTop: 16 }}>
            <Text style={styles.linkText}>
              Don’t have an account? Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 12 }}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>

      </ScrollView>

    </SafeAreaView>
    
  );
};

// const styles = StyleSheet.create({
//   container:{
//     backgroundColor: "#1C1DEF",
//   },
//   title: { 
//     fontSize: 28, 
//     fontWeight: "600", 
//     marginBottom: 24, 
//     textAlign: "center", 
//     color: "#1B253A" },
//   input: { 
//     borderWidth: 1, 
//     borderColor: "#ccc", 
//     borderRadius: 8,
//     padding: 12, 
//     marginBottom: 16, 
//     backgroundColor: "#fff" },
//   button: { 
//     backgroundColor: "#1C1DEF", 
//     padding: 14, 
//     borderRadius: 8, 
//     alignItems: "center" },
//   buttonText: { 
//     color: "#fff", 
//     fontWeight: "600", 
//     fontSize: 16 },
// });
