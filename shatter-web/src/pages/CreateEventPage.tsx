import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CreateEvent } from "../service/CreateEvent";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    const handleCreateEvent = async () => { //To be used when "Create Event" button is pressed
        const joinCode = await CreateEvent({
            name,
            description,
            startDate,
            endDate,
            maxParticipants: maxParticipants ?? 0, //If it is still undefined, default the value to zero.
        });

        console.log("Event created. Join code: ", joinCode);
        // Navigate to the EventPage page
        navigate(`/events/${joinCode}`)
    };

    return (
        <div
            className="min-h-screen relative text-white"
            style={{
                background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
            }}
        >
            <Navbar />

            <main className="max-w-xl mx-auto pt-28 pb-16 px-6">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Create New Event
                </h1>

                <div className="space-y-4">
                    <input
                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:bg-blue-900"
                        placeholder="Event Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <textarea
                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:bg-blue-900"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <input
                        type="datetime-local"
                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white cursor-pointer focus:bg-blue-900"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <input
                        type="datetime-local"
                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white cursor-pointer focus:bg-blue-900"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <input
                        type="number"
                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:bg-blue-900"
                        placeholder="Max Participants"
                        value={maxParticipants || ""}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    />

                    <button
                        onClick={handleCreateEvent}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded font-semibold"
                    >
                        Create Event
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CreateEventPage;