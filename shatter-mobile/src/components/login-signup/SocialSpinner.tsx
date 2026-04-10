import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export default function SocialSpinner() {
	const scrollX = useRef(new Animated.Value(0)).current;

	const icons: React.ComponentProps<typeof FontAwesome>["name"][] = [
		"linkedin",
		"github",
		"globe",
		"twitter",
		"instagram",
	];

	const ITEM_WIDTH = 60;
	const totalWidth = icons.length * ITEM_WIDTH;

	useEffect(() => {
		Animated.loop(
			Animated.timing(scrollX, {
				toValue: -totalWidth,
				duration: 4000,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		).start();
	}, []);

	return (
		<View style={{ overflow: "hidden", height: 40, marginTop: 5 }}>
			<Animated.View
				style={{
					flexDirection: "row",
					transform: [{ translateX: scrollX }],
				}}
			>
				{/* Duplicate icons for seamless loop */}
				{[...icons, ...icons].map((icon, index) => (
					<View key={index} style={{ width: ITEM_WIDTH, alignItems: "center" }}>
						<FontAwesome name={icon} size={28} color="#ccc" />
					</View>
				))}
			</Animated.View>
		</View>
	);
}
