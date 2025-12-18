import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import IcebreakerGame from "../../src/components/games/IcebreakerGame";
import { getEventById } from "../../src/services/event.service";

const GamePage = () => {
  const router = useRouter();
  const searchParams = useLocalSearchParams(); 
  const eventId = searchParams.eventId.toString();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      router.replace("/Events");
      return;
    }

    //fetch the event data
    getEventById(eventId)
    .then((data) => {setEvent(data?.event);})
    .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.description}>{event.description}</Text>

      {/* Game Rendering */}
      <IcebreakerGame eventId={event.eventId} gameType={event.gameType}/>
    </View>
  );
};

export default GamePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});