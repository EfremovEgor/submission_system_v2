import { getSubmissionById } from "$src/lib/database/submissions";
import { checkForChairRights } from "$src/lib/managers/rights/submission/privileges";
import { error, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    const conference = data.conference;
    const submission = await getSubmissionById(parseInt(params.submissionId), {
        include: {
            topic: {
                select: {
                    name: true,
                },
            },
            authors: {
                orderBy: {
                    id: "asc",
                },
            },
        },
    });
    if (submission == null) error(404);
    if (submission.conference_id != conference.id) error(404);
    const rights = await checkForChairRights(conference.id, data.user.id);
    if (!rights.canAccess) error(403);

    return { submission, rights };
};
