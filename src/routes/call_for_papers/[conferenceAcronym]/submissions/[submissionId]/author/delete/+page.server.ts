import {
    getConferenceByAcronym,
    getConferenceById,
    getConferences,
} from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import { getUsersWithPrivileges } from "$src/lib/database/privileges";
import {
    deleteSubmissionById,
    getSubmissionById,
    withdrawSubmissionById,
} from "$src/lib/database/submissions";
import { sendRCCCSubmissionAuthorDeleted } from "$src/lib/email/priviliges.mailing";
import type { Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        id: true,
        name: true,
        short_name: true,
    });
    const recipients = await getUsersWithPrivileges(
        data.conference.id,
        { chairs: true },
        { title: true, first_name: true, last_name: true, email: true },
    );

    let authors = await prisma.author.findMany({
        select: {
            first_name: true,
            title: true,
            last_name: true,
        },
        where: {
            submission_id: data.submission.id,
        },
    });
    recipients.chairs.forEach(async (recipient) => {
        await sendRCCCSubmissionAuthorDeleted(recipient.email, {
            recipient,
            submission: data.submission,
            conference: conference,
            authors,
        });
    });
    await withdrawSubmissionById(parseInt(data.submission.id));
    const goBackUrl = `/author`;
    return { goBackUrl };
};
