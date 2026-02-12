import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { loginFormStyles as styles } from "@/src/styles/loginForm.styles";

type Props = {
  onPressScan?: () => void; // we’ll wire later
};

export default function AuthGuest({ onPressScan }: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  return (
    <View style={styles.quickJoinExpanded}>
      {/* Event joined placeholder (backend later) */}
      <View style={styles.eventJoinedBox}>
        <Text style={styles.eventJoinedTitle}>Event Joined:</Text>
        {/* Later: map events joined from backend */}
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Name</Text>
        <Text style={styles.fieldHint}>Make yourself known!</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#888"
      />

      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
        Company/Association
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Company"
        value={company}
        onChangeText={setCompany}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Join Event!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={onPressScan ?? (() => console.log("Scan pressed"))}
      >
        <Text style={styles.scanButtonText}>Scan code</Text>
      </TouchableOpacity>
    </View>
  );
}
