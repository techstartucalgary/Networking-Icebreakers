import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NameBingo from "./NameBingo";
import { useRouter } from "expo-router";
import { useGame } from "../context/GameContext";

const IcebreakerGame = () => {
  const { gameState } = useGame();
  const router = useRouter();

  //Pick game-specific component
  const renderGame = () => {
    switch (gameState.gameType) {
      case "Name Bingo":
        return <NameBingo eventId={gameState.eventId} />;
      default:
        return <Text>Game not found</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.border}>
        {renderGame()}

        {/* Leave Game Button */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => router.replace("/EventsPage")}
        >
          <Text style={styles.leaveButtonText}>Leave Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IcebreakerGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    width: "100%",
    backgroundColor: "#fff",
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#3b82f6",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  leaveButton: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 12,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});