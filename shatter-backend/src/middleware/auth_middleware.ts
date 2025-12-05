/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt_utils';

/**
 * Extend Express Request type to include user property
 * This allows us to attach user info to the request object
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 *
 * Usage:
 *   router.get('/protected', authMiddleware, controller);
 *
 * Request must include:
 *   Authorization: Bearer <token>
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
	// step 1: Get Authorization header
	const authHeader = req.headers.authorization;

	if (!authHeader) {
	    return res.status(401).json({
		error: 'Authorization header missing',
	    });
	}

	// Step 2: extract token from "Bearer <token>" format
	const parts = authHeader.split(' ');

	if (parts.length !== 2) {
	    return res.status(401).json({
		error: 'Invalid authorization format. Use: Bearer <token>',
	    });
	}

	if (parts[0] !== 'Bearer') {
	    return res.status(401).json({
		error: 'Invalid authorization format. Must start with "Bearer"',
	    });
	}

	const token = parts[1];

	if (!token) {
	    return res.status(401).json({
		error: 'Token is empty',
	    });
	}

	// Step 3: verify token using JWT utility
	const decoded = verifyToken(token)

	// Step 4: Attach user info to request object
	req.user = {
	    userId: decoded.userId,
	};

	// step 5: Continue to next Middleware/controller
	next();
    } catch (error: any) {
	// Handle specific JWT errors thrown by jwt_utils
	if(error?.message === 'Token expired') {
	    return res.status(401).json({
		error: 'Token expired. Please login again.',
	    });
	}

	if (error?.message === 'Invalid token') {
	    return res.status(401).json({
		error: 'Invalid token. Please login again.',
	    });
	}

	// Generic error
	console.error('Auth middleware error:', error);
	return res.status(401).json({
	    error: 'Authentication failed',
	});
    }
}; 
