import { Request, Response } from "express";
import { Event } from "../models/event_model.js";
import { pusher } from "../utils/pusher_websocket.js";

import "../models/participant_model.js";

import { generateJoinCode } from "../utils/event_utils.js";
import { generateToken } from "../utils/jwt_utils.js";
import { Participant, IParticipant } from "../models/participant_model.js";
import { User } from "../models/user_model.js";
import { ParticipantConnection } from "../models/participant_connection_model.js";
import { Bingo } from "../models/bingo_model.js";
import { Types } from "mongoose";

/**
 * Create a participant with automatic name suffix on collision.
 * If the name already exists in the event, retries with a random #XXX suffix.
 */
async function createParticipantWithRetry(
  userId: Types.ObjectId | null,
  name: string,
  eventId: string,
  maxRetries: number = 5
): Promise<{ participant: IParticipant; finalName: string }> {
  let finalName = name;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const participant = await Participant.create({
        userId,
        name: finalName,
        eventId,
      });
      return { participant, finalName };
    } catch (e: any) {
      if (e.code === 11000 && e.keyPattern?.name && e.keyPattern?.eventId) {
        const suffix = String(Math.floor(Math.random() * 999) + 1).padStart(
          3,
          "0"
        );
        finalName = `${name}#${suffix}`;
        continue;
      }
      throw e;
    }
  }
  throw { code: 11000, keyPattern: { name: 1, eventId: 1 } };
}

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
      gameType,
      eventImg,
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
      gameType,
      eventImg,
      createdBy, // user id
    });

    const savedEvent = await event.save();

    res.status(201).json({ success: true, event: savedEvent });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }
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
    const eventId = req.params.eventId as string;

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

    const existingParticipant = await Participant.findOne({
      userId,
      eventId,
    });

    if (existingParticipant) {
      return res
        .status(409)
        .json({ success: false, msg: "User already joined" });
    }

    const { participant, finalName } = await createParticipantWithRetry(
      userId,
      name,
      eventId,
    );

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
    console.log("Participant data:", { participantId, name: finalName });

    await pusher.trigger(
      `event-${eventId}`, // channel (room)
      "participant-joined", // event name
      {
        participantId,
        name: finalName,
      },
    );

    return res.json({
      success: true,
      participant,
    });
  } catch (e: any) {
    if (e.code === 11000) {
      if (e.keyPattern?.email) {
        return res.status(409).json({
          success: false,
          msg: "A user with this email already exists",
        });
      }
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
    const { name, email, socialLinks, organization, title } = req.body as {
      name?: string;
      email?: string;
      socialLinks?: { linkedin?: string; github?: string; other?: { label: string; url: string }[] };
      organization?: string;
      title?: string;
    };
    const eventId = req.params.eventId as string;

    if (!name || !eventId) {
      return res.status(400).json({
        success: false,
        msg: "Missing fields: guest name and eventId are required",
      });
    }

    // Require at least one contact method or organization
    const hasEmail = email && email.trim();
    const hasSocialLink = socialLinks && (
      socialLinks.linkedin?.trim() ||
      socialLinks.github?.trim() ||
      socialLinks.other?.some((entry) => entry?.url?.trim())
    );
    const hasOrganization = organization && organization.trim();

    if (!hasEmail && !hasSocialLink && !hasOrganization) {
      return res.status(400).json({
        success: false,
        msg: "At least one contact method (email or social link) or organization is required",
      });
    }

    // Validate email format if provided
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (hasEmail && !EMAIL_REGEX.test(email.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email format",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    if (event.participantIds.length >= event.maxParticipant) {
      return res.status(400).json({ success: false, msg: "Event is full" });
    }

    // Create a guest user account so they get a JWT and can complete their profile later
    const user = await User.create({
      name,
      authProvider: 'guest',
      ...(hasEmail && { email: email.toLowerCase().trim() }),
      ...(hasSocialLink && { socialLinks }),
      ...(hasOrganization && { organization: organization.trim() }),
      ...(title && title.trim() && { title: title.trim() }),
    });

    const userId = user._id as Types.ObjectId;
    const token = generateToken(userId.toString());

    // Create participant linked to the new user, with automatic #XXX suffix on name collision
    const { participant, finalName } = await createParticipantWithRetry(
      userId,
      name,
      eventId,
    );

    // Update guest user's name to match the suffixed participant name
    if (finalName !== name) {
      await User.updateOne({ _id: userId }, { name: finalName });
    }

    const participantId = participant._id as Types.ObjectId;

    // Add participant to event and event to user history
    await Event.updateOne(
      { _id: eventId },
      { $addToSet: { participantIds: participantId } },
    );
    await User.updateOne(
      { _id: userId },
      { $addToSet: { eventHistoryIds: eventId } },
    );

    // Emit socket
    console.log("Room socket:", eventId);
    console.log("Participant data:", { participantId, name: finalName });

    await pusher.trigger(
      `event-${eventId}`, // channel (room)
      "participant-joined", // event name
      {
        participantId,
        name: finalName,
      },
    );

    return res.json({
      success: true,
      participant,
      userId,
      token,
    });
  } catch (e: any) {
    if (e.code === 11000) {
      if (e.keyPattern?.email) {
        return res.status(409).json({
          success: false,
          msg: "A user with this email already exists",
        });
      }
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
    const eventId = req.params.eventId as string;

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
/**
 * PUT /api/events/:eventId/status
 * Update event status (host only)
 *
 * @param req.params.eventId - Event ID (required)
 * @param req.body.status - New status: "In Progress" or "Completed" (required)
 * @param req.user.userId - Authenticated user ID (from access token)
 *
 * @returns 200 with updated event on success
 * @returns 400 if status is invalid or transition is not allowed
 * @returns 403 if user is not the event host
 * @returns 404 if event is not found
 */
export async function updateEventStatus(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const { status } = req.body;

    const validStatuses = ['In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // Only the host can change event status
    if (event.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: "Only the event host can update the event status",
      });
    }

    // Validate allowed transitions
    const allowedTransitions: Record<string, string> = {
      'Upcoming': 'In Progress',
      'In Progress': 'Completed',
    };

    if (allowedTransitions[event.currentState] !== status) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from "${event.currentState}" to "${status}"`,
      });
    }

    event.currentState = status;
    const updatedEvent = await event.save();

    // Emit Pusher events for real-time updates
    const pusherEvent = status === 'In Progress' ? 'event-started' : 'event-ended';
    await pusher.trigger(`event-${eventId}`, pusherEvent, {
      status,
    });

    return res.status(200).json({ success: true, event: updatedEvent });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

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

/**
 * POST /api/events/:eventId/leave
 * Leave an event as a participant
 *
 * @param req.params.eventId - Event ID to leave (required)
 * @param req.user.userId - Authenticated user ID (from access token)
 *
 * @returns 200 on success
 * @returns 400 if event is completed
 * @returns 403 if user is the host
 * @returns 404 if event not found or user is not a participant
 */
export async function leaveEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const userId = req.user!.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.currentState === "Completed") {
      return res.status(400).json({
        success: false,
        error: "Cannot leave a completed event",
      });
    }

    if (event.createdBy.toString() === userId) {
      return res.status(403).json({
        success: false,
        error: "Host cannot leave their own event. Use delete instead.",
      });
    }

    const participant = await Participant.findOne({ userId, eventId });
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: "You are not a participant in this event",
      });
    }

    const participantId = participant._id as Types.ObjectId;

    await Promise.all([
      Event.updateOne(
        { _id: eventId },
        { $pull: { participantIds: participantId } },
      ),
      Participant.deleteOne({ _id: participantId }),
      User.updateOne(
        { _id: userId },
        { $pull: { eventHistoryIds: eventId } },
      ),
      ParticipantConnection.deleteMany({
        _eventId: eventId,
        $or: [
          { primaryParticipantId: participantId },
          { secondaryParticipantId: participantId },
        ],
      }),
    ]);

    await pusher.trigger(`event-${eventId}`, "participant-left", {
      participantId,
      name: participant.name,
    });

    return res.status(200).json({
      success: true,
      msg: "Successfully left the event",
    });
  } catch (err: any) {
    console.error("LEAVE EVENT ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/events/:eventId
 * Delete/cancel an event (host only)
 *
 * @param req.params.eventId - Event ID to delete (required)
 * @param req.user.userId - Authenticated user ID (from access token)
 *
 * @returns 200 on success
 * @returns 400 if event is completed
 * @returns 403 if user is not the host
 * @returns 404 if event not found
 */
export async function deleteEvent(req: Request, res: Response) {
  try {
    const eventId = req.params.eventId as string;
    const userId = req.user!.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Only the event host can delete this event",
      });
    }

    if (event.currentState === "Completed") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete a completed event",
      });
    }

    // Get all participant userIds for history cleanup
    const participants = await Participant.find({ eventId }).select("userId").lean();
    const userIds = participants
      .map((p) => p.userId)
      .filter((id) => id != null);

    await Promise.all([
      Participant.deleteMany({ eventId }),
      Bingo.deleteMany({ _eventId: eventId }),
      ParticipantConnection.deleteMany({ _eventId: eventId }),
      User.updateMany(
        { _id: { $in: userIds } },
        { $pull: { eventHistoryIds: eventId } },
      ),
      Event.deleteOne({ _id: eventId }),
    ]);

    await pusher.trigger(`event-${eventId}`, "event-deleted", {
      eventId,
      message: "This event has been cancelled by the host",
    });

    return res.status(200).json({
      success: true,
      msg: "Event deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE EVENT ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}


/**
 * PUT /api/events/:eventId
 * Update an event's basic information (host only).
 * Does NOT allow changing currentState — use PUT /:eventId/status for that.
 *
 * @param req.params.eventId - Event ID to update (required)
 * @param req.user.userId - Authenticated user ID (from access token)
 *
 * @param req.body.name - Updated event name (optional)
 * @param req.body.description - Updated event description (optional)
 * @param req.body.startDate - Updated event start date (optional)
 * @param req.body.endDate - Updated event end date (optional)
 * @param req.body.maxParticipant - Updated maximum number of participants (optional)
 * @param req.body.gameType - Updated game type of the event (optional)
 * @param req.body.eventImg - Updated event image URL (optional)
 *
 * @returns 200 on success
 * @returns 400 if event is completed or validation fails
 * @returns 403 if user is not the host
 * @returns 404 if event not found
 */
type UpdateEventBody = {
  name?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  maxParticipant?: number;
  gameType?: "Name Bingo";
  eventImg?: string;
};

export async function updateEvent(req: Request<{ eventId: string }, {}, UpdateEventBody>, res: Response) {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Missing eventId",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: missing authenticated user",
      });
    }

    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid eventId",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Verify authenticated user is the creator/host
    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the event creator can update this event",
      });
    }

    if (event.currentState === "Completed") {
      return res.status(400).json({
        success: false,
        error: "Cannot update a completed event",
      });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      maxParticipant,
      gameType,
      eventImg,
    } = req.body;

    const updateData: Partial<{
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      maxParticipant: number;
      gameType: "Name Bingo";
      eventImg: string;
    }> = {};

    // Validate and set name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, error: "Name must be a non-empty string" });
      }
      updateData.name = name;
    }

    // Validate and set description
    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({ success: false, error: "Description must be a non-empty string" });
      }
      updateData.description = description;
    }

    // Validate and set startDate
    if (startDate !== undefined) {
      if (startDate === null || typeof startDate === "boolean") {
        return res.status(400).json({ success: false, error: "Invalid startDate" });
      }
      const parsed = new Date(startDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid startDate" });
      }
      updateData.startDate = parsed;
    }

    // Validate and set endDate
    if (endDate !== undefined) {
      if (endDate === null || typeof endDate === "boolean") {
        return res.status(400).json({ success: false, error: "Invalid endDate" });
      }
      const parsed = new Date(endDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid endDate" });
      }
      updateData.endDate = parsed;
    }

    // Validate and set maxParticipant
    if (maxParticipant !== undefined) {
      if (maxParticipant === null || !Number.isInteger(maxParticipant) || maxParticipant <= 0) {
        return res.status(400).json({ success: false, error: "maxParticipant must be a positive integer" });
      }
      if (maxParticipant < event.participantIds.length) {
        return res.status(400).json({
          success: false,
          error: `maxParticipant cannot be less than the current number of participants (${event.participantIds.length})`,
        });
      }
      updateData.maxParticipant = maxParticipant;
    }

    // Validate and set gameType
    if (gameType !== undefined) {
      const validGameTypes = ["Name Bingo"];
      if (typeof gameType !== "string" || !validGameTypes.includes(gameType)) {
        return res.status(400).json({ success: false, error: `Invalid gameType. Must be one of: ${validGameTypes.join(", ")}` });
      }
      updateData.gameType = gameType;
    }

    if (eventImg !== undefined) {
      if (typeof eventImg !== "string") {
        return res.status(400).json({ success: false, error: "eventImg must be a string" });
      }
      updateData.eventImg = eventImg;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided to update",
      });
    }

    // Validate date ordering (compare updated dates against existing ones)
    const finalStartDate = updateData.startDate ?? event.startDate;
    const finalEndDate = updateData.endDate ?? event.endDate;

    if (finalEndDate <= finalStartDate) {
      return res.status(400).json({
        success: false,
        error: "endDate must be after startDate",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err: any) {
    console.error("UPDATE EVENT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}
