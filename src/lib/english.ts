// All user-entered text must be in English: letters are limited to A-Z/a-z
// (no Cyrillic, Chinese, accented Latin...). Greek letters and the micro sign are
// allowed as scientific notation (ΔV, σ, µm); digits, punctuation and symbols too.
// Used by both the forms and the server actions.
const NON_ENGLISH_LETTER = /[^\P{L}A-Za-zͰ-Ͽµ]|\p{M}/u;

export const findNonEnglishCharacter = (value: string) =>
    value.match(NON_ENGLISH_LETTER)?.[0] ?? null;

export const isEnglishOnly = (value: string) =>
    findNonEnglishCharacter(value) == null;

export const englishOnlyMessage = (label: string) =>
    `${label} must contain only English characters`;

// First field (label -> value) that contains a non-English letter, as a message.
export const findNonEnglishField = (fields: Record<string, unknown>) => {
    for (const [label, value] of Object.entries(fields)) {
        if (typeof value != "string") continue;
        const character = findNonEnglishCharacter(value);
        if (character != null)
            return `${englishOnlyMessage(label)} ("${character}" is not allowed)`;
    }
    return null;
};

interface SubmissionText {
    title?: unknown;
    abstract?: unknown;
    keywords?: unknown;
    funding?: unknown;
}
interface AuthorText {
    first_name?: unknown;
    last_name?: unknown;
    email?: unknown;
    affiliation?: unknown;
    country?: unknown;
    web_page?: unknown;
}

export const findNonEnglishInSubmission = (
    submission: SubmissionText,
    authors: AuthorText[],
) =>
    findNonEnglishField({
        Title: submission.title,
        Abstract: submission.abstract,
        Keywords: submission.keywords,
        "Funding information": submission.funding,
        ...Object.fromEntries(
            authors.flatMap((author, index) => {
                const prefix = `Author ${index + 1}`;
                return [
                    [`${prefix} first name`, author.first_name],
                    [`${prefix} last name`, author.last_name],
                    [`${prefix} email`, author.email],
                    [`${prefix} affiliation`, author.affiliation],
                    [`${prefix} country`, author.country],
                    [`${prefix} web page`, author.web_page],
                ];
            }),
        ),
    });
