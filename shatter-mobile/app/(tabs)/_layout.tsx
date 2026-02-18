import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="Events" options={{ title: "Events" }} />
      <Tabs.Screen name="JoinEvent" options={{ title: "Join Event" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}