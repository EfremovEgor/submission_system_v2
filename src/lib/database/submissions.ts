import type { Prisma } from "@prisma/client";
import prisma from "./prisma";

export const createSubmission = async (
    submissionCreate: Prisma.SubmissionCreateInput,
    conferenceId: number,
) => {
    const rawLocalId: string | null =
        await prisma.$queryRaw`SELECT MAX(local_id) AS max FROM submissions WHERE submissions.conference_id=${conferenceId}`;
    console.log(rawLocalId);
    let localId = 0;

    if (rawLocalId[0]["max"] == null) {
        localId = 1;
    } else {
        localId = parseInt(rawLocalId[0]["max"]) + 1;
    }
    console.log(localId);
    const submission = await prisma.submission.create({
        data: {
            ...submissionCreate,
            local_id: localId,
        },
    });

    return submission;
};
