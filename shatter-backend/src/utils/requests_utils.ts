import { Request } from "express";

/**
 * Checks if all required fields are present in the request body.
 * @param req - Express request object
 * @param requiredFields - Array of required field names
 * @returns boolean indicating if all required fields are present
 */
export function check_req_fields(req: Request, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return false;
    }
  }
  return true;
}