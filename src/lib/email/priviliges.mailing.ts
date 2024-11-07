import { formatAuthors } from "../utils.client";
import { MAILING_SETTINGS } from "./mailing";
import transporter from "./setup.server";
import { renderEmailTemplate } from "./templating";

/* 
RLCCC - Reviewer, LOC, Co-Chair, Chair
RCCC - Reviewer, Co-Chair, Chair
RCC - Reviewer, Co-Chair
RC - Reviewer, Chair
CCC - Co-Chair, Chair/
*/
const PrivilegesTemplatesFolder = "privileges/";
const RCCCTemplatesFolder = PrivilegesTemplatesFolder + "rccc/";
export const enum RCCCTemplates {
    submission_author_updated = RCCCTemplatesFolder +
        "submissions/submission_author_updated.html",
    submission_author_deleted = RCCCTemplatesFolder +
        "submissions/submission_author_deleted.html",
}
export const sendRCCCSubmissionAuthorUpdated = async (
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
        };
        authors: {
            first_name: string;
            last_name: string;
            title: string;
        }[];
    },
) => {
    const subject = `Update Submission #${rawData.submission.local_id} for ${rawData.conference.short_name}`;
    const data = {
        ...rawData,
        authors: formatAuthors(rawData.authors, { convertTitle: true }),
    };
    console.log(data);
    const html = await renderEmailTemplate(
        RCCCTemplates.submission_author_updated,
        data,
    );
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
export const sendRCCCSubmissionAuthorDeleted = async (
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
        };
        conference: {
            name: string;
            short_name: string;
        };
        authors: {
            first_name: string;
            last_name: string;
            title: string;
        }[];
    },
) => {
    const subject = `Delete Submission #${rawData.submission.local_id} for ${rawData.conference.short_name}`;
    const data = {
        ...rawData,
        authors: formatAuthors(rawData.authors, { convertTitle: true }),
    };
    const html = await renderEmailTemplate(
        RCCCTemplates.submission_author_deleted,
        data,
    );
    await transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: to,
        subject: subject,
        html: html,
    });
};
