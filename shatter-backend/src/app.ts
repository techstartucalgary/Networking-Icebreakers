// Express framework gives us fucnctions to creeate web server, handle routes, process HTTP req and send responses
import express from 'express';
import userRoutes from './routes/user_route.ts'; // these routes define how to handel requests to /api/users

// Creating express application as a single "app" object, started in server.ts
// This object represents entire web server and will be used to:
// register Middleware, define routes ....
const app = express();

// Middleware setup
// responsible for parsing incoming JSON request bodies, making req.body usable in controllers
app.use(express.json());

// Defining routes
// a simple route that sends back plain text "Hello" when anyone visits the app in browser
app.get('/', (_req, res) => {
  res.send('Hello');
});

// Mounts the user routes under the path 'api/users'
// any routes defined in user_route.ts will be accessible with URLs starting with /api/users
app.use('/api/users', userRoutes);


// Export the configured Express app, so that server.ts can import it
// Keeping app setup separate from server startup makes the code modular and testable
export default app;
