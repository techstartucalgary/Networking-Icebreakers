import { useJoinEvent } from "@/src/components/new-events/JoinEvent";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function QRScannerBox({ onClose }: { onClose: () => void }) {
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const router = useRouter();
	const scanLock = useRef(false);
	const { joinEvent } = useJoinEvent();

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

			router.push({
				pathname: "/EventPages/EventLobby",
				params: { eventId: result },
			});

			setScanned(true);
			onClose();
		} catch (err: any) {
			Alert.alert(err);
			onClose();
		}
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
