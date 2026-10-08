import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import {
    parseSubmissionAuthors,
    syncSubmissionAuthors,
} from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import {
    getConferenceTopic,
    requireSubmissionChair,
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
    let authors = data.submission.authors;

    return { conference, userProfile, authors };
};

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const { submission: currentSubmission, rights } =
            await requireSubmissionChair({ cookies, params });
        if (!rights.canEdit) error(403);

        const formData = Object.fromEntries(await request.formData());
        const topic = await getConferenceTopic(
            currentSubmission.conference_id,
            parseInt(String(formData.topic)),
        );
        if (topic == null) error(400, "Unknown topic");
        const authors = parseSubmissionAuthors(formData.authors);
        const updatedSubmissionData: Prisma.SubmissionUpdateInput = {
            title: String(formData.title),
            abstract: String(formData.abstract),
            keywords: String(formData.keywords),
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

        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${submission.id}/chair`,
        );
    },
};
