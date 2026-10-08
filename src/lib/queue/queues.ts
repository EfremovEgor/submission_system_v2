import { Queue } from "bullmq";
import { REDIS_URL } from "$env/static/private";

const redisUrl = new URL(REDIS_URL);
export const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
};
export const submissionReviewProcessQueue = new Queue(
    "submission_review_process",
    {
        connection: connection,
    },
);
