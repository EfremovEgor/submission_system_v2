import type { Prisma, Submission, User } from "@prisma/client";
import { Roles, type BaseSubmissionRights } from "../base.server";
import { SubmissionStatuses } from "$src/lib/enums";

const creatorRights: BaseSubmissionRights = {
    role: Roles.creator,
    canAccess: true,
    canEdit: true,
    canDelete: true,
};
const correspondingAuthorRights: BaseSubmissionRights = {
    role: Roles.correspondingAuthor,
    canAccess: true,
    canEdit: true,
    canDelete: true,
};
const coAuthorRights: BaseSubmissionRights = {
    role: Roles.coAuthor,
    canAccess: true,
    canEdit: false,
    canDelete: false,
};
const userRights: BaseSubmissionRights = {
    role: Roles.user,
    canAccess: false,
    canEdit: false,
    canDelete: false,
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
    if (submission.status != SubmissionStatuses.submitted)
        return {
            role: Roles.any,
            canAccess: true,
            canEdit: false,
            canDelete: false,
        };
    if (submission.created_by_id == user.id) return creatorRights;
    let rights = userRights;
    submission.authors.forEach((author) => {
        if (author.email == user.email)
            rights = author.is_corresponding
                ? correspondingAuthorRights
                : coAuthorRights;
    });
    return rights;
};
