import { StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

export const ConnectionsModalStyling = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},

	container: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 20,
		width: "100%",
		maxHeight: "75%",

		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 8,
	},

	connectionsTitle: {
		fontFamily: fonts.title,
		fontSize: 22,
		color: colors.darkNavy,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 15,
	},

	itemWrapper: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: colors.lightGrey,
		marginBottom: 8,
	},

	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},

	item: {
		fontSize: 16,
		fontFamily: fonts.body,
		color: colors.darkNavy,
	},

	noConnectionsText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.lightGrey2,
		fontStyle: "italic",
		textAlign: "center",
		marginVertical: 25,
	},

	leaveConnectionsButton: {
		marginTop: 16,
		backgroundColor: colors.darkNavy,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
	},

	leaveConnectionsButtonText: {
		color: colors.white,
		fontWeight: "bold",
		fontSize: 16,
		fontFamily: fonts.body,
	},

	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},

	loading: {
		color: colors.darkNavy,
		fontFamily: fonts.body,
		fontWeight: "bold",
		marginTop: 10,
		fontSize: 16,
	},

	err: {
		fontSize: 13,
		fontFamily: fonts.body,
		fontWeight: "bold",
		color: colors.error,
		textAlign: "center",
		marginTop: 10,
	},
});
