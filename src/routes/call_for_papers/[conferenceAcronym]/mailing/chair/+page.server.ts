import { signInUrl } from "$src/lib/redirects";
import {
    loadChairSubmissions,
    loadChairTopics,
    requireConferenceChair,
} from "$src/lib/chair/chair.server";
import { PLACEHOLDER_GROUPS } from "$src/lib/email/context.server";
import { listSystemTemplates } from "$src/lib/email/system.server";
import { listMailBatches } from "$src/lib/queue/mailing";
import { MAILING_SETTINGS } from "$src/lib/email/mailing";
import { SMTP_PORTS } from "$src/lib/email/sender.server";
import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, cookies, params, parent }) => {
    const { user } = await parent();
    if (user == null) redirect(302, signInUrl(url));
    const { conference } = await requireConferenceChair(cookies, params.conferenceAcronym!);
    const [submissions, topics, systemTemplates, batches] = await Promise.all([
        loadChairSubmissions(conference.id),
        loadChairTopics(conference.id),
        listSystemTemplates(),
        listMailBatches(conference.id),
    ]);
    return {
        conference: { acronym: conference.acronym, name: conference.name },
        submissions,
        topics,
        systemTemplates,
        placeholders: PLACEHOLDER_GROUPS,
        batches,
        systemFrom: MAILING_SETTINGS.from ?? "",
        smtpPorts: SMTP_PORTS,
    };
};
