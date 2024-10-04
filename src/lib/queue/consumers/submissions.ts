import prisma from "$src/lib/database/prisma";
import { submissionReviewProcessQueue } from "../queues";
export interface submissionReviewProcessQueueData {
    id: number;
}
export class SubmissionReviewProcessQueueManager {
    private static async consumer() {
        submissionReviewProcessQueue.process(async (job, done) => {
            return prisma.submission.update({
                where: { id: job.data.id },
                data: {
                    status: "under_review",
                },
            });
        });
    }
    public static async timeoutSubmissionReviewProcess(
        data: submissionReviewProcessQueueData,
    ) {
        submissionReviewProcessQueue.add(
            { id: data.id },
            {
                delay: 10000,
            },
        );
    }
}
