import { Tabs } from "expo-router";

export default function RootLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="EventsPage" options={{ title: "Events" }} />
			<Tabs.Screen name="JoinEventPage" options={{ title: "Join Event" }} />
			<Tabs.Screen name="ProfilePage" options={{ title: "Profile" }} />
		</Tabs>
	);
}
