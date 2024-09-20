import { REDIS_URL } from "$env/static/private";
import { createClient } from "redis";
import type { RedisClientType } from "redis";

export const redis = await createClient({
    url: REDIS_URL,
});
try {
    await redis.connect();
} catch (error) {}
