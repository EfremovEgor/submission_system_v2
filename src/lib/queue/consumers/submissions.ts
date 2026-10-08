import prisma from "$src/lib/database/prisma";
import { Worker, type Job } from "bullmq";
import { connection, submissionReviewProcessQueue } from "../queues";
import { renderSubmissionUnderReviewTemplate } from "$src/lib/email/templating";
import { presentation_formats, titles } from "$src/lib/aliases";
import transporter from "$src/lib/email/setup.server";
import { EMAIL } from "$env/static/private";
export interface submissionReviewProcessQueueData {
    id: number;
}
export class SubmissionReviewProcessQueueManager {
    public static processor = async (job: Job) => {
        // Only a still-pending submission goes under review: a chair decision made in the
        // meantime or a withdrawal must not be overwritten.
        const { count } = await prisma.submission.updateMany({
            where: { id: job.data.id, status: "submitted", withdrawn: false },
            data: {
                status: "under_review",
            },
        });
        if (count == 0) return;
        const submission = await prisma.submission.findFirstOrThrow({
            where: { id: job.data.id },
            include: {
                authors: {
                    orderBy: {
                        id: "asc",
                    },
                },
                topic: true,
                conference: {
                    select: {
                        email: true,
                        short_name: true,
                        name: true,
                    },
                },
            },
        });
        submission.authors.forEach((author) => {
            author.title = titles[author.title];
        });
        for (const author of submission.authors) {
            try {
                const html = await renderSubmissionUnderReviewTemplate({
                    conference_email: submission.conference.email,
                    corresponding_title: author.title,
                    first_name: author.first_name,
                    last_name: author.last_name,
                    title: submission.title,
                    local_id: submission.local_id,
                    submission_id: submission.id,
                    presentation_format:
                        presentation_formats[submission.presentation_format],
                    topic: submission.topic.name,
                    authors: submission.authors,
                    conference_short_name: submission.conference.short_name,
                    conference_name: submission.conference.name,
                });
                await transporter.sendMail({
                    from: `${EMAIL}`,
                    to: `${author.email}`,
                    subject: `Your paper #${submission.local_id} for the  ${submission.conference.short_name} is under review`,
                    html: html,
                });
            } catch (e) {
                console.error(
                    `Under review notice for submission ${submission.id} to ${author.email} failed`,
                    e,
                );
            }
        }
    };
    public static async timeoutSubmissionReviewProcess(
        data: submissionReviewProcessQueueData,
    ) {
        await submissionReviewProcessQueue.add(
            "sendSubmissionReviewProcessEmail",
            { id: data.id },
            {
                jobId: `review-${data.id}`,
                delay: 2 * 24 * 60 * 60 * 1000,
                removeOnComplete: true,
            },
        );
    }
}
export const submissionReviewProcessWorker = new Worker(
    "submission_review_process",
    SubmissionReviewProcessQueueManager.processor,
    { connection: connection },
);
submissionReviewProcessWorker.on("failed", (job, e) =>
    console.error(`Review process job ${job?.id} failed`, e),
);
submissionReviewProcessWorker.on("error", (e) =>
    console.error("Review process worker error", e),
);
