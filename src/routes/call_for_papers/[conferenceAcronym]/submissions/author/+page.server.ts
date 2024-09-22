import { getConferenceByAcronym } from "$src/lib/database/conferences";
import { getUserSubmissions } from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { error, redirect, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();

    if (data.user == null) redirect(302, "/sign-in");
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        short_name: true,
    });
    const submissions = await getUserSubmissions(data.user.id, {
        where: {
            conference: {
                acronym: params.conferenceAcronym,
            },
        },
        include: {
            authors: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            topic: {
                select: {
                    name: true,
                },
            },
        },
    });
    return { submissions, conference };
};
