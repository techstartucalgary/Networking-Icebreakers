// controllers/participant_connections_controller.ts

import { Request, Response } from "express";
import { Types } from "mongoose";

import { check_req_fields } from "../utils/requests_utils";
import { User } from "../models/user_model";
import { Participant } from "../models/participant_model";
import { ParticipantConnection } from "../models/participant_connection_model";

/**
 * POST /api/participantConnections
 * Create a new ParticipantConnection document.
 * The server generates the ParticipantConnection `_id` automatically (pre-save hook).
 *
 * @param req.body._eventId - MongoDB ObjectId of the event (required)
 * @param req.body.primaryParticipantId - MongoDB ObjectId of the primary participant (required)
 * @param req.body.secondaryParticipantId - MongoDB ObjectId of the secondary participant (required)
 * @param req.body.description - Optional description for the connection, can be the bingo question the participants connected with (optional)
 *
 * Behavior notes:
 * - Validates ObjectId format before hitting the DB
 * - Ensures BOTH participants exist AND belong to the given event
 * - Prevents duplicates with exact same (_eventId, primaryParticipantId, secondaryParticipantId)
 *
 * @returns 201 - Created ParticipantConnection document
 * @returns 400 - Missing required fields or invalid ObjectId format
 * @returns 404 - Primary participant or secondary participant not found for this event
 * @returns 409 - ParticipantConnection already exists for this event and participants
 * @returns 500 - Internal server error
 */
