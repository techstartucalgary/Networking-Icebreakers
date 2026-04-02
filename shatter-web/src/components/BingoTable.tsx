export interface BingoCell {
    question: string;
    shortQuestion: string;
}

interface BingoTableProps {
    grid: BingoCell[][];
    onChange: (row: number, col: number, value: BingoCell) => void;
}

export default function BingoTable({ grid, onChange }: BingoTableProps) {
    const size = grid.length;

    return (
        <div>
            <label className="block text-sm text-white font-body mb-3">
                Bingo Grid ({size}x{size})
            </label>

            <div className={`grid gap-3 ${size === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
                {grid.map((row, rowIndex) =>
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