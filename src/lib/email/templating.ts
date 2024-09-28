import { readFile } from "fs/promises";
import { render } from "ejs";
export const enum EmailTemplates {
    registration = "registration.html",
    createSubmission = "create_submission.html",
    recoverPassword = "password_recovery.html",
}
export const readEmailTemplate = async (template: EmailTemplates) => {
    return await readFile(`email_templates/${template.toString()}`, "utf-8");
};

export const renderTemplateString = (templateString: string, data: object) => {
    return render(templateString, data);
};

export const renderEmailTemplate = async (
    template: EmailTemplates,
    data: object,
) => {
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
