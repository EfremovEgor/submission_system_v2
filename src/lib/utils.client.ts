import { titles } from "./aliases";
import { findNonEnglishCharacter, isEnglishOnly } from "./english";

// Blocks typing or pasting non-English letters into an input.
export const preventLanguages = (
    allowedLanguages: Array<string> | null,
    event: Event,
) => {
    if (allowedLanguages == null) {
        return true;
    }
    let text = "";
    if (typeof ClipboardEvent != "undefined" && event instanceof ClipboardEvent)
        text = event.clipboardData?.getData("text") ?? "";
    else if (
        typeof KeyboardEvent != "undefined" &&
        event instanceof KeyboardEvent &&
        event.key.length == 1
    )
        text = event.key;
    if (findNonEnglishCharacter(text) != null) {
        event.preventDefault();
        return false;
    }
    return true;
};
export const languageIsAvailable = (
    allowedLanguages: Array<string> | null,
    value: string,
    options: {
        type: "general" | "onlyLettersAndNumbers";
    } = {
        type: "general",
    },
) => {
    if (allowedLanguages == null) {
        return true;
    }
    return isEnglishOnly(value);
};
interface formatAuthorsOptions {
    additionalInfo?: boolean;
    delimiter?: string;
    convertTitle?: boolean;
}
export const formatAuthors = (
    rawAuthors: {
        first_name: string;
        last_name: string;
        title?: string;
        country?: string | null;
        affiliation?: string | null;
    }[],
    options: formatAuthorsOptions = {
        additionalInfo: false,
        delimiter: ", ",
        convertTitle: false,
    },
) => {
    let authorsArray = [];
    rawAuthors.forEach((author) => {
        let additionalInfo = "";
        if (author.country && author.affiliation && options.additionalInfo) {
            additionalInfo = ` (${author.affiliation}, ${author.country})`;
        }
        const title = author.title
            ? options.convertTitle
                ? titles[author.title] + " "
                : author.title + " "
            : "";
        authorsArray.push(
            `${title}${author.last_name} ${author.first_name}${additionalInfo}`,
        );
    });

    const authors = authorsArray.join(options.delimiter);

    return authors;
};
export const getFileExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts.pop();
};
