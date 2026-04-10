import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BingoTable from "../components/BingoTable";
import { CreateEvent } from "../service/CreateEvent";
import { useNavigate } from "react-router-dom";
import type { BingoCell } from "../types/BingoCell";
function CreateEventPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxParticipant, setMaxParticipant] = useState<number | undefined>(
        undefined
    );

    // ✅ NEW: Name Bingo selection
    const createEmptyGrid = (size: number): BingoCell[][] =>
        Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({
                question: "",
                shortQuestion: "",
            }))
        );    const [nameBingoSelected, setNameBingoSelected] = useState(false);
    const [bingoGrid, setBingoGrid] = useState<BingoCell[][]>(createEmptyGrid(3));
    const [bingoDescription, setBingoDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleCreateEvent = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Validate main form
            if (!name.trim() || !description.trim() || !startDate || !maxParticipant || maxParticipant <= 0) {
                throw new Error("Please fill in all required fields.");
            }

            // ✅ Validate bingo (if selected)
            if (nameBingoSelected) {
                const hasEmptyCells = bingoGrid.some(row =>
                    row.some(cell => !cell.question.trim() || !cell.shortQuestion.trim())
                );

                if (hasEmptyCells) {
                    throw new Error("Please fill in all bingo grid cells.");
                }

                if (!bingoDescription.trim()) {
                    throw new Error("Please add a bingo description.");
                }
            }

            // 1️⃣ Create event
            const { eventId, joinCode } = await CreateEvent({
                name,
                description,
                startDate,
                endDate,
                maxParticipants: maxParticipant ?? 0,
            });

            // 2️⃣ Create bingo (ONLY ONE CALL)
            if (nameBingoSelected) {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Authentication required.");

                const response = await fetch(`${import.meta.env.VITE_API_URL}/bingo/createBingo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        _eventId: eventId,
                        description: bingoDescription,
                        grid: bingoGrid,
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || "Failed to create bingo game.");
                }
            }

            // 3️⃣ Navigate
            setLoading(false);
            navigate(`/events/${joinCode}`);

        } catch (err: any) {
            console.error("Create event error:", err);
            setError(err.message || "Failed to create event. Please try again.");
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setMaxParticipant(undefined);
        setNameBingoSelected(false);
        setError(null);
        navigate("/");
    };

    // Form validation
    const isFormValid = 
        name.trim() !== "" &&
        description.trim() !== "" &&
        startDate.trim() !== "" &&
        maxParticipant !== undefined && 
        maxParticipant > 0;

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
    }, [token, navigate])
    return (
        <div
            className="min-h-screen text-white"
            style={{
                background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
            }}
        >
            <Navbar />

            <main className="max-w-6xl mx-auto pt-28 pb-16 px-6">
                <h2 className="text-5xl font-heading font-semibold text-white mb-4 text-center">
                    Create Event
                </h2>

                {/* Error Message */}
                {error && (
                    <div 
                        className="mb-6 p-4 rounded-lg border text-sm max-w-2xl mx-auto"
                        style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5'
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Event Name */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-white font-body mb-2 block">
                            Event Name *
                        </label>
                        <input
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black font-body"
                            placeholder="e.g., Tech Networking Night"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-white font-body mb-2 block">
                            Description *
                        </label>
                        <textarea
                            className="w-full h-32 p-3 rounded bg-white border border-gray-700 text-black font-body"
                            placeholder="Describe your event..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="text-sm text-white font-body mb-2 block">
                            Start Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black font-body"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="text-sm text-white font-body mb-2 block">
                            End Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black font-body"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                            min={startDate}
                        />
                        <p className="text-xs text-white/50 mt-1 font-body">
                            Optional: Defaults to 3 hours after start time
                        </p>
                    </div>

                    {/* Max Participant */}
                    <div>
                        <label className="text-sm text-white font-body mb-2 block">
                            Max Participants *
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 50"
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black font-body"
                            value={maxParticipant ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMaxParticipant(val === "" ? undefined : Number(val));
                            }}
                            min="1"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Icebreakers Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-heading font-semibold mb-4">
                        Icebreakers
                    </h2>
                    <p className="text-white/70 font-body mb-6 text-sm">
                        Select icebreaker activities for your event
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* ✅ Name Bingo (ACTIVE) */}
                        <div 
                            onClick={() => setNameBingoSelected((prev) => !prev)}
                            className={`
                                backdrop-blur-lg border rounded-xl p-6 cursor-pointer transition
                                ${nameBingoSelected
                                    ? "border-[#4DC4FF] bg-[#4DC4FF]/10"
                                    : "border-white/20 hover:border-white/40"
                                }
                            `}
                            style={{ backgroundColor: 'rgba(27, 37, 58, 0.5)' }}
                        >
                            <h3 className="font-heading font-semibold text-white mb-2">
                                Name Bingo
                            </h3>
                            <p className="text-sm text-white/70 font-body">
                                The ultimate icebreaker game where your bingo card is filled with
                                the names of other players.
                            </p>
                        </div>

                        {/* Disabled placeholders (unchanged) */}
                        <div 
                            className="backdrop-blur-lg border border-white/20 rounded-xl p-6 opacity-50 cursor-not-allowed"
                            style={{ backgroundColor: 'rgba(27, 37, 58, 0.5)' }}
                        >
                            <h3 className="font-heading font-semibold text-white mb-2">
                                Scavenger Hunt
                            </h3>
                            <p className="text-sm text-white/70 font-body">
                                A fun interactive hunt to get attendees talking and moving.
                            </p>
                        </div>

                        <div 
                            className="backdrop-blur-lg border border-white/20 rounded-xl p-6 opacity-50 cursor-not-allowed"
                            style={{ backgroundColor: 'rgba(27, 37, 58, 0.5)' }}
                        >
                            <h3 className="font-heading font-semibold text-white mb-2">
                                Speed Networking
                            </h3>
                            <p className="text-sm text-white/70 font-body">
                                Quick rounds of introductions to help participants meet everyone.
                            </p>
                        </div>
                    </div>
                </div>

                {/*Icebreaker Properties*/}
                                        {nameBingoSelected && (
                            <div className="mt-6 space-y-4">
                            {/*
                                <div>
                                    <label className="text-sm text-white mb-2 block">
                                        Bingo Description
                                    </label>
                                    <input
                                        value={bingoDescription}
                                        onChange={(e) => setBingoDescription(e.target.value)}
                                        className="w-full p-3 rounded bg-white border text-black"
                                    />
                                </div>
                            */}
                                <BingoTable
                                    grid={bingoGrid}
                                    onChange={(row, col, value) => {
                                        const newGrid = bingoGrid.map(r => [...r]);
                                        newGrid[row][col] = value;
                                        setBingoGrid(newGrid);
                                    }}
                                />
                            </div>
                        )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12">
                    <button
                        onClick={handleDiscard}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold font-body transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        Discard
                    </button>

                    <button
                        onClick={handleCreateEvent}
                        className="px-6 py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                            backgroundColor: isFormValid && !loading ? '#4DC4FF' : '#6b7280',
                            color: '#ffffff'
                        }}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </div>

                {/* Helper Text */}
                <p className="text-center text-white/50 text-sm font-body mt-6">
                    * Required fields
                </p>
            </main>

            <Footer />
        </div>
    );
}

export default CreateEventPage;
