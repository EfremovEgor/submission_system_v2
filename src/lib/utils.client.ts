export const getPatternFromLanguages = (languages: Array<string>) => {
    const pattern = /^[a-zA-Z0-9()@*_\-!#$%^&*,."\'\][\s]+$/;
    return pattern;
};
export const preventLanguages = (
    allowedLanguages: Array<string> | null,
    event: KeyboardEvent,
) => {
    if (allowedLanguages == null) {
        return;
    }
    const pattern = getPatternFromLanguages(allowedLanguages);
    if (!pattern.test(event.key)) {
        event.preventDefault();
    }
};
