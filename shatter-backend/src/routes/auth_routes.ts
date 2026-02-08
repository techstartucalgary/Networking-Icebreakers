import { Router } from 'express';
import { signup, login, linkedinAuth, linkedinCallback } from '../controllers/auth_controller';

const router = Router();

// POST /api/auth/signup - create new user account
router.post('/signup', signup);

// POST /api/auth/login - authenticate user
router.post('/login', login);

// LinkedIn OAuth routes
router.get('/linkedin', linkedinAuth);
router.get('/linkedin/callback', linkedinCallback);

export default router;
