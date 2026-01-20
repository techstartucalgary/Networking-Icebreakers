import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

const PORT = 4000;

async function start() {
  await mongoose.connect(process.env.MONGO_URI!);
  app.listen(PORT, () => {
    console.log(`Local API running at http://localhost:${PORT}`);
  });
}

start();
