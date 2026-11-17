import { parseIds, requireConferenceChair } from "$src/lib/chair/chair.server";
import prisma from "$src/lib/database/prisma";
import {
    buildSubmissionPdf,
    submissionPdfInclude,
} from "$src/lib/server/pdf/submissionPdf.server";
import { error } from "@sveltejs/kit";
import { downloadZip } from "client-zip";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";
import { Readable } from "node:stream";

// One zip with the chosen files of the chosen submissions. Files are streamed one by one,
// so a few gigabytes of presentations never sit in memory.

const KINDS = ["abstracts", "presentations", "manuscripts"] as const;
type Kind = (typeof KINDS)[number];

// Folder and file names inside the archive: no path separators or control characters.
const safeName = (name: string) =>
    name
        .replace(/[\\/:*?"<>|\x00-\x1f]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "untitled";

export async function GET({ url, cookies, params, fetch }) {
    const { conference } = await requireConferenceChair(cookies, params.conferenceAcronym);
    const kinds = url.searchParams.getAll("kind").filter((k): k is Kind => KINDS.includes(k as Kind));
    if (!kinds.length) error(422, "Nothing to download");
    const ids = parseIds((url.searchParams.get("ids") ?? "").split(",").filter(Boolean));
    if (!ids.length) error(422, "No submissions selected");
    const byTopic = url.searchParams.get("folders") == "topic";

    const submissions = await prisma.submission.findMany({
        where: { id: { in: ids }, conference_id: conference.id },
        include: {
            ...submissionPdfInclude,
            presentation_file: true,
            manuscript_file: true,
        },
        orderBy: { local_id: "asc" },
    });
    const acronym = conference.acronym;
    const folderOf = (kind: Kind, topic: string) =>
        [kinds.length > 1 ? kind : null, byTopic ? safeName(topic) : null]
            .filter(Boolean)
            .map((part) => `${part}/`)
            .join("");

    const missing: string[] = [];
    async function* entries() {
        for (const kind of kinds) {
            for (const s of submissions) {
                const folder = folderOf(kind, s.topic.name);
                if (kind == "abstracts") {
                    try {
                        const bytes = await buildSubmissionPdf(fetch, s);
                        yield {
                            name: `${folder}${acronym}-abstract-${s.local_id}.pdf`,
                            input: bytes,
                        };
                    } catch (e) {
                        console.error(`Abstract PDF for submission ${s.id} failed`, e);
                        missing.push(`#${s.local_id}: abstract PDF could not be generated`);
                    }
                    continue;
                }
                const file = kind == "presentations" ? s.presentation_file : s.manuscript_file;
                const word = kind == "presentations" ? "presentation" : "manuscript";
                if (!file) {
                    missing.push(`#${s.local_id}: no ${word} uploaded`);
                    continue;
                }
                if (!existsSync(file.path)) {
                    missing.push(`#${s.local_id}: ${word} file is missing on the server`);
                    continue;
                }
                const ext = extname(file.original_name) || extname(file.path);
                const info = await stat(file.path);
                yield {
                    name: `${folder}${acronym}-${word}-${s.local_id}${ext.toLowerCase()}`,
                    lastModified: file.uploaded_at,
                    size: info.size,
                    input: Readable.toWeb(createReadStream(file.path)) as ReadableStream,
                };
            }
        }
        if (missing.length)
            yield {
                name: "_missing.txt",
                input: `Not included:\n${missing.join("\n")}\n`,
            };
    }

    const name = `${acronym}-${kinds.join("-")}.zip`;
    const response = downloadZip(entries());
    return new Response(response.body, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${name}"`,
            "Cache-Control": "no-store",
        },
    });
}
