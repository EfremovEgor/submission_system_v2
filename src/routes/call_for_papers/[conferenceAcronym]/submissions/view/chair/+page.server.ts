import prisma from "$src/lib/database/prisma.js";
import { Roles } from "$src/lib/managers/rights/base.server";
import { checkForChairRights } from "$src/lib/managers/rights/submission/privileges";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, cookies, request, parent }) => {
    const { conference, user } = await parent();
    const submissions = await prisma.submission.findMany({
        where: {
            conference_id: conference.id,
        },
        select: {
            local_id: true,
            id: true,
            authors: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            title: true,
            topic: {
                select: {
                    name: true,
                    symposium: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            presentation_format: true,
            created_at: true,
            status: true,
        },
        orderBy: {
            local_id: "asc",
        },
    });
    const rights = await checkForChairRights(conference.id, user.id);
    if (rights.role != Roles.chair) error(403);
    return { submissions: submissions };
};
