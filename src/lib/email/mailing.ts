import { EMAIL } from "$env/static/private";
import transporter from "./setup.server";
import { EmailTemplates, renderEmailTemplate } from "./templating";
export const MAILING_SETTINGS = {
    from: EMAIL,
};
export interface registrationEmailData {
    name: string;
    link: string;
}

export const sendRegistrationEmail = async (
    to: string,
    data: registrationEmailData,
) => {
    const subject = "Registration";
    const html = await renderEmailTemplate(EmailTemplates.registration, data);
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};

export interface coAuthorSubmissionCreatedData {
    submittingAuthor: {
        title: string;
        first_name: string;
        last_name: string;
    };
    correspondingAuthor: {
        title: string;
        first_name: string;
        last_name: string;
    };
    submissionDetails: {
        title: string;
        local_id: number;
        id: number;
        topic: string;
        presentation_format: string;
    };
    authors: Array<{
        title: string;
        last_name: string;
        is_presenter: boolean;
        affiliation: string;
        country: string;
    }>;
    conferenceDetails: {
        short_name: string;
        email: string;
        name: string;
    };
}

export const sendCoAuthorSubmissionCreatedEmail = async (
    to: string,
    data: coAuthorSubmissionCreatedData,
) => {
    const subject = "Submission created";
    const html = await renderEmailTemplate(
        EmailTemplates.coAuthorSubmissionCreated,
        data,
    );
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
