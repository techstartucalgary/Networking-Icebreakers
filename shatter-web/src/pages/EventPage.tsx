import { useParams } from "react-router-dom";
import { useEventData } from "../hooks/useEventData";
import { useEventParticipants } from "../hooks/useEventParticipants";
import { useState, useEffect } from "react";
import QRCard from "../components/QRCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function EventPage() {
  const { joinCode } = useParams<{ joinCode: string }>();

  const {
    eventId,
    eventDetails,
    participants: initialParticipants,
    loading,
    error,
  } = useEventData(joinCode);

  const { participants } = useEventParticipants(
    eventId,
    initialParticipants
  );

    // Bingo state
  const [bingoGame, setBingoGame] = useState<{
    _id: string;
    _eventId: string;
    description: string;
    grid: string[][];
  } | null>(null);

  // Fetch bingo game for this event
  useEffect(() => {
    if (!eventId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(
      `https://techstart-shatter-backend.vercel.app/api/bingo/getBingo/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bingo) {
          setBingoGame(data.bingo);
        }
      })
      .catch(() => {
        // Bingo is optional – fail silently
      });
  }, [eventId]);


  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
        }}
      >
        <div className="text-white text-xl font-body">Loading event...</div>
      </div>
    );
  }

  if (error || !eventId || !eventDetails) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
        }}
      >
        <div className="text-center">
          <h2 className="text-white text-2xl font-heading mb-4">Event not found</h2>
          <p className="text-white/70 font-body">{error || "Please check the join code and try again."}</p>
        </div>
      </div>
    );
  }

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Generate QR code payload (could be a deep link or web URL)
  const qrPayload = joinCode;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
      }}
    >
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        {/* Event Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-semibold text-white mb-4">
            {eventDetails.name}
          </h1>
          
          {/* Event Status Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-body font-semibold"
              style={{
                backgroundColor:
                  eventDetails.currentState === "ongoing"
                    ? "rgba(34, 197, 94, 0.2)"
                    : eventDetails.currentState === "upcoming"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(156, 163, 175, 0.2)",
                color:
                  eventDetails.currentState === "ongoing"
                    ? "#4ade80"
                    : eventDetails.currentState === "upcoming"
                    ? "#60a5fa"
                    : "#9ca3af",
              }}
            >
              {eventDetails.currentState.charAt(0).toUpperCase() +
                eventDetails.currentState.slice(1)}
            </span>
            
            <span className="text-white/60 font-body text-sm">
              Join Code: <span className="font-mono font-semibold text-white">{joinCode}</span>
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div
              className="backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
            >
              <h2 className="text-2xl font-heading font-semibold text-white mb-4">
                About This Event
              </h2>
              <p className="text-white/80 font-body leading-relaxed">
                {eventDetails.description}
              </p>
            </div>

            {/* Date & Time Card */}
            <div
              className="backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
            >
              <h2 className="text-2xl font-heading font-semibold text-white mb-4">
                Date & Time
              </h2>
              
              <div className="space-y-4">
                {/* Start Date */}
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg
                      className="w-5 h-5 text-[#4DC4FF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body text-white/60 text-sm">Start</p>
                    <p className="font-body text-white font-semibold">
                      {formatDate(eventDetails.startDate)}
                    </p>
                    <p className="font-body text-white/80 text-sm">
                      {formatTime(eventDetails.startDate)}
                    </p>
                  </div>
                </div>

                {/* End Date */}
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg
                      className="w-5 h-5 text-[#4DC4FF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body text-white/60 text-sm">End</p>
                    <p className="font-body text-white font-semibold">
                      {formatDate(eventDetails.endDate)}
                    </p>
                    <p className="font-body text-white/80 text-sm">
                      {formatTime(eventDetails.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Card */}
            <div
              className="backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading font-semibold text-white">
                  Participants
                </h2>
                <span className="text-white/60 font-body text-sm">
                  {participants.length} / {eventDetails.maxParticipant || "∞"}
                </span>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60 font-body">
                    No participants yet. Be the first to join!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.participantId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold text-sm"
                        style={{
                          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                          color: "#ffffff",
                        }}
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Name */}
                      <div className="flex-1">
                        <p className="font-body text-white font-medium">
                          {participant.name}
                        </p>
                        {participant.userId && (
                          <p className="font-body text-white/50 text-xs">
                            Registered User
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <QRCard qrPayload={qrPayload} />
              
              {/* Additional Info */}
              <div
                className="mt-6 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
                style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
              >
                <h3 className="font-heading font-semibold text-white mb-3">
                  Share This Event
                </h3>
                <p className="text-white/70 font-body text-sm mb-4">
                  Share the join code or QR code with others to invite them to this event.
                </p>
                
                {/* Copy Join Code Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(joinCode || "");
                    // You could add a toast notification here
                  }}
                  className="w-full px-4 py-2.5 rounded-full font-semibold text-white hover:opacity-90 transition-opacity shadow-lg font-body flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#4DC4FF" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Join Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bingo Game Section (Bottom of Page) */}
      {bingoGame && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div
            className="backdrop-blur-lg border border-white/20 rounded-2xl p-6"
            style={{ backgroundColor: "rgba(27, 37, 58, 0.5)" }}
          >
            <h2 className="text-2xl font-heading font-semibold text-white mb-4">
              Bingo Networking
            </h2>

            <p className="text-white/70 font-body text-sm mb-6">
              Bingo game associated with this event.
            </p>

            <div className="grid grid-cols-5 gap-3 max-w-md">
              {bingoGame.grid.flat().map((cell, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center
                             border border-white/20 rounded-lg
                             font-body font-semibold text-sm text-white"
                  style={{ backgroundColor: "rgba(27, 37, 58, 0.6)" }}
                >
                  {cell}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      <Footer />
    </div>
  );
}
