import { DOMAIN, EMAIL } from "$env/static/private";
import { presentation_formats, PRIVILEGES, titles } from "$src/lib/aliases";
import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import { getUsersWithPrivileges } from "$src/lib/database/privileges";
import {
    parseSubmissionAuthors,
    syncSubmissionAuthors,
} from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { sendRCCCSubmissionAuthorUpdated } from "$src/lib/email/priviliges.mailing";
import transporter from "$src/lib/email/setup.server";
import { renderUpdateSubmissionTemplate } from "$src/lib/email/templating";
import {
    getConferenceTopic,
    isSubmissionClosed,
    requireSubmissionAuthor,
} from "$src/lib/managers/rights/submission/guards.server";
import { Prisma } from "@prisma/client";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    if (!data.rights.canEdit) error(403);
    if (data.user == null) redirect(302, "/sign-in");
    const userProfile = await getUserProfile(data.user.id);
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        short_name: true,
        acronym: true,
        name: true,
        start_date: true,
        submission_deadline: true,
        description: true,
        site_url: true,
        settings: {
            select: {
                presentation_formats: true,
            },
        },
        symposiums: {
            select: {
                name: true,
                position: true,
                topics: {
                    select: {
                        hint: true,
                        id: true,
                        name: true,
                    },
                    orderBy: {
                        position: "asc",
                    },
                },
            },
            orderBy: {
                position: "asc",
            },
        },
        topics: {
            select: {
                hint: true,
                id: true,
                name: true,
            },
            orderBy: {
                position: "asc",
            },
        },
    });
    if (conference == null) {
        error(404);
    }
    if (isSubmissionClosed(conference.submission_deadline))
        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${data.submission.id}/author`,
        );
    let authors = data.submission.authors;

    return { conference, userProfile, authors };
};

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const {
            user,
            submission: currentSubmission,
            rights,
        } = await requireSubmissionAuthor({ cookies, params });
        if (!rights.canEdit) error(403);
        const conference = await getConferenceByAcronym(
            params.conferenceAcronym,
            {
                id: true,
                name: true,
                email: true,
                short_name: true,
                submission_deadline: true,
            },
        );
        if (isSubmissionClosed(conference.submission_deadline))
            error(403, "The submission deadline has passed");

        const formData = Object.fromEntries(await request.formData());
        const topic = await getConferenceTopic(
            conference.id,
            parseInt(String(formData.topic)),
        );
        if (topic == null) error(400, "Unknown topic");
        const authors = parseSubmissionAuthors(formData.authors);
        const updatedSubmissionData: Prisma.SubmissionUpdateInput = {
            title: String(formData.title),
            abstract: String(formData.abstract),
            keywords: String(formData.keywords),
            funding:
                formData.funding == undefined
                    ? undefined
                    : String(formData.funding),
            topic: {
                connect: {
                    id: topic.id,
                },
            },
            presentation_format: String(formData.presentation_format),
        };
        const submission = await prisma.$transaction(async (tx) => {
            await syncSubmissionAuthors(tx, currentSubmission.id, authors);
            return tx.submission.update({
                where: {
                    id: currentSubmission.id,
                },
                data: updatedSubmissionData,
            });
        });

        const emailAuthors = authors.map((author) => ({
            ...author,
            title: titles[author.title],
        }));
        const sendUpdateEmail = async (recipient: {
            email: string;
            title: string;
            first_name: string;
            last_name: string;
        }) => {
            const html = await renderUpdateSubmissionTemplate({
                conference_email: conference.email,
                corresponding_title: recipient.title,
                first_name: recipient.first_name,
                last_name: recipient.last_name,
                title: submission.title,
                local_id: submission.local_id,
                submission_id: submission.id,
                presentation_format:
                    presentation_formats[submission.presentation_format],
                topic: topic.name,
                authors: emailAuthors,
                conference_short_name: conference.short_name,
                conference_name: conference.name,
            });
            await transporter.sendMail({
                from: `${EMAIL}`,
                to: `${recipient.email}`,
                subject: `Your paper #${submission.local_id} for the ${conference.short_name} has been updated`,
                html: html,
            });
        };
        const notify = async (to: string, send: () => Promise<void>) => {
            try {
                await send();
            } catch (e) {
                console.error(
                    `Update notice for submission ${submission.id} to ${to} failed`,
                    e,
                );
            }
        };

        await notify(user.email, () =>
            sendUpdateEmail({ ...user, title: titles[user.title] }),
        );
        for (const author of emailAuthors)
            if (author.email != user.email && author.is_corresponding)
                await notify(author.email, () => sendUpdateEmail(author));
        const recipients = await getUsersWithPrivileges(
            conference.id,
            { chairs: true },
            { title: true, first_name: true, last_name: true, email: true },
        );
        for (const recipient of recipients.chairs)
            await notify(recipient.email, () =>
                sendRCCCSubmissionAuthorUpdated(recipient.email, {
                    recipient,
                    submission: {
                        ...submission,
                        link: `${DOMAIN}/call_for_papers/${params.conferenceAcronym}/submissions/${submission.id}/${PRIVILEGES.chair}`,
                    },
                    conference: {
                        name: conference.name,
                        short_name: conference.short_name,
                    },
                    authors,
                }),
            );
        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${submission.id}/author`,
        );
    },
};
