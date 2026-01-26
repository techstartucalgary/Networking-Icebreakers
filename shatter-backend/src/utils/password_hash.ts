import bcrypt from 'bcryptjs';

// How many times to scramble the password (10 seems to be the standard)
// the password will be hashed 2^10 = 1024 times
const SALT_ROUNDS = 10

// we use export so other files can import and use this func
// hashing takes quite some time so we use the async keyword
// the function will return a promise that resolves to a string (hash)
export const hashPassword = async (password: string): Promise<string> => {
    try {
	// 1- generate a random salt (unique random data)
	// 'await' ensures that this assignment is complete before moving on
	const salt = await bcrypt.genSalt(SALT_ROUNDS)

	// 2- combine password with salt and hash it
	const hash = await bcrypt.hash(password, salt);

	// return the hash (this is what we store in database)
	return hash;
    } catch (error) {
	console.error('Error hashing password:', error);
	throw new Error('Failed to hash password');
    }
};

// takes the password user typed and stored hash
// recall that bcrypt stores the salt inside the hash
// the function internally extracts salt from hash
// it then rehashes the typed password with same salt and compares
export const comparePassword = async (
    password: string,
    hash: string,
): Promise<boolean> => {
    try {
	// bcrypt extracts the salt from the hash and compares
	const isMatch = await bcrypt.compare(password, hash);
	return isMatch;
    } catch (error) {
	console.error('Error comparing passwords:', error);
	throw new Error('Failed to compare passwords');
    }
};


