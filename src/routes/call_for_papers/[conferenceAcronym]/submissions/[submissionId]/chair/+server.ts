import { DOMAIN } from "$env/static/private";
import { PRIVILEGES } from "$src/lib/aliases.js";
import prisma from "$src/lib/database/prisma.js";
import {
    sendSubmissionAccepted,
    sendSubmissionRejected,
} from "$src/lib/email/authors.mailing.js";
import { requireSubmissionChair } from "$src/lib/managers/rights/submission/guards.server";
import { error, json } from "@sveltejs/kit";

const decide = async (
    submissionId: number,
    conferenceAcronym: string,
    status: "accepted" | "rejected",
) => {
    const submission = await prisma.submission.update({
        where: {
            id: submissionId,
        },
        data: {
            status,
        },
        select: {
            id: true,
            authors: {
                orderBy: {
                    id: "asc",
                },
            },
            local_id: true,
            topic: {
                select: {
                    name: true,
                },
            },
            presentation_format: true,
            title: true,
            conference: {
                select: {
                    name: true,
                    short_name: true,
                    site_url: true,
                    email: true,
                    manuscript_deadline: true,
                    presentation_deadline: true,
                    confirmation_deadline: true,
                },
            },
        },
    });
    const send =
        status == "accepted" ? sendSubmissionAccepted : sendSubmissionRejected;
    for (const author of submission.authors) {
        try {
            await send(author.email, {
                recipient: author,
                submission: {
                    local_id: submission.local_id,
                    title: submission.title,
                    link: `${DOMAIN}/call_for_papers/${conferenceAcronym}/submissions/${submission.id}/${PRIVILEGES.author}`,
                    topic: {
                        name: submission.topic.name,
                    },
                    presentation_format: submission.presentation_format,
                },
                conference: {
                    ...submission.conference,
                },
            });
        } catch (e) {
            console.error(
                `Sending ${status} email for submission ${submission.id} to ${author.email} failed`,
                e,
            );
        }
    }
};

export async function POST({ request, cookies, params }) {
    const { submission, rights } = await requireSubmissionChair({
        cookies,
        params,
    });
    if (!rights.canEdit) error(403);
    const {
        action,
    }: {
        action: string;
    } = await request.json();
    if (action == "reject")
        await decide(submission.id, params.conferenceAcronym, "rejected");
    else if (action == "accept")
        await decide(submission.id, params.conferenceAcronym, "accepted");
    else error(422);
    return json({ status: "ok" });
}
