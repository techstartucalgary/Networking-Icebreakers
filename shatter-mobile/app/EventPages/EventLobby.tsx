import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getEventById } from "@/src/services/event.service";
import { EventState } from "@/src/interfaces/Event";

export default function EventLobby() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [status, setStatus] = useState(EventState.UPCOMING);

  //TODO: Websocket for game loading
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getEventById(eventId);

      if (!res) {
        return null
      }

      if (res?.event.currentState === EventState.IN_PROGRESS) {
        clearInterval(interval);
        router.replace({
          pathname: "/GamePages/Game",
          params: { eventId },
        });
      }

      setStatus(res?.event.currentState);
    }, 3000); //poll every 3 seconds

    return () => clearInterval(interval);
  }, [eventId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Successfully Joined!</Text>

      {status === EventState.UPCOMING && (
        <>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>
            Waiting for the event to start...
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});