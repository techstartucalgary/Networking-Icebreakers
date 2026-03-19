interface BingoTableProps {
    grid: string[][];
    onChange: (row: number, col: number, value: string) => void;
}

export default function BingoTable({ grid, onChange }: BingoTableProps) {
    const size = grid.length;

    return (
        <div>
            <label className="block text-sm text-white font-body mb-3">
                Bingo Grid ({size}x{size})
                <span className="text-white/60 text-xs ml-2">
                    Fill in each box with a question or trait
                </span>
            </label>

            <div className={`grid gap-2 ${size === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className="relative group">
                            <input
                                type="text"
                                value={cell}
                                onChange={(e) =>
                                    onChange(rowIndex, colIndex, e.target.value)
                                }
                                placeholder={`${rowIndex + 1}-${colIndex + 1}`}
                                className="w-full h-24 p-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#4DC4FF] focus:ring-2 focus:ring-[#4DC4FF]/20 transition-all font-body"
                            />
                            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#4DC4FF]/80 text-white text-xs flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {rowIndex * size + colIndex + 1}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}