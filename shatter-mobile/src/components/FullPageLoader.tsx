import { colors, fonts } from "@/src/styling/constants";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const FullPageLoader = ({ message = "Loading..." }: { message?: string }) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={colors.darkNavy} />
			<Text style={styles.text}>{message}</Text>
		</View>
	);
};

export default FullPageLoader;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.lightGrey,
	},
	text: {
		marginTop: 12,
		color: colors.darkNavy,
		fontFamily: fonts.body,
		fontSize: 16,
	},
});
