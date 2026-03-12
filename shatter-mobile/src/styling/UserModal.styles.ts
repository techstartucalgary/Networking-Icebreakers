import { StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

export const UserModalStyling = StyleSheet.create({
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
	userAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 12,
	},
	userName: {
		fontSize: 18,
		fontFamily: fonts.title,
		color: colors.darkNavy,
		fontWeight: "bold",
		marginBottom: 12,
	},
	userBio: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.darkNavy,
		textAlign: "center",
		marginBottom: 10,
		lineHeight: 20,
	},
	link: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.darkBlue,
		marginBottom: 16,
	},
	leaveUserButton: {
		backgroundColor: colors.darkNavy,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 10,
	},
	leaveUserButtonText: {
		color: colors.white,
		fontWeight: "bold",
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
