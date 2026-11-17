import { parseIds, requireConferenceChair } from "$src/lib/chair/chair.server";
import {
    EMAIL_PATTERN,
    resolveRecipients,
    type Audience,
    type Recipient,
} from "$src/lib/chair/recipients.server";
import { findUnsupportedTag } from "$src/lib/email/placeholders";
import {
    isSystemTemplateKey,
    renderCustomEmail,
    renderSystemEmail,
    SYSTEM_TEMPLATES,
} from "$src/lib/email/system.server";
import {
    enqueueMailBatch,
    getMailBatch,
    listMailBatches,
    sendNow,
} from "$src/lib/queue/mailing";
import { error, json } from "@sveltejs/kit";

// Chair mailing: custom letters (only "<%= path %>" placeholders) or system letters
// (accepted, rejected, ...) to the authors of chosen papers and/or to any addresses.
//   action "preview" -> recipient list and one rendered letter
//   action "test"    -> one rendered letter sent right away to a test address
//   action "send"    -> all letters queued; returns the batch id for progress

type Template =
    | { mode: "custom"; subject: string; html: string }
    | { mode: "system"; key: string };

const parseTemplate = (raw: unknown): Template => {
    const t = raw as Template;
    if (t?.mode == "system") {
        if (!isSystemTemplateKey(t.key)) error(422, "Unknown system template");
        return t;
    }
    if (t?.mode == "custom" && typeof t.subject == "string" && typeof t.html == "string") {
        if (!t.subject.trim()) error(422, "Subject is empty");
        if (!t.html.trim()) error(422, "Letter is empty");
        const tag = findUnsupportedTag(t.html) ?? findUnsupportedTag(t.subject);
        if (tag != null) error(422, `Only <%= ... %> placeholders are supported: ${tag}`);
        return t;
    }
    error(422, "Invalid template");
};

const render = (template: Template, r: Recipient) =>
    template.mode == "system"
        ? renderSystemEmail(template.key as keyof typeof SYSTEM_TEMPLATES, r.ctx)
        : renderCustomEmail(template, r.ctx);

export async function POST({ request, cookies, params }) {
    const { user, conference } = await requireConferenceChair(cookies, params.conferenceAcronym);
    const body = await request.json().catch(() => null);
    if (body == null) error(422);
    const template = parseTemplate(body.template);
    const audience: Audience = ["all", "corresponding", "presenters"].includes(body.audience)
        ? body.audience
        : "corresponding";
    const recipients = await resolveRecipients({
        conference,
        submissionIds: parseIds(body.submissions ?? []),
        audience,
        extra: typeof body.extra == "string" ? body.extra : "",
    });
    if (template.mode == "system") {
        const without = recipients.filter((r) => !r.hasSubmission);
        if (without.length)
            error(
                422,
                `"${SYSTEM_TEMPLATES[template.key as keyof typeof SYSTEM_TEMPLATES].label}" needs a paper: add its number after the address (e.g. "name@example.com #12") for ${without
                    .slice(0, 10)
                    .map((r) => r.to)
                    .join(", ")}`,
            );
    }

    if (body.action == "preview") {
        const index = Math.min(Math.max(Number(body.index) || 0, 0), Math.max(recipients.length - 1, 0));
        const letter = recipients.length ? await render(template, recipients[index]) : null;
        return json({
            count: recipients.length,
            recipients: recipients.map((r) => ({ to: r.to, note: r.note })),
            index,
            letter,
        });
    }
    if (!recipients.length) error(422, "No recipients");

    if (body.action == "test") {
        const to = String(body.testEmail ?? "").trim();
        if (!EMAIL_PATTERN.test(to)) error(422, "Invalid test address");
        const index = Math.min(Math.max(Number(body.index) || 0, 0), recipients.length - 1);
        const letter = await render(template, recipients[index]);
        try {
            await sendNow({ to, subject: `[TEST] ${letter.subject}`, html: letter.html });
        } catch (e) {
            console.error("Test letter failed", e);
            error(502, `Sending failed: ${(e as Error).message}`);
        }
        return json({ sent: to, as: recipients[index].to });
    }

    if (body.action == "send") {
        const messages = [];
        for (const r of recipients)
            messages.push({ to: r.to, note: r.note, ...(await render(template, r)) });
        const label =
            template.mode == "system"
                ? SYSTEM_TEMPLATES[template.key as keyof typeof SYSTEM_TEMPLATES].label
                : template.subject;
        const batchId = await enqueueMailBatch({
            conferenceId: conference.id,
            label: `Mailing: ${label}`,
            createdBy: user.email,
            messages,
        });
        return json({ batchId, total: messages.length });
    }
    error(422, "Unknown action");
}

/** Mailing history of the conference, or one batch with `?batch=id`. */
export async function GET({ url, cookies, params }) {
    const { conference } = await requireConferenceChair(cookies, params.conferenceAcronym);
    const id = url.searchParams.get("batch");
    if (id) {
        const batches = await listMailBatches(conference.id);
        if (!batches.some((b) => b.id == id)) error(404);
        return json(await getMailBatch(id));
    }
    return json(await listMailBatches(conference.id));
}
