import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  createdBy?: string; // matches your backend payload
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    // JWT payload is base64url (not base64). Convert to base64 first.
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

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetchUserEvents(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Token exists but can’t be decoded / doesn’t contain user id
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL;

      // Your frontend expects a backend route that returns "my events".
      // This must be implemented server-side to query Event.find({ createdBy: userId })
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

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setEditForm({
      name: event.name,
      description: event.description,
      startDate: event.startDate?.substring(0, 16) || "",
      endDate: event.endDate?.substring(0, 16) || "",
      maxParticipant: event.maxParticipant || 0,
      currentState: event.currentState || "upcoming",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEvent(null);
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
      setSelectedEvent(null);
    } catch (err: any) {
      console.error("Error updating event:", err);
      alert(err?.message || "Failed to update event. The backend may not support updates yet.");
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
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-semibold text-white mb-4">My Events</h1>
          <p className="text-white/70 font-body text-lg">Manage your hosted events and track participants</p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg border"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center" style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}>
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold text-white mb-3">No Events Yet</h2>
            <p className="text-white/60 font-body mb-6">You haven't created any events. Start by creating your first event!</p>

            <Link
              to="/create-event"
              className="inline-block px-6 py-3 rounded-full font-semibold font-body transition-all duration-200 shadow-lg hover:scale-105"
              style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
            >
              Create Your First Event
            </Link>
          </div>
        )}

        {events.length > 0 && !isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const statusColors = getStatusColor(event.currentState);
              return (
                <div
                  key={event._id}
                  className="backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 group"
                  style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-body font-semibold"
                      style={{ backgroundColor: statusColors.bg, color: statusColors.text, border: `1px solid ${statusColors.border}` }}
                    >
                      {event.currentState.charAt(0).toUpperCase() + event.currentState.slice(1)}
                    </span>
                    <span className="text-xs text-white/50 font-mono font-body">{event.joinCode}</span>
                  </div>

                  <h3 className="text-xl font-heading font-semibold text-white mb-2 line-clamp-1">{event.name}</h3>
                  <p className="text-white/70 font-body text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/60 font-body">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.startDate)} at {formatTime(event.startDate)}
                    </div>

                    {event.participantIds && (
                      <div className="flex items-center gap-2 text-sm text-white/60 font-body">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {event.participantIds.length} / {event.maxParticipant || "∞"} Participants
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/events/${event.joinCode}`)}
                      className="flex-1 px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:opacity-90"
                      style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
                    >
                      View Event
                    </button>
                    <button
                      onClick={() => handleEditClick(event)}
                      className="px-4 py-2 rounded-lg font-body font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isEditing && selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="w-full max-w-2xl backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "rgba(27, 37, 58, 0.95)" }}
            >
              <h2 className="text-3xl font-heading font-semibold text-white mb-6">Edit Event</h2>

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
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
