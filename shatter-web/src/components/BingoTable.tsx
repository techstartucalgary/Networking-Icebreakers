import { useState } from "react"; 
import { GenerateQuestions } from "../service/GenerateQuestions";

export interface BingoCell {
    question: string;
    shortQuestion: string;
}

interface BingoTableProps {
    grid: BingoCell[][];
    onChange: (row: number, col: number, value: BingoCell) => void;
}

//This should probably use "UseState" for the columns and rows in the future when it becomes resizable. For now, it is just hard coded to 3x3/5x5

export default function BingoTable({ grid, onChange }: BingoTableProps) {
    const size = grid.length;
    const [bingoGrid, setBingoGrid] = useState(grid);
    const [bingoDescription, setBingoDescription] = useState("");

    const generateBingoQuestions = async () => {
        try {
            console.log("generating bingo questions");
            const result = await GenerateQuestions({ context: bingoDescription, n_rows: 3, n_cols: 3 });
            if (result && result.bingoGrid) {
                console.log("got response: ", result.bingoGrid);
                setBingoGrid(result.bingoGrid);
            }
        } catch (error) {
            console.error("Error generating bingo questions: ", error);
        }
    };

    return (

        <div className="space-y-4">
            <div>
                <label className="block text-sm text-white font-body mb-2">Bingo Description</label>
                <input
                    type="text"
                    value={bingoDescription}
                    onChange={(e) => setBingoDescription(e.target.value)}
                    placeholder="e.g., Find someone who..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
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
                disabled={false}
            >
                Generate Questions
            </button>

            <label className="block text-sm text-white font-body mb-3">
                Bingo Grid ({size}x{size})
            </label>

            <div className={`grid gap-3 ${size === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
                {bingoGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className="bg-white/5 p-2 rounded-lg border border-white/20">

                            {/* LONG QUESTION */}
                            <input
                                type="text"
                                value={cell.question}
                                onChange={(e) =>
                                    onChange(rowIndex, colIndex, {
                                        ...cell,
                                        question: e.target.value,
                                    })
                                }
                                placeholder="Full question"
                                className="w-full mb-2 p-2 rounded bg-white/10 text-white text-sm resize-none"
                            />

                            {/* SHORT QUESTION */}
                            <input
                                type="text"
                                value={cell.shortQuestion}
                                onChange={(e) =>
                                    onChange(rowIndex, colIndex, {
                                        ...cell,
                                        shortQuestion: e.target.value,
                                    })
                                }
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