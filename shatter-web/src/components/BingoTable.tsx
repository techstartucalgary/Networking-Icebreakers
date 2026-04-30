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
    setBingoGrid: React.Dispatch<React.SetStateAction<BingoCell[][]>>;
    bingoDescription: string;
}

//This should probably use "UseState" for the columns and rows in the future when it becomes resizable. For now, it is just hard coded to 3x3/5x5

export default function BingoTable({ bingoGrid, onChange, bingosize, setBingoGrid, bingoDescription }: BingoTableProps) {
    const size = bingosize;
    //const [bingoDescription, setBingoDescription] = useState("");
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

    const generateBingoQuestions = async () => {
        try {
            setFetching(true);

            // Converting Set into array of {row, col}
            const selected = Array.from(selectedCells).map(key => {
                const [row, col] = key.split("-").map(Number);
                return { row, col };
            });

            // Concatenating tags to create prompt

            const result = await GenerateQuestions({
                context: bingoDescription,
                n_rows: size,
                n_cols: size,
                tags: tags,
            });

            if (result && result.bingoGrid) {
                //console.log("got response: ", result.bingoGrid);

                // No selection
                if (selected.length === 0) {
                    setBingoGrid(result.bingoGrid);
                }
                // Selected cells
                else {
                    setBingoGrid(prevGrid => {
                        const newGrid = prevGrid.map(row => [...row]);

                        selected.forEach(({ row, col }) => {
                            const newCell = result.bingoGrid?.[row]?.[col];

                            if (newCell && newCell.question && newCell.shortQuestion) {
                                newGrid[row][col] = newCell;
                            }
                        });

                        return newGrid;
                    });

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
                {/* //old description input
                <label className="block text-sm text-white font-body mb-2">Bingo Prompt</label>
                <input
                    type="text"
                    value={bingoDescription}
                    onChange={(e) => setBingoDescription(e.target.value)}
                    placeholder="e.g., Software engineering event..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                />
                */}
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
                {fetching ? "Generating..." : selectedCells.size === 0 ? "Generate Questions" :
                    selectedCells.size > 1 ? "Regenerate Selected Questions" : "Regenerate Selected Question"}
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
                            className={`bg-white/5 p-4 rounded-lg border cursor-pointer ${selectedCells.has(`${rowIndex}-${colIndex}`)
                                    ? "border-[#4DC4FF] bg-[#4DC4FF]/20"
                                    : "border-white/20"
                                }`}
                        >

                            <label className="block text-base text-white font-bold mb-2 text-center cursor-pointer">Cell {rowIndex * size + colIndex + 1}</label>
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


                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => toggleCellSelection(rowIndex, colIndex)}
                                className={`bg-white/5 mt-2 mx-auto px-3 py-1 rounded-full border border-[#4DC4FF] text-[#4DC4FF] bg-[#4DC4FF]/20 text-sm text-center cursor-pointer w-fit
                                    ${selectedCells.has(`${rowIndex}-${colIndex}`) ? "visible" : "invisible"}`}
                                >
                                    Regenerate
                                </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}