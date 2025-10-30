import express from 'express';
import userRoutes from './routes/user_route.ts';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello');
});

app.get('/test', (_req, res) => {
  res.send('Test');
});

app.use('/api/users', userRoutes);

export default app;
