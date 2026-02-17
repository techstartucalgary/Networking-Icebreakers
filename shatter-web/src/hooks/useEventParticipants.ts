import { useEffect, useState } from "react";
import { pusher } from "../libs/pusher_websocket";
import type { Participant } from "../types/participant";

export function useEventParticipants(
  eventId: string | null,
  initialParticipants: Participant[],
) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (initialParticipants.length > 0) {
      setParticipants(initialParticipants);
    }
  }, [initialParticipants]);

  useEffect(() => {
    if (!eventId) return;

    const channelName = `event-${eventId}`;
    const channel = pusher.subscribe(channelName);

    const handleParticipantJoined = (p: Participant) => {
      setParticipants((prev) => {
        if (prev.some((x) => x.participantId === p.participantId)) {
          return prev;
        }
        return [...prev, p];
      });
    };

    channel.bind("participant-joined", handleParticipantJoined);

    return () => {
      channel.unbind("participant-joined", handleParticipantJoined);
      pusher.unsubscribe(channelName);
    };
  }, [eventId]);

  return { participants };
}
