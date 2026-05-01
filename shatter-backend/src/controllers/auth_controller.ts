import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../models/user_model.js';
import { AuthCode } from '../models/auth_code_model.js';
import { hashPassword, comparePassword } from '../utils/password_hash.js';
import { generateToken } from '../utils/jwt_utils.js';
import { getLinkedInAuthUrl, getLinkedInAccessToken, getLinkedInProfile } from '../utils/linkedin_oauth.js';

const JWT_SECRET = process.env.JWT_SECRET || '';

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
	    if (existingUser.authProvider === 'linkedin') {
		return res.status(409).json({
		    error: 'This email is associated with a LinkedIn account. Please log in with LinkedIn.',
		});
	    }
	    return res.status(409).json({
		error: 'Email already exists',
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

	// 7 - verify password (OAuth users won't have a passwordHash)
	if (!user.passwordHash) {
	    return res.status(401).json({
		error: 'This account uses LinkedIn login. Please sign in with LinkedIn.',
	    });
	}
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


/**
 * GET /api/auth/linkedin
 * Initiates LinkedIn OAuth flow by redirecting to LinkedIn
 */
export const linkedinAuth = async (req: Request, res: Response) => {
    try {
	// Generate CSRF protection state token
	const state = crypto.randomBytes(16).toString('hex');

	const platform = req.query.platform === 'mobile' ? 'mobile' : 'web';

	// Encode state as JWT with 5-minute expiration (stateless validation)
	const stateToken = jwt.sign({ state, platform }, JWT_SECRET, { expiresIn: '5m' });

	// Build LinkedIn authorization URL and redirect
	const authUrl = getLinkedInAuthUrl(stateToken);
	res.redirect(authUrl);
    } catch (error) {
	console.error('LinkedIn auth initiation error:', error);
	res.status(500).json({ error: 'Failed to initiate LinkedIn authentication' });
    }
};


/**
 * GET /api/auth/linkedin/link
 * Initiates LinkedIn OAuth flow for linking a LinkedIn account to an existing user.
 * Protected route - requires JWT auth (guest or local users only).
 */
export const linkedinLink = async (req: Request, res: Response) => {
    try {
	const userId = req.user?.userId;
	if (!userId) {
	    return res.status(401).json({ error: 'Authentication required' });
	}

	const user = await User.findById(userId);
	if (!user) {
	    return res.status(404).json({ error: 'User not found' });
	}

	if (user.authProvider === 'linkedin') {
	    return res.status(403).json({
		error: 'Account is already a LinkedIn account',
	    });
	}

	if (user.linkedinId) {
	    return res.status(409).json({
		error: 'LinkedIn account already linked',
	    });
	}

	const platform = req.query.platform === 'mobile' ? 'mobile' : 'web';

	// Encode linking context into the state JWT (signed, tamper-proof)
	const stateToken = jwt.sign(
	    { linking: true, userId: user._id.toString(), platform },
	    JWT_SECRET,
	    { expiresIn: '5m' }
	);

	const authUrl = getLinkedInAuthUrl(stateToken);
	res.redirect(authUrl);
    } catch (error) {
	console.error('LinkedIn link initiation error:', error);
	res.status(500).json({ error: 'Failed to initiate LinkedIn linking' });
    }
};


/**
 * GET /api/auth/linkedin/callback
 * LinkedIn redirects here after user authorization
 */
export const linkedinCallback = async (req: Request, res: Response) => {
    try {
	const { code, state, error: oauthError } = req.query as {
	    code?: string;
	    state?: string;
	    error?: string;
	};

	// Default to web frontend; mobile gets resolved after state verification below
	let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';

	// State must always be present (even on cancel, LinkedIn returns it). Verify it first
	// so we can resolve the correct redirect target before any branching.
	if (!state) {
	    return res.status(400).json({ error: 'Missing state parameter' });
	}

	let statePayload: { linking?: boolean; userId?: string; platform?: 'mobile' | 'web' };
	try {
	    statePayload = jwt.verify(state, JWT_SECRET) as { linking?: boolean; userId?: string; platform?: 'mobile' | 'web' };
	} catch (e: any) {
	    console.error('LinkedIn state verify failed:', {
		name: e?.name,
		message: e?.message,
		stateLen: state?.length,
	    });
	    return res.status(401).json({ error: 'Invalid state parameter' });
	}

	// Resolve redirect target based on the originating client encoded in the signed state JWT
	if (statePayload.platform === 'mobile') {
	    frontendUrl = 'shattermobile://auth';
	}

	// Handle user denial
	if (oauthError === 'user_cancelled_authorize') {
	    return res.redirect(`${frontendUrl}/auth/error?message=Authorization cancelled`);
	}

	// Validate code is present for the success path
	if (!code) {
	    return res.status(400).json({ error: 'Missing code parameter' });
	}

	// Exchange code for access token
	const accessToken = await getLinkedInAccessToken(code);

	// Fetch user profile from LinkedIn
	const linkedinProfile = await getLinkedInProfile(accessToken);

	// Validate email is provided
	if (!linkedinProfile.email) {
	    return res.status(400).json({
		error: 'Email address required',
		suggestion: 'Please make your email visible to third-party apps in LinkedIn settings',
	    });
	}

	let user;

	if (statePayload.linking && statePayload.userId) {
	    // --- LinkedIn linking flow (guest or local -> attach LinkedIn) ---

	    // Check if this LinkedIn account is already linked to another user
	    const existingLinkedinUser = await User.findOne({ linkedinId: linkedinProfile.sub });
	    if (existingLinkedinUser) {
		return res.redirect(
		    `${frontendUrl}/auth/error?message=This LinkedIn account is already linked to another user`
		);
	    }

	    // Look up the user to determine their current authProvider
	    const existingUser = await User.findById(statePayload.userId);
	    if (!existingUser || existingUser.authProvider === 'linkedin') {
		return res.redirect(
		    `${frontendUrl}/auth/error?message=Account not found or already a LinkedIn account`
		);
	    }

	    const updateFields: Record<string, any> = {
		linkedinId: linkedinProfile.sub,
		lastLogin: new Date(),
	    };

	    // Guest users get fully upgraded to linkedin authProvider
	    // Local users keep their authProvider (preserves password login)
	    if (existingUser.authProvider === 'guest') {
		updateFields.authProvider = 'linkedin';
	    }

	    // Only fill in fields that are currently empty
	    if (linkedinProfile.email && !existingUser.email) {
		updateFields.email = linkedinProfile.email.toLowerCase().trim();
	    }
	    if (linkedinProfile.picture && !existingUser.profilePhoto) {
		updateFields.profilePhoto = linkedinProfile.picture;
	    }
	    if (linkedinProfile.name && existingUser.authProvider === 'guest') {
		updateFields.name = linkedinProfile.name;
	    }

	    user = await User.findByIdAndUpdate(
		statePayload.userId,
		{ $set: updateFields },
		{ new: true }
	    );

	    if (!user) {
		return res.redirect(
		    `${frontendUrl}/auth/error?message=Account not found`
		);
	    }
	} else {
	    // --- Normal LinkedIn signup/login flow ---

	    // Find existing user by LinkedIn ID
	    user = await User.findOne({ linkedinId: linkedinProfile.sub });

	    if (!user) {
		// Check if email already exists with password auth (email conflict)
		const existingEmailUser = await User.findOne({
		    email: linkedinProfile.email.toLowerCase().trim(),
		});

		if (existingEmailUser) {
		    return res.redirect(
			`${frontendUrl}/auth/error?message=Email already registered with password&suggestion=Please login with your password`
		    );
		}

		// Create new user from LinkedIn data
		user = await User.create({
		    name: linkedinProfile.name,
		    email: linkedinProfile.email.toLowerCase().trim(),
		    linkedinId: linkedinProfile.sub,
		    profilePhoto: linkedinProfile.picture,
		    authProvider: 'linkedin',
		    lastLogin: new Date(),
		});
	    } else {
		// Update existing user's last login
		user.lastLogin = new Date();
		await user.save();
	    }
	}

	// Generate single-use auth code and redirect to frontend
	const authCode = crypto.randomBytes(32).toString('hex');
	await AuthCode.create({ code: authCode, userId: user._id });
	return res.redirect(`${frontendUrl}/auth/callback?code=${authCode}`);

    } catch (error: any) {
	console.error('LinkedIn callback error:', error);

	// Best-effort attempt to recover platform from state for the error redirect.
	// If state is missing/invalid we fall back to the web URL.
	let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
	try {
	    const stateParam = (req.query as { state?: string }).state;
	    if (stateParam) {
		const payload = jwt.verify(stateParam, JWT_SECRET) as { platform?: 'mobile' | 'web' };
		if (payload.platform === 'mobile') frontendUrl = 'shattermobile://auth';
	    }
	} catch {
	    // ignore — already defaulting to web
	}

	if (error.message?.includes('LinkedIn')) {
	    return res.redirect(`${frontendUrl}/auth/error?message=LinkedIn authentication failed`);
	}

	res.status(500).json({ error: 'Authentication failed. Please try again.' });
    }
};


/**
 * POST /api/auth/exchange
 * Exchange a single-use auth code for a JWT token
 *
 * @param req.body.code - The auth code from the OAuth callback redirect
 * @returns 200 with userId and JWT token on success
 */
export const exchangeAuthCode = async (req: Request, res: Response) => {
    try {
	const { code } = req.body as { code?: string };

	if (!code) {
	    return res.status(400).json({ error: 'Auth code is required' });
	}

	// Find and delete the auth code in one atomic operation (single-use)
	const authCodeDoc = await AuthCode.findOneAndDelete({ code });

	if (!authCodeDoc) {
	    return res.status(401).json({ error: 'Invalid or expired auth code' });
	}

	// Generate JWT token
	const token = generateToken(authCodeDoc.userId.toString());

	res.status(200).json({
	    message: 'Authentication successful',
	    userId: authCodeDoc.userId,
	    token,
	});

    } catch (err: any) {
	console.error('POST /api/auth/exchange error:', err);
	res.status(500).json({ error: 'Failed to exchange auth code' });
    }
};

