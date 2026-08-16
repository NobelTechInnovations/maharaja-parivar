import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/maharaja-parivar";

/**
 * Serverless-safe Mongo connection, ported from the Booster project
 * (commerce-backend/src/config/database.js). A Vercel function has no
 * long-running bootstrap step — every request just hits a route handler
 * directly — so we cache both the connected state and any in-flight
 * connection attempt on the module itself:
 *
 *  - readyState === 1 (a warm container reusing this module between
 *    invocations) resolves instantly, no reconnect overhead.
 *  - a connection already in flight (two requests hitting a cold
 *    container back to back) is awaited once and shared, instead of
 *    racing two mongoose.connect() calls.
 *  - otherwise it kicks off mongoose.connect() and caches the promise
 *    until it settles.
 */
let connectingPromise = null;

export async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectingPromise) {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    connectingPromise = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.name}`);
        return conn.connection;
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        throw error;
      })
      .finally(() => {
        connectingPromise = null;
      });
  }

  return connectingPromise;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
