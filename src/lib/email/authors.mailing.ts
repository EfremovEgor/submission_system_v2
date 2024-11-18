import { titles } from "../aliases";
import { MAILING_SETTINGS } from "./mailing";
import transporter from "./setup.server";
import { renderEmailTemplate } from "./templating";

const PrivilegesTemplatesFolder = "authors/";
export const enum AuthorTemplates {
    submission_accepted = PrivilegesTemplatesFolder +
        "submission_accepted.html",
}

export const sendSubmissionAccepted = async (
    to: string,
    rawData: {
        recipient: {
            title: string;
            first_name: string;
            last_name: string;
        };
        submission: {
            local_id: number;
            title: string;
            link: string;
        };
        conference: {
            name: string;
            short_name: string;
            site_url: string;
            email: string;
        };
    },
) => {
    const subject = `Your paper #${rawData.submission.local_id} has been accepted for presentation at the ${rawData.conference.short_name}`;
    let data = {
        ...rawData,
        conference: {
            ...rawData.conference,
            submission_deadline: new Date().toLocaleString(),
        },
    };
    data.recipient.title = titles[data.recipient.title] ?? data.recipient.title;
    const html = await renderEmailTemplate(
        AuthorTemplates.submission_accepted,
        data,
    );
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
