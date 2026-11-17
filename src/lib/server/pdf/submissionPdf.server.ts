import { submission_statuses, titles } from "$src/lib/aliases.js";
import { fetchPdfApi } from "$src/lib/server/fetch.js";
import { type submissionPDFTemplateData } from "$src/lib/server/pdf/submission";
import { error } from "@sveltejs/kit";

export const submissionPdfInclude = {
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
} as const;

type RawSubmission = {
    title: string;
    local_id: number;
    status: string;
    created_at: Date;
    abstract: string;
    keywords: string;
    authors: { title: string; last_name: string; first_name: string; affiliation: string; country: string }[];
    topic: { name: string };
    conference: { short_name: string };
};

/** Abstract PDF of a submission (loaded with `submissionPdfInclude`), rendered by the PDF API. */
export const buildSubmissionPdf = async (fetch: CallableFunction, rawSubmission: RawSubmission) => {
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
    return bytes;
};
