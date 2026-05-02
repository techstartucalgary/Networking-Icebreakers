import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const JoinEventStyling = StyleSheet.create({
	background: {
		width,
		height,
		backgroundColor: colors.lightGrey,
	},
	safe: {
		flex: 1,
		flexDirection: "column",
	},
	header: {
		height: vh(28),
		justifyContent: "center",
		alignItems: "center",
		marginTop: 5,
		paddingHorizontal: 20,
	},
	pageTitle: {
		fontSize: vw(8),
		fontWeight: "900",
		letterSpacing: 3,
		color: "#A8C8E8",
		textAlign: "center",
	},
	subtitleName: {
		marginTop: 6,
		fontSize: vw(4.2),
		color: "#ffffff",
		fontWeight: "700",
		letterSpacing: 1,
		textAlign: "center",
	},
	subtitle: {
		marginTop: 2,
		fontSize: vw(3.8),
		color: "#ffffff",
		opacity: 0.85,
		letterSpacing: 0.5,
		textAlign: "center",
	},
	container: {
		position: "absolute",
		top: vh(26),
		left: 0,
		right: 0,
		bottom: -50,
		backgroundColor: colors.lightGrey,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 16,
	},

	section: {
		backgroundColor: colors.white,
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
	},

	label: {
		fontFamily: fonts.title,
		fontWeight: "600",
		fontSize: 14,
		marginBottom: 6,
		color: colors.darkNavy,
	},

	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 10,
		color: colors.darkNavy,
	},

	button: {
		backgroundColor: colors.darkNavy,
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},

	buttonSecondary: {
		backgroundColor: colors.darkBlue,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},

	scannerButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},

	buttonText: {
		color: colors.white,
		fontWeight: "700",
		fontSize: 16,
		fontFamily: fonts.body,
	},

	errorText: {
		color: "#d32f2f",
		textAlign: "center",
		marginTop: 8,
		fontSize: 14,
	},

	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
	},

	loading: {
		padding: 10,
		color: colors.darkNavy,
		fontFamily: fonts.title,
		fontWeight: "bold",
		marginTop: 10,
		fontSize: 16,
	},
	divider: {
		marginVertical: 8,
		alignItems: "center",
	},
	dividerText: {
		color: colors.lightGrey2,
		fontSize: vw(4),
		fontFamily: fonts.body,
	},
});
