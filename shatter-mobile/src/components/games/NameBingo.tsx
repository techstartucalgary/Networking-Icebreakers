import {
	getBingoCategories,
	getBingoNamesByEventId,
} from "@/src/services/game.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type NameBingoProps = {
	eventId: string;
};

type Card = {
	cardId: string;
	assignedName?: string;
	category: string;
};

const NameBingo = ({ eventId }: NameBingoProps) => {
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [participants, setParticipants] = useState<string[]>([]);
	const [cards, setCards] = useState<Card[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	const storageKey = `bingo-cards-${eventId}`;

	//if left game and re-entered
	const loadSavedCards = async () => {
		const saved = await AsyncStorage.getItem(storageKey);
		if (saved) {
			setCards(JSON.parse(saved));
			setLoading(false);
			return true;
		}
		return false;
	};

	const fetchGameData = useCallback(async () => {
		setLoading(true);

		const hasSaved = await loadSavedCards();
		if (hasSaved) return;

		try {
			//fetch names
			const namesData = await getBingoNamesByEventId(eventId);
			const participantsList =
				namesData?.success && namesData.names ? namesData.names : [];

			//fetch categories
			const categoriesData = await getBingoCategories(eventId);
			const categoriesList =
				categoriesData?.success && categoriesData.categories
					? categoriesData.categories
					: [];

			//map categories to cards
			const initialCards: Card[] = categoriesList.flatMap((row, rowIdx) =>
				row.map((cat, colIdx) => ({
					cardId: `card-${rowIdx}-${colIdx}`,
					category: cat,
				})),
			);

			setParticipants(participantsList);
			setCards(initialCards);

			await AsyncStorage.setItem(storageKey, JSON.stringify(initialCards));
		} catch (err) {
			console.log("Error fetching bingo data:", err);
			setParticipants([]);
			setCards([]);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useFocusEffect(
		useCallback(() => {
			fetchGameData();
		}, [fetchGameData]),
	);

	const handleAssign = async (name: string) => {
		if (!selectedCardId || name === "") return;

		const trimmed = name.trim();

		if (!isValidParticipant(trimmed)) return;
		if (isAlreadyAssigned(trimmed)) return;

		const updatedCards = cards.map((c) =>
			c.cardId === selectedCardId ? { ...c, assignedName: name } : c,
		);

		setCards((prev) =>
			prev.map((c) =>
				c.cardId === selectedCardId ? { ...c, assignedName: name } : c,
			),
		);
		setSearch("");
		setSelectedCardId(null);

		await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCards));
	};

	const isValidParticipant = (name: string) =>
		participants.some((p) => p.toLowerCase() === name.toLowerCase());
	const isAlreadyAssigned = (name: string) =>
		cards.some((c) => c.assignedName?.toLowerCase() === name.toLowerCase());

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#000" />
				<Text>Loading participants or categories...</Text>
			</View>
		);
	}

	const filteredParticipants = participants.filter(
		(name) =>
			name.toLowerCase().includes(search.toLowerCase()) &&
			!isAlreadyAssigned(name),
	);

	return (
		<View style={styles.container}>
			{/* Search bar with type-ahead */}
			<View style={styles.inputRow}>
				<TextInput
					style={styles.inputFlex}
					placeholder="Search participant"
					value={search}
					onChangeText={setSearch}
				/>
				<TouchableOpacity
					style={[styles.submitButton]}
					onPress={() => handleAssign(search.trim())}
					disabled={!selectedCardId || !isValidParticipant}
				>
					<Text style={styles.submitText}>Submit</Text>
				</TouchableOpacity>
			</View>

			{/* Dropdown suggestions */}
			{search.length > 0 && filteredParticipants.length > 0 && (
				<ScrollView style={styles.dropdown}>
					{filteredParticipants.map((p) => (
						<TouchableOpacity
							key={p}
							style={styles.dropdownItem}
							onPress={() => setSearch(p)}
						>
							<Text>{p}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}

			{/* Card grid */}
			<View style={styles.grid}>
				{cards.map((card) => (
					<TouchableOpacity
						key={card.cardId}
						style={[
							styles.card,
							selectedCardId === card.cardId && styles.selectedCard,
						]}
						onPress={() => setSelectedCardId(card.cardId)}
					>
						<Text style={styles.category}>{card.category}</Text>
						{card.assignedName && (
							<Text style={styles.assignedName}>{card.assignedName}</Text>
						)}
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default NameBingo;

const styles = StyleSheet.create({
	container: { flex: 1, padding: 10 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	card: {
		width: "18%",
		aspectRatio: 1,
		backgroundColor: "#e0f7e0",
		marginBottom: 10,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		padding: 5,
	},
	selectedCard: {
		borderWidth: 2,
		borderColor: "#3b82f6",
	},
	category: { fontWeight: "bold", textAlign: "center" },
	assignedName: { fontSize: 12, textAlign: "center", marginTop: 2 },
	inputRow: { flexDirection: "row", marginBottom: 5 },
	inputFlex: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 8,
		borderRadius: 5,
	},
	submitButton: {
		marginLeft: 8,
		backgroundColor: "#3b82f6",
		paddingHorizontal: 16,
		justifyContent: "center",
		borderRadius: 5,
	},
	submitText: { color: "#fff", fontWeight: "bold" },
	dropdown: {
		maxHeight: 150,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
	},
	dropdownItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
