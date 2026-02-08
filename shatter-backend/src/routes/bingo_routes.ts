import { Router } from 'express';
import { createBingo, getBingo, updateBingo} from '../controllers/bingo_controller';

const router = Router();

// POST /api/bingo/createEvent - create new event
router.post('/createBingo', createBingo);

// POST /api/bingo/getBingo - get bingo details
router.post('/getBingo', getBingo);

// POST /api/bingo/updateBingo - update bingo details
router.put("/updateBingo", updateBingo);


export default router;
