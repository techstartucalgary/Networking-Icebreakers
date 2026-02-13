// src/ai/gemini.ts
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

// ----------------------
// Schema (1D array of names)
// ----------------------
const bingoSchema = z.object({
  grid: z.array(z.string()),
});

export type Bingo = z.infer<typeof bingoSchema>;

// ----------------------
// AI Setup
// ----------------------
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// ----------------------
// Helpers
// ----------------------
function makeEmptyGrid(size: number): string[] {
  return Array.from({ length: size }, () => "");
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}

function readPromptTemplate(): string {
  // Resolves relative to this file’s location reliably
  const filePath = path.resolve(process.cwd(), "src", "ai", "prompts", "bingo.txt");
  return fs.readFileSync(filePath, "utf8");
}

function buildPromptFromTemplate(template: string, totalCells: number): string {
  const schemaJson = JSON.stringify(zodToJsonSchema(bingoSchema), null, 2);
  const emptyGridJson = JSON.stringify(makeEmptyGrid(totalCells));

  // Supported placeholders in bingo.txt:
  // {{TOTAL_CELLS}}  -> total number of names to generate
  // {{SCHEMA}}       -> JSON schema
  // {{EMPTY_GRID}}   -> JSON array fallback for grid
  return template
    .replace(/{{TOTAL_CELLS}}/g, String(totalCells))
    .replace(/{{SCHEMA}}/g, schemaJson)
    .replace(/{{EMPTY_GRID}}/g, emptyGridJson)
    .trim();
}

// ----------------------
// Generator
// ----------------------
export async function generateNameBingo(n_rows: number, n_cols: number): Promise<Bingo> {
  const totalCells = n_rows * n_cols;

  const template = readPromptTemplate();
  const prompt = buildPromptFromTemplate(template, totalCells);

  let rawResponse: string | undefined;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(bingoSchema),
        temperature: 0.7,
      },
    });

    rawResponse = typeof response.text === "string" ? response.text : String(response.text);

    const jsonText = extractJsonObject(rawResponse);
    const parsed = JSON.parse(jsonText);
    const validated = bingoSchema.parse(parsed);

    // Enforce exact length; fallback if wrong
    if (validated.grid.length !== totalCells) {
      return { grid: makeEmptyGrid(totalCells) };
    }

    return validated;
  } catch (error) {
    console.error("\n❌ Generation Failed\n");

    if (rawResponse) {
      console.error("---- Raw Gemini Response ----");
      console.error(rawResponse);
      console.error("-----------------------------\n");
    } else {
      console.error("No response text was received from Gemini.\n");
    }

    console.error("Error:", error);

    return { grid: makeEmptyGrid(totalCells) };
  }
}

// ----------------------
// Run directly
// ----------------------
async function main() {
  const result = await generateNameBingo(4, 4);
  console.log("\n✅ Generated Bingo Grid:\n");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(() => {
  process.exitCode = 1;
});
