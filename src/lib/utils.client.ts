export const getPatternFromLanguages = (languages: Array<string>) => {
    const pattern = /^[a-zA-Z0-9()@*_\-!#$%^&*,."\'\][\s]+$/;
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
) => {
    console.log(value);
    if (allowedLanguages == null) {
        return true;
    }
    const pattern = getPatternFromLanguages(allowedLanguages);
    return pattern.test(value);
};
export const formatAuthors = (
    rawAuthors: {
        first_name: string;
        last_name: string;
    }[],
) => {
    let authorsArray = [];
    rawAuthors.forEach((author) => {
        authorsArray.push(`${author.last_name} ${author.first_name}`);
    });
    const authors = authorsArray.join(", ");
    return authors;
};
