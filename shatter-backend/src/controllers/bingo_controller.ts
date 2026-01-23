// controllers/bingo_controller.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { Bingo } from "../models/bingo_model";
import { Event } from "../models/event_model";

/**
 * POST /api/bingo
 * Create a new bingo game (server generates bingo _id)
 *
 * @param req.body._eventId - Event ObjectId (required)
 * @param req.body.description - Bingo description (optional)
 * @param req.body.grid - 2D array of strings (optional)
 *
 * @returns 201 with created bingo on success
 * @returns 400 if required fields are missing / invalid
 * @returns 404 if referenced event is not found
 */
export async function createBingo(req: Request, res: Response) {
  try {
    const { _eventId, description, grid } = req.body;

    if (!_eventId) {
      return res.status(400).json({
        success: false,
        msg: "_eventId is required",
      });
    }

    if (!Types.ObjectId.isValid(_eventId)) {
      return res.status(400).json({
        success: false,
        msg: "_eventId must be a valid ObjectId",
      });
    }

    if (grid !== undefined) {
      const is2DStringArray =
        Array.isArray(grid) &&
        grid.every(
          (row: any) =>
            Array.isArray(row) &&
            row.every((cell: any) => typeof cell === "string")
        );

      if (!is2DStringArray) {
        return res.status(400).json({
          success: false,
          msg: "grid must be a 2D array of strings",
        });
      }
    }

    const eventExists = await Event.findById(_eventId).select("_id");
    if (!eventExists) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    const bingo = await Bingo.create({
      _eventId,
      description,
      grid,
    });

    return res.status(201).json({
      success: true,
      bingoId: bingo._id,
      bingo,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


/**
 * @param req.body.id - Bingo _id (string) OR Event _id (ObjectId string) (required)
 */
export async function getBingo(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "id is required",
      });
    }

    let bingo = await Bingo.findById(id);

    if (!bingo && Types.ObjectId.isValid(id)) {
      bingo = await Bingo.findOne({ _eventId: id });
    }

    if (!bingo) {
      return res.status(404).json({
        success: false,
        msg: "Bingo not found",
      });
    }

    return res.status(200).json({
      success: true,
      bingo,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
