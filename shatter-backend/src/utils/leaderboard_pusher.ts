import { Types } from "mongoose";
import { Participant } from "../models/participant_model.js";
import { ParticipantConnection } from "../models/participant_connection_model.js";
import { pusher } from "./pusher_websocket.js";

/**
 * Recomputes a participant's connectionsCount and emits a `leaderboard-updated`
 * Pusher event on the `event-{eventId}` channel with the full payload shape
 * the leaderboard frontend expects.
 *
 * Pusher errors are logged but never thrown — a flaky Pusher call must not
 * fail the originating request.
 */
export async function emitLeaderboardUpdate(
  eventId: string | Types.ObjectId,
  participantId: string | Types.ObjectId,
): Promise<void> {
  try {
    const eventObjectId =
      typeof eventId === "string" ? new Types.ObjectId(eventId) : eventId;
    const participantIdStr = participantId.toString();

    const [participant, connections] = await Promise.all([
      Participant.findById(participantId)
        .select("name linesCompleted completed userId")
        .populate("userId", "name profilePhoto")
        .lean(),
      ParticipantConnection.find({
        _eventId: eventObjectId,
        $or: [
          { primaryParticipantId: participantId },
          { secondaryParticipantId: participantId },
        ],
      })
        .select("primaryParticipantId secondaryParticipantId")
        .lean(),
    ]);

    if (!participant) {
      console.error(
        `emitLeaderboardUpdate: participant ${participantIdStr} not found`,
      );
      return;
    }

    const uniquePartners = new Set<string>();
    for (const c of connections) {
      const otherId =
        c.primaryParticipantId.toString() === participantIdStr
          ? c.secondaryParticipantId.toString()
          : c.primaryParticipantId.toString();
      uniquePartners.add(otherId);
    }

    const user = participant.userId as
      | { name?: string; profilePhoto?: string }
      | null;

    await pusher.trigger(`event-${eventObjectId.toString()}`, "leaderboard-updated", {
      participantId: participantIdStr,
      name: user?.name || participant.name,
      profilePhoto: user?.profilePhoto || null,
      linesCompleted: participant.linesCompleted || 0,
      completed: participant.completed || false,
      connectionsCount: uniquePartners.size,
    });
  } catch (error) {
    console.error("emitLeaderboardUpdate failed:", error);
  }
}
