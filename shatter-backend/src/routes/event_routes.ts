import { Router } from 'express';
import { createEvent, getEventByJoinCode, joinEventAsUser, joinEventAsGuest } from '../controllers/event_controller';

const router = Router();

// POST /api/events - create a new event
router.post('/createEvent', createEvent);
router.get("/event/:joinCode", getEventByJoinCode);
router.post("/:eventId/join/user", joinEventAsUser);              
router.post("/:eventId/join/guest", joinEventAsGuest); 



export default router;