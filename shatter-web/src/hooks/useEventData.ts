import { useEffect, useState } from "react";
import type { Participant } from "../types/participant";

interface EventResponse {
  success: boolean;
  event: {
    _id: string;
    participantIds: Participant[];
  };
}

export function useEventData(joinCode: string | undefined) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!joinCode) return;

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/events/event/${joinCode}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: EventResponse) => {
        if (data.success) {
          setEventId(data.event._id);
          setParticipants(data.event.participantIds);
        } else {
          setEventId(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [joinCode]);

  return { eventId, participants, loading };
}
