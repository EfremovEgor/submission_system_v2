import type { Prisma, Submission, User } from "@prisma/client";
import { Roles, userRights, type BaseSubmissionRights } from "../base.server";
import { SubmissionStatuses } from "$src/lib/enums";

const creatorRights: BaseSubmissionRights = {
    role: Roles.creator,
    canAccess: true,
    canEdit: true,
    canDelete: true,
    canUpload: true,
};
const correspondingAuthorRights: BaseSubmissionRights = {
    role: Roles.correspondingAuthor,
    canAccess: true,
    canEdit: true,
    canDelete: true,
    canUpload: true,
};
const coAuthorRights: BaseSubmissionRights = {
    role: Roles.coAuthor,
    canAccess: true,
    canEdit: false,
    canDelete: false,
    canUpload: false,
};

export const resolveAuthorRights = (
    user: User,
    submission: {
        created_by_id: number;
        status: SubmissionStatuses;
        authors: {
            is_corresponding: boolean;

            email: string;
        }[];
    },
): BaseSubmissionRights => {
    let rights = structuredClone(userRights);
    if (submission.created_by_id == user.id) {
        rights = structuredClone(creatorRights);
    } else {
        submission.authors.forEach((author) => {
            if (author.email == user.email)
                rights = structuredClone(
                    author.is_corresponding
                        ? correspondingAuthorRights
                        : coAuthorRights,
                );
        });
    }
    if (
        submission.status != SubmissionStatuses.submitted &&
        submission.status != SubmissionStatuses.under_review
    ) {
        rights.canEdit = false;
    }
    return rights;
};
