import { Router } from 'express';
import { signup, login, linkedinAuth, linkedinLink, linkedinCallback, exchangeAuthCode } from '../controllers/auth_controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = Router();

// POST /api/auth/signup - create new user account
router.post('/signup', signup);

// POST /api/auth/login - authenticate user
router.post('/login', login);

// LinkedIn OAuth routes
router.get('/linkedin', linkedinAuth);
router.get('/linkedin/link', authMiddleware, linkedinLink);
router.get('/linkedin/callback', linkedinCallback);

// Auth code exchange (OAuth callback -> JWT)
router.post('/exchange', exchangeAuthCode);

export default router;
