import { REDIS_URL } from "$env/static/private";
import { createClient } from "redis";
import type { RedisClientType } from "redis";

export const redis = createClient({
    url: REDIS_URL,
});
// Without an "error" listener a dropped connection is an uncaught exception that
// kills the process; with it the client logs and reconnects on its own.
redis.on("error", (error) => console.error("Redis client error", error));
// Not awaited: with the listener above connect() keeps retrying until Redis is up, which
// would block startup (and the build). Commands sent meanwhile wait in the offline queue.
redis
    .connect()
    .catch((error) => console.error("Redis connection failed", error));
