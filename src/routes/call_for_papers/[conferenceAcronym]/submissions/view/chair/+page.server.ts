import prisma from "$src/lib/database/prisma.js";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, cookies, request, parent }) => {
    const { conference } = await parent();
    const submissions = await prisma.submission.findMany({
        where: {
            conference_id: conference.id,
        },
        select: {
            local_id: true,
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
    });
    return { submissions: submissions };
};
