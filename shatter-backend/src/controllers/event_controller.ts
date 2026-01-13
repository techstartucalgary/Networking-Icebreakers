import { Request, Response } from "express";
import { Event } from "../models/event_model";
import "../models/participant_model";

import { generateJoinCode } from "../utils/event_utils";
import { Participant } from "../models/participant_model";
import { User } from "../models/user_model";
import { Types } from "mongoose";

export async function createEvent(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      maxParticipant,
      currentState,
      createdBy,
    } = req.body;

    if (!createdBy) {
      return res
        .status(400)
        .json({ success: false, error: "createdBy email is required" });
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
      createdBy, // required email field
    });

    const savedEvent = await event.save();

    res.status(201).json({ success: true, event: savedEvent });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getEventByJoinCode(req: Request, res: Response) {
  try {
    const { joinCode } = req.params;

    if (!joinCode) {
      return res
        .status(400)
        .json({ success: false, error: "joinCode is required" });
    }

    // const event = await Event.findOne({ joinCode }).populate("participantIds");
    const event = await Event.findOne({ joinCode });

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

export async function joinEventAsUser(req: Request, res: Response) {
  try {
    const { name, userId } = req.body;
    const { eventId } = req.params;

    console.log("=== JOIN EVENT START ===");
    console.log("EventId:", eventId);
    console.log("UserId:", userId);
    console.log("Name:", name);
    console.log("req.io exists?", !!req.io);

    if (!userId || !name)
      return res.status(400).json({ success: false, msg: "Missing fields" });

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
      return res.status(409).json({ success: false, msg: "Already joined" });
    }

    participant = await Participant.create({
      userId,
      name,
      eventId,
    });

    const participantId = participant._id as Types.ObjectId;

    const eventUpdate = await Event.updateOne(
      { _id: eventId },
      { $addToSet: { participantIds: participantId } }
    );

    // If nothing changed → already joined
    if (eventUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Already joined this event" });
    }

    // 2. Add event to user history
    await User.updateOne(
      { _id: userId },
      { $addToSet: { eventHistoryIds: eventId } }
    );

    console.log("=== EMITTING SOCKET EVENT ===");
    console.log("Room (eventId):", eventId);
    console.log("Participant data:", { participantId, name });

    if (!req.io) {
      console.error("ERROR: req.io is undefined!");
    } else {
      const room = req.io.to(eventId);
      console.log("Room object:", room);

      room.emit("participant-joined", {
        participantId,
        name,
      });

      console.log("Socket event emitted successfully");
    }

    return res.json({
      success: true,
      participant,
    });
  } catch (e) {
    console.error("JOIN EVENT ERROR:", e);
    return res.status(500).json({ success: false, msg: "Internal error" });
  }
}

export async function joinEventAsGuest(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const { eventId } = req.params;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing guest name" });
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
      { $addToSet: { participantIds: participantId } }
    );

    // Emit socket
    console.log("=== EMITTING SOCKET EVENT ===");
    console.log("Room (eventId):", eventId);
    console.log("Participant data:", { participantId, name });

    if (!req.io) {
      console.error("ERROR: req.io is undefined!");
    } else {
      const room = req.io.to(eventId);
      console.log("Room object:", room);

      room.emit("participant-joined", {
        participantId,
        name,
      });

      console.log("Socket event emitted successfully");
    }

    return res.json({
      success: true,
      participant,
    });
  } catch (err) {
    console.error("JOIN GUEST ERROR:", err);
    return res.status(500).json({ success: false, msg: "Internal error" });
  }
}
