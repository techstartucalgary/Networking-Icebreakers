// src/ai/chatgpt.ts

import OpenAI from "openai";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prompt } from "./prompt_builder.js";

console.log("===== OpenAI Bingo Generator Starting =====");

// ----------------------
// File path setup
// ----------------------

console.log("Resolving file paths...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Current file:", __filename);
console.log("Current directory:", __dirname);

const promptPath = path.join(__dirname, "prompts", "bingo.txt");

console.log("Prompt path:", promptPath);
console.log("Prompt exists:", fs.existsSync(promptPath));

// ----------------------
// Helpers
// ----------------------

function makeEmptyGrid(rows: number, cols: number): string[][] {
  console.log(`Creating fallback empty grid ${rows}x${cols}`);
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

function buildShapeExample(rows: number, cols: number): string {
  console.log("Building shape example...");

  const rowsText = Array.from({ length: rows }, (_, r) => {
    const colsText = Array.from(
      { length: cols },
      (_, c) => `"Row ${r + 1} Col ${c + 1}"`
    );
    return `    [${colsText.join(", ")}]`;
  });

  const example = `{
  "grid": [
${rowsText.join(",\n")}
  ]
}`;

  console.log("Shape example:");
  console.log(example);

  return example;
}

function buildJsonSchema(rows: number, cols: number) {
  console.log("Constructing JSON schema...");

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      grid: {
        type: "array",
        minItems: rows,
        maxItems: rows,
        items: {
          type: "array",
          minItems: cols,
          maxItems: cols,
          items: {
            type: "string"
          }
        }
      }
    },
    required: ["grid"]
  };

  console.log("JSON schema created:");
  console.log(JSON.stringify(schema, null, 2));

  return schema;
}

// ----------------------
// Types
// ----------------------

export type Bingo = {
  grid: string[][];
};

// ----------------------
// OpenAI Setup
// ----------------------

console.log("Initializing OpenAI client...");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log(
  "API key loaded:",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

// ----------------------
// Generator
// ----------------------

export async function generateNameBingo(
  rows: number,
  cols: number
): Promise<Bingo> {

  console.log("\n===== generateNameBingo START =====");

  console.log("Rows:", rows);
  console.log("Cols:", cols);

  if (rows <= 0 || cols <= 0) {
    console.log("Invalid grid size");
    return { grid: [[]] };
  }

  // ----------------------
  // Schema
  // ----------------------

  const jsonSchema = buildJsonSchema(rows, cols);

  // ----------------------
  // Prompt
  // ----------------------

  const shapeExample = buildShapeExample(rows, cols);

  const basePrompt = `
Generate a ${rows}x${cols} bingo grid.

Return JSON matching this exact structure:

${shapeExample}

Rules:
- Every cell should contain a short phrase
- Make entries playful and tech workplace related
`.trim();

  const preContext =
    "The following is the context of the event where this bingo game will be played:";

  const eventContext =
    "This is a team-building event for a software development company. Attendees include engineers, designers, and product managers.";

  console.log("Loading instruction file...");

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Prompt file missing: ${promptPath}`);
  }

  const aiInstruction = fs.readFileSync(promptPath, "utf-8");

  console.log("Instruction file loaded.");
  console.log("Instruction length:", aiInstruction.length);

  console.log("Building prompt...");

  const aiPrompt = new Prompt([
    basePrompt,
    preContext,
    eventContext,
    aiInstruction
  ]);

  aiPrompt.generatePrompt();
  const prompt = aiPrompt.getPrompt();

  console.log("\n===== FINAL PROMPT =====");
  console.log(prompt);
  console.log("========================\n");

  // ----------------------
  // OpenAI Request
  // ----------------------

  try {

    console.log("Sending request to OpenAI...");

    const response = await client.responses.create({
      model: "gpt-5.2",
      temperature: 0.7,
      input: prompt,

      text: {
        format: {
          type: "json_schema",
          name: "bingo_grid",
          schema: jsonSchema
        }
      }
    });

    console.log("Response received from OpenAI");

    console.log("Full raw response:");
    console.log(JSON.stringify(response, null, 2));

    const json =
      response.output?.[0]?.content?.[0]?.json;

    console.log("Extracted JSON:");
    console.log(JSON.stringify(json, null, 2));

    console.log("Returning generated grid");

    return json;

  } catch (error) {

    console.error("\n===== OPENAI GENERATION FAILED =====");
    console.error(error);

    console.log("Returning fallback grid");

    return { grid: makeEmptyGrid(rows, cols) };
  }
}

// ----------------------
// Run directly
// ----------------------

async function main() {

  console.log("\n===== MAIN START =====");

  const result = await generateNameBingo(4, 4);

  console.log("\n===== FINAL RESULT =====");

  console.log(JSON.stringify(result, null, 2));

  console.log("\n===== PROGRAM COMPLETE =====");
}

main().catch((err) => {
  console.error("Fatal error:");
  console.error(err);
  process.exitCode = 1;
});