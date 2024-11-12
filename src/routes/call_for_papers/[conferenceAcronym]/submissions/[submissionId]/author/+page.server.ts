import {
    PRESENTATION_UPLOADS_FOLDER,
    UPLOADS_FOLDER,
} from "$env/static/private";
import prisma from "$src/lib/database/prisma";
import type { Actions } from "@sveltejs/kit";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { extname, join } from "path";

export const actions: Actions = {
    presentation: async ({ request, route, url, params }) => {
        const formData = await request.formData();
        const uploadedFile = formData?.get("file");
        const presentationUploadsPath = join(
            UPLOADS_FOLDER,
            PRESENTATION_UPLOADS_FOLDER,
        );
        if (!existsSync(presentationUploadsPath)) {
            await mkdir(presentationUploadsPath, { recursive: true });
        }

        const filename = `${crypto.randomUUID()}${extname(uploadedFile?.name)}`;
        const filePath = join(presentationUploadsPath, filename);
        await writeFile(
            filePath,
            Buffer.from(await uploadedFile?.arrayBuffer()),
        );
        await prisma.submission.update({
            where: {
                id: parseInt(params.submissionId),
            },
            data: {
                presentation_file: filename,
            },
        });
    },
};
