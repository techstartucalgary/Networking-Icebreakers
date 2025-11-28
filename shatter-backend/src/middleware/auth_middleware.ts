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
) => 
