import { ConnectionOptions } from "bullmq";
import * as ioredis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "63719"),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (attempts) => {
    const delay = Math.min(5000, 100 * Math.pow(2, attempts));
    console.log(`[Redis] Retrying connection in ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetErrors = [/READONLY/, /ETIMEDOUT/, /ECONNRESET/];

    if (
      targetErrors.some((regex) => {
        regex.test(err.message);
      })
    ) {
      console.warn("[Redis] Trying to reconnect...");
      return true;
    }
    return false;
  },
};

export const redisConnection = new ioredis.default(connection);

redisConnection.on("connect", () => {
  console.log("[Redis] Connected to Redis server");
});

redisConnection.on("error", (error: any) => {
  console.error("[Redis] Redis connection error:", error);
});

redisConnection.on("close", () => {
  console.log("[Redis] Redis connection closed");
});
