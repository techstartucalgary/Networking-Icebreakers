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
		width: vw(90),
		height: vh(70),
		backgroundColor: colors.white,
		borderRadius: 14,
		padding: 16,
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
		paddingVertical: 12,
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
	timer: {
		fontSize: 16,
		fontFamily: fonts.body,
		fontWeight: "600",
		color: colors.darkNavy,
		marginBottom: 12,
		textAlign: "center",
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.55)",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 14,
	},
	overlayText: {
		fontSize: 26,
		fontFamily: fonts.title,
		color: colors.white,
	},
});
