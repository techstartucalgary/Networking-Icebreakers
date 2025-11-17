import { Request, Response } from 'express';
import { User } from '../models/user_model';
import { hashPassword } from '../utils/password_hash';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/auth/signup
 * Create new user account
 * 
 * @param req.body.name - User's display name
 * @param req.body.email - User's email
 * @param req.body.password - User's plain text password
 * @returns 201 with userId on success
 */
export const signup = async (req: Request, res: Response) => {
    try {
	// extract data from req body
	const { name, email, password } = req.body as {
	    name?: string;
	    email?: string;
	    password?: string;
	};

	// validate required fields
	if (!name || !email || !password) {
	    return res.status(400).json({
		error: 'name, email and password are required'
	    });
	}

	// normalize email before validation
	const normalizedEmail = email.toLowerCase().trim();

	// validate email format
	if (!EMAIL_REGEX.test(normalizedEmail)) {
	    return res.status(400).json({
		error: 'Invalid email format'
	    });
	}

	// validate password length
	if (password.length < 8) {
	    return res.status(400).json({
		error: 'Password must be at least 8 characters long'
	    });
	}

	// check if email already exists
	const existingUser = await User.findOne({ email: normalizedEmail }).lean();
	if (existingUser) {
	    return res.status(409).json({
		error: 'Email already exists'
	    });
	}

	// hash the password
	const passwordHash = await hashPassword(password);

	// create user in database
	// mongoose automatically adds createdAt, updatedAt, _id with User.create
	const newUser = await User.create({
	    name,
	    email: normalizedEmail,
	    passwordHash
	});

	// return success
	res.status(201).json({
	    message: 'User created successfully',
	    userId: newUser._id
	});

    } catch (err: any) {
	console.error('POST /api/auth/signup error:', err);

	// handle duplicate email error form MongoDB
	if (err?.code === 11000) {
	    return res.status(409).json({
		error: 'Email already exists'
	    });
	}
	
	// Generic error Response
	res.status(500).json({
	    error: 'Failed to create user'
	});
    }
};


