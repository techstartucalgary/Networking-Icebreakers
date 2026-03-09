import { colors } from "./constants";

export const barStyles = {
	//bottom tab bar
	tabBarStyle: {
		backgroundColor: colors.darkNavy,
		height: 90,
		borderTopWidth: 0,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	tabBarActiveTintColor: colors.white,
	tabBarInactiveTintColor: colors.lightNavy,
};
