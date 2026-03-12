import { useGame } from "@/src/components/context/GameContext";
import { EventState, Participant } from "@/src/interfaces/Event";
import {
	getBingoCategories,
	getParticipantsByEventId,
} from "@/src/services/game.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
	DimensionValue,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { NameBingoStyling as styles } from "../../styling/NameBingo.styles";
import FullPageLoader from "../FullPageLoader";

type NameBingoProps = {
	eventId: string;
	onConnect?: (participant: Participant, description: string | null) => void;
};

type Card = {
	cardId: string;
	assignedParticipantId?: string;
	assignedName?: string;
	category: string;
};

type WinningLine = {
	type: "row" | "col" | "diag";
	index?: number;
	reverse?: boolean;
};

const NameBingo = ({ eventId, onConnect }: NameBingoProps) => {
	const { gameState, currentParticipantId } = useGame();
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null); //what user chooses
	const [activeCardId, setActiveCardId] = useState<string | null>(null); //card in the roller
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [categories, setCategories] = useState<string[][]>([]);
	const [cards, setCards] = useState<Card[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [err, setError] = useState("");
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

			if (!saved || saved.length <= 0) {
				return false; //no saved cards
			}

			const parsed: Card[] = JSON.parse(saved);
			setCards(parsed);
			return true;
		} catch (error) {
			console.log("Error loading saved cards:", error);
			return false;
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			try {
				//load game categories
				const categoriesData = await getBingoCategories(eventId);
				const categoriesList =
					categoriesData?.success && categoriesData.categories
						? categoriesData.categories
						: [];
				setCategories(categoriesList);

				//load participants
				const res = await getParticipantsByEventId(eventId);
				const participantsList = res?.participants || [];
				setParticipants(participantsList);

				//load local cards if needed
				const hasSaved = await loadSavedCards();
				if (!hasSaved) {
					const initialCards: Card[] = categoriesList.flatMap((row, rowIdx) =>
						row.map((cat, colIdx) => ({
							cardId: `card-${rowIdx}-${colIdx}`,
							category: cat,
						})),
					);
					setCards(initialCards);
					await AsyncStorage.setItem(storageKey, JSON.stringify(initialCards));
				}
			} catch (err) {
				console.log("Error fetching bingo data:", err);
				setError((err as Error).message);
				setParticipants([]);
				setCards([]);
			} finally {
				setLoading(false);
			}
		};

		if (eventId) fetchData();
	}, [eventId]);

	const handleAssign = async (participant: Participant) => {
		if (!selectedCardId || !participant || !currentParticipantId) return;

		if (!isValidParticipant(participant._id, currentParticipantId)) return;
		if (isAlreadyAssigned(participant._id)) return;

		const updatedCards = cards.map((c) =>
			c.cardId === selectedCardId
				? {
						...c,
						assignedParticipantId: participant._id,
						assignedName: participant.name,
					}
				: c,
		);

		setCards(updatedCards);
		setSearch("");
		setSelectedCardId(null);

		await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCards));

		if (onConnect) {
			const userToConnect: Participant = {
				userId: participant.userId,
				_id: participant._id,
				name: participant.name,
			};

			onConnect(userToConnect, "Met during Name Bingo");
		}

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
				grid[i][j] = card?.assignedParticipantId;
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
		if (cards.every((c) => c.assignedParticipantId)) return "Blackout";

		return foundLines;
	};

	const playBlackoutAnimation = async () => {
		if (!categories.length) return;

		setBlackoutAnimating(true);
		setAnimatedBlackoutIds([]);

		const numRows = categories.length;
		const numCols = categories[0].length;

		const order: string[] = [];

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

	//check if secondary is not primary
	const isValidParticipant = (
		participantId: string,
		primaryParticipantId: string,
	) => participantId !== primaryParticipantId;

	//check if secondary hasn't been assigned to anything yet
	const isAlreadyAssigned = (participantId: string) =>
		cards.some((c) => c.assignedParticipantId === participantId);

	const filteredParticipants = participants.filter((participant) => {
		if (!currentParticipantId) return false;

		return (
			participant.name.toLowerCase().includes(search.toLowerCase()) &&
			!isAlreadyAssigned(participant._id) &&
			isValidParticipant(participant._id, currentParticipantId)
		);
	});

	const flatCategories = categories.flatMap((row, rowIdx) =>
		row.map((cat, colIdx) => ({
			category: cat,
			cardId: `card-${rowIdx}-${colIdx}`,
		})),
	);

	//grid management
	const selectedCard = cards.find((c) => c.cardId === selectedCardId); //find selected card for category
	const gridSize = categories.length || 5;
	const cardSize = `${100 / gridSize}%` as DimensionValue; //dynamic card size for different grid sizes

	if (loading) return <FullPageLoader message="Loading bingo..." />;

	return (
		<View style={styles.container}>
			{/* Selected card category */}
			{selectedCard && (
				<View style={styles.selectedCardInfo}>
					<Text style={styles.selectedCardCategory}>
						{selectedCard.category}
					</Text>
				</View>
			)}

			{/* No card selected when name selected */}
			{!selectedCardId && !(gameState.progress === EventState.COMPLETED) && (
				<Text style={styles.selectCardHint}>Select a square first</Text>
			)}

			{/* Search bar with type-ahead + dropdown */}
			{!(gameState.progress === EventState.COMPLETED) && (
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.inputFlex}
						placeholder="Who did you find?"
						value={search}
						onChangeText={setSearch}
					/>

					{search.length > 0 && filteredParticipants.length > 0 && (
						<ScrollView style={styles.dropdown}>
							{filteredParticipants.map((p) => (
								<TouchableOpacity
									key={p._id}
									style={styles.dropdownItem}
									onPress={() => handleAssign(p)}
								>
									<Text>{p.name}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					)}
				</View>
			)}

			{/* Card grid */}
			<View style={{ padding: 12 }}>
				<View style={styles.grid}>
					{cards.map((card) => {
						let isWinningCard = false;
						const isBlackoutAnimated = animatedBlackoutIds.includes(
							card.cardId,
						);

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
									{ width: cardSize },
									selectedCardId === card.cardId && styles.selectedCard,
									activeCardId === card.cardId && styles.rollerHighlighted,
									isWinningCard && styles.winningCard,
									isBlackoutAnimated && styles.blackoutCard,
								]}
								onPress={() => {
									setSelectedCardId(card.cardId);
									setActiveCardId(card.cardId);
								}}
							>
								<Text style={styles.category}>{card.category}</Text>
								{card.assignedParticipantId && (
									<Text style={styles.assignedName}>{card.assignedName}</Text>
								)}
							</TouchableOpacity>
						);
					})}
					<Text style={styles.err}>{err}</Text>
				</View>

				{/* Roller */}
				<ScrollView
					style={styles.rollerVertical}
					showsVerticalScrollIndicator={false}
				>
					{flatCategories.map((item) => (
						<TouchableOpacity
							key={item.cardId}
							style={[
								styles.rollerItemVertical,
								activeCardId === item.cardId && styles.rollerItemActive,
							]}
							onPress={() => {
								setActiveCardId(item.cardId);
								setSelectedCardId(item.cardId);
							}}
						>
							<Text style={styles.rollerText}>{item.category}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</View>
	);
};

export default NameBingo;
