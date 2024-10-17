import { submission_statuses, titles } from "$src/lib/aliases";
import prisma from "$src/lib/database/prisma";
import {
    generateSubmissionPDFBytes,
    type submissionPDFTemplateData,
} from "$server/pdf/submission";

import { json } from "@sveltejs/kit";

export async function GET({ url }) {
    const rawSubmission = await prisma.submission.findFirst({
        where: { id: parseInt(url.searchParams.get("submission")) },
        include: {
            authors: {
                select: {
                    last_name: true,
                    first_name: true,
                    affiliation: true,
                    country: true,
                    title: true,
                },
            },
            topic: {
                select: { name: true },
            },
        },
    });
    const submission: submissionPDFTemplateData = {
        submission: {
            title: rawSubmission.title,
            localId: rawSubmission.local_id,
            status: submission_statuses[rawSubmission.status],
            createdAt: rawSubmission.created_at.toLocaleString(),
            abstract: rawSubmission.abstract,
            keywords: rawSubmission.keywords.split("\n"),
            authors: rawSubmission.authors.map(
                (author) =>
                    `${titles[author.title]} ${author.last_name} ${author.first_name}, ${author.affiliation}, ${author.country}`,
            ),
        },
        topic: {
            name: rawSubmission.topic.name,
        },
    };
    const bytes = await generateSubmissionPDFBytes(submission);
    if (!bytes) return json({ error: true });
    return new Response(bytes, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Length": bytes.byteLength.toString(),
        },
    });
}
