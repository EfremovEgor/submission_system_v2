import { submission_statuses, titles } from "$src/lib/aliases.js";
import prisma from "$src/lib/database/prisma.js";
import {
    generateSubmissionPDFBytes,
    type submissionPDFData,
} from "$src/lib/latex/templating";
import { json } from "@sveltejs/kit";

export async function GET({ params }) {
    const rawSubmission = await prisma.submission.findFirst({
        where: { id: parseInt(params.id) },
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
    const submission: submissionPDFData = {
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
