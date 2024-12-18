import { presentation_formats, submission_statuses } from "$src/lib/aliases";
import { formatAuthors } from "$src/lib/utils.client";
import { utils, write } from "xlsx";
export const generateSubmissionsXLSX = (
    submissions: {
        local_id: number;
        authors: {
            first_name: string;
            last_name: string;
            affiliation: string;
            country: string;
        }[];
        title: string;
        topic: {
            name: string;
        };
        presentation_format: string;
        created_at: Date;
        status: string;
        withdrawn: boolean;
        particiaption_confirmed: boolean;
    }[],
): Buffer => {
    let workbook = utils.book_new();
    const headers = [
        "#",
        "Authors",
        "Countries",
        "Affiliations",
        "Title",
        "Topic",
        "Presentation Format",
        "Submitted At",
        "Review Status",
        "Withdrawn",
        "Confirmed",
    ];
    let worksheet = utils.aoa_to_sheet([]);
    utils.book_append_sheet(workbook, worksheet);
    utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    submissions.forEach((submission, index) => {
        const data = [
            submission.local_id,
            formatAuthors(submission.authors),
            submission.authors.map((author) => author.country).join(", "),
            submission.authors.map((author) => author.affiliation).join(", "),
            submission.title,
            submission.topic.name,
            presentation_formats[submission.presentation_format],
            submission.created_at.toLocaleString(),
            submission_statuses[submission.status],
            submission.withdrawn,
            submission.particiaption_confirmed,
        ];
        utils.sheet_add_aoa(worksheet, [data], { origin: `A${index + 2}` });
    });
    return write(workbook, { type: "buffer", bookType: "xlsx" });
};
