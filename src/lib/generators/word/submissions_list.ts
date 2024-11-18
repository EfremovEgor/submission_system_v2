import { formatAuthors } from "$src/lib/utils.client";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
} from "docx";

export const generateSubmissionsWord = async (data: {
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
    }[];
    conference: {
        acronym: string;
    };
}) => {
    const rows = data.submissions.map(
        (submission, index) =>
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph(`${index + 1}`)],
                    }),

                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${data.conference.acronym}-${submission.local_id}`,
                                        bold: true,
                                    }),
                                    new TextRun({
                                        text: `${submission.title}`,
                                        break: 1,
                                    }),
                                    ...Object.entries(
                                        Object.groupBy(
                                            submission.authors,
                                            ({ affiliation }) => affiliation,
                                        ),
                                    ).map(
                                        ([key, value]) =>
                                            new TextRun({
                                                text: `${formatAuthors(value, {
                                                    delimiter: ", ",
                                                })}, ${key}, ${value[0].country}`,
                                                break: 1,
                                                italics: true,
                                            }),
                                    ),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
    );
    const table = new Table({
        rows: [...rows],
    });
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [table],
            },
        ],
    });
    return await Packer.toBuffer(doc);
};
