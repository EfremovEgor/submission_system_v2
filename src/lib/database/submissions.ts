import { error } from "@sveltejs/kit";
import type { Prisma } from "@prisma/client";
import prisma from "./prisma";

export const createSubmission = async (
    submissionCreate: Prisma.SubmissionCreateInput,
    conferenceId: number,
) => {
    // The per-conference lock keeps concurrent submissions from getting the same local_id.
    return prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${conferenceId}::bigint)`;
        const rawLocalId: { max: number | null }[] =
            await tx.$queryRaw`SELECT MAX(local_id) AS max FROM submissions WHERE submissions.conference_id=${conferenceId}`;
        const max = rawLocalId[0]?.max;
        const localId = max == null ? 1 : Number(max) + 1;
        return tx.submission.create({
            data: {
                ...submissionCreate,
                local_id: localId,
            },
        });
    });
};

export interface SubmissionAuthorInput {
    title: string;
    email: string;
    first_name: string;
    last_name: string;
    affiliation: string;
    country: string;
    is_presenter: boolean;
    is_corresponding: boolean;
    web_page: string | null;
}

// Parses the JSON "authors" field posted by the submission forms.
export const parseSubmissionAuthors = (
    rawAuthors: FormDataEntryValue | undefined,
): SubmissionAuthorInput[] => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(String(rawAuthors));
    } catch {
        error(400, "Invalid authors");
    }
    if (
        !Array.isArray(parsed) ||
        parsed.length == 0 ||
        parsed.some((author) => typeof author?.email != "string")
    )
        error(400, "At least one author with an email is required");
    return parsed.map((author) => ({
        title: author.title,
        email: author.email,
        first_name: author.first_name,
        last_name: author.last_name,
        affiliation: author.affiliation,
        country: author.country,
        is_presenter: author.is_presenter,
        is_corresponding: author.is_corresponding,
        web_page: author.web_page,
    }));
};

// Updates authors matched by email, creates the new ones in form order and removes the rest.
export const syncSubmissionAuthors = async (
    tx: Prisma.TransactionClient,
    submissionId: number,
    authors: SubmissionAuthorInput[],
) => {
    await tx.author.deleteMany({
        where: {
            submission_id: submissionId,
            email: { notIn: authors.map((author) => author.email) },
        },
    });
    for (const updatedAuthor of authors) {
        const author = await tx.author.findFirst({
            where: {
                submission_id: submissionId,
                email: updatedAuthor.email,
            },
        });
        if (author != null) {
            await tx.author.update({
                where: {
                    id: author.id,
                },
                data: updatedAuthor,
            });
        } else {
            await tx.author.create({
                data: {
                    ...updatedAuthor,
                    submission_id: submissionId,
                },
            });
        }
    }
};

export const getUserSubmissions = async (
    userId: number,
    args: Prisma.SubmissionFindManyArgs = {},
) => {
    const submissions = await prisma.submission.findMany({
        where: { created_by_id: userId },
        orderBy: { created_at: "desc" },
        ...args,
    });
    return submissions;
};
export const getSubmissionById = async (
    submissionId: number,
    fields: Prisma.SubmissionFindFirstArgs,
) => {
    const submissions = await prisma.submission.findFirst({
        where: { id: submissionId },
        ...fields,
    });
    return submissions;
};
export const deleteSubmissionById = async (submissionId: number) => {
    await prisma.submission.delete({
        where: {
            id: submissionId,
        },
    });
};
export const withdrawSubmissionById = async (submissionId: number) => {
    await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            withdrawn: true,
            particiaption_confirmed:false,
        },
    });
};
