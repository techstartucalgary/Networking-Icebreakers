import { getEventByCode, JoinEventIdGuest, JoinEventIdUser } from "@/src/services/event.service";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function QRScannerBox({onClose,}: {onClose: () => void;}) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const scanLock = useRef(false);

  //extract joinCode from QR code
  const extractjoinCode = (qrData: string): string | null => {
    try { 
      //8 numbers (0-9)
      const isValid = /^[0-9]{8}$/.test(qrData);

      if (!isValid) {
        console.log("Invalid join code format: ", qrData);
        return null;
      }
      return qrData; 
    } catch (e) {
      console.log("Error extracting join code:", e);
      return null;
    }
  };

  const joinEvent = async (joinCode: string) => {
    const userId = user?.user_id;
    const name = user?.name

    const eventData = await getEventByCode(joinCode);
    const eventId = eventData?.event.eventId
    console.log("Event returned successfully: ", eventData?.event.name);

    if (!eventData || !eventId) {
      console.log("No event found for join code!");
      return { status: "event-not-found", event: null };
    }

    if (!name) {
      console.log("No name found for user");
      return { status: "no-user", event: null };
    }

    let eventJoinStatus;
    try {
      if (!user?.isGuest) {
        eventJoinStatus = await JoinEventIdUser(eventId, userId!, name);
      } else {
        eventJoinStatus = await JoinEventIdGuest(eventId, userId!, name);
      }
    } catch (error) {
      console.log("Error joining event:", error);
      return { status: "join-error", event: null };
    }

    console.log("Event joined successfully!");
    return { status: eventJoinStatus?.success, event: eventJoinStatus?.event };
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
    if (scanLock.current) return;
    scanLock.current = true; //lock scanner

    const joinCode = extractjoinCode(data);
    if (!joinCode) {
      Alert.alert("Invalid QR Code", "Could not extract join code");
      onClose();
      return;
    }

    try {
      const result = await joinEvent(joinCode);

      if (result.status === "no-user") {
        router.push({ pathname: "/Profile", }); //user must log in or create a guest account
        Alert.alert("No User Found", "Please Create an Account to Join the Event");
        onClose();
        return;
      } else if (result.status === "event-not-found") {
        Alert.alert("No Event Found");
        onClose();
        return;
      } else if (result.status === "join-error") {
        Alert.alert("An error has occurred, please try again later.");
        onClose();
        return;
      }

      setScanned(true);
      onClose();
      router.push({ pathname: "/Events", }); //navigate to event page after scanning
    } catch (err: any) {
      Alert.alert("Error", err.message);
      onClose();
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