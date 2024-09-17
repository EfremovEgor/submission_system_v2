import {
    getConferenceByAcronym,
    getConferences,
} from "$src/lib/database/conferences";
import { getUserProfile } from "$src/lib/database/users";
import { error, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        short_name: true,
        acronym: true,
        name: true,
        start_date: true,
        submission_deadline: true,
        description: true,
        site_url: true,
    });
    if (conference == null) {
        error(404);
    }
    return { conference };
};
