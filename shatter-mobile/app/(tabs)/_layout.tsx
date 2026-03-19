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

export const JoinEventPageHeaderStyling = {
	title: "",
	headerTransparent: true,
	headerTitle: "",
	tabBarIcon: ({ color, size }: { color: string; size: number }) => (
		<Ionicons name="qr-code-outline" size={size} color={color} />
	),
};

export const ProfilePageHeaderStyling = {
	title: "",
	headerTransparent: true,
	headerTitle: "",
	tabBarIcon: ({ color, size }: { color: string; size: number }) => (
		<Ionicons name="person-outline" size={size} color={color} />
	),
};

export default function RootLayout() {
	return (
		<Tabs screenOptions={barStyles}>
			<Tabs.Screen name="EventsPage" options={EventPageHeaderStyling} />
			<Tabs.Screen name="JoinEventPage" options={JoinEventPageHeaderStyling} />
			<Tabs.Screen name="ProfilePage" options={ProfilePageHeaderStyling} />
		</Tabs>
	);
}
