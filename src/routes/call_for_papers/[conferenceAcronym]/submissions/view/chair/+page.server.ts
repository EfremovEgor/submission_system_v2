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
                    country: true,
                    affiliation: true,
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
            withdrawn: true,
            particiaption_confirmed: true,
            presentation_file: true,
            manuscript_file: true,
        },
        orderBy: {
            local_id: "asc",
        },
    });
    console.log(submissions);
    const rights = await checkForChairRights(conference.id, user.id);
    if (rights.role != Roles.chair) error(403);
    const symposiums = await prisma.symposium.findMany({
        where: {
            conference_id: conference.id,
        },
        select: {
            name: true,
            topics: {
                select: { name: true },
                orderBy: {
                    position: "asc",
                },
            },
        },
        orderBy: {
            position: "asc",
        },
    });

    if (symposiums.length == 0) {
        const topics = await prisma.topic.findMany({
            where: {
                conference_id: conference.id,
            },
            select: {
                name: true,
                id: true,
            },
        });
        return { submissions: submissions, topics, symposiums };
    }
    return { submissions: submissions, symposiums, topics: [] };
};
