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
    transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
