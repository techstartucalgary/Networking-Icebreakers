import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const JoinEventStyling = StyleSheet.create({
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
		height: vh(20),
		justifyContent: "center",
		alignItems: "center",
		marginTop: 5,
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
	container: {
		position: "absolute",
		top: vh(17),
		width: "100%",
		bottom: -50,
		backgroundColor: colors.lightGrey,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		padding: 20,
	},

	section: {
		backgroundColor: colors.white,
		borderRadius: 10,
		padding: 15,
		marginBottom: 20,
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
		marginVertical: 15,
		alignItems: "center",
	},
	dividerText: {
		color: colors.lightGrey2,
		fontSize: vw(4),
		fontFamily: fonts.body,
	},
});
