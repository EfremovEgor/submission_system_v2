import prisma from "$src/lib/database/prisma.js";
import { error } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ url, cookies, request, parent }) => {
    const { user } = await parent();
    const conferences = await prisma.conference.findMany({
        select: {
            name: true,
            acronym: true,
        },
        where: {
            chairs: {
                some: {
                    user_id: user.id,
                },
            },
        },
    });
    return { conferences: conferences };
};
