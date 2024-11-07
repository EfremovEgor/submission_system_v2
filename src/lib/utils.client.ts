const languagePatterns = {
    en: {
        general: /^[a-zA-Z0-9()@*_\-\\\+!=#$%^&*,?/:."\'\][\s]+$/,
        onlyLettersAndNumbers: /^[a-zA-Z0-9\s]+$/,
    },
};
export const getPatternFromLanguages = (
    languages: Array<"en">,
    type: "general" | "onlyLettersAndNumbers" = "general",
) => {
    const pattern = languagePatterns.en[type];
    return pattern;
};
export const preventLanguages = (
    allowedLanguages: Array<string> | null,
    event: KeyboardEvent,
) => {
    if (allowedLanguages == null) {
        return true;
    }
    const pattern = getPatternFromLanguages(allowedLanguages);
    if (!pattern.test(event.key)) {
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
    console.log(value);
    if (allowedLanguages == null) {
        return true;
    }
    const pattern = getPatternFromLanguages(allowedLanguages, options.type);
    return pattern.test(value);
};
interface formatAuthorsOptions {
    additionalInfo?: boolean;
    delimiter?: string;
}
export const formatAuthors = (
    rawAuthors: {
        first_name: string;
        last_name: string;
        country: string | null;
        affiliation: string | null;
    }[],
    options: formatAuthorsOptions = {
        additionalInfo: false,
        delimiter: ", ",
    },
) => {
    let authorsArray = [];
    rawAuthors.forEach((author) => {
        let additionalInfo = "";
        if (author.country && author.affiliation && options.additionalInfo) {
            additionalInfo = ` (${author.affiliation}, ${author.country})`;
        }
        authorsArray.push(
            `${author.last_name} ${author.first_name}${additionalInfo}`,
        );
    });

    const authors = authorsArray.join(options.delimiter);

    return authors;
};