export async function createParticipantConnection(req: Request, res: Response) {
  try {
    const requiredFields = ["_eventId", "primaryParticipantId", "secondaryParticipantId"];
    if (!check_req_fields(req, requiredFields)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { _eventId, primaryParticipantId, secondaryParticipantId, description } = req.body;

    // Validate ObjectId format before hitting the DB
    const idsToValidate = { _eventId, primaryParticipantId, secondaryParticipantId };
    for (const [key, value] of Object.entries(idsToValidate)) {
      if (!Types.ObjectId.isValid(value)) {
        return res.status(400).json({ error: `Invalid ${key}` });
      }
    }

    // Ensure both participants exist AND belong to the event
    const [primaryParticipant, secondaryParticipant] = await Promise.all([
      Participant.findOne({ _id: primaryParticipantId, eventId: _eventId }).select("_id"),
      Participant.findOne({ _id: secondaryParticipantId, eventId: _eventId }).select("_id"),
    ]);

    if (!primaryParticipant) {
      return res.status(404).json({ error: "Primary participant not found for this event" });
    }
    if (!secondaryParticipant) {
      return res.status(404).json({ error: "Secondary participant not found for this event" });
    }

    // Prevent duplicates with exact same (_eventId, primaryParticipantId, secondaryParticipantId)
    const existing = await ParticipantConnection.findOne({
      _eventId,
      primaryParticipantId,
      secondaryParticipantId,
    });

    if (existing) {
      return res.status(409).json({
        error: "ParticipantConnection already exists for this event and participants",
        existingConnection: existing,
      });
    }

    const newConnection = await ParticipantConnection.create({
      _eventId,
      primaryParticipantId,
      secondaryParticipantId,
      description,
    });

    return res.status(201).json(newConnection);
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/participantConnections/by-emails
 * Create a new ParticipantConnection by providing USER emails.
 *
 * Looks up users by email, then finds their Participant records for the given event,
 * then saves the connection using the participants' MongoDB ObjectIds.
 * The server generates the ParticipantConnection `_id` automatically (pre-save hook).
 *
 * @param req.body._eventId - MongoDB ObjectId of the event (required)
 * @param req.body.primaryUserEmail - Email of the primary user (required)
 * @param req.body.secondaryUserEmail - Email of the secondary user (required)
 * @param req.body.description - Optional description for the connection (optional)
 *
 * Behavior notes:
 * - Validates _eventId ObjectId format
 * - Validates emails + prevents same email provided twice
 * - Maps email -> User -> Participant (for that event)
 * - Prevents duplicates with exact same (_eventId, primaryParticipantId, secondaryParticipantId)
 *
 * @returns 201 - Created ParticipantConnection document
 * @returns 400 - Missing required fields, invalid ObjectId, invalid emails, or same email provided twice
 * @returns 404 - Primary/secondary user not found OR participant not found for this event
 * @returns 409 - ParticipantConnection already exists for this event and participants
 * @returns 500 - Internal server error
 */
export async function createParticipantConnectionByEmails(req: Request, res: Response) {
  try {
    const requiredFields = ["_eventId", "primaryUserEmail", "secondaryUserEmail"];
    if (!check_req_fields(req, requiredFields)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { _eventId, primaryUserEmail, secondaryUserEmail, description } = req.body;

    if (!Types.ObjectId.isValid(_eventId)) {
      return res.status(400).json({ error: "Invalid _eventId" });
    }

    const primaryEmail = String(primaryUserEmail).trim().toLowerCase();
    const secondaryEmail = String(secondaryUserEmail).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(primaryEmail)) {
      return res.status(400).json({ error: "Invalid primaryUserEmail" });
    }
    if (!emailRegex.test(secondaryEmail)) {
      return res.status(400).json({ error: "Invalid secondaryUserEmail" });
    }

    if (primaryEmail === secondaryEmail) {
      return res.status(400).json({ error: "primaryUserEmail and secondaryUserEmail must be different" });
    }

    // Find users by email
    const [primaryUser, secondaryUser] = await Promise.all([
      User.findOne({ email: primaryEmail }).select("_id"),
      User.findOne({ email: secondaryEmail }).select("_id"),
    ]);

    if (!primaryUser) return res.status(404).json({ error: "Primary user not found" });
    if (!secondaryUser) return res.status(404).json({ error: "Secondary user not found" });

    // Map User -> Participant (for the event)
    const [primaryParticipant, secondaryParticipant] = await Promise.all([
      Participant.findOne({ eventId: _eventId, userId: primaryUser._id }).select("_id"),
      Participant.findOne({ eventId: _eventId, userId: secondaryUser._id }).select("_id"),
    ]);

    if (!primaryParticipant) {
      return res.status(404).json({ error: "Primary participant not found for this event (by user email)" });
    }
    if (!secondaryParticipant) {
      return res.status(404).json({ error: "Secondary participant not found for this event (by user email)" });
    }

    // Prevent duplicates with exact same (_eventId, primaryParticipantId, secondaryParticipantId)
    const existing = await ParticipantConnection.findOne({
      _eventId,
      primaryParticipantId: primaryParticipant._id,
      secondaryParticipantId: secondaryParticipant._id,
    });

    if (existing) {
      return res.status(409).json({
        error: "ParticipantConnection already exists for this event and participants",
        existingConnection: existing,
      });
    }

    const newConnection = await ParticipantConnection.create({
      _eventId,
      primaryParticipantId: primaryParticipant._id,
      secondaryParticipantId: secondaryParticipant._id,
      description,
    });

    return res.status(201).json(newConnection);
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/participantConnections/delete
 *
 * Deletes a participant connection only if it belongs to the given event.
 *
 * @param req.body.eventId - MongoDB ObjectId of the event (required)
 * @param req.body.connectionId - ParticipantConnection string _id (required)
 *
 * @returns 200 - Deleted connection
 * @returns 400 - Missing/invalid body params
 * @returns 404 - ParticipantConnection not found for this event
 * @returns 500 - Internal server error
 */
export async function deleteParticipantConnection(req: Request, res: Response) {
  try {
    const { eventId, connectionId } = req.body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    if (!connectionId || typeof connectionId !== "string") {
      return res.status(400).json({ error: "Invalid connectionId" });
    }

    const deleted = await ParticipantConnection.findOneAndDelete({
      _id: connectionId,
      _eventId: eventId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "ParticipantConnection not found for this event" });
    }

    return res.status(200).json({
      message: "ParticipantConnection deleted successfully",
      deletedConnection: deleted,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/participantConnections/getByParticipantAndEvent
 *
 * Returns all ParticipantConnections for an event where the given participant is either:
 * - primaryParticipantId OR
 * - secondaryParticipantId
 *
 * @param req.body.eventId - MongoDB ObjectId of the event (required)
 * @param req.body.participantId - MongoDB ObjectId of the participant (required)
 *
 * @returns 200 - Array of matching ParticipantConnections
 * @returns 400 - Missing/invalid body params
 * @returns 500 - Internal server error
 */
export async function getConnectionsByParticipantAndEvent(req: Request, res: Response) {
  try {
    const { eventId, participantId } = req.body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }
    if (!participantId || !Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ error: "Invalid participantId" });
    }

    const connections = await ParticipantConnection.find({
      _eventId: eventId,
      $or: [{ primaryParticipantId: participantId }, { secondaryParticipantId: participantId }],
    });

    return res.status(200).json(connections);
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/participantConnections/getByUserEmailAndEvent
 *
 * Returns all ParticipantConnections for an event where the given user's PARTICIPANT is either:
 * - primaryParticipantId OR
 * - secondaryParticipantId
 *
 * @param req.body.eventId - MongoDB ObjectId of the event (required)
 * @param req.body.userEmail - Email of the user (required)
 *
 * Behavior notes:
 * - Maps userEmail -> User -> Participant (for that event)
 * - Then returns ParticipantConnections where that participant appears
 *
 * @returns 200 - Array of matching ParticipantConnections
 * @returns 400 - Missing/invalid body params or invalid userEmail (no matching user)
 * @returns 404 - Participant not found for this event (even though user exists)
 * @returns 500 - Internal server error
 */
export async function getConnectionsByUserEmailAndEvent(req: Request, res: Response) {
  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    const email = String(userEmail).trim().toLowerCase();
    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return res.status(400).json({ error: "Invalid userEmail" });
    }

    const participant = await Participant.findOne({ eventId, userId: user._id }).select("_id");
    if (!participant) {
      return res.status(404).json({ error: "Participant not found for this event (by user email)" });
    }

    const connections = await ParticipantConnection.find({
      _eventId: eventId,
      $or: [{ primaryParticipantId: participant._id }, { secondaryParticipantId: participant._id }],
    });

    return res.status(200).json(connections);
  } catch (_error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}