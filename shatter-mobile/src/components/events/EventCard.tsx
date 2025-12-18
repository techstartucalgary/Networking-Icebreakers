import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import Event from '../../interfaces/Event';

interface EventCardProps {
  event: Event;
  onPress?: () => void; //if tapped
}

const EventCard = ({ event, onPress }: EventCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {event.eventImg ? (
        <Image source={{ uri: event.eventImg }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{event.name}</Text>

      <Text style={styles.date}>
        {new Date(event.startDate).toLocaleDateString()} -{" "}
        {new Date(event.endDate).toLocaleDateString()}
      </Text>

      {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
    </TouchableOpacity>
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
  description: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  joinCode: {
    fontSize: 12,
    color: "#999",
  },
});