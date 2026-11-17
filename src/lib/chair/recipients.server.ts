import prisma from "$src/lib/database/prisma";
import {
    authorName,
    buildMailContext,
    loadMailSubmissions,
    mailSubmissionInclude,
    type MailConference,
    type MailContext,
    type MailSubmission,
} from "$src/lib/email/context.server";
import { error } from "@sveltejs/kit";

export const EMAIL_PATTERN = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;
export const MAX_EXTRA_LINES = 1000;

export type Audience = "all" | "corresponding" | "presenters";

export interface Recipient {
    to: string;
    note: string;
    ctx: MailContext;
    hasSubmission: boolean;
}

interface ExtraLine {
    line: number;
    email: string;
    localId: number | null;
    name: string | null;
}

/**
 * Additional recipients, one per line: `email`, optionally followed by a paper number
 * (`#12` or `12`) and/or a name. With a paper number the letter is filled in with that
 * paper; the recipient name is the given one, the author's with that email, or the
 * corresponding author's.
 */
export const parseExtraLines = (text: string): ExtraLine[] => {
    const lines = text
        .split(/\r?\n/)
        .map((l, i) => ({ raw: l.trim(), line: i + 1 }))
        .filter((l) => l.raw);
    if (lines.length > MAX_EXTRA_LINES)
        error(422, `At most ${MAX_EXTRA_LINES} additional recipients per mailing`);
    const bad: string[] = [];
    const out = lines.map(({ raw, line }) => {
        const tokens = raw.split(/[\s,;]+/).filter(Boolean);
        const emailIndex = tokens.findIndex((t) => t.includes("@"));
        const email = emailIndex >= 0 ? tokens[emailIndex].replace(/^<|>$/g, "") : "";
        if (!EMAIL_PATTERN.test(email)) bad.push(`line ${line}: ${raw}`);
        const rest = tokens.filter((_, i) => i != emailIndex);
        const idToken = rest.find((t) => /^#?\d+$/.test(t));
        const name = rest.filter((t) => t != idToken).join(" ").trim();
        return {
            line,
            email,
            localId: idToken ? Number(idToken.replace("#", "")) : null,
            name: name || null,
        };
    });
    if (bad.length) error(422, `Invalid email(s):\n${bad.slice(0, 20).join("\n")}`);
    return out;
};

export const resolveRecipients = async ({
    conference,
    submissionIds,
    audience,
    extra,
}: {
    conference: MailConference;
    submissionIds: number[];
    audience: Audience;
    extra: string;
}): Promise<Recipient[]> => {
    const recipients: Recipient[] = [];
    const submissions = await loadMailSubmissions(conference.id, submissionIds);
    for (const submission of submissions) {
        const authors = submission.authors.filter(
            (a) =>
                audience == "all" ||
                (audience == "corresponding" && a.is_corresponding) ||
                (audience == "presenters" && a.is_presenter),
        );
        const seen = new Set<string>();
        for (const author of authors) {
            const to = author.email.trim();
            if (!to || seen.has(to.toLowerCase())) continue;
            seen.add(to.toLowerCase());
            recipients.push({
                to,
                note: `#${submission.local_id} ${authorName(author)}`,
                ctx: buildMailContext(conference, submission, author),
                hasSubmission: true,
            });
        }
    }

    const lines = parseExtraLines(extra);
    const localIds = [...new Set(lines.map((l) => l.localId).filter((id): id is number => id != null))];
    const bound = new Map<number, MailSubmission>();
    if (localIds.length) {
        const found = await prisma.submission.findMany({
            where: { conference_id: conference.id, local_id: { in: localIds } },
            include: mailSubmissionInclude,
        });
        for (const s of found) bound.set(s.local_id, s);
        const unknown = localIds.filter((id) => !bound.has(id));
        if (unknown.length) error(422, `No paper(s) with number ${unknown.join(", ")}`);
    }
    for (const l of lines) {
        const submission = l.localId != null ? bound.get(l.localId)! : null;
        const author =
            submission?.authors.find((a) => a.email.trim().toLowerCase() == l.email.toLowerCase()) ??
            submission?.authors.find((a) => a.is_corresponding) ??
            submission?.authors[0];
        const [first, ...last] = (l.name ?? "").split(" ");
        const person = l.name
            ? { first_name: first, last_name: last.join(" "), title: "" }
            : (author ?? {});
        recipients.push({
            to: l.email,
            note: `${submission ? `#${submission.local_id} ` : ""}${l.name ?? (author && submission ? authorName(author) : "")} (added)`.trim(),
            ctx: buildMailContext(conference, submission, {
                ...(l.name ? {} : author),
                ...person,
                email: l.email,
            }),
            hasSubmission: submission != null,
        });
    }
    return recipients;
};
