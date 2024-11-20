import { presentation_formats, titles } from "$src/lib/aliases.js";
import { getConferenceByAcronym } from "$src/lib/database/conferences.js";
import prisma from "$src/lib/database/prisma.js";
import { MAILING_SETTINGS } from "$src/lib/email/mailing.js";
import transporter from "$src/lib/email/setup.server.js";
import { json } from "@sveltejs/kit";
import { render } from "ejs";

export async function POST({ request, cookies, params }) {
    const {
        template,
        subject,
        submissions,
        settings,
    }: {
        template: string;
        subject: string;
        submissions: {
            id: number;
        }[];
        settings: {
            allAuthors: boolean;
            allCorresponding: boolean;
        };
    } = await request.json();
    console.log(submissions);
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        name: true,
        short_name: true,
        confirmation_deadline: true,
        presentation_deadline: true,
        manuscript_deadline: true,
        site_url: true,
        email: true,
    });
    submissions.forEach(async (_submission) => {
        const submission = await prisma.submission.findFirst({
            where: {
                id: _submission.id,
            },
            include: {
                authors: {
                    where: {
                        submission_id: _submission.id,
                        ...(settings.allCorresponding && {
                            is_corresponding: true,
                        }),
                    },
                },
                topic: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        submission.authors.forEach(async (author) => {
            const html = render(template, {
                recipient: {
                    ...author,
                    title: titles[author.title],
                },
                submission: {
                    ...submission,
                    presentation_format:
                        presentation_formats[submission.presentation_format],
                },
                conference: conference,
            });
            await transporter.sendMail({
                from: MAILING_SETTINGS.from,
                to: author.email,
                subject: render(subject, {
                    recipient: {
                        ...author,
                        title: titles[author.title],
                    },
                    submission: submission,
                    conference: conference,
                }),
                html: html,
            });
        });
    });

    return json({ status: "sent" });
}
