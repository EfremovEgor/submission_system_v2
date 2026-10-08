import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import { getUsersWithPrivileges } from "$src/lib/database/privileges";
import { withdrawSubmissionById } from "$src/lib/database/submissions";
import { sendRCCCSubmissionAuthorDeleted } from "$src/lib/email/priviliges.mailing";
import { requireSubmissionAuthor } from "$src/lib/managers/rights/submission/guards.server";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";

// Withdrawing happens only in the POST action: a GET (link, preload) must not change anything.
/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    if (!data.submission.withdrawn)
        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${data.submission.id}/author`,
        );
    const goBackUrl = `/author`;
    return { goBackUrl };
};

export const actions: Actions = {
    default: async ({ cookies, params }) => {
        const { submission, rights } = await requireSubmissionAuthor({
            cookies,
            params,
        });
        if (!rights.canDelete || submission.particiaption_confirmed)
            error(403);
        if (submission.withdrawn) return;
        await withdrawSubmissionById(submission.id);

        const conference = await getConferenceByAcronym(
            params.conferenceAcronym,
            {
                id: true,
                name: true,
                short_name: true,
            },
        );
        const recipients = await getUsersWithPrivileges(
            conference.id,
            { chairs: true },
            { title: true, first_name: true, last_name: true, email: true },
        );
        const authors = await prisma.author.findMany({
            select: {
                first_name: true,
                title: true,
                last_name: true,
            },
            where: {
                submission_id: submission.id,
            },
            orderBy: {
                id: "asc",
            },
        });
        for (const recipient of recipients.chairs) {
            try {
                await sendRCCCSubmissionAuthorDeleted(recipient.email, {
                    recipient,
                    submission,
                    conference,
                    authors,
                });
            } catch (e) {
                console.error(
                    `Withdrawal notice for submission ${submission.id} to ${recipient.email} failed`,
                    e,
                );
            }
        }
    },
};
