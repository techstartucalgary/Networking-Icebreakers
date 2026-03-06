import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const EventPageStyling = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
	},
	safe: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		flex: 1,
		backgroundColor: colors.lightGrey,
		width: "95%",
		borderRadius: 8,
		padding: 10,
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
		marginTop: 10,
		fontSize: 16,
	},
});
