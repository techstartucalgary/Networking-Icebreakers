import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const GuestStyling = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
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
	},
	container: {
		position: "absolute",
		top: vh(15),
		width: "100%",
		bottom: 0,
		backgroundColor: colors.lightGrey,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		padding: 20,
	},
	label: {
		fontFamily: fonts.body,
		fontWeight: "600",
		marginTop: 12,
		marginBottom: 4,
		color: colors.darkNavy,
		fontSize: 14,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.lightGrey2,
		color: colors.darkNavy,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 10,
		fontFamily: fonts.body,
		fontSize: 14,
	},
	inputInfo: {
		textAlign: "center",
		color: colors.lightGrey2,
		fontStyle: "italic",
		fontFamily: fonts.body,
		fontSize: 12,
		marginTop: 6,
	},
	error: {
		textAlign: "center",
		color: colors.error,
		fontFamily: fonts.body,
		fontWeight: "600",
		marginTop: 8,
	},
	primaryButton: {
		backgroundColor: colors.darkNavy,
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 24,
	},
	secondaryButton: {
		backgroundColor: colors.lightGrey2,
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	buttonText: {
		color: colors.white,
		fontWeight: "700",
		fontFamily: fonts.body,
		fontSize: 16,
	},
});
