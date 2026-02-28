import { EventState, GameType } from "@/src/interfaces/Event";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useState } from "react";

type GameState = {
	gameType: GameType; //"Game Bingo"
	eventId: string;
	loading: boolean;
	data: any; //generic, can hold cards, prompts, scores
	status: string | null; //"Bingo!", "Completed"
	progress: EventState;
};

type GameContextType = {
	gameState: GameState;
	initializeGame: (
		gameType: GameType,
		eventId: string,
        eventProgress: EventState,
		initialData?: any,
	) => void;
	setGameData: (data: any) => void;
	setGameStatus: (status: string | null) => void;
	setGameProgress: (progress: EventState) => void;
	resetGame: () => void;
};

const defaultGameState: GameState = {
	gameType: GameType.NAME_BINGO,
	eventId: "",
	loading: true,
	data: "",
	status: null,
	progress: EventState.UPCOMING,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
	const [gameState, setGameState] = useState<GameState>(defaultGameState);

	const storageKey = (eventId: string, gameType: GameType) =>
		`game-${gameType}-${eventId}`;

	const initializeGame = async (
		gameType: GameType,
		eventId: string,
		eventProgress: EventState,
		initialData: any = {},
	) => {
		setGameState({
			gameType,
			eventId,
			loading: true,
			data: initialData,
			status: null,
			progress: eventProgress,
		});

		//Load persisted state if exists
		try {
			const saved = await AsyncStorage.getItem(storageKey(eventId, gameType));
			if (saved) {
				setGameState(JSON.parse(saved));
			}
		} catch (err) {
			console.log("Failed to load game state:", err);
		} finally {
			setGameState((prev) => ({ ...prev, loading: false }));
		}
	};

	const setGameData = async (data: any) => {
		if (!gameState) return;
		const newState = { ...gameState, data };
		setGameState(newState);

		try {
			await AsyncStorage.setItem(
				storageKey(gameState.eventId, gameState.gameType),
				JSON.stringify(newState),
			);
		} catch (err) {
			console.log("Failed to save game data:", err);
		}
	};

	const setGameStatus = async (status: string | null) => {
		if (!gameState) return;
		const newState = { ...gameState, status };
		setGameState(newState);

		try {
			await AsyncStorage.setItem(
				storageKey(gameState.eventId, gameState.gameType),
				JSON.stringify(newState),
			);
		} catch (err) {
			console.log("Failed to save game status:", err);
		}
	};

	const setGameProgress = async (progress: EventState) => {
		if (!gameState) return;
		const newState = { ...gameState, progress };
		setGameState(newState);

		try {
			await AsyncStorage.setItem(
				storageKey(gameState.eventId, gameState.gameType),
				JSON.stringify(newState),
			);
		} catch (err) {
			console.log("Failed to save game progress:", err);
		}
	};

	const resetGame = async () => {
		if (!gameState) return;
		const key = storageKey(gameState.eventId, gameState.gameType);
		try {
			await AsyncStorage.removeItem(key);
			setGameState({ ...gameState, data: {}, status: null });
		} catch (err) {
			console.log("Failed to reset game:", err);
		}
	};

	return (
		<GameContext.Provider
			value={{
				gameState,
				initializeGame,
				setGameData,
				setGameStatus,
				setGameProgress,
				resetGame,
			}}
		>
			{children}
		</GameContext.Provider>
	);
};

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) throw new Error("useGame must be used within a GameProvider");
	return context;
};
