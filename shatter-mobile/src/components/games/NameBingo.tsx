import { useGame } from "@/src/components/context/GameContext";
import { EventState, Participant } from "@/src/interfaces/Event";
import { BingoTile } from "@/src/interfaces/Game";
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
	tile: BingoTile;
};

type WinningLine = {
	type: "row" | "col" | "diag";
	index?: number;
	reverse?: boolean;
};

const NameBingo = ({ eventId, onConnect }: NameBingoProps) => {
	const { gameState, currentParticipantId } = useGame();

	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [activeCardId, setActiveCardId] = useState<string | null>(null);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [categories, setCategories] = useState<BingoTile[][]>([]);
	const [cards, setCards] = useState<Card[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [bingoStatus, setBingoStatus] = useState<string | null>(null);
	const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
	const [blackoutAnimating, setBlackoutAnimating] = useState(false);
	const [animatedBlackoutIds, setAnimatedBlackoutIds] = useState<string[]>([]);

	const storageKey = `bingo-cards-${eventId}`;
	const gridSize = categories.length || 5;
	const cardSize = `${100 / gridSize}%` as DimensionValue;

	//helper functions
	const getInitialCards = (tiles: BingoTile[][]) =>
		tiles.flatMap((row, rowIdx) =>
			row.map((tile, colIdx) => ({
				cardId: `card-${rowIdx}-${colIdx}`,
				tile,
			})),
		);

	const isValidParticipant = (participantId: string) =>
		participantId !== currentParticipantId;

	const isAlreadyAssigned = (participantId: string) =>
		cards.some((c) => c.assignedParticipantId === participantId);

	const checkBingoStatus = (
		cardsArr: Card[],
		categoriesList: BingoTile[][],
	): WinningLine[] | "Blackout" => {
		const numRows = categoriesList.length;
		const numCols = categoriesList[0]?.length || 0;
		const grid: (string | undefined)[][] = Array.from(
			{ length: numRows },
			(_, i) =>
				Array.from(
					{ length: numCols },
					(_, j) =>
						cardsArr.find((c) => c.cardId === `card-${i}-${j}`)
							?.assignedParticipantId,
				),
		);

		const lines: WinningLine[] = [];

		//rows & Columns
		for (let i = 0; i < numRows; i++)
			if (grid[i].every(Boolean)) lines.push({ type: "row", index: i });
		for (let j = 0; j < numCols; j++)
			if (grid.every((row) => row[j])) lines.push({ type: "col", index: j });

		//diagonals
		if (grid.every((row, i) => row[i]))
			lines.push({ type: "diag", reverse: false });
		if (grid.every((row, i) => row[numCols - 1 - i]))
			lines.push({ type: "diag", reverse: true });

		if (cardsArr.every((c) => c.assignedParticipantId)) return "Blackout";

		return lines;
	};

	const isCardWinning = (cardId: string) => {
		const [rowIdx, colIdx] = cardId.replace("card-", "").split("-").map(Number);
		return winningLines.some((line) => {
			const size = categories.length;
			if (line.type === "row" && line.index === rowIdx) return true;
			if (line.type === "col" && line.index === colIdx) return true;
			if (line.type === "diag") {
				if (!line.reverse && rowIdx === colIdx) return true;
				if (line.reverse && colIdx === size - 1 - rowIdx) return true;
			}
			return false;
		});
	};

	const playBlackoutAnimation = async () => {
		if (!categories.length) return;
		setBlackoutAnimating(true);
		setAnimatedBlackoutIds([]);

		const order: string[] = [];
		categories.forEach((row, i) =>
			row.forEach((_, j) => order.push(`card-${i}-${j}`)),
		);

		for (const id of order) {
			await new Promise((res) => setTimeout(res, 80));
			setAnimatedBlackoutIds((prev) => [...prev, id]);
		}

		setBlackoutAnimating(false);
		setBingoStatus("Blackout!");
	};

	//load saved cards if re-entering
	const loadSavedCards = async () => {
		try {
			const saved = await AsyncStorage.getItem(storageKey);
			if (!saved) return false;
			const parsed: Card[] = JSON.parse(saved);
			setCards(parsed);
			return true;
		} catch (err) {
			console.log("Error loading saved cards:", err);
			return false;
		}
	};

	//load bingo game data on load
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const categoriesData = await getBingoCategories(eventId);
				setCategories(categoriesData.tiles);

				const participantsData = await getParticipantsByEventId(eventId);
				setParticipants(participantsData?.participants || []);

				const hasSaved = await loadSavedCards();
				if (!hasSaved) {
					const initialCards = getInitialCards(categoriesData.tiles);
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

	//check for bingo on load
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

	const handleAssign = async (participant: Participant) => {
		if (!selectedCardId || !participant || !currentParticipantId) return;
		if (
			!isValidParticipant(participant._id) ||
			isAlreadyAssigned(participant._id)
		)
			return;

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
		setSelectedCardId(null);
		setSearch("");
		await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCards));

		onConnect?.(
			{
				_id: participant._id,
				userId: participant.userId,
				name: participant.name,
			},
			"Met during Name Bingo",
		);

		const result = checkBingoStatus(updatedCards, categories);
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
	};

	const filteredParticipants = participants.filter(
		(p) =>
			currentParticipantId &&
			p.name.toLowerCase().includes(search.toLowerCase()) &&
			!isAlreadyAssigned(p._id) &&
			isValidParticipant(p._id),
	);

	const flatCategories = getInitialCards(categories);

	const selectedCard = cards.find((c) => c.cardId === selectedCardId);

	if (loading) return <FullPageLoader message="Loading bingo..." />;

	return (
		<View style={styles.container}>
			{/* Selected card */}
			{selectedCard && (
				<View style={styles.selectedCardInfo}>
					<Text style={styles.selectedCardCategory}>
						{selectedCard.tile?.question || "?"}
					</Text>
				</View>
			)}

			{/* Hint */}
			{!selectedCardId && gameState.progress !== EventState.COMPLETED && (
				<Text style={styles.selectCardHint}>Select a square first</Text>
			)}

			{/* Search */}
			{gameState.progress !== EventState.COMPLETED && (
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

			{/* Card Grid */}
			<View style={{ padding: 12 }}>
				<View style={styles.grid}>
					{cards.map((card) => {
						const isBlackoutAnimated = animatedBlackoutIds.includes(
							card.cardId,
						);
						return (
							<TouchableOpacity
								key={card.cardId}
								style={[
									styles.card,
									{ width: cardSize },
									selectedCardId === card.cardId && styles.selectedCard,
									activeCardId === card.cardId && styles.rollerHighlighted,
									isCardWinning(card.cardId) && styles.winningCard,
									isBlackoutAnimated && styles.blackoutCard,
								]}
								onPress={() => {
									setSelectedCardId(card.cardId);
									setActiveCardId(card.cardId);
								}}
							>
								<Text style={styles.category}>
									{card.tile?.shortQuestion || "?"}
								</Text>
								{card.assignedParticipantId && (
									<Text style={styles.assignedName}>{card.assignedName}</Text>
								)}
							</TouchableOpacity>
						);
					})}
					<Text style={styles.err}>{error}</Text>
				</View>

				{/* Roller */}
				<ScrollView style={styles.rollerVertical}>
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
							<Text style={styles.rollerText}>
								{item.tile?.question || "?"}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</View>
	);
};

export default NameBingo;
