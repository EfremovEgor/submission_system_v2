import type { Prisma, User } from "@prisma/client";
import prisma from "./prisma";
export const getUsersWithPrivileges = async (
    conferenceId: number,
    privileges: {
        reviewers?: boolean;
        coChairs?: boolean;
        chairs?: boolean;
        locs?: boolean;
    },
    select: Prisma.UserSelect,
) => {
    let chairs = [];
    if (privileges.chairs) {
        chairs = await prisma.user.findMany({
            select: select,
            where: {
                chair: {
                    some: {
                        conference_id: conferenceId,
                    },
                },
            },
        });
    }
    return { chairs: chairs };
};
