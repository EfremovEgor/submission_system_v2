import { authorizedRoute } from "$src/lib/auth.sever";
import prisma from "$src/lib/database/prisma";
import { canViewSubmission } from "$src/lib/managers/rights/submission/guards.server";
import { MIME_TYPES } from "$src/lib/mime_types";
import { redis } from "$src/lib/redis/redis";
import { getUploadedFile } from "$src/lib/server/files.js";
import { error } from "@sveltejs/kit";
import { extname } from "path";

export async function GET({ params, cookies }) {
    const user = await authorizedRoute(cookies, redis);
    const file = await getUploadedFile(params.fileId);
    if (!file) error(404);
    if (file.uploaded_by_id != user.id) {
        const submissions = await prisma.submission.findMany({
            where: {
                OR: [
                    { presentation_file_id: file.id },
                    { manuscript_file_id: file.id },
                ],
            },
            include: { authors: true },
        });
        let allowed = false;
        for (const submission of submissions)
            if (await canViewSubmission(user, submission)) {
                allowed = true;
                break;
            }
        if (!allowed) error(404);
    }
    return new Response(file.buffer, {
        headers: {
            "Content-Type":
                MIME_TYPES[extname(file.path)] ?? "application/octet-stream",
            "Content-Length": file.buffer.byteLength.toString(),
            // Uploads are user content: never let the browser render them on our origin.
            // No filename here, so links keep naming downloads via their `download` attribute.
            "Content-Disposition": "attachment",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
