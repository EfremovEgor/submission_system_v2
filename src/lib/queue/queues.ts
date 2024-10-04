import Queue from "bull";
export const submissionReviewProcessQueue = new Queue(
    "submission_review_process",
    "redis://127.0.0.1:6380",
);
