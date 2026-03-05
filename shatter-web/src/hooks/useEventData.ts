import { useEffect, useState } from "react";
import type { Participant } from "../types/participant";

interface EventDetails {
  _id: string;
  name: string;
  description: string;
  joinCode: string;
  startDate: string;
  endDate: string;
  maxParticipant: number;
  currentState: string;
  participantIds: Participant[];
}

interface EventResponse {
  success: boolean;
  event: EventDetails;
}

export function useEventData(joinCode: string | undefined) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!joinCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    fetch(`${import.meta.env.VITE_API_URL}/events/event/${joinCode}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Event not found");
        }
        return res.json();
      })
      .then((data: EventResponse) => {
        if (data.success && data.event) {
          setEventId(data.event._id);
          setEventDetails(data.event);
          setParticipants(data.event.participantIds);
        } else {
          setEventId(null);
          setEventDetails(null);
          setError("Event not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setEventId(null);
        setEventDetails(null);
        setError(err.message || "Failed to load event");
      })
      .finally(() => setLoading(false));
  }, [joinCode]);

  return { eventId, eventDetails, participants, loading, error };
}
