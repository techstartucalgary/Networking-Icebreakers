import { View, StyleSheet } from "react-native";
import SignUpForm from "@/src/components/login-signup/SignupForm";

export default function SignupPage() {
  return (
    <View style={styles.container}>
      <SignUpForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#A1C9F6",
  },
});