import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CreateEvent } from "../service/CreateEvent";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setDate] = useState("");
    const [maxParticipants, setMaxParticipants] = useState<number | undefined>(
        undefined
    );
    //new
    const [eventType, setEventType] = useState("");
    const [keyInterest, setKeyInterest] = useState("");
    const [institution, setInstitution] = useState("");

    const navigate = useNavigate();

    const handleCreateEvent = async () => {
        const joinCode = await CreateEvent({
            name,
            description,
            startDate,
            maxParticipants: maxParticipants ?? 0,
            eventType,
            keyInterest,
            institution,
        });

        navigate(`/events/${joinCode}`);
    };

    // So form cannot be submitted without field entries
    const isFormValid = name.trim() != "" &&
        description.trim() != "" &&
        startDate.trim() != "" &&
        maxParticipants != undefined && maxParticipants > 0;

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
                {/* Form Grid */}
                <div className="grid grid-cols-1 gap-6"> {/*was cols = 4 */}
                    {/* Event Name */}
                    <div>
                        <label className="text-sm text-white">Event Name</label>
                        <input
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>


                    {/*
                    <div>
                        <label className="text-sm text-white">Event Type</label>
                        <select className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            onChange={(e) => setEventType(e.target.value)}
                        >
                            <option>Networking Event</option>
                            <option>Career Fair</option>
                            <option>Workshop</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-white">Key Interests</label>
                        <select className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            onChange={(e) => setKeyInterest(e.target.value)}
                        >
                            <option>AI</option>
                            <option>Engineering</option>
                            <option>Business</option>
                            <option>Software</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-white">Institution</label>
                        <select className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            onChange={(e) => setInstitution(e.target.value)}
                        >
                            <option>University of Calgary</option>
                        </select>
                    </div>
                    */}

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="text-sm text-white">Description</label>
                        <textarea
                            className="w-full h-48 p-3 rounded bg-white border border-gray-700 text-black"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-sm text-white">Date</label>
                        <input
                            type="date"
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            value={startDate}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Max Participants */}
                    <div>
                        <label className="text-sm text-white">Max Participants</label>
                        <input
                            type="number"
                            placeholder="Max No."
                            className="w-full p-3 rounded bg-white border border-gray-700 text-black"
                            value={maxParticipants ?? ""}
                            onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Icebreakers */}
                
                <h2 className="text-xl font-semibold mt-12 mb-4">Icebreakers</h2>

                <div className="flex gap-6">
                    <div className="bg-gray-800 rounded-xl p-6 w-56 h-80 shadow-lg">
                        <h3 className="font-semibold mb-2">Name Bingo</h3>
                        <p className="text-sm text-white/70x">
                            The ultimate icebreaker game where your bingo card is filled with
                            the names of other players.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 w-56 shadow-lg">
                        <h3 className="font-semibold mb-2">Scavenger Hunt</h3>
                        <p className="text-sm text-white/70 ">
                            A fun interactive hunt to get attendees talking and moving.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-12">
                    <button
                        onClick={handleCreateEvent}
                        className="px-6 py-3 rounded-full bg-green-300 text-black font-semibold hover:opacity-90"
                        disabled={!isFormValid}
                    >
                        Create Event
                    </button>

                    <button className="px-6 py-3 rounded-full bg-red-300 text-black font-semibold hover:opacity-90">
                        Discard Event
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default CreateEventPage;
