import { useCallback, useEffect, useState } from "react";
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
  createdBy?: string;
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

  const fetchEvent = useCallback((signal?: AbortSignal) => {
    if (!joinCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${import.meta.env.VITE_API_URL}/events/event/${joinCode}`, {
      cache: "no-store",
      signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Event not found");
        }
        return res.json();
      })
      .then((data: EventResponse) => {
        if (data.success && data.event) {
          const ev = data.event;
          setEventId(ev._id);
          setEventDetails(ev);
          setParticipants(ev.participantIds || []);
        } else {
          setEventId(null);
          setEventDetails(null);
          setError("Event not found");
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Error fetching event:", err);
        setEventId(null);
        setEventDetails(null);
        setError(err.message || "Failed to load event");
      })
      .finally(() => setLoading(false));
  }, [joinCode]);

  useEffect(() => {
    if (!joinCode) return;
    const controller = new AbortController();
    fetchEvent(controller.signal);
    return () => controller.abort();
  }, [joinCode, fetchEvent]);

  const refetch = () => fetchEvent();

  return { eventId, eventDetails, participants, loading, error, refetch };
}
