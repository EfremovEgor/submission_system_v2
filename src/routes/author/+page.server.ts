import prisma from "$src/lib/database/prisma";
import { getUserSubmissions } from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { error, redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }: { parent: any }) => {
    const data = await parent();

    if (data.user == null) redirect(300, "/sign-in");
    const userProfile = await getUserProfile(data.user.id);
    const conferencesSubmittedIn = await prisma.conference.findMany({
        select: {
            short_name: true,
            start_date: true,
            acronym: true,
        },
        where: {
            submissions: { some: { created_by_id: data.user.id } },
        },
    });
    return { userProfile, conferencesSubmittedIn };
};
