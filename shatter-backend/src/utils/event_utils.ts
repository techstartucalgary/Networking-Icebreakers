import crypto from "crypto";

/**
 * Generates a random hash string for eventId
 * Example: 3f5a9c7d2e8b1a6f4c9d0e2b7a1c8f3d
 */
export function generateEventId(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Generates a random 8-digit number string for joinCode
 * Example: "48392017"
 */
export function generateJoinCode(): string {
  const code = Math.floor(10000000 + Math.random() * 90000000);
  return code.toString();
}
