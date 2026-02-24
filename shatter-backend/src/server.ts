import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGO_URI;

async function start() {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'MONGO_URI',
      'JWT_SECRET',
      'LINKEDIN_CLIENT_ID',
      'LINKEDIN_CLIENT_SECRET',
      'LINKEDIN_CALLBACK_URL',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    if (!MONGODB_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
