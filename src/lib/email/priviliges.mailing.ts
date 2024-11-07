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
    data: {
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
    },
) => {
    const subject = `Update Submission ${data.submission.local_id} for ${data.conference.short_name}`;
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
    data: {
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
    },
) => {
    const subject = `Delete Submission ${data.submission.local_id} for ${data.conference.short_name}`;
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
