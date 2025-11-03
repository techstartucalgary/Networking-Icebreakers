import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignupForm";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<"login" | "signup">("login");

  //logged in
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.name}!</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setUser(null)}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //not logged in, show pages for signup or login
  return (
    <View style={styles.container}>
      {form === "login" ? (
        <LoginForm switchToSignUp={() => setForm("signup")} />
      ) : (
        <SignUpForm switchToLogin={() => setForm("login")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 24, 
    backgroundColor: "#A1C9F6" },
  title: { 
    fontSize: 28, 
    fontWeight: "600", 
    textAlign: "center", 
    color: "#1B253A", 
    marginBottom: 16 },
  subtitle: { 
    fontSize: 16, 
    textAlign: "center", 
    color: "#666", 
    marginBottom: 20 },
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