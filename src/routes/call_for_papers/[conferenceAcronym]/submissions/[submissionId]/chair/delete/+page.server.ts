import { withdrawSubmissionById } from "$src/lib/database/submissions";
import { requireSubmissionChair } from "$src/lib/managers/rights/submission/guards.server";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";

// Withdrawing happens only in the POST action: a GET (link, preload) must not change anything.
/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    if (!data.submission.withdrawn)
        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${data.submission.id}/chair`,
        );
    const goBackUrl = `/call_for_papers/${params.conferenceAcronym}/submissions/view/chair`;
    return { goBackUrl };
};

export const actions: Actions = {
    default: async ({ cookies, params }) => {
        const { submission, rights } = await requireSubmissionChair({
            cookies,
            params,
        });
        if (!rights.canDelete) error(403);
        await withdrawSubmissionById(submission.id);
    },
};
