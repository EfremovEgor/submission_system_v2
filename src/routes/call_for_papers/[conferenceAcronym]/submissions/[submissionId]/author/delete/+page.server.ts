import { deleteSubmissionById } from "$src/lib/database/submissions";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    await deleteSubmissionById(parseInt(data.submission.id));
    const goBackUrl = `/call_for_papers/${params.conferenceAcronym}/submissions/author`;
    return { goBackUrl };
};
