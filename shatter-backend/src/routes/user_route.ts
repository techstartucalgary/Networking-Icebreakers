// router is like a mini-express app that allows grouping of related routes together
import { Router } from 'express';
import { getUsers, createUser } from '../controllers/user_controller';
// Importing controller functions that handle logic for each route
// These function define what happens when a req is received

// creating new router instance
const router = Router();

// Defining routes for the /api/users path
router.get('/', getUsers);    // when GET req is made, run getUsers func
router.post('/', createUser); // when POST req is made, run creatUser func

// Export the router so it can be used in app.ts
// app.ts imports router and mounts it under '/api/users'
export default router;
