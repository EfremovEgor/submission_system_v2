import type { Prisma } from "@prisma/client";
import prisma from "./prisma";

export const createSubmission = async (
    submissionCreate: Prisma.SubmissionCreateInput,
    conferenceId: number,
) => {
    const rawLocalId: string | null =
        await prisma.$queryRaw`SELECT MAX(local_id) AS max FROM submissions WHERE submissions.conference_id=${conferenceId}`;
    let localId = 0;

    if (rawLocalId[0]["max"] == null) {
        localId = 1;
    } else {
        localId = parseInt(rawLocalId[0]["max"]) + 1;
    }
    const submission = await prisma.submission.create({
        data: {
            ...submissionCreate,
            local_id: localId,
        },
    });

    return submission;
};

export const getUserSubmissions = async (
    userId: number,
    fields: Prisma.SubmissionSelect,
) => {
    const submissions = await prisma.submission.findMany({
        where: { created_by_id: userId },
        select: fields,
    });
    return submissions;
};
export const getSubmissionById = async (
    submissionId: number,
    fields: Prisma.SubmissionSelect = {},
) => {
    const submissions = await prisma.submission.findFirst({
        where: { id: submissionId },
        ...(Object.keys(fields).length && { select: fields }),
    });
    return submissions;
};
