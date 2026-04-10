import { Router } from 'express';
import { createBingo, getBingo, updateBingo, generateBingo} from '../controllers/bingo_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = Router();

router.post('/createBingo', authMiddleware, createBingo);

// GET /api/bingo/getBingo - get bingo details
router.get('/getBingo/:eventId', getBingo);

// PUT /api/bingo/updateBingo - update bingo details
router.put("/updateBingo", authMiddleware, updateBingo);

// POST /api/bingo/generateBingo - generate bingo using AI for an event
router.post("/generateBingo", authMiddleware, generateBingo);


export default router;
