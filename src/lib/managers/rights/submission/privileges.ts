import prisma from "$src/lib/database/prisma";
import { type BaseSubmissionRights, Roles, userRights } from "../base.server";

export const chairRights: BaseSubmissionRights = {
    role: Roles.chair,
    canAccess: true,
    canEdit: true,
    canDelete: true,
    canViewAll: true,
};
export const locRights: BaseSubmissionRights = {
    role: Roles.chair,
    canAccess: true,
    canEdit: false,
    canDelete: false,
    canViewAll: false,
};
// LOC membership is per topic: pass topicId to check access to a specific submission.
export const checkForLOCRights = async (
    conferenceId: number,
    userId: number,
    topicId?: number,
) => {
    const loc = await prisma.lOC.findFirst({
        where: {
            conference_id: conferenceId,
            user_id: userId,
            ...(topicId != undefined && { topic_id: topicId }),
        },
    });
    if (loc == null) return structuredClone(userRights);
    return structuredClone(locRights);
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
    if (chair == null) return structuredClone(userRights);
    return structuredClone(chairRights);
};
