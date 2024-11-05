import type { Prisma, Submission, User } from "@prisma/client";
import { Roles, userRights, type BaseSubmissionRights } from "../base.server";
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
        console.log("creator");
    } else {
        submission.authors.forEach((author) => {
            if (author.email == user.email)
                rights = structuredClone(
                    author.is_corresponding
                        ? correspondingAuthorRights
                        : coAuthorRights,
                );
        });
        console.log("co-author");
    }
    if (submission.status != SubmissionStatuses.submitted) {
        console.log(submission.status);
        rights.canEdit = false;
    }
    console.debug(rights);
    return rights;
};
