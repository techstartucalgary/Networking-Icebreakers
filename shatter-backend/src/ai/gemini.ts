import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";


const bingoSchema = z.object({
  grid: z.array(z.string()),
});

export type Bingo = z.infer<typeof bingoSchema>;

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



export async function generateNameBingo(
  n_rows: number,
  n_cols: number
): Promise<Bingo> {
  const totalCells = n_rows * n_cols;

  const prompt = `
Generate a Name Bingo game.

Requirements:
- Return ONLY valid JSON (no markdown, no commentary).
- The ONLY top-level field must be "grid".
- "grid" must be a 1D array of exactly ${totalCells} strings.
- Each element must be a RANDOM full name (first + last).
- All names should be unique.
- If you cannot generate valid JSON, return {"grid": ${JSON.stringify(
    makeEmptyGrid(totalCells)
  )}}.

Schema:
${JSON.stringify(zodToJsonSchema(bingoSchema), null, 2)}
`.trim();

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

    rawResponse =
      typeof response.text === "string"
        ? response.text
        : String(response.text);

    const jsonText = extractJsonObject(rawResponse);
    const parsed = JSON.parse(jsonText);
    const validated = bingoSchema.parse(parsed);

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
  const result = await generateNameBingo(3, 3);
  console.log("\n✅ Generated Bingo Grid:\n");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(() => {
  process.exitCode = 1;
});
