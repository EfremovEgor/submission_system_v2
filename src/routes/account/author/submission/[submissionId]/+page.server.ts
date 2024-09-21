import { getSubmissionById } from "$src/lib/database/submissions";
import { error, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();

    if (data.user == null) error(403);
    const submission = await getSubmissionById(parseInt(params.submissionId));
    return { submission };
};
