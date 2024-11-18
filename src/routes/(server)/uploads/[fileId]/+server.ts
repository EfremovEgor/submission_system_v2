import { MIME_TYPES } from "$src/lib/mime_types";
import { getUploadedFile } from "$src/lib/server/files.js";
import { error, json } from "@sveltejs/kit";
import { extname } from "path";

export async function GET({ params }) {
    const file = await getUploadedFile(params.fileId);
    if (!file) error(404);
    return new Response(file.buffer, {
        headers: {
            "Content-Type": MIME_TYPES[extname(file.path)],
            "Content-Length": file.buffer.byteLength.toString(),
        },
    });
}
