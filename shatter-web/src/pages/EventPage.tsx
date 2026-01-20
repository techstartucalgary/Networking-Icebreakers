import { useParams } from "react-router-dom";
import { useEventData } from "../hooks/useEventData";
import { useEventParticipants } from "../hooks/useEventParticipants";

export default function EventPage() {
  const { joinCode } = useParams<{ joinCode: string }>();

  const {
    eventId,
    participants: initialParticipants,
    loading,
  } = useEventData(joinCode);

  const { participants } = useEventParticipants(
    eventId,
    initialParticipants
  );

  if (loading) return <div>Loading event...</div>;
  if (!eventId) return <div>Event not found</div>;

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
