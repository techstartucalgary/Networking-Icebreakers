import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function QRScannerBox() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const userId = "USER123";

  //extract event ID from QR code
  const extractEventId = (qrData: string): string | null => {
    try {
      //plain event ID
      console.log(qrData)
      return qrData; //TODO: Insert checks for data passed
    } catch {
      return null;
    }
  };

  //TODO: Backend Request
  const joinEvent = async (userId: string, eventId: string) => {
    const res = await fetch("backend_route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eventId }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Unable to join event");

    return data;
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{ marginBottom: 10 }}>Camera access is required.</Text>
        <Text onPress={requestPermission} style={styles.link}>
          Grant Camera Permission
        </Text>
      </View>
    );
  }

  const handleScan = async (data: string) => {
    if (scanned) return;
    setScanned(true);

    const eventId = extractEventId(data);
    if (!eventId) {
      Alert.alert("Invalid QR Code", "Could not extract event ID");
      setScanned(false);
      return;
    }

    try {
      const userId = "USER123"; //TODO: User ID in AuthContext
      await joinEvent(userId, eventId);

      router.push({
        pathname: "/Events", //navigate to event page after scanning
        params: { id: eventId },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setScanned(false);
    }
  };

  return (
    <View style={styles.boxContainer}>
      {scanned && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "white", marginTop: 8 }}>Joining Event...</Text>
        </View>
      )}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ data }) => handleScan(data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#888",
    backgroundColor: "#000",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 16,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});