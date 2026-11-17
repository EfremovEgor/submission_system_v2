import { presentation_formats, titles } from "$src/lib/aliases";
import type { MailContext } from "./context.server";
import { findUnsupportedTag, renderPlaceholders } from "./placeholders";
import { readEmailTemplate, renderTemplateString } from "./templating";

// Letters the system sends on its own; the chair can send them to anyone by hand.
// They are files from the repository, so EJS may run them (unlike chair-written templates).
interface SystemTemplate {
    label: string;
    file: string;
    needsSubmission: boolean;
    subject: (ctx: MailContext) => string;
    data?: (ctx: MailContext) => object;
}

export const SYSTEM_TEMPLATES = {
    submission_accepted: {
        label: "Submission accepted",
        file: "authors/submission_accepted.html",
        needsSubmission: true,
        subject: (ctx) =>
            `Your paper #${ctx.submission.local_id} has been accepted for presentation at the ${ctx.conference.short_name}`,
    },
    submission_rejected: {
        label: "Submission rejected",
        file: "authors/submission_rejected.html",
        needsSubmission: true,
        subject: (ctx) =>
            `Your paper #${ctx.submission.local_id} has been rejected for presentation at the ${ctx.conference.short_name}`,
    },
    submission_under_review: {
        label: "Submission under review",
        file: "submission_under_review.html",
        needsSubmission: true,
        subject: (ctx) =>
            `Your paper #${ctx.submission.local_id} for the  ${ctx.conference.short_name} is under review`,
        data: (ctx) => {
            const submission = ctx._raw.submission!;
            return {
                conference_email: ctx.conference.email,
                conference_short_name: ctx.conference.short_name,
                conference_name: ctx.conference.name,
                corresponding_title: ctx.recipient.title,
                first_name: ctx.recipient.first_name,
                last_name: ctx.recipient.last_name,
                title: submission.title,
                local_id: submission.local_id,
                submission_id: submission.id,
                presentation_format:
                    presentation_formats[submission.presentation_format] ??
                    submission.presentation_format,
                topic: submission.topic.name,
                authors: submission.authors.map((a) => ({
                    ...a,
                    title: titles[a.title] ?? a.title,
                })),
            };
        },
    },
} satisfies Record<string, SystemTemplate>;

export type SystemTemplateKey = keyof typeof SYSTEM_TEMPLATES;

export const isSystemTemplateKey = (key: unknown): key is SystemTemplateKey =>
    typeof key == "string" && Object.hasOwn(SYSTEM_TEMPLATES, key);

/** Template list for the chair UI; `source` only for templates that are plain placeholders. */
export const listSystemTemplates = async () =>
    Promise.all(
        Object.entries(SYSTEM_TEMPLATES).map(async ([key, t]) => {
            const source = await readEmailTemplate(t.file);
            return {
                key,
                label: t.label,
                needsSubmission: t.needsSubmission,
                // Only placeholder-only templates can be opened as an editable copy.
                source: findUnsupportedTag(source) == null ? source : null,
            };
        }),
    );

export const renderSystemEmail = async (key: SystemTemplateKey, ctx: MailContext) => {
    const t: SystemTemplate = SYSTEM_TEMPLATES[key];
    const html = renderTemplateString(
        await readEmailTemplate(t.file),
        t.data ? t.data(ctx) : ctx,
    );
    return { subject: t.subject(ctx), html };
};

export const renderCustomEmail = (
    template: { subject: string; html: string },
    ctx: MailContext,
) => ({
    subject: renderPlaceholders(template.subject, ctx, { escape: false }),
    html: renderPlaceholders(template.html, ctx),
});
