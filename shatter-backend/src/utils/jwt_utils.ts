import jwt from 'jsonwebtoken';

// Get JWT secret from .env
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRATION = '30d'; // set token to expire in 30 days

// Validate that secret actually exists
if (!JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET not set in environment variables!');
}

/**
 * Generate a JWT token for a user
 * 
 * @param userId - The user's MongoDB _id
 * @returns A signed JWT token string
 * 
 * @example
 * const token = generateToken('673abc123def456');
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export const generateToken = (userId: string): string => {
    try{
	// create and sign the token
	const token = jwt.sign(
	    { userId },        		 // payload - data we want to store
	    JWT_SECRET,                  // Secret key - proves token is real
	    { expiresIn: JWT_EXPIRATION} // Options - token expires in 30 days
	);

	return token;
	
    } catch (error) {
	console.error('Error generating JWT token:', error);
	throw new Error('Failed to generate authentication token');
    }
};

/**
 * Verify a JWT token and extract the userId
 * 
 * @param token - The JWT token string to verify
 * @returns Object containing the userId
 * @throws Error if token is invalid or expired
 * 
 * @example
 * const decoded = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * console.log(decoded.userId); // "673abc123def456"
 */
export const verifyToken = (token: string): { userId: string } => {
    try {
	// verify the token signature and decode
	const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

	return decoded;

    } catch (error) {
	// Handle specific JWT errors
	if (error instanceof jwt.TokenExpiredError) {
	    throw new Error('Token expired');
	}
	if (error instanceof jwt.JsonWebTokenError) {
	    throw new Error('Invalid token');
	}

	// Generic error
	console.error('Error verifying JWT token:', error);
	throw new Error('Token verification failed');
    }
};
