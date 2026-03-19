import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const IcebreakerStyling = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	gameCard: {
		flex: 1,
		backgroundColor: colors.white,
		borderRadius: 14,
		padding: 7,
		justifyContent: "space-between",

		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 3 },
		shadowRadius: 6,
		elevation: 3,
	},
	gameArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	leaveButton: {
		backgroundColor: colors.darkNavy,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 20,
	},
	leaveButtonText: {
		color: colors.white,
		fontFamily: fonts.body,
		fontSize: 16,
		fontWeight: "600",
	},
});
