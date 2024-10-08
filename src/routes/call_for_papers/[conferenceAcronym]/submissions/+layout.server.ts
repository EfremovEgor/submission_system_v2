import { getConferenceByAcronym } from "$src/lib/database/conferences";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent, params }) => {
    const data = await parent();

    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        id: true,
        short_name: true,
        name: true,
    });
    return { conference: conference };
};
