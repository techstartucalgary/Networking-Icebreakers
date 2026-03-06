//called by Profile.tsx for signing up
import { User } from "@/src/interfaces/User";
import { userSignup } from "@/src/services/user.service";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button,KeyboardAvoidingView,ScrollView, Platform, StyleSheet, Text, TextInput,ImageBackground, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SignUpFormStyling as styles } from "../../styling/SignUpFormStyling.styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpForm() {
	const { authenticate } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setError] = useState("");

	const handleSignup = async () => {
		setError("");
		setLoading(true);

		if (!email || !password) {
			console.log("Error: All fields are required");
			setLoading(false);
			setError("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.log("Error: Invalid email format");
			setLoading(false);
			setError("Please enter a valid email.");
			return;
		}

		if (password.length < 8) {
			console.log("Error: Password must be at least 8 characters");
			setError("Password must be at least 8 characters.");
			setLoading(false);
			return;
		}

		try {
			const userResponse = await userSignup(name, email, password);

			const user: User = {
				_id: userResponse.userId,
				name,
				email,
				socialLinks: [],
				isGuest: false,
			};

			await authenticate(user, userResponse.token, false); //no event joined, set gameData to null

			router.push("/(tabs)/JoinEventPage");
		} catch (err) {
			console.log("Signup failed:", err);
			setError(
				(err as Error).message ||
					"Uh Oh! Please check your signup info and try again.",
			);
		} finally {
			setLoading(false);
		}
	};

  return (
    <ImageBackground
      source={require("../../images/getStartedImage.png")}
      style = {styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style = {styles.safe}>
        <View style = {styles.header}>
          <Text style = {styles.logoTitle}>
            SHATTER
          </Text>
          <Text style = {styles.brandSubtitle}>
            Break The Ice
          </Text>

        </View>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: "flex-end" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            
        <View style = {styles.formWrap}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
          
            <Text style={styles.title}>Sign Up</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#888"/>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#888"/>
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#888"/>

            <TouchableOpacity style={[styles.button, loading && { backgroundColor: "#ccc" }]} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/UserPages/Login")} style={{ marginTop: 16 }}>
              <Text style={{ textAlign: "center", color: "#1B2A4A" }}>Already have an account? Log In</Text>
            </TouchableOpacity>
            <Text style={{ textAlign: "center", color: "#afafaf" }}>Password must be at least 8 characters long</Text>
            <Button
                title="Continue as Guest"
                onPress={() => router.push("/UserPages/Guest")}
                color="#4A90B8"
              />
            {err && <Text style={{ textAlign: "center", color: "#e63232" }}>{err}</Text>}
          </ScrollView>
        </View>
        </KeyboardAvoidingView>


      </SafeAreaView>


      
    </ImageBackground>
  );
};

// const styles = StyleSheet.create({
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
