import { Router } from 'express';
import { createEvent, getEventByJoinCode } from '../controllers/event_controller';

const router = Router();

// POST /api/events - create a new event
router.post('/createEvent', createEvent);
router.get("/event/:joinCode", getEventByJoinCode);


export default router;