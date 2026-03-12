import { StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

export const EventCompletedStyling = StyleSheet.create({
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
	subtitle: {
		marginTop: 10,
		fontSize: 16,
		color: colors.darkNavy,
		fontFamily: fonts.body,
	},
	connectionsTitle: {
		marginTop: 12,
		fontFamily: fonts.title,
		fontSize: 14,
		color: colors.darkNavy,
		fontWeight: "bold",
	},
	item: {
		fontSize: 12,
		color: colors.beige,
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 8,
	},
	itemWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 2,
	},
	eventsButton: {
		backgroundColor: colors.darkNavy,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 30,
	},
	eventsButtonText: {
		color: colors.white,
		fontFamily: fonts.body,
		fontWeight: "600",
		fontSize: 16,
	},
	err: {
		fontSize: 12,
		fontFamily: fonts.body,
		fontWeight: "bold",
		color: colors.error,
	},
});
