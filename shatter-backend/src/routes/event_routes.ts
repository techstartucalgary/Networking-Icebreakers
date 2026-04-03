import { Router } from 'express';
import { createEvent, getEventByJoinCode, getEventById, joinEventAsUser, joinEventAsGuest, getEventsByUserId, updateEventStatus, leaveEvent, deleteEvent, updateEvent } from '../controllers/event_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = Router();


router.post("/createEvent", authMiddleware, createEvent);
router.get("/event/:joinCode", getEventByJoinCode);
router.put("/:eventId/status", authMiddleware, updateEventStatus);
router.get("/:eventId", getEventById);
router.post("/:eventId/join/user", authMiddleware, joinEventAsUser);
router.post("/:eventId/join/guest", joinEventAsGuest);
router.post("/:eventId/leave", authMiddleware, leaveEvent);
router.delete("/:eventId", authMiddleware, deleteEvent);
router.get("/createdEvents/user/:userId", authMiddleware, getEventsByUserId);
router.put("/:eventId", authMiddleware, updateEvent);

export default router;
