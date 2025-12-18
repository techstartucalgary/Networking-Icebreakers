import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Event, { EventState } from '../../interfaces/Event';

type EventCardProps = {
  event: Event;
  expanded: boolean;
  onPress: () => void; //if tapped
  onJoinGame?: (event: Event) => void;
};

const EventCard = ({ event, expanded, onPress, onJoinGame, }: EventCardProps) => {
  const live = (event.currentState === EventState.IN_PROGRESS);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* LIVE badge */}
      {live && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>Currently Shattering!</Text>
        </View>
      )}

      <Image source={{ uri: event.eventImg }} style={styles.image} ></Image>
      <Text style={styles.title}>{event.name}</Text>

      <Text style={styles.date}>
        {new Date(event.startDate).toLocaleString()}
      </Text>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text>{event.description}</Text>

          {/* Join Game Button */}
          {live && onJoinGame && (
            <Pressable
              onPress={() => onJoinGame(event)}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Join Game</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  description: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinButton: {
    marginTop: 12,
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  liveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});