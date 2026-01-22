import { Tabs } from "expo-router";
import { AuthProvider } from "../../src/components/context/AuthContext";
import {Ionicons} from '@expo/vector-icons'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen 
          name="Events"
          options={{ title: "Home", headerShown: false,tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused?"home": "home-outline"}
            />
          )}}
        />

        <Tabs.Screen 
          name="Explore"
          options={{ title: "explore", headerShown: false,tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused? "compass":"compass-outline"}
            />
          )}}
        />

        <Tabs.Screen
          name="JoinEvent"
          options={{ title: "Join an Event",headerShown: false, tabBarIcon: ({focused}) =>(
            <Ionicons
              size = {24}
              name={focused? "scan-circle": "scan-circle-outline"}
            />
          )}}
        />

        <Tabs.Screen
          name="Notification"
          options={{ title: "Notification", headerShown: false, tabBarIcon:({focused})=>(
            <Ionicons
              size={24}
              name={focused? "notifications": "notifications-outline"}
            />
          )}}
        />

        <Tabs.Screen
          name="Profile"
          options={{ title: "Profile",headerShown: false, tabBarIcon:({focused})=>(
            <Ionicons
              size={24}
              name={focused? "person": "person-outline"}
            />
          )}}
        />

        <Tabs.Screen
          name="Guest"
          options={{
            href: null, //don't show in nav bar
            title: "Guest"
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
