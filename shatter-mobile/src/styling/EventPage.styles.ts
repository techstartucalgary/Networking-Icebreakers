import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const EventPageStyling = StyleSheet.create({
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
	},
	pageTitle: {
		fontSize: vw(8),
		fontWeight: "900",
		letterSpacing: 3,
		color: "#A8C8E8",
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
		padding: 5,
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
