import { Router } from 'express';
import { createBingo, getBingo, updateBingo, generateBingo} from '../controllers/bingo_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = Router();

router.post('/createBingo', authMiddleware, createBingo);

// GET /api/bingo/getBingo - get bingo details
router.get('/getBingo/:eventId', getBingo);

// PUT /api/bingo/updateBingo - update bingo details
router.put("/updateBingo", authMiddleware, updateBingo);

// POST /api/bingo/generateBingo - generate bingo using AI for an event
router.put("/generateBingo", generateBingo);


export default router;
