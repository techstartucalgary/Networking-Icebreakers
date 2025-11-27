import { Tabs } from "expo-router";
import { AuthProvider } from "../../src/components/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen 
          name="Events"
          options={{ title: "Events" }}
        />

        <Tabs.Screen
          name="JoinEvent"
          options={{ title: "Join an Event" }}
        />

        <Tabs.Screen
          name="Profile"
          options={{ title: "Profile" }}
        />
      </Tabs>
    </AuthProvider>
  );
}
