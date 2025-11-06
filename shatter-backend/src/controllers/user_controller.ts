// import req and res types for type safety
import { Request, Response } from 'express';
import { User } from '../models/user_model.ts'; // imports user model created with mongoose

// controller: GET /api/users
// This function handles GET reqs to /api/users
// It fetches all users from MongoDB and sends them as json

export const getUsers = async (_req: Request, res: Response) => {
    try {
	// retrieves all docs from "users" collection
	const users = await User.find().lean(); // .lean() returns plain JS objects instead of Mongoose docs, may change incase we need extra model methods later
	res.json(users); // sends list of users back as JSON response
    } catch (err) { // log the error if something goes wrong
	console.error('GET /api/users error:', err);
	res.status(500).json({ error: 'Failed to fetch users' });
    }
};


// controller: POST /api/users
// reads data from req body, vailidates it and creates a new user
export const createUser = async (req: Request, res: Response) => {
    try {
	// Destructure the req body sent by the client
	// The ?? {} ensures we don't get error if req.body is undefined
	const { name, email } = req.body ?? {};

	// Basic validation to ensure both name and email are provided
	// if not respond with bad request and stop further processes
	if (!name || !email) {
	    return res.status(400).json({ error: 'name and email required' });
	}

	// create a new user doc in DB using Mongoose's .create()
	const user = await User.create({ name, email });
	// respond with "created" and send back created user as JSON
	res.status(201).json(user);
    } catch(err: any) {
	// Handle duplicate email error
	// Mongo DB rejects duplicat value since we have email marked as 'unique'
	if (err?.code === 11000) {
	    return res.status(409).json({ error: 'email already exists' });
	}
	
	// for all other errors, log them and return generic 500 response
	console.error('POST /api/users error:', err);
	res.status(500).json({error: 'Failed to create user' });
    }
};
