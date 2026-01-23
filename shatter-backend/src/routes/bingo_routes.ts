import { Router } from 'express';
import { createBingo, getBingo} from '../controllers/bingo_controller';

const router = Router();

// POST /api/bingo/createEvent - create new event
router.post('/createBingo', createBingo);

// POST /api/bingo/getBingo - get bingo details
router.post('/getBingo', getBingo);

export default router;
