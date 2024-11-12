export interface BaseSubmissionRights {
    role: Roles;
    canAccess: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAll?: boolean;
    canUpload: boolean;
}

export enum Roles {
    any = "any",
    creator = "creator",
    correspondingAuthor = "corresponding",
    coAuthor = "co_author",
    user = "user",
    chair = "chair",
}

export const userRights: BaseSubmissionRights = {
    role: Roles.user,
    canAccess: false,
    canEdit: false,
    canDelete: false,
};
