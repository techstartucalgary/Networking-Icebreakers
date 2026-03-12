// src/ai/gemini.ts

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Prompt } from "./prompt_builder.ts";

console.log("Gemini module starting...");


// ----------------------
// File path setup
// ----------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptPath = path.join(__dirname, "prompts", "bingo.txt");

console.log("Resolved prompt path:", promptPath);
console.log("Prompt file exists:", fs.existsSync(promptPath));


// ----------------------
// Helpers
// ----------------------

function makeEmptyGrid(rows: number, cols: number) {

  console.log(`Creating fallback grid ${rows}x${cols}`);

  const grid: Record<string, string[]> = {};

  for (let r = 1; r <= rows; r++) {
    grid[`row${r}`] = Array(cols).fill("");
  }

  return grid;
}


function buildSchema(rows: number, cols: number) {

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


function buildShapeExample(rows: number, cols: number) {

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


// ----------------------
// Gemini Client
// ----------------------

console.log("Initializing Gemini client...");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing API key");
}

const ai = new GoogleGenAI({ apiKey });

console.log("Gemini client initialized.");


// ----------------------
// Generator
// ----------------------

export async function generateNameBingo(rows: number, cols: number) {

  console.log("generateNameBingo called");
  console.log("Grid size:", rows, "x", cols);

  const schema = buildSchema(rows, cols);
  const schemaJson = zodToJsonSchema(schema);

  const example = buildShapeExample(rows, cols);

  const basePrompt = `
Generate a ${rows}x${cols} bingo board.

Return JSON exactly matching this structure:

${example}

Rules:
- Keys must be row1, row2, row3, etc.
- Each row must contain ${cols} strings.
- Each string is a humorous bingo phrase about software development culture.

Return ONLY valid JSON.
`.trim();


  console.log("Loading instruction file...");

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Prompt file missing: ${promptPath}`);
  }

  const aiInstruction = fs.readFileSync(promptPath, "utf-8");

  const aiPrompt = new Prompt([
    basePrompt,
    aiInstruction,
  ]);

  console.log("Generating final prompt...");

  aiPrompt.generatePrompt();

  const prompt = aiPrompt.getPrompt();

  console.log("Final prompt length:", prompt.length);


  try {

    console.log("Sending request to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schemaJson,
        temperature: 0.7,
      },
    });

    console.log("Gemini response received");

    console.log("RAW RESPONSE:");
    console.log(response.text);


    console.log("Parsing JSON...");

    const parsed = JSON.parse(response.text);

    console.log("Validating schema...");

    const validated = schema.parse(parsed);

    console.log("Schema validation successful");

    return validated;

  } catch (error) {

    console.error("Generation failed:", error);

    return makeEmptyGrid(rows, cols);
  }
}


// ----------------------
// Run directly
// ----------------------

async function main() {

  console.log("Generating Bingo Grid...");

  const result = await generateNameBingo(3, 2);

  console.log("Result:");

  console.log(JSON.stringify(result, null, 2));
}


main().catch((err) => {

  console.error("Fatal error:", err);

  process.exitCode = 1;
});