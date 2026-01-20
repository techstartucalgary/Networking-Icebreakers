import express from 'express';
import cors from "cors";

import userRoutes from './routes/user_route'; // these routes define how to handle requests to /api/users
import authRoutes from './routes/auth_routes';
import eventRoutes from './routes/event_routes';

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use((req, _res, next) => {
  req.io = app.get('socketio'); 
  next();
});

app.get('/', (_req, res) => {
  res.send('Hello');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

export default app;
