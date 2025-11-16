import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import QRScannerBox from "../../src/components/new-events/QRScannerBox";
import { useAuth } from "../context/AuthContext";

export default function JoinEventPage() {
  const { user, setUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! Join an Event</Text>

      {!showScanner && (
        <Button
          title="Scan QR Code"
          onPress={() => setShowScanner(true)}
        />
      )}

      {showScanner && <QRScannerBox />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
});
