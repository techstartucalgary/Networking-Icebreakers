import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth, User } from "../context/AuthContext";
import { loginFormStyles as styles } from "@/src/styles/loginForm.styles";

type Props = {
  switchToSignUp: () => void;
};

export default function AuthLogin({ switchToSignUp }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    if (!email || !password) {
      console.log("Error: All fields are required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log("Error: Invalid email format");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      console.log("Error: Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      const user: User = {
        user_id: "user123",
        name: "John Doe",
        email,
        linkedin: "https://linkedin.com/john-doe",
        github: "https://github.com/john-doe",
        isGuest: false,
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
    <>

      <TextInput
        style={styles.input}
        placeholder="email@domain.com"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.authinput}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.authbuttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.oauthButton}>
        <Text style={styles.oauthButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.oauthButton}>
        <Text style={styles.oauthButtonText}>Continue with LinkedIn</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By clicking continue, you agree to our Terms of Service and Privacy Policy
      </Text>

      <TouchableOpacity onPress={switchToSignUp} style={{ marginTop: 10 }}>
        <Text style={styles.authlinkText}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </>
    
  );
}
