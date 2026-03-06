import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const EventCardStyling = StyleSheet.create({
	card: {
		backgroundColor: colors.white,
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 5,
		elevation: 3,
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		borderRadius: 10,
		overflow: "hidden",
		marginBottom: 10,
	},
	image: {
		width: "100%",
		height: 150,
		borderRadius: 10,
		marginBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.darkBlue,
		fontFamily: fonts.title,
	},
	date: {
		fontSize: 14,
		color: colors.darkNavy,
		fontFamily: fonts.body,
	},
	expandedContent: {
		marginTop: 8,
		borderTopWidth: 1,
		borderTopColor: colors.white,
		paddingTop: 12,
	},
	description: {
		fontSize: 16,
		color: colors.darkNavy,
		fontFamily: fonts.body,
		marginVertical: 5,
	},
	liveBadge: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: colors.darkNavy,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	joinButton: {
		marginTop: 12,
		backgroundColor: colors.softBlue,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	joinButtonText: {
		color: colors.darkBlue,
		fontWeight: "bold",
		fontSize: 15,
	},
	viewButton: {
		marginTop: 12,
		backgroundColor: colors.softBlue,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	viewButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 15,
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
	liveText: {
		color: "#fff",
		fontWeight: "bold",
		fontFamily: fonts.body,
		fontSize: 12,
		zIndex: 1,
	},
	err: {
		fontSize: 12,
		fontFamily: fonts.body,
		fontWeight: "bold",
		color: colors.error,
	},
});
