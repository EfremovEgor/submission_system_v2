import { parseIds, requireConferenceChair } from "$src/lib/chair/chair.server";
import prisma from "$src/lib/database/prisma";
import {
    buildMailContext,
    loadMailSubmissions,
    authorName,
} from "$src/lib/email/context.server";
import { renderSystemEmail } from "$src/lib/email/system.server";
import { enqueueMailBatch, type MailMessage } from "$src/lib/queue/mailing";
import { error, json } from "@sveltejs/kit";

// Bulk changes from the chair dashboard. Decisions can notify authors with the same
// letters as the single-submission accept/reject buttons; letters go through the queue.

const ACTIONS = {
    accept: { data: { status: "accepted" }, letter: "submission_accepted", label: "Accepted" },
    reject: { data: { status: "rejected" }, letter: "submission_rejected", label: "Rejected" },
    under_review: { data: { status: "under_review" }, label: "Under review" },
    submitted: { data: { status: "submitted" }, label: "Submitted" },
    withdraw: { data: { withdrawn: true, particiaption_confirmed: false }, label: "Withdrawn" },
    restore: { data: { withdrawn: false }, label: "Restored" },
    confirm: { data: { particiaption_confirmed: true }, label: "Confirmed" },
    unconfirm: { data: { particiaption_confirmed: false }, label: "Unconfirmed" },
} as const;

type Action = keyof typeof ACTIONS;

export async function POST({ request, cookies, params }) {
    const { user, conference } = await requireConferenceChair(cookies, params.conferenceAcronym);
    const body = await request.json().catch(() => null);
    const action = body?.action as Action;
    if (!Object.hasOwn(ACTIONS, action)) error(422, "Unknown action");
    const ids = parseIds(body.ids);
    if (!ids.length) error(422, "No submissions selected");
    const notify = body.notify === true;
    const audience: "all" | "corresponding" = body.audience == "corresponding" ? "corresponding" : "all";
    const spec = ACTIONS[action];

    const { count } = await prisma.submission.updateMany({
        where: { id: { in: ids }, conference_id: conference.id },
        data: spec.data,
    });

    let batchId: string | null = null;
    let letters = 0;
    if (notify && "letter" in spec) {
        const submissions = await loadMailSubmissions(conference.id, ids);
        const messages: MailMessage[] = [];
        for (const submission of submissions) {
            // A withdrawn paper gets no decision letter.
            if (submission.withdrawn) continue;
            const authors = submission.authors.filter(
                (a) => audience == "all" || a.is_corresponding,
            );
            const seen = new Set<string>();
            for (const author of authors) {
                const to = author.email.trim();
                if (!to || seen.has(to.toLowerCase())) continue;
                seen.add(to.toLowerCase());
                const ctx = buildMailContext(conference, submission, author);
                messages.push({
                    to,
                    note: `#${submission.local_id} ${authorName(author)}`,
                    ...(await renderSystemEmail(spec.letter, ctx)),
                });
            }
        }
        letters = messages.length;
        batchId = await enqueueMailBatch({
            conferenceId: conference.id,
            label: `${spec.label}: ${submissions.length} paper(s)`,
            createdBy: user.email,
            messages,
        });
    }
    return json({ updated: count, letters, batchId });
}
