import prisma from "$src/lib/database/prisma.js";
import { requireSubmissionAuthor } from "$src/lib/managers/rights/submission/guards.server";
import { error, json } from "@sveltejs/kit";

export async function POST({ request, cookies, params }) {
    const { submission } = await requireSubmissionAuthor({ cookies, params });
    const {
        action,
    }: {
        action: string;
    } = await request.json();
    if (!["confirm"].includes(action)) error(422);
    const conference = await prisma.conference.findUniqueOrThrow({
        where: { id: submission.conference_id },
        select: { confirmation_deadline: true },
    });
    // Same conditions under which the page offers the "Confirm" button.
    if (
        submission.withdrawn ||
        submission.status != "accepted" ||
        submission.particiaption_confirmed ||
        !(new Date() < conference.confirmation_deadline)
    )
        error(409);
    await prisma.submission.update({
        data: {
            particiaption_confirmed: true,
        },
        where: {
            id: submission.id,
        },
    });
    return json({ status: "ok" });
}
