// controllers/bingo_controller.js
import { Request, Response } from "express";
import { Types } from "mongoose";
import { Bingo } from "../models/bingo_model.js";
import { Event } from "../models/event_model.js";
import { Prompt } from "../ai/prompt_builder.js";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aiConstruction =
  "You will generate the bingo grid with shortened version of the questions while maintaining the same structure. Each entry should be turned into a max 3 word version of the question that describes what the question is about.";

const aiShortVersionInstruction = `Generate creative bingo entries based on the provided event context.

Goal
Create short bingo squares that describe recognizable moments, traits, or behaviors of professionals at the event.

Length
- 3–8 words per entry.
- Keep entries concise and punchy.

Key Rule: Be Specific
Entries must describe a concrete behavior, situation, or trait someone could realistically notice at the event.

Avoid vague descriptions of conversation.

Avoid phrases like:
- "talking about"
- "discusses"
- "mentions"
- "asks"
- "conversation about"
- "debates"
- "connects on"
- "networking with"

These are too generic and do not describe an observable bingo moment.

Instead prefer:

Observable behaviors  
Work-related habits  
Professional traits  
Real situations that happen during networking  
Work artifacts or tools someone references or shows  

Good structural patterns

Action
Shows photos of a recent project  
Sketches an idea on a napkin  
Explains how their team works  

Situation
Runs into a former coworker  
Recognizes someone from online  
Arrives straight from work  

Work artifact
Laptop covered in stickers  
Shows a product demo  
Pulls up slides on their phone  

Professional trait
Always “too busy lately”  
Recently started a new role  
Proud of their latest project  

Quote
Has said: "It's been a crazy week"
Has said: "We're hiring right now"

Context usage
Use the provided event context to inspire industry-relevant references when appropriate.

Examples
Shows photos of a recent project
Sketches an idea while talking
Proud of their latest work
Runs into someone they know
Recently changed jobs
Laptop covered in company stickers
Shows a demo on their phone
Explains a project they built
Has said: "It's been a long week"

Avoid
- Generic phrases describing conversation
- Things that always happen at networking events (ex: exchanging LinkedIn)
- Overly abstract statements
- Repeating the same structure across many entries

Diversity rule
Ensure entries vary in structure, wording, and situation.
No more than two entries may begin with the same first word.`;

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
      const isValidGrid =
        Array.isArray(grid) &&
        grid.every(
          (row: any) =>
            Array.isArray(row) &&
            row.every(
              (cell: any) =>
                cell &&
                typeof cell === "object" &&
                typeof cell.question === "string" &&
                typeof cell.shortQuestion === "string",
            ),
        );

      if (!isValidGrid) {
        return res.status(400).json({
          success: false,
          msg: "grid must be a 2D array of { question: string, shortQuestion: string }",
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
    const rawEventId = req.params.eventId;
    const eventId: string = Array.isArray(rawEventId)
      ? rawEventId[0]
      : rawEventId;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "eventId is required",
      });
    }

    let bingo = await Bingo.findOne({ _eventId: eventId });

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
      const isValidGrid =
        Array.isArray(grid) &&
        grid.every(
          (row: any) =>
            Array.isArray(row) &&
            row.every(
              (cell: any) =>
                cell &&
                typeof cell === "object" &&
                typeof cell.question === "string" &&
                typeof cell.shortQuestion === "string",
            ),
        );

      if (!isValidGrid) {
        return res.status(400).json({
          success: false,
          msg: "grid must be a 2D array of { question: string, shortQuestion: string }",
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

    let bingo = await Bingo.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );

    if (!bingo && Types.ObjectId.isValid(id)) {
      bingo = await Bingo.findOneAndUpdate(
        { _eventId: id },
        { $set: update },
        { new: true },
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
  const grid: Record<string, string[]> = {};

  for (let r = 1; r <= rows; r++) {
    grid[`row${r}`] = Array(cols).fill("");
  }

  return grid;
}

function buildSchema(
  rows: number,
  cols: number,
): z.ZodObject<Record<string, z.ZodArray<z.ZodString>>> {
  const shape: Record<string, z.ZodArray<z.ZodString>> = {};

  for (let r = 1; r <= rows; r++) {
    shape[`row${r}`] = z
      .array(
        z
          .string()
          .describe("A humorous bingo square phrase related to tech culture"),
      )
      .length(cols)
      .describe(`Row ${r} of the bingo board`);
  }

  return z.object(shape);
}

function buildShapeExample(rows: number, cols: number): string {
  const obj: Record<string, string[]> = {};

  for (let r = 1; r <= rows; r++) {
    obj[`row${r}`] = Array.from(
      { length: cols },
      (_, c) => `Row ${r} Col ${c + 1}`,
    );
  }

  return JSON.stringify(obj, null, 2);
}

/**
 * Calls Gemini to generate a bingo grid
 */
async function generateBingoGrid(
  n_rows: number,
  n_cols: number,
  event_description: string,
  tags: string[],
): Promise<Record<string, string[]>> {
  const schema = buildSchema(n_rows, n_cols);
  const schemaJson = z.toJSONSchema(schema);
  const example = buildShapeExample(n_rows, n_cols);

  const basePrompt_structure =
    `Generate a ${n_rows}x${n_cols} bingo board. Return JSON exactly matching this structure:
    ${example}

    Rules:
    - Keys must be row1, row2, row3, etc.
    - Each row must contain ${n_cols} strings.
    - Return ONLY valid JSON.
    - Each entry should be a full bingo question or bingo square phrase.
    - Every entry must fit the provided event description.
    - Use the tags as guidance for the types of professionals, roles, departments, or specializations attending the event.
    - Tags can be empty. If no tags are provided, rely only on the event description.
    - Avoid duplicate or near-duplicate entries.
    - Avoid generic networking items unless they are made specific to the event context.
  `.trim();

  const eventContext = `
Event description:
${event_description}

Tags / attendee professional types:
${tags.length > 0 ? tags.join(", ") : "No tags provided"}
`.trim();

  const aiPrompt = new Prompt([
    basePrompt_structure,
    eventContext,
    aiShortVersionInstruction,
  ]);

  aiPrompt.generatePrompt();
  const prompt = aiPrompt.getPrompt();

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

    if (!response.text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(response.text);
    const validated: Record<string, string[]> = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Generation failed:", error);
    return makeEmptyGrid(n_rows, n_cols);
  }
}

async function generateBingoGrid_shortVersions(
  n_rows: number,
  n_cols: number,
  original_bingo_questions: string,
): Promise<Record<string, string[]>> {
  const schema = buildSchema(n_rows, n_cols);
  const schemaJson = z.toJSONSchema(schema);
  const example = buildShapeExample(n_rows, n_cols);

  const basePrompt_structure =
    `Generate a ${n_rows}x${n_cols} bingo board. Return JSON exactly matching this structure:
    ${example}
    Rules:
    - Keys must be row1, row2, row3, etc.
    - Each row must contain ${n_cols} strings.
    Return ONLY valid JSON.

    You will be provided with additional information about what to put inside the bingo squares.
  `.trim();
  const original_bingo_questions_context = `These are the original bingo questions:\n${original_bingo_questions}`;

  // const promptPath = new URL("../ai/prompts/bingo.txt", import.meta.url);
  // const aiInstruction = fs.readFileSync(promptPath, "utf-8");

  const aiPrompt = new Prompt([
    basePrompt_structure,
    original_bingo_questions_context,
    aiConstruction,
  ]);
  aiPrompt.generatePrompt();
  const prompt = aiPrompt.getPrompt();

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

    if (!response.text) {
      throw new Error("Gemini returned empty response");
    }

    const parsed = JSON.parse(response.text);
    const validated: Record<string, string[]> = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Short version generation failed:", error);
    return makeEmptyGrid(n_rows, n_cols);
  }
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey });
//takes geminis dumbass output and turns it into a more usable format
function process_ai_result(ai_result: Record<string, string[]>) {
  const grid: string[][] = [];

  const keys: string[] = Object.keys(ai_result);
  for (let i = 0; i < keys.length; i++) {
    const val: string[] = ai_result[keys[i]];
    grid.push(val);
  }

  return grid;
}

function combine2DArrays(
  arr1: string[][],
  arr2: string[][],
): { question: string; shortQuestion: string }[][] {
  return arr1.map((row, i) =>
    row.map((val, j) => ({
      question: val,
      shortQuestion: arr2[i]?.[j] || val,
    })),
  );
}

/**
 * POST /api/bingo/generate
 *
 * Generate an AI bingo grid.
 *
 * @param req.body.event_description - General event context for bingo content (required)
 * @param req.body.tags - Types of professionals, roles, departments, or specializations attending the event (required, can be empty)
 * @param req.body.n_rows - Number of grid rows (1-5)
 * @param req.body.n_cols - Number of grid columns (1-5)
 *
 * @returns 200 with generated bingo grid
 * @returns 400 if validation fails
 */
export async function generateBingo(req: Request, res: Response) {
  try {
    const { event_description, tags, n_rows, n_cols } = req.body;

    if (
      !event_description ||
      typeof event_description !== "string" ||
      event_description.trim().length === 0
    ) {
      return res.status(400).json({
        status: false,
        msg: "event_description is required and must be a non-empty string",
      });
    }

    if (
      tags === undefined ||
      !Array.isArray(tags) ||
      !tags.every((tag: any) => typeof tag === "string")
    ) {
      return res.status(400).json({
        status: false,
        msg: "tags is required and must be an array of strings",
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

    const cleanedTags = tags.map((tag: string) => tag.trim()).filter(Boolean);

    const bingo_questions = await generateBingoGrid(
      n_rows,
      n_cols,
      event_description.trim(),
      cleanedTags,
    );

    const bingo_short_versions = await generateBingoGrid_shortVersions(
      n_rows,
      n_cols,
      JSON.stringify(bingo_questions),
    );

    const bingo_grid_questions: string[][] = process_ai_result(bingo_questions);

    const bingo_grid_short_versions: string[][] =
      process_ai_result(bingo_short_versions);

    const bingo_grid = combine2DArrays(
      bingo_grid_questions,
      bingo_grid_short_versions,
    );

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

function buildSingleBingoQuestionSchema() {
  return z.object({
    question: z
      .string()
      .min(1)
      .describe("The full generated bingo question"),
    shortQuestion: z
      .string()
      .min(1)
      .describe("A max 3 word short version of the question"),
  });
}

async function generateSingleBingoQuestionWithGemini({
  event_description,
  tags,
  bingo_grid,
  bingo_question_target,
}: {
  event_description: string;
  tags: string[];
  bingo_grid: string[][];
  bingo_question_target: string;
}): Promise<{ question: string; shortQuestion: string }> {
  const schema = buildSingleBingoQuestionSchema();
  const schemaJson = z.toJSONSchema(schema);

  const basePrompt = `
Generate one new bingo question for an event bingo game.

Return JSON exactly matching this structure:
{
  "question": "Full bingo question here",
  "shortQuestion": "Max 3 words"
}

Rules:
- Return ONLY valid JSON.
- Generate exactly one new question.
- The new question must fit the event context.
- The new question must be different from every existing question in the bingo grid.
- The target question is being regenerated, but the replacement does NOT need to be about the same topic.
- The replacement should be entirely new while still fitting the event.
- The shortQuestion must be max 3 words.
- The shortQuestion should describe what the full question is about.
- Avoid generic networking questions.
- Prefer observable, realistic, event-specific bingo moments.
`.trim();

  const eventContext = `
Event description:
${event_description}

Tags / attendee roles:
${tags.length > 0 ? tags.join(", ") : "No tags provided"}

Existing bingo grid questions:
${JSON.stringify(bingo_grid, null, 2)}

Target question to replace:
${bingo_question_target}
`.trim();

  const aiPrompt = new Prompt([
    basePrompt,
    eventContext,
    aiShortVersionInstruction,
  ]);

  aiPrompt.generatePrompt();
  const prompt = aiPrompt.getPrompt();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schemaJson,
      temperature: 0.8,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned empty response");
  }

  const parsed = JSON.parse(response.text);
  const validated = schema.parse(parsed);

  return validated;
}


/**
 * POST /api/bingo/generate/single
 *
 * Generate one AI bingo question.
 *
 * @param req.body.event_description - Context for bingo content (required) - string
 * @param req.body.tags - Tags for the type/roles of people attending the event - string[] can be empty
 * @param req.body.bingo_grid - Existing bingo grid of full questions - string[][]
 * @param req.body.bingo_question_target - Target question to regenerate - string
 *
 * @returns 200 with generated bingo question and short version
 * @returns 400 if validation fails
 */
export async function generateSingleBingoQuestion(req: Request, res: Response) {
  try {
    const {
      event_description,
      tags,
      bingo_grid,
      bingo_question_target,
    } = req.body;

    if (
      !event_description ||
      typeof event_description !== "string" ||
      event_description.trim().length === 0
    ) {
      return res.status(400).json({
        status: false,
        msg: "event_description is required and must be a non-empty string",
      });
    }

    if (
      tags === undefined ||
      !Array.isArray(tags) ||
      !tags.every((tag: any) => typeof tag === "string")
    ) {
      return res.status(400).json({
        status: false,
        msg: "tags is required and must be an array of strings",
      });
    }

    if (
      !Array.isArray(bingo_grid) ||
      bingo_grid.length === 0 ||
      !bingo_grid.every(
        (row: any) =>
          Array.isArray(row) &&
          row.every((cell: any) => typeof cell === "string"),
      )
    ) {
      return res.status(400).json({
        status: false,
        msg: "bingo_grid is required and must be a 2D array of strings",
      });
    }

    if (
      !bingo_question_target ||
      typeof bingo_question_target !== "string" ||
      bingo_question_target.trim().length === 0
    ) {
      return res.status(400).json({
        status: false,
        msg: "bingo_question_target is required and must be a non-empty string",
      });
    }

    const generatedQuestion = await generateSingleBingoQuestionWithGemini({
      event_description: event_description.trim(),
      tags,
      bingo_grid,
      bingo_question_target: bingo_question_target.trim(),
    });

    return res.status(200).json({
      status: true,
      question: generatedQuestion.question,
      shortQuestion: generatedQuestion.shortQuestion,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      error: err.message,
    });
  }
}
