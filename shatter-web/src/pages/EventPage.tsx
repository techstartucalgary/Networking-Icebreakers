import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { socket } from "../service/socket";

interface Participant {
  participantId: string;
  userId: string;
  name: string;
}

interface EventResponse {
  success: boolean;
  event: {
    _id: string;
    participantIds: Participant[];
  };
}

export default function EventPage() {
  const { joinCode } = useParams<{ joinCode: string }>();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadEventData() {
    console.log("📡 Loading event data for:", joinCode);
    const res = await fetch(
      `http://localhost:4000/api/events/event/${joinCode}`,
      {
        cache: "no-store",
      }
    );
    const data: EventResponse = await res.json();
    console.log("📦 Event data received:", data);

    if (data.success) {
      setParticipants(data.event.participantIds);
      setEventId(data.event._id); 
      console.log("Using eventId from API:", data.event._id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEventData();
  }, [joinCode]);

  useEffect(() => {
    if (!eventId) {
      console.log("Waiting for eventId from API...");
      return;
    }

    console.log("=== Setting up socket with eventId:", eventId, "===");

    const handleConnect = () => {
      console.log("🔌 Socket CONNECTED, ID:", socket.id);
      console.log("📤 Emitting join-event-room for:", eventId);
      socket.emit("join-event-room", eventId);
    };

    const handleRoomJoined = (data: any) => {
      console.log("✅ ROOM JOINED CONFIRMATION:", data);
    };

    const handleParticipantJoined = (p: Participant) => {
      console.log("🎉 PARTICIPANT JOINED EVENT RECEIVED");
      console.log("Type of p:", typeof p);
      console.log("Value of p:", p);
      console.log("JSON.stringify(p):", JSON.stringify(p));
      console.log("p.name:", p?.name);
      console.log("p.participantId:", p?.participantId);

      if (!p || !p.participantId || !p.name) {
        console.error("❌ Invalid participant data received:", p);
        return;
      }

      setParticipants((prev) => {
        if (
          prev.some(
            (participant) => participant.participantId === p.participantId
          )
        ) {
          console.log("Participant already exists");
          return prev;
        }
        console.log("Adding new participant:", p);
        return [...prev, p];
      });
    };

    // Register listeners
    socket.on("connect", handleConnect);
    socket.on("room-joined", handleRoomJoined);
    socket.on("participant-joined", handleParticipantJoined);

    // Log ALL events
    socket.onAny((eventName, ...args) => {
      console.log("📨 Socket event received:", eventName, args);
    });

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    } else {
      console.log("⚠️ Socket not connected, connecting...");
      socket.connect();
    }

    return () => {
      console.log("🧹 Cleanup: leaving room", eventId);
      socket.off("connect", handleConnect);
      socket.off("room-joined", handleRoomJoined);
      socket.off("participant-joined", handleParticipantJoined);
      socket.offAny();
      socket.emit("leave-event-room", eventId);
    };
  }, [eventId]); // Trigger when eventId from API is set

  if (loading) {
    return <div>Loading event...</div>;
  }

  if (!eventId) {
    return <div>Event not found</div>;
  }

  return (
    <div>
      <h2>Participants ({participants.length})</h2>
      <p>Code: {joinCode}</p>
      <ul>
        {participants.map((p) => (
          <li key={p.participantId}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
