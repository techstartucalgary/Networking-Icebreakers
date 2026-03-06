import { colors } from "./constants";

export const barStyles = {
	//top header
	headerTintColor: "#ffffff",
	headerTitleStyle: {
		fontWeight: "bold",
		fontSize: 18,
	},
	headerTitleAlign: "center",

	//bottom tab bar
	tabBarStyle: {
		backgroundColor: colors.white,
		height: 90,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		marginHorizontal: 10,
	},
	tabBarActiveTintColor: colors.darkNavy,
	tabBarInactiveTintColor: colors.lightNavy,
};
