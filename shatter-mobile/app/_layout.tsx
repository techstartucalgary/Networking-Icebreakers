import { GameProvider } from "@/src/components/context/GameContext";
import { AuthProvider } from "../src/components/context/AuthContext";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <Slot />
      </GameProvider>
    </AuthProvider>
  );
}