import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const GamePageStyling = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
		backgroundColor: colors.darkNavy,
	},
	safe: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
	},
	page: {
		flex: 1,
		backgroundColor: colors.lightGrey,
		padding: 20,
		borderRadius: 12,
	},
	eventCard: {
		backgroundColor: colors.white,
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	title: {
		fontSize: 22,
		fontFamily: fonts.title,
		color: colors.darkNavy,
		marginBottom: 6,
	},
	description: {
		fontSize: 15,
		fontFamily: fonts.body,
		color: colors.darkNavy,
		lineHeight: 20,
	},
	gameContainer: {
		flex: 1,
		backgroundColor: colors.white,
		borderRadius: 12,
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightGrey,
        width: vw(90),
        maxWidth: 600,
        alignSelf: "center",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		fontFamily: fonts.body,
		color: colors.darkNavy,
	},
	loadingColor: {
		color: colors.darkNavy,
	},
	errorText: {
		fontSize: 18,
		fontFamily: fonts.body,
		color: colors.darkNavy,
	},
});
