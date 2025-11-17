export interface layoutUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    is_chair: boolean;
    is_loc: boolean;
}

export type SubmissionStatus =
    | "accepted"
    | "under_review"
    | "submitted"
    | "rejected";
