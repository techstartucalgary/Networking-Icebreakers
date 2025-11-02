import React from "react";
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="NewEvents"
        options={{
          title: 'New Events',
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
        }}
      />

      <Tabs.Screen
        name="PastEvents"
        options={{
          title: 'PastEvents',
        }}
      />
    </Tabs>
  );
}
