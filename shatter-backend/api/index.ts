import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../src/app';

const MONGODB_URI = process.env.MONGO_URI;

let cachedConnection: typeof mongoose | null = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  const conn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false, 
  });

  cachedConnection = conn;
  return conn;
}

connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

export default app;