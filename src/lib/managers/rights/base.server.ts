export interface BaseSubmissionRights {
    role: Roles;
    canAccess: boolean;
    canEdit: boolean;
    canDelete: boolean;
}
export enum Roles {
    any = "any",
    creator = "creator",
    correspondingAuthor = "corresponding",
    coAuthor = "co_author",
    user = "user",
}
