import { authorizedRoute } from "$src/lib/auth.sever";
import prisma from "$src/lib/database/prisma";
import { mailConferenceSelect, type MailConference } from "$src/lib/email/context.server";
import { Roles } from "$src/lib/managers/rights/base.server";
import { checkForChairRights } from "$src/lib/managers/rights/submission/privileges";
import { redis } from "$src/lib/redis/redis";
import { error, type Cookies } from "@sveltejs/kit";

/** Signed-in chair of the conference, or 401/403/404. */
export const requireConferenceChair = async (cookies: Cookies, acronym: string) => {
    const user = await authorizedRoute(cookies, redis);
    const conference: MailConference | null = await prisma.conference.findFirst({
        where: { acronym },
        select: mailConferenceSelect,
    });
    if (conference == null) error(404);
    const rights = await checkForChairRights(conference.id, user.id);
    if (rights.role != Roles.chair) error(403);
    return { user, conference };
};

/** Positive integer ids, deduplicated; 422 on anything else. */
export const parseIds = (ids: unknown, max = 5000) => {
    if (!Array.isArray(ids) || ids.length > max) error(422, "Invalid submission list");
    const out = [...new Set(ids.map(Number))];
    if (out.some((id) => !Number.isInteger(id) || id <= 0)) error(422, "Invalid submission list");
    return out;
};

const fileSelect = { id: true, original_name: true } as const;

/** Everything the chair dashboard and the mailing page filter on. */
export const loadChairSubmissions = (conferenceId: number) =>
    prisma.submission.findMany({
        where: { conference_id: conferenceId },
        select: {
            id: true,
            local_id: true,
            title: true,
            presentation_format: true,
            created_at: true,
            updated_at: true,
            status: true,
            withdrawn: true,
            particiaption_confirmed: true,
            presentation_file: { select: fileSelect },
            manuscript_file: { select: fileSelect },
            topic: {
                select: {
                    id: true,
                    name: true,
                    symposium: { select: { name: true } },
                },
            },
            authors: {
                select: {
                    first_name: true,
                    last_name: true,
                    title: true,
                    email: true,
                    country: true,
                    affiliation: true,
                    is_corresponding: true,
                    is_presenter: true,
                },
                orderBy: { id: "asc" },
            },
        },
        orderBy: { local_id: "asc" },
    });

export type ChairSubmission = Awaited<ReturnType<typeof loadChairSubmissions>>[number];

/** Topics in display order, grouped by symposium when the conference has them. */
export const loadChairTopics = async (conferenceId: number) => {
    const topics = await prisma.topic.findMany({
        where: {
            OR: [{ conference_id: conferenceId }, { symposium: { conference_id: conferenceId } }],
        },
        select: {
            id: true,
            name: true,
            position: true,
            symposium: { select: { name: true, position: true } },
        },
    });
    return topics
        .sort(
            (a, b) =>
                (a.symposium?.position ?? 0) - (b.symposium?.position ?? 0) ||
                (a.symposium?.name ?? "").localeCompare(b.symposium?.name ?? "") ||
                a.position - b.position ||
                a.name.localeCompare(b.name),
        )
        .map((t) => ({ id: t.id, name: t.name, symposium: t.symposium?.name ?? null }));
};
