import { UPLOADS_FOLDER } from "$env/static/private";
import prisma from "$src/lib/database/prisma";
import { error, type Actions } from "@sveltejs/kit";
import { existsSync } from "node:fs";
import { writeFile, mkdir } from "fs/promises";
import { extname, join, basename } from "path";
import { uploadFile } from "$src/lib/server/files";
import { getUserFromCookies } from "$src/lib/auth.sever";
import { redis } from "$src/lib/redis/redis";

export const actions: Actions = {
    presentation: async ({ request, route, url, params, cookies }) => {
        const user = await getUserFromCookies(cookies, redis);
        if (!user) error(403);
        const formData = await request.formData();
        const uploadedFile = formData?.get("file");
        const presentationUploadsPath = join(UPLOADS_FOLDER, "presentations");
        const file = await uploadFile(
            await uploadedFile?.arrayBuffer(),
            presentationUploadsPath,
            uploadedFile?.name,
            user.id,
        );
        await prisma.submission.update({
            where: {
                id: parseInt(params.submissionId),
            },
            data: {
                presentation_file_id: file.id,
            },
        });
    },
    manuscript: async ({ request, route, url, params, cookies }) => {
        const user = await getUserFromCookies(cookies, redis);
        if (!user) error(403);
        const formData = await request.formData();
        const uploadedFile = formData?.get("file");
        const manuscriptUploadsPath = join(UPLOADS_FOLDER, "manuscripts");
        const file = await uploadFile(
            await uploadedFile?.arrayBuffer(),
            manuscriptUploadsPath,
            uploadedFile?.name,
            user.id,
        );
        await prisma.submission.update({
            where: {
                id: parseInt(params.submissionId),
            },
            data: {
                manuscript_file_id: file.id,
            },
        });
    },
};
