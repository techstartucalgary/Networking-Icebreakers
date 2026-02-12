import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { loginFormStyles as styles } from "@/src/styles/loginForm.styles";
import QuickJoinCard from "./AuthGuest";
import LoginFormCard from "./AuthLogin";

type Props = {
  switchToSignUp: () => void;
};

type Section = "quickJoin" | "signIn";

export default function AuthCard({ switchToSignUp }: Props) {
  const [open, setOpen] = useState<Section>("signIn");

  return (
    <View style={styles.authStack}>
      <View style={styles.quickJoinCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setOpen(open === "quickJoin" ? "signIn" : "quickJoin")}
          style={styles.cardHeader}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Quick Join</Text>
            <Text style={styles.cardSubtitle}>Scan the code to join the event!</Text>
          </View>

          <View style={styles.scanIconBox}>
            <Text style={styles.scanIconText}>⌁</Text>
          </View>
        </TouchableOpacity>

        {open === "quickJoin" && (
          <View style={styles.cardBody}>
            <QuickJoinCard onPressScan={() => console.log("TODO: scan")} />
          </View>
        )}
      </View>


      <View style={styles.signInCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen("signIn")}>
          <Text style={styles.cardTitle}>Sign in or Register</Text>
        </TouchableOpacity>

        {open === "signIn" && (
          <View style={styles.cardBody}>
            <LoginFormCard switchToSignUp={switchToSignUp} />
          </View>
        )}
      </View>
    </View>
  );
}

