import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Event, { EventState } from '../../interfaces/Event';
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchConnections } from "@/src/services/user.service";

type EventCardProps = {
  event: Event;
  expanded: boolean;
  onPress: () => void; //if tapped
  onJoinGame?: (event: Event) => void;
};

const EventCard = ({ event, expanded, onPress, onJoinGame, }: EventCardProps) => {
  const live = true//(event.currentState === EventState.IN_PROGRESS); //TODO: Remove hard coded live status
  const { user, authStorage } = useAuth();
  const [connections, setConnections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  useEffect(() => {
    if (expanded) {
      loadConnections(event._id);
    }
  }, [expanded]);

  const loadConnections = async (eventId: string) => {
    try {
      setLoading(true);
      const userId = user?.user_id;
      const accessToken = authStorage.accessToken

      if (!userId) {
        return {status: "no-user"};
      }

      const res = await fetchConnections(userId, eventId, accessToken);
      if (!res) {
        return {status: "connection-error"};
      }

      setConnections(res.connections)
    } catch {
      setError("Unable to find connections.");
    } finally {
      setLoading(false);
      setError("")
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: event.eventImg }} style={styles.image} />
        
        {/* LIVE badge */}
        {live && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>Currently Shattering!</Text>
          </View>
        )}
      </View>
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

          {loading && <Text>Loading connections...</Text>}

          {/* Connection List */}
          {!loading && <Text style={styles.connectionsTitle}>Connections:</Text>}
          <FlatList
            data={connections}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Text style={styles.item}>{item}</Text>
            )}
          />

          <Text style={styles.err}>{err}</Text>
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
  imageWrapper: {
    position: "relative",
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
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
  connectionsTitle: {
    fontSize: 13, 
    color: "#777",
    fontWeight: "bold",
  },
  item: {
    fontSize: 12,
    color: "#777",
  },
  liveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    zIndex: 1,
  },
  err: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ef4444",
  },
});