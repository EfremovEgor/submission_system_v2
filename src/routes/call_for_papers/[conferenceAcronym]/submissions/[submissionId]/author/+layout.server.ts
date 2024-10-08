import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import {
    getSubmissionById,
    getUserSubmissions,
} from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { resolveAuthorRights } from "$src/lib/managers/rights/submission/authors";
import type { Prisma } from "@prisma/client";
import { error, redirect, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    const conference = data.conference;
    if (data.user == null) redirect(302, "/sign-in");
    // const conference = await getConferenceByAcronym(params.conferenceAcronym, {
    //     id: true,
    //     short_name: true,
    // });
    const submission = await getSubmissionById(parseInt(params.submissionId), {
        include: {
            topic: {
                select: {
                    name: true,
                },
            },
            authors: true,
        },
    });
    if (submission == null) error(404);
    if (submission.conference_id != conference.id) error(404);
    const rights = resolveAuthorRights(data.user, submission);
    if (!rights.canAccess) error(403);
    return { submission, rights };
};
