import { Router } from 'express';
import { createEvent, getEventByJoinCode, getEventById, joinEventAsUser, joinEventAsGuest, getEventsByUserId } from '../controllers/event_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = Router();


router.post("/createEvent", authMiddleware, createEvent);
router.get("/event/:joinCode", getEventByJoinCode);
router.get("/:eventId", getEventById);
router.post("/:eventId/join/user", authMiddleware, joinEventAsUser);
router.post("/:eventId/join/guest", joinEventAsGuest);
router.get("/createdEvents/user/:userId", authMiddleware, getEventsByUserId);


export default router;