import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../../src/components/LoginForm";
import SignUpForm from "../../src/components/SignupForm";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<"login" | "signup">("login");

  //other profile info
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [github, setGithub] = useState(user?.github || "");

  const handleSave = () => {
    //TODO: Backend upload
    console.log("Saved profile info:", { linkedin, github });
  };

  //logged in
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.name}!</Text>
        <Text style={styles.subtitle}>{user.email}</Text>

        <Text style={styles.label}>LinkedIn:</Text>
        <TextInput
          style={styles.input}
          value={linkedin}
          onChangeText={setLinkedin}
          placeholder="Enter LinkedIn URL"
          placeholderTextColor="#888"
        />
        
        <Text style={styles.label}>GitHub:</Text>
        <TextInput
          style={styles.input}
          value={github}
          onChangeText={setGithub}
          placeholder="Enter GitHub URL"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        
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
  label: { 
    fontWeight: "600", 
    marginTop: 12 },
  input: { 
    borderWidth: 1, 
    borderColor: "#1B253A",
    color: "black",
    backgroundColor: "#fff",  
    borderRadius: 8, 
    padding: 10, 
    marginTop: 5 },
  saveButton: { 
    backgroundColor: "#4CAF50", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    marginTop: 15 },
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