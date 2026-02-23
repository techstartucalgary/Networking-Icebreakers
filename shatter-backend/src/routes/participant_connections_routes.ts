// routes/participant_connections_routes.ts

import { Router } from "express";
import {
  createParticipantConnection,
  createParticipantConnectionByEmails,
  deleteParticipantConnection,
  getConnectionsByParticipantAndEvent,
  getConnectionsByUserEmailAndEvent,
} from "../controllers/participant_connections_controller";

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
router.post("/by-emails", createParticipantConnectionByEmails);

// Delete connection (eventId + connectionId in request body)
// DELETE /api/participantConnections/delete
router.delete("/delete", deleteParticipantConnection);

// Get all connections for (eventId + participantId) where participant is primary or secondary
// PUT /api/participantConnections/getByParticipantAndEvent
router.put("/getByParticipantAndEvent", getConnectionsByParticipantAndEvent);

// Get all connections for (eventId + userEmail) where user's participant is primary or secondary
// PUT /api/participantConnections/getByUserEmailAndEvent
router.put("/getByUserEmailAndEvent", getConnectionsByUserEmailAndEvent);

export default router;