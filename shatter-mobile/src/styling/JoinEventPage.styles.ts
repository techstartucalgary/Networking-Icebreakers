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
		height: vh(10),
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
		top: vh(20),
		width: "100%",
		bottom: 0,
		backgroundColor: colors.lightGrey,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		padding: 20,
	},
	codeContainer: {
		width: "100%",
		marginTop: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		fontSize: 16,
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
		fontFamily: fonts.body,
		fontWeight: "bold",
		marginTop: 10,
		fontSize: 16,
	},
});
