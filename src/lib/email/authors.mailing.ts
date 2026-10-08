import { presentation_formats, titles } from "../aliases";
import { MAILING_SETTINGS } from "./mailing";
import transporter from "./setup.server";
import { renderEmailTemplate } from "./templating";

const PrivilegesTemplatesFolder = "authors/";
export const enum AuthorTemplates {
    submission_accepted = PrivilegesTemplatesFolder +
        "submission_accepted.html",
    submission_rejected = PrivilegesTemplatesFolder +
        "submission_rejected.html",
}

// Deadlines are optional per conference; an unset one must not break the email.
const formatDeadline = (deadline: Date | null) =>
    deadline == null
        ? "TBA"
        : `${deadline.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${deadline.getFullYear()}, ${deadline.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`;

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
            presentation_format: string;
            topic: {
                name: string;
            };
        };
        conference: {
            name: string;
            short_name: string;
            site_url: string;
            email: string;
            confirmation_deadline: Date | null;
            manuscript_deadline: Date | null;
            presentation_deadline: Date | null;
        };
    },
) => {
    const subject = `Your paper #${rawData.submission.local_id} has been accepted for presentation at the ${rawData.conference.short_name}`;
    let data = {
        ...rawData,
        conference: {
            ...rawData.conference,
            confirmation_deadline: formatDeadline(
                rawData.conference.confirmation_deadline,
            ),
            manuscript_deadline: formatDeadline(
                rawData.conference.manuscript_deadline,
            ),
            presentation_deadline: formatDeadline(
                rawData.conference.presentation_deadline,
            ),
        },
    };
    data.submission.presentation_format =
        presentation_formats[rawData.submission.presentation_format];
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

export const sendSubmissionRejected = async (
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
            presentation_format: string;
            topic: {
                name: string;
            };
        };
        conference: {
            name: string;
            short_name: string;
            site_url: string;
            email: string;
            confirmation_deadline: Date | null;
            manuscript_deadline: Date | null;
            presentation_deadline: Date | null;
        };
    },
) => {
    const subject = `Your paper #${rawData.submission.local_id} has been rejected for presentation at the ${rawData.conference.short_name}`;
    let data = {
        ...rawData,
        conference: {
            ...rawData.conference,
            confirmation_deadline: formatDeadline(
                rawData.conference.confirmation_deadline,
            ),
            manuscript_deadline: formatDeadline(
                rawData.conference.manuscript_deadline,
            ),
            presentation_deadline: formatDeadline(
                rawData.conference.presentation_deadline,
            ),
        },
    };
    data.submission.presentation_format =
        presentation_formats[rawData.submission.presentation_format];
    data.recipient.title = titles[data.recipient.title] ?? data.recipient.title;
    const html = await renderEmailTemplate(
        AuthorTemplates.submission_rejected,
        data,
    );
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
