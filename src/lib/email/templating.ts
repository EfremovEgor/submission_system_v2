import { readFile } from "fs/promises";
import { render } from "ejs";
export const enum EmailTemplates {
    registration = "registration.html",
    createSubmission = "create_submission.html",
    updateSubmission = "update_submission.html",
    recoverPassword = "password_recovery.html",
    coAuthorSubmissionCreated = "create_submission_co_author.html",
    submissionUnderReview = "submission_under_review.html",
}

export const readEmailTemplate = async (template: string) => {
    return await readFile(`email_templates/${template.toString()}`, "utf-8");
};

export const renderTemplateString = (templateString: string, data: object) => {
    return render(templateString, data);
};

export const renderEmailTemplate = async (template: string, data: object) => {
    const templateString = await readEmailTemplate(template);
    return renderTemplateString(templateString, data);
};

export interface CreateSubmissionTemplateData {
    corresponding_title: string;
    first_name: string;
    last_name: string;
    title: string;
    local_id: number;
    submission_id: number;

    presentation_format: string;
    topic: string;
    authors: Array<{
        title: string;
        last_name: string;
        is_presenter: boolean;
        affiliation: string;
        country: string;
    }>;

    conference_short_name: string;
    conference_email: string;
    conference_name: string;
}
export const renderCreateSubmissionTemplate = async (
    data: CreateSubmissionTemplateData,
) => {
    return renderEmailTemplate(EmailTemplates.createSubmission, data);
};
export interface UpdateSubmissionTemplateData
    extends CreateSubmissionTemplateData {}
export const renderUpdateSubmissionTemplate = async (
    data: UpdateSubmissionTemplateData,
) => {
    return renderEmailTemplate(EmailTemplates.updateSubmission, data);
};
export interface RecoverPasswordTemplateData {
    title: string;
    first_name: string;
    last_name: string;
    link: string;
}
export const renderRecoverPasswordTemplate = async (
    data: RecoverPasswordTemplateData,
) => {
    return renderEmailTemplate(EmailTemplates.recoverPassword, data);
};

export interface SubmissionUnderReviewTemplateData
    extends CreateSubmissionTemplateData {}
export const renderSubmissionUnderReviewTemplate = async (
    data: SubmissionUnderReviewTemplateData,
) => {
    return renderEmailTemplate(EmailTemplates.submissionUnderReview, data);
};
