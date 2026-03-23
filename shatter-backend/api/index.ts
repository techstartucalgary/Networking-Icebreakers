import 'dotenv/config';
import { connectDB } from '../src/utils/db.js';
import app from '../src/app.js';

const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
  throw new Error('MONGO_URI is not set in environment variables');
}

// Eagerly start connection at module load (Vercel cold start)
connectDB(MONGODB_URI).catch(console.error);

export default app;
