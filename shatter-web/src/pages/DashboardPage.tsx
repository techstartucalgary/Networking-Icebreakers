import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Event {
  _id: string;
  name: string;
  description: string;
  joinCode: string;
  startDate: string;
  endDate: string;
  currentState: string;
  maxParticipant?: number;
  participantIds?: any[];
  createdBy?: string;
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const payload = JSON.parse(atob(padded));

    return payload.userId || payload.id || payload.sub || null;
  } catch {
    return null;
  }
}

function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxParticipant: 0,
    currentState: "upcoming",
  });

  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);
  const [bingoGrid, setBingoGrid] = useState<string[][]>([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);
  const [bingoDescription, setBingoDescription] = useState("");
  const [isSavingBingo, setIsSavingBingo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetchUserEvents(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select first event when events are loaded
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  const fetchUserEvents = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/events/createdEvents/user/${userId}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Failed to fetch events (status ${response.status}). ${text ? text.slice(0, 120) : ""}`.trim()
        );
      }

      const data = await response.json();

      if (!data?.success) {
        throw new Error(data?.message || "Backend did not return success.");
      }

      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching events:", err);
      setError(err?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsEditing(false);
    setSelectedIcebreaker(null);
    
    // Load bingo data if it exists
    loadBingoData(event._id);
  };

  const loadBingoData = async (eventId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bingo/getBingo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: eventId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bingo) {
          setBingoGrid(data.bingo.grid || [
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
          ]);
          setBingoDescription(data.bingo.description || "");
        }
      } else {
        // No bingo exists yet, reset to empty
        setBingoGrid([
          ["", "", "", "", ""],
          ["", "", "", "", ""],
          ["", "", "", "", ""],
          ["", "", "", "", ""],
          ["", "", "", "", ""],
        ]);
        setBingoDescription("");
      }
    } catch (err) {
      console.error("Error loading bingo data:", err);
      // Reset to empty on error
      setBingoGrid([
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ]);
      setBingoDescription("");
    }
  };

  const handleEditClick = () => {
    if (!selectedEvent) return;
    
    setIsEditing(true);
    setEditForm({
      name: selectedEvent.name,
      description: selectedEvent.description,
      startDate: selectedEvent.startDate?.substring(0, 16) || "",
      endDate: selectedEvent.endDate?.substring(0, 16) || "",
      maxParticipant: selectedEvent.maxParticipant || 0,
      currentState: selectedEvent.currentState || "upcoming",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${selectedEvent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          startDate: new Date(editForm.startDate).toISOString(),
          endDate: new Date(editForm.endDate).toISOString(),
          maxParticipant: editForm.maxParticipant,
          currentState: editForm.currentState,
        }),
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Failed to update event (status ${response.status}). ${txt ? txt.slice(0, 120) : ""}`.trim());
      }

      await fetchUserEvents();
      setIsEditing(false);
      
      // Update selected event with new data
      const updatedEvent = events.find(e => e._id === selectedEvent._id);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }
    } catch (err: any) {
      console.error("Error updating event:", err);
      alert(err?.message || "Failed to update event. The backend may not support updates yet.");
    }
  };

  const handleBingoGridChange = (row: number, col: number, value: string) => {
    const newGrid = [...bingoGrid];
    newGrid[row][col] = value;
    setBingoGrid(newGrid);
  };

  const handleSaveBingo = async () => {
    if (!selectedEvent) return;

    try {
      setIsSavingBingo(true);
      const token = localStorage.getItem("token");

      // Check if all grid cells are filled
      const hasEmptyCells = bingoGrid.some(row => row.some(cell => !cell.trim()));
      if (hasEmptyCells) {
        alert("Please fill in all bingo grid cells before saving.");
        setIsSavingBingo(false);
        return;
      }

      // Try to update first, then create if update fails
      let response = await fetch(`${import.meta.env.VITE_API_URL}/bingo/updateBingo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          id: selectedEvent._id,
          description: bingoDescription,
          grid: bingoGrid,
        }),
      });

      // If update fails (404), try creating new bingo
      if (response.status === 404) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/bingo/createBingo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            _eventId: selectedEvent._id,
            description: bingoDescription,
            grid: bingoGrid,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save bingo game");
      }

      const data = await response.json();
      if (data.success) {
        alert("Bingo game saved successfully!");
        setSelectedIcebreaker(null);
      } else {
        throw new Error(data.message || "Failed to save bingo game");
      }
    } catch (err: any) {
      console.error("Error saving bingo:", err);
      alert(err?.message || "Failed to save bingo game");
    } finally {
      setIsSavingBingo(false);
    }
  };

  const handleCancelBingo = () => {
    setSelectedIcebreaker(null);
    // Reload bingo data to reset any unsaved changes
    if (selectedEvent) {
      loadBingoData(selectedEvent._id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case "ongoing":
        return { bg: "rgba(34, 197, 94, 0.2)", text: "#4ade80", border: "rgba(34, 197, 94, 0.3)" };
      case "upcoming":
        return { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
      case "completed":
        return { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af", border: "rgba(156, 163, 175, 0.3)" };
      default:
        return { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af", border: "rgba(156, 163, 175, 0.3)" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white" style={{ background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)" }}>
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-xl font-body">Loading your events...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)" }}>
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-white mb-2">My Events</h1>
          <p className="text-white/70 font-body">Manage your hosted events and track participants</p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg border"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        {/* No Events State */}
        {!loading && events.length === 0 && (
          <div className="backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center" style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}>
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-white mb-3">No Events Yet</h2>
            <p className="text-white/60 font-body mb-6">You haven't created any events. Start by creating your first event!</p>
            <button
              onClick={() => navigate("/create-event")}
              className="inline-block px-6 py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg hover:scale-105"
              style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
            >
              Create Your First Event
            </button>
          </div>
        )}

        {/* Dashboard Layout - Left Sidebar + Right Panel */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Events List */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div
                className="backdrop-blur-lg border border-white/20 rounded-2xl p-4 sticky top-28"
                style={{ backgroundColor: "rgba(27, 37, 58, 0.5)", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-heading font-semibold text-white">Your Events</h2>
                  <button
                    onClick={() => navigate("/create-event")}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Create new event"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {events.map((event) => {
                    const statusColors = getStatusColor(event.currentState);
                    const isSelected = selectedEvent?._id === event._id;
                    
                    return (
                      <button
                        key={event._id}
                        onClick={() => handleEventSelect(event)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          isSelected ? 'bg-white/10 border-2' : 'hover:bg-white/5 border-2 border-transparent'
                        }`}
                        style={isSelected ? { borderColor: '#4DC4FF' } : {}}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-heading font-semibold text-white text-sm line-clamp-1 flex-1">
                            {event.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-body font-semibold whitespace-nowrap"
                            style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                          >
                            {event.currentState}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60 font-body">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.startDate)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Event Details */}
            <div className="lg:col-span-8 xl:col-span-9">
              {selectedEvent && (
                <div
                  className="backdrop-blur-lg border border-white/20 rounded-2xl p-6"
                  style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
                >
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-heading font-semibold text-white mb-2">
                        {selectedEvent.name}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-body font-semibold"
                          style={{
                            backgroundColor: getStatusColor(selectedEvent.currentState).bg,
                            color: getStatusColor(selectedEvent.currentState).text,
                            border: `1px solid ${getStatusColor(selectedEvent.currentState).border}`
                          }}
                        >
                          {selectedEvent.currentState.charAt(0).toUpperCase() + selectedEvent.currentState.slice(1)}
                        </span>
                        <span className="text-sm text-white/50 font-mono font-body">
                          Code: {selectedEvent.joinCode}
                        </span>
                      </div>
                    </div>
                    
                    {!isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/events/${selectedEvent.joinCode}`)}
                          className="px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all duration-200"
                          style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
                        >
                          View Event
                        </button>
                        <button
                          onClick={handleEditClick}
                          className="px-4 py-2 rounded-lg font-body font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-200"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit Form */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white font-body mb-2">Event Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white font-body mb-2">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={4}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white font-body mb-2">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            value={editForm.startDate}
                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-white font-body mb-2">End Date & Time</label>
                          <input
                            type="datetime-local"
                            value={editForm.endDate}
                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-white font-body mb-2">Max Participants</label>
                        <input
                          type="number"
                          value={editForm.maxParticipant}
                          onChange={(e) => setEditForm({ ...editForm, maxParticipant: Number(e.target.value) })}
                          min="1"
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white font-body mb-2">Event Status</label>
                        <select
                          value={editForm.currentState}
                          onChange={(e) => setEditForm({ ...editForm, currentState: e.target.value })}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#4DC4FF] transition-colors font-body"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-6 py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg hover:scale-105"
                          style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-3 rounded-full font-semibold font-body bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Event Details View */
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-white mb-2">Description</h3>
                        <p className="text-white/80 font-body">{selectedEvent.description}</p>
                      </div>

                      {/* Event Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-body">Start Date</span>
                          </div>
                          <p className="text-white font-body font-semibold">{formatDate(selectedEvent.startDate)}</p>
                          <p className="text-white/70 text-sm font-body">{formatTime(selectedEvent.startDate)}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-body">End Date</span>
                          </div>
                          <p className="text-white font-body font-semibold">{formatDate(selectedEvent.endDate)}</p>
                          <p className="text-white/70 text-sm font-body">{formatTime(selectedEvent.endDate)}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-body">Participants</span>
                          </div>
                          <p className="text-white font-body font-semibold">
                            {selectedEvent.participantIds?.length || 0} / {selectedEvent.maxParticipant || "∞"}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span className="text-sm font-body">Join Code</span>
                          </div>
                          <p className="text-white font-mono font-semibold text-lg">{selectedEvent.joinCode}</p>
                        </div>
                      </div>

                      {/* Icebreaker Selection */}
                      <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-heading font-semibold text-white mb-4">Networking Icebreakers</h3>
                        <p className="text-white/60 text-sm font-body mb-4">Select and configure activities to help participants connect</p>
                        
                        {!selectedIcebreaker && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button 
                              onClick={() => setSelectedIcebreaker('bingo')}
                              className="p-4 rounded-xl border-2 border-white/20 hover:border-[#4DC4FF] bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-[#4DC4FF]/20 flex items-center justify-center group-hover:bg-[#4DC4FF]/30 transition-colors">
                                  <svg className="w-6 h-6 text-[#4DC4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <h4 className="font-heading font-semibold text-white">Name Bingo</h4>
                              </div>
                              <p className="text-sm text-white/70 font-body">Find people who match the descriptions on your bingo card</p>
                            </button>

                            <button className="p-4 rounded-xl border-2 border-white/20 hover:border-[#4DC4FF] bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group opacity-50 cursor-not-allowed">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                                <h4 className="font-heading font-semibold text-white/60">Scavenger Hunt</h4>
                              </div>
                              <p className="text-sm text-white/50 font-body">Coming soon - Hunt for specific items or complete challenges</p>
                            </button>

                            <button className="p-4 rounded-xl border-2 border-white/20 hover:border-[#4DC4FF] bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group opacity-50 cursor-not-allowed">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h4 className="font-heading font-semibold text-white/60">Speed Networking</h4>
                              </div>
                              <p className="text-sm text-white/50 font-body">Coming soon - Timed one-on-one conversations</p>
                            </button>
                          </div>
                        )}

                        {/* Bingo Editor */}
                        {selectedIcebreaker === 'bingo' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#4DC4FF]/20 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-[#4DC4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <h4 className="text-xl font-heading font-semibold text-white">Edit Name Bingo</h4>
                              </div>
                              <button
                                onClick={handleCancelBingo}
                                className="text-white/60 hover:text-white transition-colors"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

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

                            <div>
                              <label className="block text-sm text-white font-body mb-3">
                                Bingo Grid (5x5)
                                <span className="text-white/60 text-xs ml-2">Fill in each box with a question or trait</span>
                              </label>
                              
                              <div className="grid grid-cols-5 gap-2">
                                {bingoGrid.map((row, rowIndex) =>
                                  row.map((cell, colIndex) => (
                                    <div key={`${rowIndex}-${colIndex}`} className="relative group">
                                      <input
                                        type="text"
                                        value={cell}
                                        onChange={(e) => handleBingoGridChange(rowIndex, colIndex, e.target.value)}
                                        placeholder={`${rowIndex + 1}-${colIndex + 1}`}
                                        className="w-full h-24 p-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#4DC4FF] focus:ring-2 focus:ring-[#4DC4FF]/20 transition-all font-body resize-none"
                                        style={{ 
                                          fontSize: '0.75rem',
                                          lineHeight: '1.2',
                                        }}
                                      />
                                      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#4DC4FF]/80 text-white text-xs flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {rowIndex * 5 + colIndex + 1}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="bg-[#4DC4FF]/10 border border-[#4DC4FF]/30 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#4DC4FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-white/80 font-body">
                                  <p className="font-semibold mb-1">Tips for creating good bingo questions:</p>
                                  <ul className="space-y-1 text-white/70">
                                    <li>• Use "Find someone who..." format (e.g., "has traveled to 5+ countries")</li>
                                    <li>• Mix easy and challenging traits to keep it interesting</li>
                                    <li>• Include professional and personal topics</li>
                                    <li>• Keep questions short and clear</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={handleSaveBingo}
                                disabled={isSavingBingo}
                                className="flex-1 px-6 py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
                              >
                                {isSavingBingo ? "Saving..." : "Save Bingo Game"}
                              </button>
                              <button
                                onClick={handleCancelBingo}
                                disabled={isSavingBingo}
                                className="px-6 py-3 rounded-full font-semibold font-body bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-200 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
