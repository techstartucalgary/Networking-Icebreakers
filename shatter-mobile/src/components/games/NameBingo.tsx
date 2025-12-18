import { getBingoCategories, getBingoNamesByEventId } from "@/src/services/game.service";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

type NameBingoProps = {
  eventId: string;
};

type Card = {
  cardId: string;
  assignedName?: string;
  category: string;
};

const NameBingo = ({ eventId }: NameBingoProps) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);

      try {
        //fetch names
        const namesData = await getBingoNamesByEventId(eventId);
        const participantsList = namesData?.success && namesData.names ? namesData.names : [];

        //fetch categories
        const categoriesData = await getBingoCategories(eventId);
        const categoriesList = categoriesData?.success && categoriesData.categories ? categoriesData.categories : [];

        //map categories to cards
        const initialCards: Card[] = categoriesList.map((cat, idx) => ({
          cardId: `card-${idx + 1}`,
          category: cat,
        }));

        setParticipants(participantsList);
        setCards(initialCards);
      } catch (err) {
        console.log("Error fetching bingo data:", err);
        setParticipants([]);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchGameData();
  }, [eventId]);

  const handleAssign = (cardId: string, name: string) => {
    setCards((prev) =>
      prev.map((c) => (c.cardId === cardId ? { ...c, assignedName: name } : c))
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading participants or categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search participant"
        value={search}
        onChangeText={setSearch}
      />

      {cards.map((card) => (
        <View key={card.cardId} style={styles.cardContainer}>
          <Text style={styles.cardText}>
            {card.assignedName ? card.assignedName : card.category}
          </Text>

          <FlatList
            data={participants.filter((name) =>
              name.toLowerCase().includes(search.toLowerCase())
            )}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Button
                title={`Assign ${item}`}
                onPress={() => handleAssign(card.cardId, item)}
              />
            )}
          />
        </View>
      ))}
    </View>
  );
};

export default NameBingo;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  cardContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 5,
  },
  cardText: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
});