import express from "express";
import cors from "cors";

import userRoutes from './routes/user_route'; // these routes define how to handle requests to /api/users
import authRoutes from './routes/auth_routes';
import eventRoutes from './routes/event_routes';
import bingoRoutes from './routes/bingo_routes';
import userConnectionRoutes from './routes/user_connections_routes';


const app = express();
app.use(express.json());

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bingo', bingoRoutes);
app.use('/api/userConnections', userConnectionRoutes);

export default app;
