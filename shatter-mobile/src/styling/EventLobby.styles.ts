import { StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

export const EventLobbyStyling = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.lightGrey,
	},
	safe: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 20,
		color: colors.darkNavy,
		fontFamily: fonts.title,
	},
	text: {
		marginTop: 10,
		fontSize: 16,
		color: colors.darkNavy,
		fontFamily: fonts.body,
	},
	indicator: {
		color: colors.white,
		marginTop: 10,
	},
	leaveButton: {
		backgroundColor: colors.darkNavy,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 30,
	},
	leaveButtonText: {
		color: colors.white,
		fontFamily: fonts.body,
		fontWeight: "600",
		fontSize: 16,
	},
});
