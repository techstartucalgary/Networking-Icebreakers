import { Router } from 'express';
import { signup } from '../controllers/auth_controller';

const router = Router();

// create new user account
router.post('/signup', signup);

export default router;
