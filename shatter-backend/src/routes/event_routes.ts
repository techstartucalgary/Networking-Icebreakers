import { Router } from 'express';
import { createEvent, getEventByJoinCode, getEventById, joinEventAsUser, joinEventAsGuest, getEventsByUserId, updateEventStatus } from '../controllers/event_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = Router();


router.post("/createEvent", authMiddleware, createEvent);
router.get("/event/:joinCode", getEventByJoinCode);
router.put("/:eventId/status", authMiddleware, updateEventStatus);
router.get("/:eventId", getEventById);
router.post("/:eventId/join/user", authMiddleware, joinEventAsUser);
router.post("/:eventId/join/guest", joinEventAsGuest);
router.get("/createdEvents/user/:userId", authMiddleware, getEventsByUserId);


export default router;