import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

// const MOCK_DATA = [
//   { id: "1", title: "Tech Meetup", location: "New York" },
//   { id: "2", title: "Music Festival", location: "Los Angeles" },
//   { id: "3", title: "Startup Pitch Night", location: "San Francisco" },
// ];

export default function ExploreScreen() {
  const [search, setSearch] = useState("");

//   const filteredData = MOCK_DATA.filter(item =>
//     item.title.toLowerCase().includes(search.toLowerCase())
//   );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore</Text>

      <TextInput
        placeholder="Search events..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 32,
  },
});
