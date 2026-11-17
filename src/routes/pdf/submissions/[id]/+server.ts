import prisma from "$src/lib/database/prisma.js";
import {
    buildSubmissionPdf,
    submissionPdfInclude,
} from "$src/lib/server/pdf/submissionPdf.server";

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
        include: submissionPdfInclude,
    });
    if (rawSubmission == null || !(await canViewSubmission(user, rawSubmission)))
        error(404);
    const bytes = await buildSubmissionPdf(fetch, rawSubmission);
    return new Response(bytes, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Length": bytes.byteLength.toString(),
        },
    });
}
