import { UPLOADS_FOLDER } from "$env/static/private";
import prisma from "$src/lib/database/prisma";
import { error, fail, type Actions, type RequestEvent } from "@sveltejs/kit";
import { extname, join } from "path";
import { uploadFile } from "$src/lib/server/files";
import { requireSubmissionAuthor } from "$src/lib/managers/rights/submission/guards.server";

const uploadSubmissionFile = async (
    { request, params, cookies }: RequestEvent,
    kind: "presentation" | "manuscript",
) => {
    const { user, submission, rights } = await requireSubmissionAuthor({
        cookies,
        params,
    });
    // Same conditions under which the page shows the upload manager.
    if (submission.withdrawn || !rights.canUpload) error(403);
    const formData = await request.formData();
    const uploadedFile = formData.get("file");
    if (!(uploadedFile instanceof File) || uploadedFile.size == 0)
        return fail(400, { message: "No file uploaded" });
    const allowedExtension = kind == "presentation" ? ".pptx" : ".docx";
    if (extname(uploadedFile.name).toLowerCase() != allowedExtension)
        return fail(400, { message: `Only ${allowedExtension} files are allowed` });
    const file = await uploadFile(
        await uploadedFile.arrayBuffer(),
        join(UPLOADS_FOLDER, `${kind}s`),
        uploadedFile.name,
        user.id,
    );
    await prisma.submission.update({
        where: {
            id: submission.id,
        },
        data:
            kind == "presentation"
                ? { presentation_file_id: file.id }
                : { manuscript_file_id: file.id },
    });
};

export const actions: Actions = {
    presentation: (event) => uploadSubmissionFile(event, "presentation"),
    manuscript: (event) => uploadSubmissionFile(event, "manuscript"),
};
