import express from 'express';
import userRoutes from './routes/user_route'; // these routes define how to handle requests to /api/users
import authRoutes from './routes/auth_routes';
import eventRoutes from './routes/event_routes';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

export default app;
