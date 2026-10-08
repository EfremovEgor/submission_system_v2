import { Queue } from "bullmq";
import { REDIS_URL } from "$env/static/private";

const redisUrl = new URL(REDIS_URL);
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
