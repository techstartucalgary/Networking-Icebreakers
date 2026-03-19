import { StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

export const UserModalStyling = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
		backgroundColor: "rgba(0, 0, 0, 0.85)",
		borderRadius: 8,
	},
	container: {
		backgroundColor: colors.white,
		borderRadius: 20,
		padding: 20,
		width: "100%",
		maxHeight: "75%",

		shadowColor: colors.black,
		shadowOpacity: 0.25,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 8,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 14,
	},
	headerText: {
		flex: 1,
		justifyContent: "center",
	},
	userAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginRight: 16,
	},
	userName: {
		fontSize: 20,
		fontFamily: fonts.title,
		color: colors.darkNavy,
		fontWeight: "bold",
	},
	userBio: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.darkNavy,
		marginBottom: 12,
		lineHeight: 22,
	},

	linkLabel: {
		fontFamily: fonts.title,
		fontSize: 14,
		color: colors.darkNavy,
		fontWeight: "bold",
		marginTop: 6,
	},

	link: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.darkBlue,
		marginBottom: 10,
	},

	leaveUserButton: {
		backgroundColor: colors.darkNavy,
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 10,
	},

	leaveUserButtonText: {
		color: colors.white,
		fontWeight: "bold",
		fontSize: 15,
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
