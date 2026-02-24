/*
 * ============================================
 * MongoDB Connection Singleton
 * ============================================
 * 
 * WHY A SINGLETON?
 * In serverless (Vercel), each API request can spin up a new function instance.
 * Without caching, every request would create a new DB connection = connection leak.
 * This pattern caches the connection across hot function invocations.
 *
 * ARCHITECTURE:
 *   Request → API Route → connectDB() → cached connection → MongoDB Atlas
 *                                     ↘ new connection (cold start only)
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gitrepo-analyzer";

// Global cache to persist connection across hot reloads in dev
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to persist across serverless function invocations
const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

export async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast instead of buffering
      maxPoolSize: 10,       // Connection pool for serverless
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset on failure so next request retries
    throw e;
  }

  return cached.conn;
}

export default connectDB;
