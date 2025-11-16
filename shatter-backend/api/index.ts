import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../src/app';

const MONGODB_URI = process.env.MONGO_URI;

let connectionPromise: Promise<void> | null = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  connectionPromise = (async () => {
    try {   
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        connectionPromise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        connectionPromise = null;
      });

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

connectDB().catch(console.error);

app.use(async (req, res, next) => {
  try {
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