import { signInUrl } from "$src/lib/redirects";
import { getConferenceByAcronym } from "$src/lib/database/conferences";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ parent, params, url }) => {
    const data = await parent();

    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        id: true,
        short_name: true,
        name: true,
        acronym: true,
        submission_deadline: true,
        confirmation_deadline: true,
    });
    if (data.user == null) redirect(302, signInUrl(url));

    return { conference: conference };
};
