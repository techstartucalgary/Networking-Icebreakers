import { useState } from "react"; 
import { GenerateQuestions } from "../service/GenerateQuestions";
import useTagInput from "../hooks/useTag";
import { TagField } from "./TagField"; 

// Displays the bingo table and handles input/AI generation
export interface BingoCell {
    question: string;
    shortQuestion: string;
}

interface BingoTableProps {
    bingoGrid: BingoCell[][];
    onChange: (row: number, col: number, value: BingoCell) => void;
    bingosize: number; // 3 or 5 for now, but will be dynamic in the future
    setBingoGrid: any
}

//This should probably use "UseState" for the columns and rows in the future when it becomes resizable. For now, it is just hard coded to 3x3/5x5

export default function BingoTable({ bingoGrid, onChange, bingosize, setBingoGrid }: BingoTableProps) {
    const [size, setSize] = useState(bingosize);
    const [bingoDescription, setBingoDescription] = useState("");
    const [fetching, setFetching] = useState(false);
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

    const MAX_TAGS = 5;
    const { tags, handleAddTag, handleRemoveTag } = useTagInput(MAX_TAGS);


    //Handling cell selection
    const toggleCellSelection = (row: number, col: number) => {
        const key = `${row}-${col}`;
        setSelectedCells(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    //API call
    /*const generateBingoQuestions = async () => {
        try {
            console.log("generating bingo questions");
            setFetching(true)
            const result = await GenerateQuestions({ context: bingoDescription, n_rows: 3, n_cols: 3 });
            if (result && result.bingoGrid) {
                console.log("got response: ", result.bingoGrid);
                setBingoGrid(result.bingoGrid);
                setFetching(false);
            }
        } catch (error) {
            console.error("Error generating bingo questions: ", error);
            setFetching(false);
        }
    };*/

    const generateBingoQuestions = async () => {
        try {
            setFetching(true);

            // Converting Set into array of {row, col}
            const selected = Array.from(selectedCells).map(key => {
                const [row, col] = key.split("-").map(Number);
                return { row, col };
            });

            // Concatenating tags to create prompt
            const tagString = tags.length > 0
                ? ` Tags: ${tags.join(", ")}`
                : "";

            const fullPrompt = `${bingoDescription}${tagString}`;

            const result = await GenerateQuestions({
                context: fullPrompt,
                n_rows: size,
                n_cols: size,
                selectedCells: selected.length > 0 ? selected : undefined //if no cells are selected, acts as if we selected all of them
            });

            if (result && result.bingoGrid) {
                //console.log("got response: ", result.bingoGrid);

                // No selection
                if (selected.length === 0) {
                    setBingoGrid(result.bingoGrid);
                }
                // Selected cells
                else {
                    const newGrid = bingoGrid.map(row => [...row]);

                    selected.forEach(({ row, col }) => {
                        const newCell = result.bingoGrid?.[row]?.[col]; //optional chaining

                        if (newCell && newCell.question && newCell.shortQuestion) {
                            newGrid[row][col] = newCell;
                        }
                    });

                    setBingoGrid(newGrid);
                    setSelectedCells(new Set());
                }
            }

        } catch (error) {
            console.error("Error generating bingo questions: ", error);
        } finally {
            setFetching(false);
        }
    };

    return (

        <div className="space-y-4">
            <div>
                <label className="block text-sm text-white font-body mb-2">Bingo Prompt</label>
                <input
                    type="text"
                    value={bingoDescription}
                    onChange={(e) => setBingoDescription(e.target.value)}
                    placeholder="e.g., Software engineering event..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                />
                <label className="block text-sm text-white font-body mb-2">Bingo Tags</label>
                <TagField
                    tags={tags}
                    addTag={handleAddTag}
                    removeTag={handleRemoveTag}
                    maxTags={MAX_TAGS}
                />

            </div>

            <button
                onClick={generateBingoQuestions}
                className="px-4 py-2 rounded-full font-body transition-all duration-200 border border-transparent"
                style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8F7DE";
                    e.currentTarget.style.color = "#1B253A";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#4DC4FF";
                    e.currentTarget.style.color = "#ffffff";
                }}
                disabled={fetching}
            >
                {fetching ? "Generating..." : "Generate Questions"}
            </button>

            <label className="block text-sm text-white font-body mb-3">
                Bingo Grid ({size}x{size})
            </label>

            <div className={`grid gap-3 ${size === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
                {bingoGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => toggleCellSelection(rowIndex, colIndex)}
                            className={`bg-white/5 p-2 rounded-lg border cursor-pointer ${selectedCells.has(`${rowIndex}-${colIndex}`)
                                    ? "border-[#4DC4FF] bg-[#4DC4FF]/20"
                                    : "border-white/20"
                                }`}
                        >

                            {/* LONG QUESTION */}
                            <input
                                type="text"
                                value={cell.question}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    const newGrid = bingoGrid.map(r => [...r]);
                                    newGrid[rowIndex][colIndex] = {
                                        ...cell,
                                        question: e.target.value,
                                    };
                                    setBingoGrid(newGrid);
                                }}
                                placeholder="Full question"
                                className="w-full mb-2 p-2 rounded bg-white/10 text-white text-sm resize-none"
                            />

                            {/* SHORT QUESTION */}
                            <input
                                type="text"
                                value={cell.shortQuestion}
                                onClick={(e) => e.stopPropagation()} // Prevent cell selection when clicking on short question input
                                onChange={(e) => {
                                    const newGrid = bingoGrid.map(r => [...r]);
                                    newGrid[rowIndex][colIndex] = {
                                        ...cell,
                                        shortQuestion: e.target.value,
                                    };
                                    setBingoGrid(newGrid);
                                }}
                                placeholder="Short version"
                                className="w-full p-2 rounded bg-white/10 text-white text-xs"
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}