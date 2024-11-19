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
            confirmation_deadline: Date;
            manuscript_deadline: Date;
            presentation_deadline: Date;
        };
    },
) => {
    const subject = `Your paper #${rawData.submission.local_id} has been accepted for presentation at the ${rawData.conference.short_name}`;
    const confirmationDeadline = rawData.conference.confirmation_deadline;
    const manuscriptDeadline = rawData.conference.manuscript_deadline;
    const presentationDeadline = rawData.conference.presentation_deadline;
    let data = {
        ...rawData,
        conference: {
            ...rawData.conference,
            confirmation_deadline: `${confirmationDeadline.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${confirmationDeadline.getFullYear()}, ${confirmationDeadline.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`,
            manuscript_deadline: `${manuscriptDeadline.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${manuscriptDeadline.getFullYear()}, ${manuscriptDeadline.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`,
            presentation_deadline: `${presentationDeadline.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${presentationDeadline.getFullYear()}, ${presentationDeadline.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`,
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
