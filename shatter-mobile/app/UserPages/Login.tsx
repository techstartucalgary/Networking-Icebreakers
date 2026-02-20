import { View, StyleSheet } from "react-native";
import LoginForm from "@/src/components/login-signup/LoginForm";

export default function LoginPage() {
  return (
    <View style={styles.container}>
      <LoginForm />
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