import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

let connectionPromise: Promise<void> | null = null;
let listenersRegistered = false;

function registerListeners(): void {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on("connected", () => console.log("MongoDB: connected"));
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB: disconnected");
    connectionPromise = null;
  });
  mongoose.connection.on("reconnected", () => console.log("MongoDB: reconnected"));
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB: error:", err);
    connectionPromise = null;
  });
}

export async function connectDB(uri: string): Promise<void> {
  registerListeners();

  // If connected, verify the connection is actually alive (not stale from serverless freeze)
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db!.admin().ping();
      return; // genuinely alive
    } catch {
      console.log("MongoDB connection stale, reconnecting...");
      await mongoose.disconnect();
      connectionPromise = null;
    }
  }

  // If in a transitional state (connecting/disconnecting), reset
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
  }

  // Reuse in-flight connection attempt
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      await mongoose.connect(uri, {
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
      });
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

export function ensureConnection(req: Request, res: Response, next: NextFunction): void {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    res.status(500).json({ error: "MONGO_URI is not configured" });
    return;
  }

  connectDB(uri)
    .then(() => next())
    .catch((error: any) => {
      res.status(500).json({
        error: "Database connection failed",
        message: error.message,
      });
    });
}
