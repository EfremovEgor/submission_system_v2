import { submission_statuses, titles } from "$src/lib/aliases.js";
import prisma from "$src/lib/database/prisma.js";
import { fetchPdfApi } from "$src/lib/server/fetch.js";
import { type submissionPDFTemplateData } from "$src/lib/server/pdf/submission";

import { authorizedRoute } from "$src/lib/auth.sever";
import { canViewSubmission } from "$src/lib/managers/rights/submission/guards.server";
import { redis } from "$src/lib/redis/redis";
import { error } from "@sveltejs/kit";

export async function GET({ params, fetch, cookies }) {
    const user = await authorizedRoute(cookies, redis);
    const submissionId = Number(params.id);
    if (!Number.isInteger(submissionId)) error(404);
    const rawSubmission = await prisma.submission.findFirst({
        where: { id: submissionId },
        include: {
            authors: {
                select: {
                    last_name: true,
                    first_name: true,
                    affiliation: true,
                    country: true,
                    title: true,
                    email: true,
                    is_corresponding: true,
                },
                orderBy: {
                    id: "asc",
                },
            },
            topic: {
                select: { name: true },
            },
            conference: {
                select: { short_name: true },
            },
        },
    });
    if (rawSubmission == null || !(await canViewSubmission(user, rawSubmission)))
        error(404);
    const submission: submissionPDFTemplateData = {
        submission: {
            title: rawSubmission.title,
            localId: rawSubmission.local_id,
            status: submission_statuses[rawSubmission.status],
            createdAt: rawSubmission.created_at.toLocaleString(),
            abstract: rawSubmission.abstract,
            keywords: rawSubmission.keywords.split("\n").join(", "),
            authors: rawSubmission.authors.map(
                (author) =>
                    `${titles[author.title]} ${author.last_name} ${author.first_name}, ${author.affiliation}, ${author.country}`,
            ),
        },
        conference: rawSubmission.conference,
        topic: {
            name: rawSubmission.topic.name,
        },
    };
    const response = await fetchPdfApi(fetch, "/pdf/submission", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
    });

    if (!response.ok) error(502, "PDF generation failed");
    const bytes: Buffer = Buffer.from(
        await (await response.blob()).arrayBuffer(),
    );
    return new Response(bytes, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Length": bytes.byteLength.toString(),
        },
    });
}
