// routes/participant_connections_routes.js

import { Router } from "express";
import {
  createParticipantConnection,
  createParticipantConnectionByEmails,
  deleteParticipantConnection,
  getConnectedUsersInfo,
  getConnectionsByParticipantAndEvent,
  getConnectionsByUserEmailAndEvent,
} from "../controllers/participant_connections_controller.js";
import { authMiddleware } from "../middleware/auth_middleware.js";

const router = Router();

/**
 * Base path (mounted in app): /api/participantConnections
 *
 * Routes:
 * - POST   /api/participantConnections
 *     Create connection by participant ObjectIds
 *
 * - POST   /api/participantConnections/by-emails
 *     Create connection by user emails (controller maps email -> User -> Participant -> ObjectIds)
 *
 * - DELETE /api/participantConnections/delete
 *     Delete connection (eventId + connectionId in request body)
 *
 * - PUT    /api/participantConnections/getByParticipantAndEvent
 *     Get all connections for (eventId + participantId) where participant is primary or secondary
 *
 * - PUT    /api/participantConnections/getByUserEmailAndEvent
 *     Get all connections for (eventId + userEmail) where the user's participant is primary or secondary
 */






// Create connection by participant ObjectIds
// POST /api/participantConnections
router.post("/", createParticipantConnection);

// Create connection by user emails (controller converts to participant ObjectIds)
// POST /api/participantConnections/by-emails
router.post("/by-emails", authMiddleware, createParticipantConnectionByEmails);

// Delete connection (eventId + connectionId in request body)
// DELETE /api/participantConnections/delete
router.delete("/delete", authMiddleware, deleteParticipantConnection);

// Get all connections for (eventId + participantId) where participant is primary or secondary
// GET /api/participantConnections/getByParticipantAndEvent
router.get("/getByParticipantAndEvent", authMiddleware, getConnectionsByParticipantAndEvent);

// Get all connections for (eventId + userEmail) where user's participant is primary or secondary
// GET /api/participantConnections/getByUserEmailAndEvent
router.get("/getByUserEmailAndEvent", authMiddleware, getConnectionsByUserEmailAndEvent);

// Get all user's information that connected with the participant
// GET /api/participantConnections/connected-users
router.get("/connected-users", authMiddleware, getConnectedUsersInfo);

export default router;