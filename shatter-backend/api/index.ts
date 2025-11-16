import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../src/app';

const MONGODB_URI = process.env.MONGO_URI;

mongoose.set('bufferCommands', false);

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2, 
      maxIdleTimeMS: 30000, 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;

    mongoose.connection.on('error', (err) => {
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
    });

  } catch (error) {
    isConnected = false;
    throw error;
  }
}

connectDB().catch(console.error);

app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    await connectDB();
    next();
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message
    });
  }
});

export default app;