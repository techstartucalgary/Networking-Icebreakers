import { Router, Request, Response } from 'express';
import { getUsers, createUser, getUserById, getUserEvents } from '../controllers/user_controller';
import { authMiddleware } from '../middleware/auth_middleware';
import { User } from '../models/user_model';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);

// Protected route example - returns current user's info
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
	const user = await User.findById(req.user?.userId).select('-passwordHash');
	if (!user) {
	    return res.status(404).json({ error: 'User not found' });
	}
	res.json(user);
    } catch (err) {
	console.error('GET /api/users/me error:', err);
	res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get all events a user has joined - must come before /:userId to avoid route conflict
router.get('/:userId/events', getUserEvents);

// Get user by ID
router.get('/:userId', getUserById);

export default router;
