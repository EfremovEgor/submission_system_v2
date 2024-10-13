import prisma from "$src/lib/database/prisma";
import { type BaseSubmissionRights, Roles, userRights } from "../base.server";

export const chairRights: BaseSubmissionRights = {
    role: Roles.chair,
    canAccess: true,
    canEdit: true,
    canDelete: true,
    canViewAll: true,
};

export const checkForChairRights = async (
    conferenceId: number,
    userId: number,
) => {
    const chair = await prisma.chair.findFirst({
        where: {
            conference_id: conferenceId,
            user_id: userId,
        },
    });
    if (chair == null) return userRights;
    return chairRights;
};