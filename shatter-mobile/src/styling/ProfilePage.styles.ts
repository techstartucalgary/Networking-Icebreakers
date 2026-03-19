import { Dimensions, StyleSheet } from "react-native";
import { colors } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const ProfilePageStyling = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
		backgroundColor: colors.lightGrey,
	},
	safe: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
	},
	header: {
		height: vh(7),
		justifyContent: "center",
		alignItems: "center",
	},
	pageTitle: {
		fontSize: vw(8),
		fontWeight: "900",
		letterSpacing: 3,
		color: "#A8C8E8",
		textAlign: "center",
	},
	subtitle: {
		marginTop: 6,
		fontSize: vw(4),
		color: "#ffffff",
		opacity: 0.9,
		letterSpacing: 1,
		textAlign: "center",
		paddingHorizontal: 10,
	},
	notice: {
		marginTop: 6,
		fontSize: vw(4),
		color: colors.lightGrey2,
		opacity: 0.9,
		letterSpacing: 1,
		textAlign: "center",
		paddingHorizontal: 10,
	},
	container: {
		position: "absolute",
		top: vh(15),
		width: "100%",
		bottom: 0,
		backgroundColor: colors.lightGrey,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		padding: 20,
		alignItems: "center",
	},
	avatar: {
		width: vw(25),
		height: vw(25),
		borderRadius: vw(12.5),
		marginBottom: 16,
	},
	title: {
		fontSize: vw(6),
		fontWeight: "700",
		color: colors.darkNavy,
		marginBottom: 4,
		textAlign: "center",
	},
	subtitleText: {
		fontSize: vw(4),
		color: "#555",
		marginBottom: 12,
		textAlign: "center",
	},
	linkContainer: {
		width: "100%",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	linkLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.darkNavy,
	},
	linkUrl: {
		fontSize: 14,
		color: "#555",
	},
	editButton: {
		marginTop: 16,
		backgroundColor: "#1e3a8a",
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 8,
	},
	logoutButton: {
		marginTop: 12,
		backgroundColor: "#d32f2f",
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 8,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "700",
		textAlign: "center",
	},
	emptyText: {
		fontSize: 14,
		color: "#777",
		marginTop: 12,
		textAlign: "center",
	},
});
