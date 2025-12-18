import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import NameBingo from "./NameBingo";

type IcebreakerGameProps = {
  eventId: string;
  gameType: "Name Bingo"; //TODO: Add more games
};

const IcebreakerGame = ({ eventId, gameType }: IcebreakerGameProps) => {
  const [timeLeft, setTimeLeft] = useState(300); //5 mins
  const [gameOver, setGameOver] = useState(false);

  //Timer logic
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  //Pick game-specific component
  const renderGame = () => {
    switch (gameType) {
      case "Name Bingo":
        return <NameBingo eventId={eventId} />;
      default:
        return <Text>Game not found</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.border}>
        <Text style={styles.timer}>Time Left: {timeLeft}s</Text>
        {renderGame()}
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Game Over!</Text>
        </View>
      )}
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