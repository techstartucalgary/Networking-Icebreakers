import {
	getBingoCategories,
	getBingoNamesByEventId,
} from "@/src/services/game.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

type WinningLine = {
	type: "row" | "col" | "diag";
	index?: number;
	reverse?: boolean;
};

const NameBingo = ({ eventId }: NameBingoProps) => {
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [participants, setParticipants] = useState<string[]>([]);
	const [categories, setCategories] = useState<string[][]>([]);
	const [cards, setCards] = useState<Card[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [bingoStatus, setBingoStatus] = useState<string | null>(null);
	const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
	const [blackoutAnimating, setBlackoutAnimating] = useState(false);
	const [animatedBlackoutIds, setAnimatedBlackoutIds] = useState<string[]>([]);

	const storageKey = `bingo-cards-${eventId}`;

	//check bingo board state on reload
	useEffect(() => {
		if (!cards.length || !categories.length) return;

		const result = checkBingoStatus(cards, categories);

		if (result === "Blackout") {
			setWinningLines([]);
			playBlackoutAnimation();
		} else if (Array.isArray(result) && result.length > 0) {
			setWinningLines(result);
			setBingoStatus(`Bingo x${result.length}!`);
		} else {
			setWinningLines([]);
			setBingoStatus(null);
		}
	}, [cards, categories]);

	//if left game and re-entered
	const loadSavedCards = async () => {
		try {
			const saved = await AsyncStorage.getItem(storageKey);

			if (!saved) return false;
			const parsed: Card[] = JSON.parse(saved);

			setCards(parsed);
			setLoading(false);
			return true;
		} catch (error) {
			console.log("Error loading saved cards:", error);
			return false;
		}
	};

	const fetchGameData = useCallback(async () => {
		setLoading(true);

		try {
			//fetch categories
			const categoriesData = await getBingoCategories(eventId);

			//store locally
			const categoriesList =
				categoriesData?.success && categoriesData.categories
					? categoriesData.categories
					: [];

			setCategories(categoriesList);

			//fetch names
			const namesData = await getBingoNamesByEventId(eventId);
			const participantsList =
				namesData?.success && namesData.names ? namesData.names : [];

			setParticipants(participantsList);

			const hasSaved = await loadSavedCards();
			if (hasSaved) return;

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

		if (categories) {
			const result = checkBingoStatus(updatedCards, categories);

			if (result === "Blackout") {
				setWinningLines([]);
				playBlackoutAnimation();
			} else if (result.length > 0) {
				setWinningLines(result);
				setBingoStatus(`Bingo x${result.length}!`);
			} else {
				setWinningLines([]);
				setBingoStatus(null);
			}
		}
	};

	const checkBingoStatus = (
		cards: Card[],
		categoriesList: string[][],
	): WinningLine[] | "Blackout" => {
		const numRows = categoriesList.length;
		const numCols = categoriesList[0]?.length || 0;

		const grid: (string | undefined)[][] = [];

		for (let i = 0; i < numRows; i++) {
			grid[i] = [];
			for (let j = 0; j < numCols; j++) {
				const card = cards.find((c) => c.cardId === `card-${i}-${j}`);
				grid[i][j] = card?.assignedName;
			}
		}

		const foundLines: WinningLine[] = [];

		//Rows
		for (let i = 0; i < numRows; i++) {
			if (grid[i].every((name) => name)) {
				foundLines.push({ type: "row", index: i });
			}
		}

		//Columns
		for (let j = 0; j < numCols; j++) {
			if (grid.every((row) => row[j])) {
				foundLines.push({ type: "col", index: j });
			}
		}

		//Main diagonal
		if (grid.every((row, i) => row[i])) {
			foundLines.push({ type: "diag", reverse: false });
		}

		//Anti-diagonal
		if (grid.every((row, i) => row[numCols - 1 - i])) {
			foundLines.push({ type: "diag", reverse: true });
		}

		//Blackout check
		if (cards.every((c) => c.assignedName)) return "Blackout";

		return foundLines;
	};

	const playBlackoutAnimation = async () => {
		if (!categories.length) return;

		setBlackoutAnimating(true);
		setAnimatedBlackoutIds([]);

		const numRows = categories.length;
		const numCols = categories[0].length;

		const order: string[] = [];

		// Example pattern: row-by-row wave
		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				order.push(`card-${i}-${j}`);
			}
		}

		for (let id of order) {
			await new Promise((res) => setTimeout(res, 80));
			setAnimatedBlackoutIds((prev) => [...prev, id]);
		}

		setBlackoutAnimating(false);
		setBingoStatus("Blackout!");
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
			{/* Bingo status */}
			{bingoStatus && (
				<View style={styles.bingoBanner}>
					<Text style={styles.bingoText}>{bingoStatus}</Text>
				</View>
			)}

			{/* Search bar with type-ahead */}
			<View style={styles.inputRow}>
				<TextInput
					style={styles.inputFlex}
					placeholder="Who did you find?"
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
				{cards.map((card) => {
					let isWinningCard = false;
					const isBlackoutAnimated = animatedBlackoutIds.includes(card.cardId);

					//check for winning bingo line
					if (winningLines.length > 0) {
						winningLines.forEach((line) => {
							const [rowIdx, colIdx] = card.cardId
								.replace("card-", "")
								.split("-")
								.map(Number);

							if (line.type === "row" && line.index === rowIdx)
								isWinningCard = true;

							if (line.type === "col" && line.index === colIdx)
								isWinningCard = true;

							if (line.type === "diag") {
								const size = categories.length;

								if (!line.reverse && rowIdx === colIdx) isWinningCard = true;

								if (line.reverse && colIdx === size - 1 - rowIdx)
									isWinningCard = true;
							}
						});
					}

					return (
						<TouchableOpacity
							key={card.cardId}
							style={[
								styles.card,
								selectedCardId === card.cardId && styles.selectedCard,
								isWinningCard && styles.winningCard,
								isBlackoutAnimated && styles.blackoutCard,
							]}
							onPress={() => setSelectedCardId(card.cardId)}
						>
							<Text style={styles.category}>{card.category}</Text>
							{card.assignedName && (
								<Text style={styles.assignedName}>{card.assignedName}</Text>
							)}
						</TouchableOpacity>
					);
				})}
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
	winningCard: {
		borderWidth: 3,
		borderColor: "gold",
	},
	blackoutCard: {
		backgroundColor: "#FFD700",
		transform: [{ scale: 1.1 }],
	},
	category: { fontWeight: "bold", textAlign: "center" },
	assignedName: { fontSize: 12, textAlign: "center", marginTop: 2 },
	inputRow: { flexDirection: "row", marginBottom: 5 },
	inputTitle: { color: "#d4d4d4", fontWeight: "bold" },
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
	bingoBanner: {
		backgroundColor: "#4CAF50",
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
	},
	bingoText: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
	dropdown: {
		maxHeight: 150,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
	},
	dropdownItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
