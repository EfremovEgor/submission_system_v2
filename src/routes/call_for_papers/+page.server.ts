import { getConferences } from "$src/lib/database/conferences";
import { getUserProfile } from "$src/lib/database/users";
import { error } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }: { parent: any }) => {
    return {
        conferences: await getConferences({
            select: {
                short_name: true,
                acronym: true,
                name: true,
                start_date: true,
                submission_deadline: true,
            },
            orderBy: {
                start_date: "desc",
            },
        }),
    };
};
