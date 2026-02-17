import { Request, Response } from "express";
import { User } from "../models/user_model";
import { hashPassword } from "../utils/password_hash";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

// controller: GET /api/users/:userId
// Get a specific user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// controller: GET /api/users/:userId/events
// Get all events that a user has joined
export const getUserEvents = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    const user = await User.findById(userId)
      .populate("eventHistoryIds", "name description joinCode startDate endDate currentState")
      .select("eventHistoryIds");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      events: user.eventHistoryIds,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/users/:userId
 * Update user profile. Users can only update their own profile.
 * Guest users can upgrade to local auth by providing email + password.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Users can only update their own profile
    if (req.user?.userId !== userId) {
      return res.status(403).json({ success: false, error: "You can only update your own profile" });
    }

    const { name, email, password, bio, profilePhoto, socialLinks } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      bio?: string;
      profilePhoto?: string;
      socialLinks?: { linkedin?: string; github?: string; other?: string };
    };

    const updateFields: Record<string, any> = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, error: "Name cannot be empty" });
      }
      updateFields.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({ success: false, error: "Invalid email format" });
      }
      // Check for duplicate email
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } }).lean();
      if (existing) {
        return res.status(409).json({ success: false, error: "Email already in use" });
      }
      updateFields.email = normalizedEmail;
    }

    if (password !== undefined) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
      }
      updateFields.passwordHash = await hashPassword(password);
      updateFields.passwordChangedAt = new Date();
      // Upgrade guest users to local auth when they set a password
      const currentUser = await User.findById(userId).lean();
      if (currentUser?.authProvider === 'guest') {
        updateFields.authProvider = 'local';
      }
    }

    if (bio !== undefined) updateFields.bio = bio;
    if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const result = await User.updateOne(
      { _id: userId },
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const updatedUser = await User.findById(userId).select("-passwordHash");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, error: "Email already in use" });
    }
    console.error("PUT /api/users/:userId error:", err);
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
};
