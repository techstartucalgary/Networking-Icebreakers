import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import EventCard from "../../src/components/events/EventCard";
import type Event from "../../src/interfaces/Event";
import { getAllEvents } from "../../src/services/event.service";

const NewEvents = () => {

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  //reload event list
  const loadEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    const events: Event[] = data?.events || [];
    setEvents(events);
    setLoading(false);
  };

  //load list on page mount
  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => console.log("Tapped event:", item.name)}
          />
        )}
      />
    </View>
  );
};

export default NewEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
});
