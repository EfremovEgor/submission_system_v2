import { Queue } from "bullmq";
export const connection = {
    port: 6380,
    host: "localhost",
};
export const submissionReviewProcessQueue = new Queue(
    "submission_review_process",
    {
        connection: connection,
    },
);
