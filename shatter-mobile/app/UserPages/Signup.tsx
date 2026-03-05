import { View, StyleSheet } from "react-native";
import SignUpForm from "@/src/components/login-signup/SignupForm";
import {Stack} from "expo-router";

export default function SignupPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SignUpForm />
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 0,
    backgroundColor: "#fff",
  },
});