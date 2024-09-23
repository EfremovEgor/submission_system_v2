import { deleteSubmissionById } from "$src/lib/database/submissions";
import type { Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    await deleteSubmissionById(parseInt(data.submission.id));
    const goBackUrl = `/author`;
    return { goBackUrl };
};
