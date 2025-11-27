import { Router } from 'express';
import { signup, login } from '../controllers/auth_controller';

const router = Router();

// POST /api/auth/signup - create new user account
router.post('/signup', signup);

// POST /api/auth/login - authenticate user
router.post('/login', login);

export default router;
