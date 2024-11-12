import { submission_statuses } from "$src/lib/aliases.js";
import prisma from "$src/lib/database/prisma.js";
import { sendSubmissionAccepted } from "$src/lib/email/authors.mailing.js";
import { error, json } from "@sveltejs/kit";
const acceptSubmission = async (submissionId: number) => {
    const submission = await prisma.submission.findFirst({
        select: {
            authors: true,
            local_id: true,
            title: true,
            conference: {
                select: {
                    name: true,
                    short_name: true,
                    site_url: true,
                    email: true,
                },
            },
        },
        where: {
            id: submissionId,
        },
    });
    await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            status: "accepted",
        },
    });
    submission.authors.forEach((author) => {
        if (author.is_corresponding)
            sendSubmissionAccepted(author.email, {
                recipient: author,
                submission: {
                    local_id: submission.local_id,
                    title: submission.title,
                },
                conference: submission.conference,
            });
    });
};
const rejectSubmission = async (submissionId: number) => {
    const submission = await prisma.submission.findFirst({
        select: {
            authors: true,
            local_id: true,
            title: true,
            conference: {
                select: {
                    name: true,
                    short_name: true,
                    site_url: true,
                    email: true,
                },
            },
        },
        where: {
            id: submissionId,
        },
    });
    await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            status: "rejected",
        },
    });
};
export async function POST({ request, cookies, params }) {
    const {
        action,
    }: {
        action: string;
    } = await request.json();
    if (!["accept", "reject"].includes(action)) error(422);
    if (action == "reject") rejectSubmission(parseInt(params.submissionId));
    if (action == "accept") acceptSubmission(parseInt(params.submissionId));
    return json({ status: "ok" });
}
