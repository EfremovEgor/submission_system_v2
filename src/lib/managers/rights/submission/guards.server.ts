import { error, type Cookies } from "@sveltejs/kit";
import { authorizedRoute } from "$src/lib/auth.sever";
import prisma from "$src/lib/database/prisma";
import { redis } from "$src/lib/redis/redis";
import { resolveAuthorRights } from "./authors";
import { checkForChairRights, checkForLOCRights } from "./privileges";

// Form actions and +server.ts handlers don't run layout loads, so each of them
// must resolve the user and check rights on its own through these guards.

interface SubmissionRouteEvent {
    cookies: Cookies;
    params: Partial<Record<string, string>>;
}

const getRouteSubmission = async (params: SubmissionRouteEvent["params"]) => {
    const submissionId = Number(params.submissionId);
    if (!Number.isInteger(submissionId)) error(404);
    const submission = await prisma.submission.findFirst({
        where: {
            id: submissionId,
            conference: { acronym: params.conferenceAcronym },
        },
        include: {
            authors: {
                orderBy: {
                    id: "asc",
                },
            },
        },
    });
    if (submission == null) error(404);
    return submission;
};

export const requireSubmissionAuthor = async ({
    cookies,
    params,
}: SubmissionRouteEvent) => {
    const user = await authorizedRoute(cookies, redis);
    const submission = await getRouteSubmission(params);
    const rights = resolveAuthorRights(user, submission);
    if (!rights.canAccess) error(403);
    return { user, submission, rights };
};

export const requireSubmissionChair = async ({
    cookies,
    params,
}: SubmissionRouteEvent) => {
    const user = await authorizedRoute(cookies, redis);
    const submission = await getRouteSubmission(params);
    const rights = await checkForChairRights(submission.conference_id, user.id);
    if (!rights.canAccess) error(403);
    return { user, submission, rights };
};

// Whether the user may see a submission in any role: author, chair of its
// conference or LOC member for its topic.
export const canViewSubmission = async (
    user: { id: number; email: string },
    submission: Parameters<typeof resolveAuthorRights>[1] & {
        conference_id: number;
        topic_id: number;
    },
) => {
    if (resolveAuthorRights(user as any, submission).canAccess) return true;
    if ((await checkForChairRights(submission.conference_id, user.id)).canAccess)
        return true;
    return (
        await checkForLOCRights(
            submission.conference_id,
            user.id,
            submission.topic_id,
        )
    ).canAccess;
};

// Topics are linked to a conference either directly or through a symposium.
export const getConferenceTopic = async (
    conferenceId: number,
    topicId: number,
) => {
    if (!Number.isInteger(topicId)) return null;
    return prisma.topic.findFirst({
        where: {
            id: topicId,
            OR: [
                { conference_id: conferenceId },
                { symposium: { conference_id: conferenceId } },
            ],
        },
        select: { id: true, name: true },
    });
};

// Submissions close at 23:59:59.999 MSK of the deadline day
// (dates come from the DB as UTC midnight).
export const isSubmissionClosed = (submissionDeadline: Date | null) =>
    submissionDeadline != null &&
    new Date() >
        new Date(submissionDeadline.getTime() + 60 * 60 * 21 * 1000 - 1);
