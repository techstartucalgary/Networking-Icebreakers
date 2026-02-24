import { Router } from 'express';
import { createBingo, getBingo, updateBingo} from '../controllers/bingo_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = Router();

router.post('/createBingo', authMiddleware, createBingo);

// POST /api/bingo/getBingo - get bingo details
router.get('/getBingo/:eventId', getBingo);

// POST /api/bingo/updateBingo - update bingo details
router.put("/updateBingo", authMiddleware, updateBingo);


export default router;
