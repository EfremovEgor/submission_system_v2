import { getConferenceByAcronym } from "$src/lib/database/conferences";
import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ parent, params }) => {
    const data = await parent();

    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        id: true,
        short_name: true,
        name: true,
        acronym: true,
    });
    if (data.user == null) redirect(302, "/sign-in");

    return { conference: conference };
};
