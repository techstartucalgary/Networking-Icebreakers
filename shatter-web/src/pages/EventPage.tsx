import { useParams } from "react-router-dom";
import { useEventData } from "../hooks/useEventData";
import { useEventParticipants } from "../hooks/useEventParticipants";
import { useState, useEffect } from "react";
import QRCard from "../components/QRCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventSpotlight from "../components/EventSpotlight";
import { CalendarIcon, ClipboardCopyIcon } from "../components/icons";

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

  // loading event state
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

  // error state 
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

  // Format the date and time
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

  // Generate QR code payload (which is just the join code in this case)
  // TODO: In the future, we could encode a URL or more complex data here
  const qrPayload = joinCode || "";

  // Main render
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
                    : eventDetails.currentState === "Upcoming"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(156, 163, 175, 0.2)",
                color:
                  eventDetails.currentState === "ongoing"
                    ? "#4ade80"
                    : eventDetails.currentState === "Upcoming"
                    ? "#60a5fa"
                    : "#9ca3af",
              }}
            >
              {eventDetails.currentState.charAt(0).toUpperCase() +
                eventDetails.currentState.slice(1)}
            </span>
            
            {/* Join Code Display */}
            <span className="text-white/60 font-body text-sm">
              Join Code: <span className="font-mono font-semibold text-white">{joinCode}</span>
            </span>
          </div>
        </div>

        {/* Live Activity Spotlight */}
        <div className="mb-12">
          <EventSpotlight
            participants={participants}
            eventId={eventId}
            useDemoConnections={false}
            useDemoActivity={true}
          />
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
                    <CalendarIcon className="w-5 h-5 text-[#4DC4FF]" />
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
                    <CalendarIcon className="w-5 h-5 text-[#4DC4FF]" />
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

              {/* Participant List */}
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
              {qrPayload && <QRCard qrPayload={qrPayload} />}
              
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
                  <ClipboardCopyIcon className="w-4 h-4" />
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
