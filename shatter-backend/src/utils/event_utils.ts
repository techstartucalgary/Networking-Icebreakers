import crypto from "crypto";

/**
 * Generates a random hash string for eventId
 * Example: 3f5a9c7d2e8b1a6f4c9d0e2b7a1c8f3d
 */
export function generateEventId(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Generates a random 4-digit number string for joinCode
 * Example: "4132"
 */
export function generateJoinCode(): string {
  const code = Math.floor(1000 + Math.random() * 9000); 
  return code.toString();
}
