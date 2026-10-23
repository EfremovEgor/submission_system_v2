import { Queue } from "bullmq";
import { env } from "$env/dynamic/private";

// Read at runtime from the environment (.env), not baked into the build.
const { REDIS_URL } = env;

// Env is empty while building; the fallback only keeps the build from failing.
const redisUrl = new URL(REDIS_URL || "redis://localhost:6379");
// BullMQ lives in its own Redis DB: sessions use raw keys in DB 0,
// so queue keys there (e.g. the numeric "bull:...:id") would be accepted as session tokens.
export const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    db: 1,
};
export const submissionReviewProcessQueue = new Queue(
    "submission_review_process",
    {
        connection: connection,
    },
);
