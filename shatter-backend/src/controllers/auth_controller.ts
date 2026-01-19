import { Request, Response } from 'express';
import { User } from '../models/user_model';
import { hashPassword, comparePassword } from '../utils/password_hash';
import { generateToken } from '../utils/jwt_utils';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/auth/signup
 * Create new user account
 *
 * @param req.body.name - User's display name
 * @param req.body.email - User's email
 * @param req.body.password - User's plain text password
 * @returns 201 with userId and JWT token on success
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

	// generate JWT token for the new user
	const token = generateToken(newUser._id.toString());

	// return success with token
	res.status(201).json({
	    message: 'User created successfully',
	    userId: newUser._id,
	    token
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


/**
 * POST /api/auth/login
 * Authenticate user and log them in
 * 
 * @param req.body.email - User's email
 * @param req.body.password - User's plain text password
 * @returns 200 with userId on success
 */
export const login = async (req: Request, res: Response) => {
    try {
	// 1 - extract data from req body
	const { email, password } = req.body as {
	    email?: string;
	    password?: string;
	};

	// 2 - validate required fields
	if (!email || !password) {
	    return res.status(400).json({
		error: 'Email and password are required'
	    });
	}

	// 3 - normalize email
	const normalizedEmail = email.toLowerCase().trim();

	// 4 - validate email format
	if (!EMAIL_REGEX.test(normalizedEmail)) {
	    return res.status(400).json({
		error: 'Invalid email format'
	    });
	}

	// 5 - find user by email
	const user = await User.findOne({ email: normalizedEmail })
	    .select('+passwordHash'); // need this since queries don't return passwordHash by default

	// 6 - check if user exists
	if (!user) {
	    // for security purposes I won't include whether email exists or not
	    return res.status(401).json({
		error: 'Invalid credentials'
	    });
	}

	// 7 - verify password
	const isPasswordValid = await comparePassword(password, user.passwordHash);

	if (!isPasswordValid) {
	    return res.status(401).json({
		error: 'Invalid credentials'
	    });
	}

	// 8 - update lastLogin stamp
	user.lastLogin = new Date();
	await user.save(); // save the updated user

	// 9 - generate JWT token for the user
	const token = generateToken(user._id.toString());

	// 10 - return success with token
	res.status(200).json({
	    message: 'Login successful',
	    userId: user._id,
	    token
	});

    } catch (err: any) {
	console.error('POST /api/auth/login error:', err);

	// Generic error Response
	res.status(500).json({
	    error: 'Login failed'
	});
    }
};

