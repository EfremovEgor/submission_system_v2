export interface form {
    title: string;
    abstarct: string;
    keywords: string;
    topic: number;
    presentation_format: string;
    funding?: string;
}
export interface editForm extends form {
    local_id: number;
}
