import {
    deleteSubmissionById,
    withdrawSubmissionById,
} from "$src/lib/database/submissions";
import type { Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    await withdrawSubmissionById(parseInt(data.submission.id));
    const goBackUrl = `/call_for_papers/${params.conferenceAcronym}/submissions/view/chair`;
    return { goBackUrl };
};
