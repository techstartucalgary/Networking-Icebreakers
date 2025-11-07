import { Request, Response } from "express";
import { Event } from "../models/event_model";
import "../models/participant_model"; 

import {generateEventId, generateJoinCode} from "../utils/event_utils";


export async function createEvent(req: Request, res: Response) {
  try {
    const { name, description, startDate, endDate, maxParticipant, currentState, createdBy } = req.body;

    if (!createdBy) {
      return res.status(400).json({ success: false, error: "createdBy email is required" });
    }

    const eventId = generateEventId();
    const joinCode = generateJoinCode();

    const event = new Event({
      eventId,
      name,
      description,
      joinCode,
      startDate,
      endDate,
      maxParticipant,
      participants: [],
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
      return res.status(400).json({ success: false, error: "joinCode is required" });
    }

    // Find event by joinCode and populate participants
    const event = await Event.findOne({ joinCode }).populate("participants");

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