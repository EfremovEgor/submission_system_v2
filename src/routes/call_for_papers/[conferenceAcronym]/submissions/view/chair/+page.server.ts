import {
    loadChairSubmissions,
    loadChairTopics,
    requireConferenceChair,
} from "$src/lib/chair/chair.server";
import { listMailBatches } from "$src/lib/queue/mailing";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ cookies, params, parent }) => {
    // The layout redirects signed-out users to sign in; let it run first.
    await parent();
    const { conference } = await requireConferenceChair(cookies, params.conferenceAcronym!);
    const [submissions, topics, batches] = await Promise.all([
        loadChairSubmissions(conference.id),
        loadChairTopics(conference.id),
        listMailBatches(conference.id),
    ]);
    return { submissions, topics, batches };
};
