// This is the main entry point that starts the application

import 'dotenv/config';           // loads .env file and populates process.env (the node.js object)
import mongoose from 'mongoose';  // mongoose is an Object Data Modelling (ODM) livrary for MongoDB
import app from './app.ts';       // Import the express app


// config

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000; // use defined PORT in .env if present , otherwise default to 400
const MONGODB_URI = process.env.MONGO_URI;                       // read the mongoDB connection from env variables

// Start up function
async function start() {
    try {
	if (!MONGODB_URI) {                            // check that MOGO URI is provided in .env
	    throw new Error('MONGODB_URI is not set'); 
	}
	await mongoose.connect(MONGODB_URI);  // this returns a promise, so we 'await' until it's successfully connected
	console.log('Successfully connected to MongoDB');

	// start listening for incoming HTTP requests on chosen port
	app.listen(PORT, () => {
	    console.log('Server running on http://localhost:${PORT}');
	});
    } catch (err) {           		             // if connection goes wrong, log the error
	console.error('Failed to start server:', err);
	process.exit(1);    // code 1 indicates failure
    }
}

start();
