import { env } from "$env/dynamic/private";
import { presentation_formats, PRIVILEGES, submission_statuses, titles } from "$src/lib/aliases";
import prisma from "$src/lib/database/prisma";

// Read at runtime from the environment (.env), not baked into the build.
const { DOMAIN } = env;

// Deadlines are optional per conference; an unset one must not break the email.
export const formatDeadline = (deadline: Date | null | undefined) =>
    deadline == null
        ? "TBA"
        : `${deadline.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${deadline.getFullYear()}, ${deadline.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`;

export const mailConferenceSelect = {
    id: true,
    acronym: true,
    name: true,
    short_name: true,
    site_url: true,
    email: true,
    confirmation_deadline: true,
    presentation_deadline: true,
    manuscript_deadline: true,
} as const;

export type MailConference = {
    id: number;
    acronym: string;
    name: string;
    short_name: string;
    site_url: string | null;
    email: string | null;
    confirmation_deadline: Date | null;
    presentation_deadline: Date | null;
    manuscript_deadline: Date | null;
};

export const mailSubmissionInclude = {
    authors: { orderBy: { id: "asc" } },
    topic: { select: { name: true } },
} as const;

export type MailSubmission = NonNullable<
    Awaited<ReturnType<typeof loadMailSubmissions>>
>[number];

export const loadMailSubmissions = (conferenceId: number, ids: number[]) =>
    prisma.submission.findMany({
        where: { conference_id: conferenceId, id: { in: ids } },
        include: mailSubmissionInclude,
        orderBy: { local_id: "asc" },
    });

type MailAuthor = MailSubmission["authors"][number];

export const authorName = (a: { first_name: string; last_name: string }) =>
    `${a.first_name} ${a.last_name}`.trim();

/**
 * Values available to every template: `recipient`, `submission` and `conference`.
 * Recipient without a submission (an address typed by the chair) only has `email`
 * and whatever name was given.
 */
export const buildMailContext = (
    conference: MailConference,
    submission: MailSubmission | null,
    recipient: Partial<MailAuthor> & { email: string },
) => {
    const conferenceData = {
        name: conference.name,
        short_name: conference.short_name,
        acronym: conference.acronym,
        site_url: conference.site_url ?? "",
        email: conference.email ?? "",
        confirmation_deadline: formatDeadline(conference.confirmation_deadline),
        presentation_deadline: formatDeadline(conference.presentation_deadline),
        manuscript_deadline: formatDeadline(conference.manuscript_deadline),
    };
    const recipientData = {
        email: recipient.email,
        title: recipient.title ? (titles[recipient.title] ?? recipient.title) : "",
        first_name: recipient.first_name ?? "",
        last_name: recipient.last_name ?? "",
        affiliation: recipient.affiliation ?? "",
        country: recipient.country ?? "",
    };
    const submissionData = submission && {
        id: submission.id,
        local_id: submission.local_id,
        title: submission.title,
        topic: { name: submission.topic.name },
        presentation_format:
            presentation_formats[submission.presentation_format] ??
            submission.presentation_format,
        status: submission_statuses[submission.status] ?? submission.status,
        link: `${DOMAIN}/call_for_papers/${conference.acronym}/submissions/${submission.id}/${PRIVILEGES.author}`,
        authors: submission.authors.map(authorName).join(", "),
    };
    return {
        recipient: recipientData,
        submission: submissionData ?? {
            id: "",
            local_id: "",
            title: "",
            topic: { name: "" },
            presentation_format: "",
            status: "",
            link: "",
            authors: "",
        },
        conference: conferenceData,
        // Kept only for the "under review" system template, which uses flat names.
        _raw: { submission, recipient },
    };
};

export type MailContext = ReturnType<typeof buildMailContext>;

/** Placeholders shown to the chair in the editor. */
export const PLACEHOLDER_GROUPS = [
    {
        name: "recipient",
        fields: ["title", "first_name", "last_name", "email", "affiliation", "country"],
    },
    {
        name: "submission",
        fields: [
            "local_id",
            "title",
            "topic.name",
            "presentation_format",
            "status",
            "authors",
            "link",
        ],
    },
    {
        name: "conference",
        fields: [
            "name",
            "short_name",
            "site_url",
            "email",
            "confirmation_deadline",
            "presentation_deadline",
            "manuscript_deadline",
        ],
    },
];
