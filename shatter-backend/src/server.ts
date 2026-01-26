import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGO_URI;

async function start() {
  try {
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
