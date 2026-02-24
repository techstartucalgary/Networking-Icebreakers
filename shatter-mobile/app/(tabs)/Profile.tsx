import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/components/context/AuthContext";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();

  //other profile info
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [github, setGithub] = useState(user?.github || "");

  //update local form
  useFocusEffect(
    useCallback(() => {
      setLinkedin(user?.linkedin || "");
      setGithub(user?.github || "");
    }, [user])
  );

  const handleSave = () => {
    //TODO: Backend Logic --> Update user profile in backend
    console.log("Saved profile info:", { linkedin, github });

    //update auth state with new info
    updateUser({ linkedin, github });
  };

  //not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/UserPages/Login");
    }
  }, [user]);

  if (!user) {
    return null; //don't render profile content while redirecting
  }

  //logged in
  if (user && !user.isGuest) {
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

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user?.isGuest) {
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome, {user?.name || "Guest"}!</Text>
          <Text style={styles.subtitle}>
            You are logged in as a guest. Some features may be limited.
          </Text>
    
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => router.push("/UserPages/Signup")}
            >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      );
  }
};

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