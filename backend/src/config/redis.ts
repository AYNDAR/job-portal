import Redis from "ioredis";

let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on("connect", () => console.log("Redis connected"));
  redisClient.on("error", (err) => console.error("Redis error:", err));
}

export const getRedisClient = () => redisClient;
