import { Request, Response } from "express";
import { Types } from "mongoose";

import { check_req_fields } from "../utils/requests_utils";
import { User } from "../models/user_model";
import { UserConnection } from "../models/user_connection_model";
import { Event } from "../models/event_model";



/**
 * POST /api/userConnections
 * Create a new UserConnection document.
 * The server generates the UserConnection `_id` automatically (pre-save hook).
 *
 * @param req.body._eventId - MongoDB ObjectId of the event (required)
 * @param req.body.primaryUserId - MongoDB ObjectId of the primary user (required)
 * @param req.body.secondaryUserId - MongoDB ObjectId of the secondary user (required)
 * @param req.body.description - Optional description for the connection, can be the bingo question the users connected with for example (optional)
 *
 * @returns 201 - Created UserConnection document
 * @returns 400 - Missing required fields or invalid ObjectId format
 * @returns 404 - Primary user or secondary user not found
 * @returns 500 - Internal server error
 */

export async function createUserConnection(req: Request, res: Response) {
  try {
    const requiredFields = ["_eventId", "primaryUserId", "secondaryUserId"];
    if (!check_req_fields(req, requiredFields)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { _eventId, primaryUserId, secondaryUserId, description } = req.body;

    // Validate ObjectId format before hitting the DB
    const idsToValidate = { _eventId, primaryUserId, secondaryUserId };
    for (const [key, value] of Object.entries(idsToValidate)) {
      if (!Types.ObjectId.isValid(value)) {
        return res.status(400).json({ error: `Invalid ${key}` });
      }
    }

    // Check that both users exist
    const [primaryExists, secondaryExists] = await Promise.all([
      User.exists({ _id: primaryUserId }),
      User.exists({ _id: secondaryUserId }),
    ]);

    if (!primaryExists) return res.status(404).json({ error: "Primary user not found" });
    if (!secondaryExists) return res.status(404).json({ error: "Secondary user not found" });

    // ✅ NEW: prevent duplicates with exact same (_eventId, primaryUserId, secondaryUserId)
    const existing = await UserConnection.findOne({
      _eventId,
      primaryUserId,
      secondaryUserId,
    });

    if (existing) {
      return res.status(409).json({
        error: "UserConnection already exists for this event and users",
        existingConnection: existing,
      });
    }

    const newConnection = await UserConnection.create({
      _eventId,
      primaryUserId,
      secondaryUserId,
      description,
    });

    return res.status(201).json(newConnection);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/userConnections/by-emails
 * Create a new UserConnection by providing user emails.
 * Looks up users by email, then saves the connection using their MongoDB ObjectIds.
 * The server generates the UserConnection `_id` automatically (pre-save hook).
 *
 * @param req.body._eventId - MongoDB ObjectId of the event (required)
 * @param req.body.primaryUserEmail - Email of the primary user (required)
 * @param req.body.secondaryUserEmail - Email of the secondary user (required)
 * @param req.body.description - Optional description for the connection (optional)
 *
 * @returns 201 - Created UserConnection document
 * @returns 400 - Missing required fields, invalid ObjectId, invalid emails, or same email provided twice
 * @returns 404 - Primary user or secondary user not found
 * @returns 500 - Internal server error
 */
export async function createUserConnectionByEmails(req: Request, res: Response) {
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
    if (!emailRegex.test(primaryEmail)) return res.status(400).json({ error: "Invalid primaryUserEmail" });
    if (!emailRegex.test(secondaryEmail)) return res.status(400).json({ error: "Invalid secondaryUserEmail" });

    if (primaryEmail === secondaryEmail) {
      return res.status(400).json({ error: "primaryUserEmail and secondaryUserEmail must be different" });
    }

    const [primaryUser, secondaryUser] = await Promise.all([
      User.findOne({ email: primaryEmail }).select("_id"),
      User.findOne({ email: secondaryEmail }).select("_id"),
    ]);

    if (!primaryUser) return res.status(404).json({ error: "Primary user not found" });
    if (!secondaryUser) return res.status(404).json({ error: "Secondary user not found" });

    // ✅ NEW: prevent duplicates with exact same (_eventId, primaryUserId, secondaryUserId)
    const existing = await UserConnection.findOne({
      _eventId,
      primaryUserId: primaryUser._id,
      secondaryUserId: secondaryUser._id,
    });

    if (existing) {
      return res.status(409).json({
        error: "UserConnection already exists for this event and users",
        existingConnection: existing,
      });
    }

    const newConnection = await UserConnection.create({
      _eventId,
      primaryUserId: primaryUser._id,
      secondaryUserId: secondaryUser._id,
      description,
    });

    return res.status(201).json(newConnection);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/userConnections/delete
 *
 * Deletes a user connection only if it belongs to the given event.
 *
 * @param req.body.eventId - MongoDB ObjectId of the event (required)
 * @param req.body.connectionId - UserConnection string _id (required)
 *
 * @returns 200 - Deleted connection
 * @returns 400 - Missing/invalid body params
 * @returns 404 - Connection not found for this event
 * @returns 500 - Internal server error
 */
export async function deleteUserConnection(req: Request, res: Response) {
  try {
    const { eventId, connectionId } = req.body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId hmmm" });
    }

    if (!connectionId || typeof connectionId !== "string") {
      return res.status(400).json({ error: "Invalid connectionId" });
    }

    const deleted = await UserConnection.findOneAndDelete({
      _id: connectionId,
      _eventId: eventId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "UserConnection not found for this event" });
    }

    return res.status(200).json({
      message: "UserConnection deleted successfully",
      deletedConnection: deleted,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/userConnections/getByUserAndEvent
 *
 * Returns all UserConnections for an event where the given user is either:
 * - primaryUserId OR
 * - secondaryUserId
 *
 * @param req.body.eventId - MongoDB ObjectId of the event (required)
 * @param req.body.userId - MongoDB ObjectId of the user (required)
 *
 * @returns 200 - Array of matching UserConnections
 * @returns 400 - Missing/invalid body params
 * @returns 500 - Internal server error
 */
export async function getConnectionsByUserAndEvent(req: Request, res: Response) {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const connections = await UserConnection.find({
      _eventId: eventId,
      $or: [{ primaryUserId: userId }, { secondaryUserId: userId }],
    });

    return res.status(200).json(connections);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}