// controllers/bingo_controller.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { Bingo } from "../models/bingo_model";
import { Event } from "../models/event_model";
import { Prompt } from "../ai/prompt_builder";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Console } from "node:console";

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
 * @param req.body.eventId - Bingo for a given eventId (string) (required)
 */
export async function getBingo(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "eventId is required",
      });
    }

    let bingo = await Bingo.findById(eventId);

    if (!bingo && Types.ObjectId.isValid(eventId)) {
      bingo = await Bingo.findOne({ _eventId: eventId });
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


/**
 * @param req.body.id - Bingo _id (string) OR Event _id (ObjectId string) (required)
 * @param req.body.description - New bingo description (string) (optional)
 * @param req.body.grid - New bingo grid (2D array of strings) (optional)
 */
export async function updateBingo(req: Request, res: Response) {
  try {
    const { id, description, grid } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, msg: "id is required" });
    }

    const update: Record<string, any> = {};

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res
          .status(400)
          .json({ success: false, msg: "description must be a string" });
      }
      update.description = description;
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

      update.grid = grid;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Nothing to update: provide description and/or grid",
      });
    }

    let bingo = await Bingo.findByIdAndUpdate(id, { $set: update }, { new: true });

    if (!bingo && Types.ObjectId.isValid(id)) {
      bingo = await Bingo.findOneAndUpdate(
        { _eventId: id },
        { $set: update },
        { new: true }
      );
    }

    if (!bingo) {
      return res.status(404).json({ success: false, msg: "Bingo not found" });
    }

    return res.status(200).json({ success: true, bingo });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}



function makeEmptyGrid(rows: number, cols: number): Record<string, string[]> {

  console.log(`Creating fallback grid ${rows}x${cols}`);

  const grid: Record<string, string[]> = {};

  for (let r = 1; r <= rows; r++) {
    grid[`row${r}`] = Array(cols).fill("");
  }

  return grid;
}

function buildSchema(rows: number, cols: number): Object {

  console.log("Building dynamic Zod schema...");

  const shape: Record<string, z.ZodTypeAny> = {};

  for (let r = 1; r <= rows; r++) {

    shape[`row${r}`] = z
      .array(
        z
          .string()
          .describe("A humorous bingo square phrase related to tech culture")
      )
      .length(cols)
      .describe(`Row ${r} of the bingo board`);
  }

  return z.object(shape);
}

function buildShapeExample(rows: number, cols: number): string {

  console.log("Building JSON example for prompt");

  const obj: Record<string, string[]> = {};

  for (let r = 1; r <= rows; r++) {
    obj[`row${r}`] = Array.from(
      { length: cols },
      (_, c) => `Row ${r} Col ${c + 1}`
    );
  }

  return JSON.stringify(obj, null, 2);
}

/**
 * Calls Gemini to generate a bingo grid
 */
async function generateBingoGrid(n_rows: number, n_cols: number, context: string): Promise<Record<string, string[]>> {
  

  const schema = buildSchema(n_rows, n_cols);
  const schemaJson = zodToJsonSchema(schema); 
  const example = buildShapeExample(n_rows, n_cols);

  const basePrompt_structure = `Generate a ${n_rows}x${n_cols} bingo board. Return JSON exactly matching this structure:
    ${example}
    Rules:
    - Keys must be row1, row2, row3, etc.
    - Each row must contain ${n_cols} strings.
    Return ONLY valid JSON.

    You will be provided with additional context to inspire the content of the bingo squares. Use that context to generate relevant bingo square phrases.
  `.trim();
  const userContext = `Additional context for bingo content:\n${context}`;

  const promptPath = "../ai/prompts/bingo.txt";
  if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file missing: ${promptPath}`);
  }
  const aiInstruction = fs.readFileSync(promptPath, "utf-8");

  const aiPrompt =  new Prompt([basePrompt_structure, userContext, aiInstruction])
  aiPrompt.generatePrompt();
  const prompt = aiPrompt.getPrompt();
  console.log("----------- Final Prompt -----------");
  console.log(prompt);
  console.log("------------------------------------");

  try {

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schemaJson,
      temperature: 0.7,
    },
  });

  console.log("RAW RESPONSE:");
  console.log(response.text);

  const parsed = JSON.parse(response.text);
  const validated: Record<string, string[]> = schema.parse(parsed);
  return validated;

  } catch (error) {
    console.error("Generation failed:", error);  
    return makeEmptyGrid(n_rows, n_cols)    
  }
}

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
//takes geminis dumbass output and turns it into a more usable format
function process_ai_result(ai_result: Record<string, string[]>) {
  const grid: string[][] = [];

  const keys: string[] = Object.keys(ai_result);
  for(let i = 0; i < keys.length; i++) {
    const val: string[] = ai_result[keys[i]];
    grid.push(val)
  }

  return grid;
}

/**
 * POST /api/bingo/generate
 *
 * Generate an AI bingo grid.
 *
 * @param req.body.context - Context for bingo content (required)
 * @param req.body.n_rows - Number of grid rows (1-5)
 * @param req.body.n_cols - Number of grid columns (1-5)
 *
 * @returns 200 with generated bingo grid
 * @returns 400 if validation fails
 */
export async function generateBingo(req: Request, res: Response) {
  try {
    const { context, n_rows, n_cols } = req.body;

    if (!context) {
      return res.status(400).json({
        status: false,
        msg: "context is required",
      });
    }

    if (
      typeof n_rows !== "number" ||
      typeof n_cols !== "number" ||
      n_rows <= 0 ||
      n_cols <= 0 ||
      n_rows > 5 ||
      n_cols > 5
    ) {
      return res.status(400).json({
        status: false,
        msg: "n_rows and n_cols must be numbers where 0 < value <= 5",
      });
    }

    const aiResult = await generateBingoGrid(n_rows, n_cols, context);
    const bingo_grid: string[][] = process_ai_result(aiResult);

    return res.status(200).json({
      status: true,
      bingo_grid,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      error: err.message,
    });
  }
}