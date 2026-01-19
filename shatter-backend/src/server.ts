import 'dotenv/config';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';

// config
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to MongoDB");

    // // start listening for incoming HTTP requests on chosen port
    // app.listen(PORT, () => {
    //     console.log(`Server running on http://localhost:${PORT}`);
    // });

    // Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // Setup Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: "http://localhost:3000", // React frontend
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"], // fallback to polling
    });

	app.set('socketio', io);

    // Socket.IO connection handler
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-event-room", (eventId: string) => {
        socket.join(eventId);
        console.log(`Socket ${socket.id} joined room ${eventId}`);
      });

      socket.on("leave-event-room", (eventId: string) => {
        socket.leave(eventId);
        console.log(`Socket ${socket.id} left room ${eventId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
