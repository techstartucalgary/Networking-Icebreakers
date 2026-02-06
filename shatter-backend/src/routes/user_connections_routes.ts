// routes/user_connections_routes.ts
import { Router } from "express";
import {
  createUserConnection,
  createUserConnectionByEmails,
  deleteUserConnection,
  getConnectionsByUserAndEvent,
  getConnectionsByUserEmailAndEvent,
} from "../controllers/user_connections_controller";

const router = Router();

/**
 * Base path (mounted in app): /api/userConnections
*/

// Create connection by user ObjectIds
// POST /api/userConnections
router.post("/", createUserConnection);

// Create connection by user emails (controller converts to ObjectIds)
// POST /api/userConnections/by-emails
router.post("/by-emails", createUserConnectionByEmails);

// Delete connection (eventId + connectionId in request body)
// DELETE /api/userConnections/delete
router.delete("/delete", deleteUserConnection);

// Get all connections for (eventId + userId) where user is primary or secondary
// PUT /api/userConnections/getByUserAndEvent
router.put("/getByUserAndEvent", getConnectionsByUserAndEvent);

// Get all connections for (eventId + userEmail) where user is primary or secondary
// PUT /api/userConnections/getByUserEmailAndEvent
router.put("/getByUserEmailAndEvent", getConnectionsByUserEmailAndEvent);

export default router;