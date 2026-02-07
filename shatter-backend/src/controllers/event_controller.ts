import { Request, Response } from "express";
import { Event } from "../models/event_model";
import { pusher } from "../utils/pusher_websocket";

import "../models/participant_model";

import { generateJoinCode } from "../utils/event_utils";
import { Participant } from "../models/participant_model";
import { User } from "../models/user_model";
import { Types } from "mongoose";

/**
 * POST /api/events/createEvent
 * Create a new event
 *
 * @param req.body.name - Event name (required)
 * @param req.body.description - Event description
 * @param req.body.startDate - Event start date
 * @param req.body.endDate - Event end date
 * @param req.body.maxParticipant - Maximum number of participants
 * @param req.body.currentState - Current state of the event
 * @param req.user.userId - Authenticated user ID (from access token)
 *
 * @returns 201 with created event on success
 * @returns 400 if required fields are missing
 * @returns 404 if creator user is not found
 */
export async function createEvent(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      maxParticipant,
      currentState,
    } = req.body;

    const createdBy = req.user!.userId;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Event name is required" });
    }

    const user = await User.findById(createdBy).select("_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const joinCode = generateJoinCode();

    const event = new Event({
      name,
      description,
      joinCode,
      startDate,
      endDate,
      maxParticipant,
      participantIds: [],
      currentState,
      createdBy, // user id
    });

    const savedEvent = await event.save();

    res.status(201).json({ success: true, event: savedEvent });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/events/event/:joinCode
 * Get event details by join code
 *
 * @param req.params.joinCode - Unique join code of the event (required)
 *
 * @returns 200 with event details on success
 * @returns 400 if joinCode is missing
 * @returns 404 if event is not found
 */
export async function getEventByJoinCode(req: Request, res: Response) {
  try {
    const { joinCode } = req.params;

    if (!joinCode) {
      return res
        .status(400)
        .json({ success: false, error: "joinCode is required" });
    }

    const event = await Event.findOne({ joinCode }).populate(
      "participantIds",
      "name userId",
    );

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/events/:eventId/join/user
 * Join an event as a registered user
 *
 * @param req.params.eventId - Event ID to join (required)
 * @param req.body.userId - User ID joining the event (required)
 * @param req.body.name - Display name of the participant (required)
 *
 * @returns 200 with participant info on success
 * @returns 400 if required fields are missing or event is full
 * @returns 404 if user or event is not found
 * @returns 409 if user already joined the event
 */
export async function joinEventAsUser(req: Request, res: Response) {
  try {
    const { name, userId } = req.body;
    const { eventId } = req.params;

    if (!userId || !name || !eventId)
      return res.status(400).json({
        success: false,
        msg: "Missing fields: userId, name, and eventId are required",
      });

    const user = await User.findById(userId).select("_id");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ success: false, msg: "Event not found" });

    if (event.participantIds.length >= event.maxParticipant)
      return res.status(400).json({ success: false, msg: "Event is full" });

    let participant = await Participant.findOne({
      userId,
      eventId,
    });

    if (participant) {
      return res
        .status(409)
        .json({ success: false, msg: "User already joined" });
    }

    participant = await Participant.create({
      userId,
      name,
      eventId,
    });

    const participantId = participant._id as Types.ObjectId;

    const eventUpdate = await Event.updateOne(
      { _id: eventId },
      { $addToSet: { participantIds: participantId } },
    );

    if (eventUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Already joined this event" });
    }

    // Add event to user history
    await User.updateOne(
      { _id: userId },
      { $addToSet: { eventHistoryIds: eventId } },
    );

    console.log("Room socket:", eventId);
    console.log("Participant data:", { participantId, name });

    await pusher.trigger(
      `event-${eventId}`, // channel (room)
      "participant-joined", // event name
      {
        participantId,
        name,
      },
    );

    return res.json({
      success: true,
      participant,
    });
  } catch (e: any) {
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "This name is already taken in this event",
      });
    }
    console.error("JOIN EVENT ERROR:", e);
    return res.status(500).json({ success: false, msg: "Internal error" });
  }
}

/**
 * POST /api/events/:eventId/join/guest
 * Join an event as a guest (no registered user)
 *
 * @param req.params.eventId - Event ID to join (required)
 * @param req.body.name - Display name of the guest participant (required)
 *
 * @returns 200 with participant info on success
 * @returns 400 if required fields are missing or event is full
 * @returns 404 if event is not found
 */
export async function joinEventAsGuest(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const { eventId } = req.params;

    if (!name || !eventId) {
      return res.status(400).json({
        success: false,
        msg: "Missing fields: guest name and eventId are required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    if (event.participantIds.length >= event.maxParticipant) {
      return res.status(400).json({ success: false, msg: "Event is full" });
    }

    // Create guest participant (userId is null)
    const participant = await Participant.create({
      userId: null,
      name,
      eventId,
    });

    const participantId = participant._id as Types.ObjectId;

    // Add participant to event
    await Event.updateOne(
      { _id: eventId },
      { $addToSet: { participantIds: participantId } },
    );

    // Emit socket
    console.log("Room socket:", eventId);
    console.log("Participant data:", { participantId, name });

    await pusher.trigger(
      `event-${eventId}`, // channel (room)
      "participant-joined", // event name
      {
        participantId,
        name,
      },
    );

    return res.json({
      success: true,
      participant,
    });
  } catch (e: any) {
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "This name is already taken in this event",
      });
    }
    console.error("JOIN GUEST ERROR:", e);
    return res.status(500).json({ success: false, msg: "Internal error" });
  }
}

/**
 * GET /api/events/:eventId
 * Get event details by event ID
 *
 * @param req.params.eventId - Event ID (required)
 *
 * @returns 200 with event details on success
 * @returns 400 if eventId is missing
 * @returns 404 if event is not found
 */
export async function getEventById(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, error: "eventId is required" });
    }

    const event = await Event.findById(eventId).populate(
      "participantIds",
      "name userId",
    );

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/events/createdEvents/user/:userId
 * Get list of events created by a specific user
 *
 * @param req.params.userId - User ID (required)
 *
 * @returns 200 with list of events on success
 * @returns 400 if userId is missing
 * @returns 404 if no events are found for the user
 */
export async function getEventsByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const events = await Event.find({ createdBy: userId });

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No events found for this user",
      });
    }

    res.status(200).json({
      success: true,
      events,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}