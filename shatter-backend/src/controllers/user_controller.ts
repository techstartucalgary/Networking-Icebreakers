import { Request, Response } from "express";
import { User } from "../models/user_model";

// controller: GET /api/users
// This function handles GET reqs to /api/users
// It fetches all users from MongoDB and sends them as json

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().lean();
    res.json(users); 
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    res.status(500).json({
      error: "Failed to fetch users",
      message: err.message,
    });
  }
};

// controller: POST /api/users
// reads data from req body, vailidates it and creates a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body ?? {};

    if (!name || !email) {
      return res.status(400).json({ error: "name and email required" });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "email already exists" });
    }

    console.error("POST /api/users error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};
