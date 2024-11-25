import prisma from "$src/lib/database/prisma.js";
import { Roles } from "$src/lib/managers/rights/base.server";
import { checkForLOCRights } from "$src/lib/managers/rights/submission/privileges";
import { error, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, cookies, request, parent }) => {
    const { conference, user } = await parent();
    const topics = await prisma.lOC.findMany({
        select: {
            topic_id: true,
        },
        where: {
            conference_id: conference.id,
            user_id: user.id,
        },
    });
    const topicsId = topics.map(({ topic_id }) => topic_id);
    const submissions = await prisma.submission.findMany({
        where: {
            conference_id: conference.id,
            topic_id: {
                in: topicsId,
            },
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
            withdrawn: true,
            particiaption_confirmed: true,
            presentation_file: true,
        },
        orderBy: {
            local_id: "asc",
        },
    });
    const rights = await checkForLOCRights(conference.id, user.id);
    if (rights.role != Roles.chair) error(403);
    const symposiums = await prisma.symposium.findMany({
        where: {
            conference_id: conference.id,
            topics: {
                some: {
                    id: {
                        in: topicsId,
                    },
                },
            },
        },
        select: {
            name: true,
            topics: {
                select: { name: true },
                orderBy: {
                    position: "asc",
                },
                where: {
                    id: {
                        in: topicsId,
                    },
                },
            },
        },
        orderBy: {
            position: "asc",
        },
    });
    return { submissions: submissions, symposiums };
};
