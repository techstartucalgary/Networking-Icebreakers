import express from "express";
import cors from "cors";

import { ensureConnection } from "./utils/db.js";
import userRoutes from './routes/user_route.js';
import authRoutes from './routes/auth_routes.js';
import eventRoutes from './routes/event_routes.js';
import bingoRoutes from './routes/bingo_routes.js';
import participantConnectionRoutes from "./routes/participant_connections_routes.js";


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

// Ensure DB connection is alive before handling any API request
app.use("/api", ensureConnection);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bingo', bingoRoutes);
app.use("/api/participantConnections", participantConnectionRoutes);

export default app;
