import { Dimensions, StyleSheet } from "react-native";
import { colors, fonts } from "./constants";

const { width, height } = Dimensions.get("window");

const vw = (percent: number) => (width * percent) / 100;
const vh = (percent: number) => (height * percent) / 100;

export const NameBingoStyling = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		backgroundColor: colors.lightGrey,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	card: {
		aspectRatio: 1,
		backgroundColor: colors.white,
		marginBottom: 10,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		padding: 6,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
	},
	selectedCard: {
		borderWidth: 2,
		borderColor: colors.darkNavy,
	},
	selectedCardInfo: {
		backgroundColor: colors.white,
		padding: 10,
		marginBottom: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	selectedCardCategory: {
		fontSize: 16,
		fontWeight: "bold",
	},
	winningCard: {
		borderWidth: 3,
		borderColor: colors.gold,
	},
	blackoutCard: {
		backgroundColor: colors.gold,
		transform: [{ scale: 1.1 }],
	},
	category: {
		fontFamily: fonts.body,
		fontWeight: "bold",
		fontSize: 12,
		textAlign: "center",
	},
	assignedName: {
		fontFamily: fonts.body,
		fontSize: 11,
		textAlign: "center",
		marginTop: 2,
	},
	inputRow: {
		flexDirection: "row",
		marginBottom: 8,
	},
	inputFlex: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.lightGrey2,
		backgroundColor: colors.white,
		padding: 8,
		borderRadius: 8,
		fontFamily: fonts.body,
		fontSize: 14,
	},
	selectCardHint: {
		color: colors.lightGrey2,
		fontFamily: fonts.body,
		fontWeight: "600",
	},
	bingoBanner: {
		backgroundColor: colors.lightGreen,
		padding: 10,
		borderRadius: 8,
		marginBottom: 10,
	},
	bingoText: {
		color: colors.white,
		fontFamily: fonts.body,
		fontWeight: "bold",
		textAlign: "center",
	},
	dropdown: {
		maxHeight: 160,
		borderWidth: 1,
		borderColor: colors.lightGrey2,
		borderRadius: 8,
		backgroundColor: colors.white,
		marginBottom: 10,
	},
	dropdownItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.lightGrey2,
	},
	rollerVertical: {
		maxHeight: 200,
		marginTop: 4,
		width: '100%',
	},
	rollerItemVertical: {
	paddingVertical: 10,
	paddingHorizontal: 6,
	backgroundColor: '#eee',
	borderRadius: 8,
	marginBottom: 6,
	width: '100%',
	alignItems: 'center',
	},
	rollerItemActive: {
		backgroundColor: colors.gold,
	},
	rollerText: {
		fontSize: 14,
	},
	rollerHighlighted: {
		borderWidth: 2,
		borderColor: colors.gold,
	},
	err: {
		fontSize: 12,
		fontFamily: fonts.body,
		fontWeight: "bold",
		color: colors.error,
		textAlign: "center",
	},
});
