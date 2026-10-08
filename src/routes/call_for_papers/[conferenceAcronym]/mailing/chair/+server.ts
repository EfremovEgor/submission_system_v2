import { DOMAIN } from "$env/static/private";
import { presentation_formats, PRIVILEGES, titles } from "$src/lib/aliases.js";
import { authorizedRoute } from "$src/lib/auth.sever";
import { getConferenceByAcronym } from "$src/lib/database/conferences.js";
import prisma from "$src/lib/database/prisma.js";
import { MAILING_SETTINGS } from "$src/lib/email/mailing.js";
import {
    findUnsupportedTag,
    renderPlaceholders,
} from "$src/lib/email/placeholders";
import transporter from "$src/lib/email/setup.server.js";
import { checkForChairRights } from "$src/lib/managers/rights/submission/privileges";
import { redis } from "$src/lib/redis/redis";
import { error, json } from "@sveltejs/kit";

export async function POST({ request, cookies, params }) {
    const user = await authorizedRoute(cookies, redis);
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        id: true,
        acronym: true,
        name: true,
        short_name: true,
        confirmation_deadline: true,
        presentation_deadline: true,
        manuscript_deadline: true,
        site_url: true,
        email: true,
    });
    if (conference == null) error(404);
    const rights = await checkForChairRights(conference.id, user.id);
    if (!rights.canAccess) error(403);

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
            mailing?: {
                allAuthors: boolean;
                allCorresponding: boolean;
            };
        };
    } = await request.json();
    if (
        typeof template != "string" ||
        typeof subject != "string" ||
        !Array.isArray(submissions)
    )
        error(422);
    const unsupportedTag =
        findUnsupportedTag(template) ?? findUnsupportedTag(subject);
    if (unsupportedTag != null)
        error(422, `Only <%= ... %> placeholders are supported: ${unsupportedTag}`);
    const onlyCorresponding = settings?.mailing?.allCorresponding ?? false;
    const { id: conferenceId, ...conferenceData } = conference;

    const selectedSubmissions = await prisma.submission.findMany({
        where: {
            id: { in: submissions.map((submission) => Number(submission.id)) },
            conference_id: conferenceId,
        },
        include: {
            authors: {
                where: onlyCorresponding ? { is_corresponding: true } : {},
                orderBy: { id: "asc" },
            },
            topic: {
                select: {
                    name: true,
                },
            },
        },
    });

    let sent = 0;
    let failed = 0;
    for (const submission of selectedSubmissions) {
        const submissionData = {
            ...submission,
            presentation_format:
                presentation_formats[submission.presentation_format],
            link: `${DOMAIN}/call_for_papers/${conference.acronym}/submissions/${submission.id}/${PRIVILEGES.author}`,
        };
        for (const author of submission.authors) {
            const data = {
                recipient: {
                    ...author,
                    title: titles[author.title],
                },
                submission: submissionData,
                conference: conferenceData,
            };
            try {
                await transporter.sendMail({
                    from: MAILING_SETTINGS.from,
                    to: author.email,
                    subject: renderPlaceholders(subject, data, {
                        escape: false,
                    }),
                    html: renderPlaceholders(template, data),
                });
                sent++;
            } catch (e) {
                console.error(`Mailing to ${author.email} failed`, e);
                failed++;
            }
        }
    }

    return json({ status: "sent", sent, failed });
}
