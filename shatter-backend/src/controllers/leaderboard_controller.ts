import { Request, Response } from "express";
import { Types } from "mongoose";
import { Participant } from "../models/participant_model.js";
import { ParticipantConnection } from "../models/participant_connection_model.js";
import { emitLeaderboardUpdate } from "../utils/leaderboard_pusher.js";

/**
 * GET /api/events/:eventId/leaderboard
 *
 * Returns the bingo leaderboard for an event, sorted by completion status
 * and lines completed. Connections count is computed from ParticipantConnection
 * records (unique connected partners per participant).
 *
 * @returns 200 - Sorted leaderboard array
 * @returns 400 - Invalid eventId
 * @returns 500 - Internal server error
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;

    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    const eventObjectId = new Types.ObjectId(eventId);

    // Fetch participants and connections in parallel
    const [participants, connections] = await Promise.all([
      Participant.find({ eventId: eventObjectId })
        .select("name linesCompleted completed userId")
        .populate("userId", "name profilePhoto")
        .lean(),
      ParticipantConnection.find({ _eventId: eventObjectId })
        .select("primaryParticipantId secondaryParticipantId")
        .lean(),
    ]);

    // Build connections count: unique connected partners per participant
    const connectionsMap = new Map<string, Set<string>>();

    for (const conn of connections) {
      const primaryId = conn.primaryParticipantId.toString();
      const secondaryId = conn.secondaryParticipantId.toString();

      if (!connectionsMap.has(primaryId)) {
        connectionsMap.set(primaryId, new Set());
      }
      if (!connectionsMap.has(secondaryId)) {
        connectionsMap.set(secondaryId, new Set());
      }

      connectionsMap.get(primaryId)!.add(secondaryId);
      connectionsMap.get(secondaryId)!.add(primaryId);
    }

    // Build leaderboard entries
    const leaderboard = participants.map((p) => {
      const participantId = (p._id as Types.ObjectId).toString();
      const user = p.userId as { name?: string; profilePhoto?: string } | null;

      return {
        participantId,
        name: user?.name || p.name,
        profilePhoto: user?.profilePhoto || null,
        connectionsCount: connectionsMap.get(participantId)?.size || 0,
        linesCompleted: p.linesCompleted || 0,
        completed: p.completed || false,
      };
    });

    // Sort: completed first, then by linesCompleted desc, then connectionsCount desc
    leaderboard.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      if (a.linesCompleted !== b.linesCompleted)
        return b.linesCompleted - a.linesCompleted;
      return b.connectionsCount - a.connectionsCount;
    });

    return res.status(200).json(leaderboard);
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/events/:eventId/leaderboard/score
 *
 * Updates the authenticated user's bingo score for an event.
 * Triggers a Pusher event for live leaderboard updates.
 *
 * @param req.body.linesCompleted - Number of completed lines (optional)
 * @param req.body.completed - Whether the entire bingo sheet is filled (optional)
 *
 * @returns 200 - Updated score fields
 * @returns 400 - Invalid eventId or no valid fields provided
 * @returns 404 - Participant not found for this event
 * @returns 500 - Internal server error
 */
export async function updateScore(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const userId = req.user?.userId;

    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    const { linesCompleted, completed } = req.body as {
      linesCompleted?: number;
      completed?: boolean;
    };

    // Build update object with only provided fields
    const update: Record<string, number | boolean> = {};
    if (typeof linesCompleted === "number") update.linesCompleted = linesCompleted;
    if (typeof completed === "boolean") update.completed = completed;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        error: "At least one of linesCompleted or completed must be provided",
      });
    }

    const participant = await Participant.findOneAndUpdate(
      { userId, eventId },
      { $set: update },
      { new: true }
    ).select("name linesCompleted completed");

    if (!participant) {
      return res.status(404).json({
        error: "Participant not found for this event",
      });
    }

    const participantId = (participant._id as Types.ObjectId).toString();

    await emitLeaderboardUpdate(eventId, participant._id as Types.ObjectId);

    const connections = await ParticipantConnection.find({
      _eventId: new Types.ObjectId(eventId),
      $or: [
        { primaryParticipantId: participant._id },
        { secondaryParticipantId: participant._id },
      ],
    })
      .select("primaryParticipantId secondaryParticipantId")
      .lean();

    const uniquePartners = new Set<string>();
    for (const conn of connections) {
      const otherId =
        conn.primaryParticipantId.toString() === participantId
          ? conn.secondaryParticipantId.toString()
          : conn.primaryParticipantId.toString();
      uniquePartners.add(otherId);
    }

    return res.status(200).json({
      participantId,
      name: participant.name,
      linesCompleted: participant.linesCompleted,
      completed: participant.completed,
      connectionsCount: uniquePartners.size,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
