import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { barStyles } from "../../src/styling/PageStyles.styles";

export const EventPageHeaderStyling = {
	title: "",
	headerTransparent: true,
	headerTitle: "",
	tabBarIcon: ({ color, size }: { color: string; size: number }) => (
		<Ionicons name="calendar-outline" size={size} color={color} />
	),
};

export default function RootLayout() {
	return (
		<Tabs screenOptions={barStyles}>
			<Tabs.Screen name="EventsPage" options={EventPageHeaderStyling} />
			<Tabs.Screen
				name="JoinEventPage"
				options={{
					title: "",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="qr-code-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="ProfilePage"
				options={{
					title: "",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
