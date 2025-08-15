import mongoose from "mongoose";
import { log } from "../logger";

async function connectDb(mongoUri: string) {
  // connect to db
  try {
    await mongoose.connect(mongoUri);
    log.info("Connected to MongoDB");
  } catch (error) {
    log.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

export { connectDb };
